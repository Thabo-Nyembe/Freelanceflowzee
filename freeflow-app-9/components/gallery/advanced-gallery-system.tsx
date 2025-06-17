'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Image as ImageIcon,
  Video,
  Share2,
  Download,
  Heart,
  Eye,
  Lock,
  Unlock,
  Users,
  Link2,
  Calendar,
  Star,
  Package,
  Shield,
  Timer,
  Zap,
  Settings,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  ExternalLink,
  Mail,
  Copy,
  Check,
  Globe,
  Clock
} from 'lucide-react'

interface GalleryCollection {
  id: string
  name: string
  description: string
  coverImage: string
  items: GalleryItem[]
  settings: CollectionSettings
  sharing: SharingSettings
  analytics: AnalyticsData
  createdAt: string
  updatedAt: string
}

interface GalleryItem {
  id: string
  name: string
  type: 'image' | 'video'
  url: string
  thumbnail: string
  description?: string
  tags: string[]
  metadata: ItemMetadata
  status: 'processing' | 'ready' | 'archived'
  favorites: number
  downloads: number
  views: number
  isFavorited: boolean
  pricing?: ItemPricing
  watermark?: WatermarkSettings
}

interface CollectionSettings {
  isPublic: boolean
  passwordProtected: boolean
  password?: string
  downloadEnabled: boolean
  favoritesEnabled: boolean
  commentsEnabled: boolean
  watermarkEnabled: boolean
  expiryDate?: string
  clientAccess: string[]
  downloadLimit?: number
  viewLimit?: number
}

interface SharingSettings {
  publicUrl: string
  directLinks: boolean
  socialSharing: boolean
  embedCode: string
  qrCode: string
  customDomain?: string
  brandingEnabled: boolean
}

interface AnalyticsData {
  totalViews: number
  uniqueVisitors: number
  downloadCount: number
  favoriteCount: number
  topCountries: Array<{ country: string; count: number }>
  recentActivity: Array<{ type: string; timestamp: string; details: string }>
}

interface ItemMetadata {
  width?: number
  height?: number
  duration?: number
  size: string
  format: string
  createdAt: string
  location?: string
  camera?: string
}

interface ItemPricing {
  digital: number
  print?: number
  commercial?: number
  exclusive?: number
}

interface WatermarkSettings {
  enabled: boolean
  type: 'text' | 'logo'
  content: string
  position: 'center' | 'corner' | 'repeated'
  opacity: number
}

export function AdvancedGallerySystem() {
  const [collections, setCollections] = useState<GalleryCollection[]>([
    {
      id: 'coll_001',
      name: 'Wedding Photography - Sarah & Mike',
      description: 'Beautiful moments captured from your special day',
      coverImage: '/images/wedding-cover.jpg',
      createdAt: '2024-02-01',
      updatedAt: '2024-02-05',
      settings: {
        isPublic: false,
        passwordProtected: true,
        password: 'sarah2024',
        downloadEnabled: true,
        favoritesEnabled: true,
        commentsEnabled: true,
        watermarkEnabled: false,
        expiryDate: '2024-12-31',
        clientAccess: ['sarah@email.com', 'mike@email.com'],
        downloadLimit: 50,
        viewLimit: 1000
      },
      sharing: {
        publicUrl: 'https://gallery.freeflow.com/wedding-sarah-mike',
        directLinks: true,
        socialSharing: true,
        embedCode: '<iframe src="https://gallery.freeflow.com/embed/coll_001" width="800" height="600"></iframe>',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
        brandingEnabled: true
      },
      analytics: {
        totalViews: 234,
        uniqueVisitors: 45,
        downloadCount: 23,
        favoriteCount: 67,
        topCountries: [
          { country: 'US', count: 156 },
          { country: 'CA', count: 43 },
          { country: 'UK', count: 35 }
        ],
        recentActivity: [
          { type: 'download', timestamp: '2024-02-05T14:30:00Z', details: 'sarah@email.com downloaded 5 images' },
          { type: 'view', timestamp: '2024-02-05T13:15:00Z', details: 'New visitor from United States' },
          { type: 'favorite', timestamp: '2024-02-05T12:00:00Z', details: 'mike@email.com favorited 3 images' }
        ]
      },
      items: [
        {
          id: 'img_001',
          name: 'Ceremony Kiss',
          type: 'image',
          url: '/images/wedding-1.jpg',
          thumbnail: '/images/wedding-1-thumb.jpg',
          description: 'The magical first kiss as married couple',
          tags: ['ceremony', 'kiss', 'romantic'],
          status: 'ready',
          favorites: 15,
          downloads: 8,
          views: 45,
          isFavorited: false,
          metadata: {
            width: 4000,
            height: 6000,
            size: '12.5 MB',
            format: 'RAW',
            createdAt: '2024-02-01T14:30:00Z',
            location: 'Central Park, NYC',
            camera: 'Canon EOS R5'
          },
          pricing: {
            digital: 25,
            print: 45,
            commercial: 150,
            exclusive: 500
          }
        },
        {
          id: 'vid_001',
          name: 'Wedding Highlights',
          type: 'video',
          url: '/videos/wedding-highlights.mp4',
          thumbnail: '/images/video-thumb.jpg',
          description: 'Beautiful 3-minute highlight reel',
          tags: ['highlights', 'cinematic', 'love'],
          status: 'ready',
          favorites: 35,
          downloads: 5,
          views: 89,
          isFavorited: true,
          metadata: {
            duration: 180,
            size: '245 MB',
            format: '4K MP4',
            createdAt: '2024-02-01T21:00:00Z'
          },
          pricing: {
            digital: 150,
            exclusive: 750
          }
        }
      ]
    }
  ])

  const [selectedCollection, setSelectedCollection] = useState<GalleryCollection | null>(collections[0])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('gallery')
  const [sharingPanelOpen, setSharingPanelOpen] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(type)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = (method: 'email' | 'social' | 'direct') => {
    if (!selectedCollection) return

    const url = selectedCollection.sharing.publicUrl
    
    switch (method) {
      case 'email':
        window.open(`mailto:?subject=Check out my gallery&body=View my gallery: ${url}`)
        break
      case 'social':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=Check out my gallery!`)
        break
      case 'direct':
        copyToClipboard(url, 'url')
        break
    }
  }

  const handleDownloadItem = (item: GalleryItem) => {
    // Update analytics
    setCollections(prev => prev.map(collection =>
      collection.id === selectedCollection?.id
        ? {
            ...collection,
            items: collection.items.map(i =>
              i.id === item.id
                ? { ...i, downloads: i.downloads + 1 }
                : i
            ),
            analytics: {
              ...collection.analytics,
              downloadCount: collection.analytics.downloadCount + 1,
              recentActivity: [
                {
                  type: 'download',
                  timestamp: new Date().toISOString(),
                  details: `Downloaded ${item.name}`
                },
                ...collection.analytics.recentActivity.slice(0, 4)
              ]
            }
          }
        : collection
    ))

    // Trigger actual download
    console.log(`Downloading: ${item.name}`)
    // In real app: window.open(item.url, '_blank')
  }

  const handleFavorite = (item: GalleryItem) => {
    setCollections(prev => prev.map(collection =>
      collection.id === selectedCollection?.id
        ? {
            ...collection,
            items: collection.items.map(i =>
              i.id === item.id
                ? { 
                    ...i, 
                    isFavorited: !i.isFavorited,
                    favorites: i.isFavorited ? i.favorites - 1 : i.favorites + 1
                  }
                : i
            )
          }
        : collection
    ))
  }

  if (!selectedCollection) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎨 Advanced Gallery System
          </h1>
          <p className="text-muted-foreground mt-2">
            Professional client galleries with advanced sharing and analytics
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setSharingPanelOpen(!sharingPanelOpen)}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Gallery
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="mr-2 h-4 w-4" />
            New Gallery
          </Button>
        </div>
      </div>

      {/* Sharing Panel */}
      {sharingPanelOpen && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-purple-600" />
              Share "{selectedCollection.name}"
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Public Link */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Public Gallery Link
              </h4>
              <div className="flex gap-2">
                <Input
                  value={selectedCollection.sharing.publicUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(selectedCollection.sharing.publicUrl, 'url')}
                >
                  {copiedText === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(selectedCollection.sharing.publicUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Share Options */}
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => handleShare('email')}
                className="h-20 flex-col gap-2"
              >
                <Mail className="h-6 w-6" />
                Email Share
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('social')}
                className="h-20 flex-col gap-2"
              >
                <Share2 className="h-6 w-6" />
                Social Media
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('direct')}
                className="h-20 flex-col gap-2"
              >
                <Link2 className="h-6 w-6" />
                Copy Link
              </Button>
            </div>

            {/* Embed Code */}
            <div className="space-y-3">
              <h4 className="font-medium">Embed Code</h4>
              <div className="flex gap-2">
                <Input
                  value={selectedCollection.sharing.embedCode}
                  readOnly
                  className="flex-1 text-xs"
                />
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(selectedCollection.sharing.embedCode, 'embed')}
                >
                  {copiedText === 'embed' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="clients">Client Access</TabsTrigger>
        </TabsList>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-6">
          {/* Collection Header */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-purple-800 mb-2">
                    {selectedCollection.name}
                  </h2>
                  <p className="text-purple-600 mb-4">{selectedCollection.description}</p>
                  <div className="flex items-center gap-4 text-sm text-purple-700">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      {selectedCollection.items.length} items
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {selectedCollection.analytics.totalViews} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {selectedCollection.analytics.downloadCount} downloads
                    </span>
                    <Badge className={selectedCollection.settings.isPublic ? 
                      'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                      {selectedCollection.settings.isPublic ? (
                        <><Unlock className="h-3 w-3 mr-1" />Public</>
                      ) : (
                        <><Lock className="h-3 w-3 mr-1" />Private</>
                      )}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gallery Items */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {selectedCollection.items.map(item => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Media Thumbnail */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden rounded-t-lg">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20"></div>
                      
                      {/* Type Badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className={`${
                          item.type === 'video' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-green-600 text-white'
                        }`}>
                          {item.type === 'video' ? (
                            <><Video className="h-3 w-3 mr-1" />Video</>
                          ) : (
                            <><ImageIcon className="h-3 w-3 mr-1" />Photo</>
                          )}
                        </Badge>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className={`${
                          item.status === 'ready' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status === 'ready' && <Check className="h-3 w-3 mr-1" />}
                          {item.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                          {item.status}
                        </Badge>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-purple-100/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {item.type === 'video' && (
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                              <Video className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-white hover:bg-white/20"
                            onClick={() => handleDownloadItem(item)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Video Duration */}
                      {item.type === 'video' && item.metadata.duration && (
                        <div className="absolute bottom-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
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
                          {item.tags.slice(0, 3).map(tag => (
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
                            <Eye className="w-4 h-4" />
                            {item.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {item.downloads}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {item.metadata.size}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFavorite(item)}
                          className={`flex-1 ${item.isFavorited ? 'text-red-600 border-red-200' : ''}`}
                        >
                          <Heart className={`w-4 h-4 mr-1 ${item.isFavorited ? 'fill-current' : ''}`} />
                          {item.isFavorited ? 'Favorited' : 'Favorite'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownloadItem(item)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>

                      {/* Pricing */}
                      {item.pricing && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Digital</span>
                            <span className="font-medium">${item.pricing.digital}</span>
                          </div>
                          {item.pricing.print && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Print License</span>
                              <span className="font-medium">${item.pricing.print}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selectedCollection.analytics.totalViews}</p>
                    <p className="text-sm text-gray-600">Total Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selectedCollection.analytics.uniqueVisitors}</p>
                    <p className="text-sm text-gray-600">Unique Visitors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Download className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selectedCollection.analytics.downloadCount}</p>
                    <p className="text-sm text-gray-600">Downloads</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selectedCollection.analytics.favoriteCount}</p>
                    <p className="text-sm text-gray-600">Favorites</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedCollection.analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-1 rounded-full ${
                      activity.type === 'download' ? 'bg-blue-100' :
                      activity.type === 'view' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      {activity.type === 'download' && <Download className="h-3 w-3 text-blue-600" />}
                      {activity.type === 'view' && <Eye className="h-3 w-3 text-green-600" />}
                      {activity.type === 'favorite' && <Heart className="h-3 w-3 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.details}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 