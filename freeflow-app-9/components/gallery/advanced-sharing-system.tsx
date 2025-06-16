'use client'

import React, { useState, useEffect } from 'react'
import { 
  Share2, 
  Download, 
  Eye, 
  Heart, 
  MessageCircle, 
  Copy, 
  ExternalLink,
  QrCode,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Link,
  Settings,
  BarChart3,
  Users,
  Clock,
  MapPin,
  Globe,
  Lock,
  Unlock,
  Star,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  Grid,
  List,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Tag,
  DollarSign,
  Code
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'

interface GalleryItem {
  id: string
  name: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl: string
  size: number
  dimensions: { width: number; height: number }
  metadata: {
    camera?: string
    lens?: string
    settings?: string
    location?: string
    tags: string[]
  }
  pricing: {
    digital: number
    print: number
    commercial: number
  }
  stats: {
    views: number
    likes: number
    downloads: number
    shares: number
  }
  createdAt: string
}

interface GallerySettings {
  isPublic: boolean
  allowDownloads: boolean
  showPricing: boolean
  watermarkEnabled: boolean
  passwordProtected: boolean
  password?: string
  expiresAt?: string
  customDomain?: string
  brandingEnabled: boolean
  analyticsEnabled: boolean
  socialSharingEnabled: boolean
}

interface VisitorAnalytics {
  totalVisitors: number
  uniqueVisitors: number
  pageViews: number
  avgSessionDuration: number
  topReferrers: Array<{ source: string; visits: number }>
  geoData: Array<{ country: string; visits: number }>
  deviceTypes: Array<{ type: string; percentage: number }>
  popularItems: Array<{ id: string; name: string; views: number }>
}

interface AdvancedGallerySharingSystemProps {
  galleryId: string
  items: GalleryItem[]
  settings: GallerySettings
  analytics?: VisitorAnalytics
  currentUser: {
    id: string
    name: string
    avatar?: string
    role: 'owner' | 'collaborator' | 'viewer'
  }
  isOwnerView?: boolean
}

export function AdvancedGallerySharingSystem({
  galleryId,
  items,
  settings: initialSettings,
  analytics,
  currentUser,
  isOwnerView = false
}: AdvancedGallerySharingSystemProps) {
  const [settings, setSettings] = useState<GallerySettings>(initialSettings)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<string>('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'views' | 'likes'>('date')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null)
  const [shareDialog, setShareDialog] = useState(false)
  const [settingsDialog, setSettingsDialog] = useState(false)
  const [analyticsDialog, setAnalyticsDialog] = useState(false)
  const [qrCodeDialog, setQrCodeDialog] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [embedCode, setEmbedCode] = useState('')

  const galleryUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/gallery/${galleryId}`
  const publicShareUrl = settings.customDomain ? `https://${settings.customDomain}` : galleryUrl

  useEffect(() => {
    generateEmbedCode()
  }, [settings])

  const generateEmbedCode = () => {
    const code = `<iframe 
  src="${publicShareUrl}?embed=true" 
  width="100%" 
  height="600" 
  frameborder="0" 
  allowfullscreen>
</iframe>`
    setEmbedCode(code)
  }

  const filteredAndSortedItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesTag = !filterTag || item.metadata.tags.includes(filterTag)
      return matchesSearch && matchesTag
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'views':
          return b.stats.views - a.stats.views
        case 'likes':
          return b.stats.likes - a.stats.likes
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const allTags = [...new Set(items.flatMap(item => item.metadata.tags))]

  const handleShare = async (platform: string) => {
    const url = encodeURIComponent(publicShareUrl)
    const text = encodeURIComponent(customMessage || `Check out this amazing gallery!`)
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      email: `mailto:?subject=${text}&body=Check out this gallery: ${url}`,
      copy: publicShareUrl
    }

    if (platform === 'copy') {
      await navigator.clipboard.writeText(shareUrls.copy)
      alert('Link copied to clipboard!')
    } else if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400')
    }

    // Track share event
    await trackEvent('share', { platform, galleryId })
  }

  const handleDownload = async (item: GalleryItem, license: 'digital' | 'print' | 'commercial') => {
    if (!settings.allowDownloads && currentUser.role === 'viewer') {
      alert('Downloads are not enabled for this gallery')
      return
    }

    // Track download event
    await trackEvent('download', { itemId: item.id, license, galleryId })

    // Generate secure download link
    const response = await fetch('/api/gallery/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: item.id,
        license,
        galleryId
      })
    })

    if (response.ok) {
      const { downloadUrl } = await response.json()
      window.open(downloadUrl, '_blank')
    }
  }

  const handleLike = async (itemId: string) => {
    await trackEvent('like', { itemId, galleryId })
    // Update item stats locally for immediate feedback
    // In production, this would trigger a real-time update
  }

  const trackEvent = async (event: string, data: any) => {
    try {
      await fetch('/api/gallery/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      })
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  const updateSettings = async (newSettings: Partial<GallerySettings>) => {
    try {
      const response = await fetch('/api/gallery/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryId,
          settings: { ...settings, ...newSettings }
        })
      })

      if (response.ok) {
        setSettings(prev => ({ ...prev, ...newSettings }))
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Professional Gallery</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{items.length} items</span>
            {analytics && (
              <>
                <span>•</span>
                <span>{analytics.totalVisitors} visitors</span>
                <span>•</span>
                <span>{analytics.pageViews} views</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isOwnerView && (
            <>
              <Button
                variant="outline"
                onClick={() => setAnalyticsDialog(true)}
                className="space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setSettingsDialog(true)}
                className="space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </>
          )}

          <Button
            onClick={() => setShareDialog(true)}
            className="space-x-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Share Gallery</span>
          </Button>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center space-x-4">
        <Badge variant={settings.isPublic ? 'default' : 'secondary'} className="space-x-1">
          {settings.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          <span>{settings.isPublic ? 'Public' : 'Private'}</span>
        </Badge>
        
        {settings.passwordProtected && (
          <Badge variant="outline" className="space-x-1">
            <Lock className="h-3 w-3" />
            <span>Password Protected</span>
          </Badge>
        )}
        
        {settings.expiresAt && (
          <Badge variant="outline" className="space-x-1">
            <Clock className="h-3 w-3" />
            <span>Expires {new Date(settings.expiresAt).toLocaleDateString()}</span>
          </Badge>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by date</SelectItem>
              <SelectItem value="name">Sort by name</SelectItem>
              <SelectItem value="views">Sort by views</SelectItem>
              <SelectItem value="likes">Sort by likes</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Gallery */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedItems.map((item) => (
            <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={item.thumbnailUrl}
                  alt={item.name}
                  className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => setLightboxItem(item)}
                />
                
                {/* Overlay controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setLightboxItem(item)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleLike(item.id)}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  
                  {settings.allowDownloads && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="secondary">
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {settings.showPricing ? (
                          <>
                            <DropdownMenuItem onClick={() => handleDownload(item, 'digital')}>
                              Digital (${item.pricing.digital})
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(item, 'print')}>
                              Print (${item.pricing.print})
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(item, 'commercial')}>
                              Commercial (${item.pricing.commercial})
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem onClick={() => handleDownload(item, 'digital')}>
                            Download
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Media type indicator */}
                {item.type === 'video' && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="space-x-1">
                      <Play className="h-3 w-3" />
                      <span>Video</span>
                    </Badge>
                  </div>
                )}

                {/* Stats overlay */}
                <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{item.stats.views}</span>
                  </Badge>
                  <Badge variant="secondary" className="text-xs space-x-1">
                    <Heart className="h-3 w-3" />
                    <span>{item.stats.likes}</span>
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-medium text-sm mb-2 truncate">{item.name}</h3>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatFileSize(item.size)}</span>
                  <span>{item.dimensions.width} × {item.dimensions.height}</span>
                </div>
                
                {item.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.metadata.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.metadata.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.metadata.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={item.thumbnailUrl}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded cursor-pointer"
                  onClick={() => setLightboxItem(item)}
                />
                
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{formatFileSize(item.size)}</span>
                    <span>{item.dimensions.width} × {item.dimensions.height}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{item.stats.views}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{item.stats.likes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Download className="h-4 w-4" />
                      <span>{item.stats.downloads}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLightboxItem(item)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLike(item.id)}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  
                  {settings.allowDownloads && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {settings.showPricing ? (
                          <>
                            <DropdownMenuItem onClick={() => handleDownload(item, 'digital')}>
                              Digital (${item.pricing.digital})
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(item, 'print')}>
                              Print (${item.pricing.print})
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(item, 'commercial')}>
                              Commercial (${item.pricing.commercial})
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem onClick={() => handleDownload(item, 'digital')}>
                            Download
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={shareDialog} onOpenChange={setShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Gallery</DialogTitle>
            <DialogDescription>
              Share your gallery with clients and get detailed analytics on engagement
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Gallery URL</label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  value={publicShareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => handleShare('copy')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Custom Message (Optional)</label>
              <Textarea
                placeholder="Add a personal message for your clients..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleShare('facebook')}
                className="space-x-2"
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleShare('twitter')}
                className="space-x-2"
              >
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleShare('linkedin')}
                className="space-x-2"
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleShare('email')}
                className="space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setQrCodeDialog(true)}
                className="flex-1 space-x-2"
              >
                <QrCode className="h-4 w-4" />
                <span>QR Code</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(embedCode)}
                className="flex-1 space-x-2"
              >
                <Code className="h-4 w-4" />
                <span>Embed</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxItem && (
        <Dialog open={!!lightboxItem} onOpenChange={() => setLightboxItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative">
              {lightboxItem.type === 'video' ? (
                <video
                  src={lightboxItem.url}
                  controls
                  className="w-full max-h-[70vh] object-contain"
                  autoPlay
                />
              ) : (
                <img
                  src={lightboxItem.url}
                  alt={lightboxItem.name}
                  className="w-full max-h-[70vh] object-contain"
                />
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLightboxItem(null)}
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{lightboxItem.name}</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLike(lightboxItem.id)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {lightboxItem.stats.likes}
                  </Button>
                  
                  {settings.allowDownloads && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {settings.showPricing ? (
                          <>
                            <DropdownMenuItem onClick={() => handleDownload(lightboxItem, 'digital')}>
                              Digital License (${lightboxItem.pricing.digital})
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(lightboxItem, 'print')}>
                              Print License (${lightboxItem.pricing.print})
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(lightboxItem, 'commercial')}>
                              Commercial License (${lightboxItem.pricing.commercial})
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem onClick={() => handleDownload(lightboxItem, 'digital')}>
                            Download Full Resolution
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Size:</span>
                  <br />
                  {formatFileSize(lightboxItem.size)}
                </div>
                <div>
                  <span className="font-medium">Dimensions:</span>
                  <br />
                  {lightboxItem.dimensions.width} × {lightboxItem.dimensions.height}
                </div>
                <div>
                  <span className="font-medium">Views:</span>
                  <br />
                  {lightboxItem.stats.views}
                </div>
                <div>
                  <span className="font-medium">Downloads:</span>
                  <br />
                  {lightboxItem.stats.downloads}
                </div>
              </div>
              
              {lightboxItem.metadata.tags.length > 0 && (
                <div>
                  <span className="font-medium text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {lightboxItem.metadata.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 