'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Download, Share2, Heart, Eye, Copy, ExternalLink, QrCode, 
  Settings, BarChart3, Users, Calendar, MapPin, Camera,
  Grid3X3, List, Filter, Search, Play, Pause, Volume2, VolumeX
} from 'lucide-react'

interface GalleryItem {
  id: string
  name: string
  type: 'image' | 'video' | 'document'
  url: string
  thumbnail: string
  description?: string
  tags: string[]
  status: 'processing' | 'ready' | 'error'
  favorites: number
  downloads: number
  views: number
  isFavorited: boolean
  metadata: ItemMetadata
  pricing?: ItemPricing
}

interface GalleryCollection {
  id: string
  name: string
  description: string
  coverImage: string
  createdAt: string
  updatedAt: string
  settings: CollectionSettings
  sharing: SharingSettings
  analytics: CollectionAnalytics
  items: GalleryItem[]
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
  brandingEnabled: boolean
}

interface CollectionAnalytics {
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

interface Watermark {
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
        password: process.env.DEMO_PASSWORD || 'demo-password',
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
        }
      ]
    }
  ])

  const [selectedCollection, setSelectedCollection] = useState<GalleryCollection | null>(collections[0])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<any>('gallery')
  const [sharingPanelOpen, setSharingPanelOpen] = useState<any>(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(type)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gallery Management</h1>
          <p className="text-muted-foreground">
            Manage your collections, analytics, and client galleries
          </p>
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {selectedCollection && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedCollection.name}</CardTitle>
                  <CardDescription>{selectedCollection.description}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSharingPanelOpen(true)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="sharing">Sharing</TabsTrigger>
                </TabsList>

                <TabsContent value="gallery" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Search items..."
                        className="w-64"
                      />
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-4' : 'space-y-2'}>
                    {selectedCollection.items.map((item) => (
                      <Card key={item.id} className="group relative">
                        <CardContent className="p-3">
                          <div className="aspect-square relative overflow-hidden rounded-lg bg-muted mb-3">
                            <img
                              src={item.thumbnail}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            {item.type === 'video' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="w-8 h-8 text-white bg-black bg-opacity-50 rounded-full p-1" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleDownloadItem(item)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center space-x-3">
                                <span className="flex items-center">
                                  <Eye className="w-3 h-3 mr-1" />
                                  {item.views}
                                </span>
                                <span className="flex items-center">
                                  <Heart className="w-3 h-3 mr-1" />
                                  {item.favorites}
                                </span>
                                <span className="flex items-center">
                                  <Download className="w-3 h-3 mr-1" />
                                  {item.downloads}
                                </span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {item.metadata.format}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Views</p>
                            <p className="text-2xl font-bold">{selectedCollection.analytics.totalViews}</p>
                          </div>
                          <Eye className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Unique Visitors</p>
                            <p className="text-2xl font-bold">{selectedCollection.analytics.uniqueVisitors}</p>
                          </div>
                          <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Downloads</p>
                            <p className="text-2xl font-bold">{selectedCollection.analytics.downloadCount}</p>
                          </div>
                          <Download className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Favorites</p>
                            <p className="text-2xl font-bold">{selectedCollection.analytics.favoriteCount}</p>
                          </div>
                          <Heart className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Collection Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="public">Public Gallery</Label>
                        <Switch
                          id="public"
                          checked={selectedCollection.settings.isPublic}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password Protected</Label>
                        <Switch
                          id="password"
                          checked={selectedCollection.settings.passwordProtected}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="downloads">Allow Downloads</Label>
                        <Switch
                          id="downloads"
                          checked={selectedCollection.settings.downloadEnabled}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sharing" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Share Gallery</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Public URL</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            value={selectedCollection.sharing.publicUrl}
                            readOnly
                          />
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(selectedCollection.sharing.publicUrl, 'url')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        {copiedText === 'url' && (
                          <p className="text-sm text-green-600 mt-1">Copied to clipboard!</p>
                        )}
                      </div>
                      
                      <div>
                        <Label>Embed Code</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            value={selectedCollection.sharing.embedCode}
                            readOnly
                          />
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(selectedCollection.sharing.embedCode, 'embed')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        {copiedText === 'embed' && (
                          <p className="text-sm text-green-600 mt-1">Copied to clipboard!</p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button onClick={() => handleShare('email')}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Share via Email
                        </Button>
                        <Button variant="outline" onClick={() => handleShare('social')}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share on Social
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 