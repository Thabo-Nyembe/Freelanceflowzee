'use client'

import React, { useState, useEffect } from 'react'
 percentage: number }>
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
    role: 'owner' | 'collaborator' | 'viewer
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
  const [filterTag, setFilterTag] = useState<string>('&apos;)
  const [sortBy, setSortBy] = useState<&apos;date&apos; | &apos;name&apos; | &apos;views&apos; | &apos;likes&apos;>('date')
  const [viewMode, setViewMode] = useState<&apos;grid&apos; | &apos;list&apos;>('grid')
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null)
  const [shareDialog, setShareDialog] = useState(false)
  const [settingsDialog, setSettingsDialog] = useState(false)
  const [analyticsDialog, setAnalyticsDialog] = useState(false)
  const [qrCodeDialog, setQrCodeDialog] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [embedCode, setEmbedCode] = useState('')

  const galleryUrl = `${typeof window !== 'undefined' ? window.location.origin : }/gallery/${galleryId}
  const publicShareUrl = settings.customDomain ? `https://${settings.customDomain}` : galleryUrl

  useEffect(() => {
    generateEmbedCode()
  }, [settings])

  const generateEmbedCode = () => {
    const code = `<iframe 
  src= "${publicShareUrl}?embed=true" 
  width= "100%" 
  height= "600" 
  frameborder="0" 
  allowfullscreen>
</iframe>
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

  const trackEvent = async (event: string, data: Record<string, unknown>) => {
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
    if (bytes === 0) return '0 B
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}
  }

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}
    }
    return `${mins}:${secs.toString().padStart(2, '0')}
  }

  return (
    <div className= "w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className= "flex items-center justify-between">
        <div className= "space-y-1">
          <h1 className= "text-3xl font-bold">Professional Gallery</h1>
          <div className= "flex items-center space-x-4 text-sm text-gray-600">
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

        <div className= "flex items-center space-x-2">
          {isOwnerView && (
            <>
              <Button
                variant= "outline
                onClick={() => setAnalyticsDialog(true)}
                className= "space-x-2
              >
                <BarChart3 className= "h-4 w-4" />
                <span>Analytics</span>
              </Button>
              
              <Button
                variant= "outline
                onClick={() => setSettingsDialog(true)}
                className= "space-x-2
              >
                <Settings className= "h-4 w-4" />
                <span>Settings</span>
              </Button>
            </>
          )}

          <Button
            onClick={() => setShareDialog(true)}
            className= "space-x-2
          >
            <Share2 className= "h-4 w-4" />
            <span>Share Gallery</span>
          </Button>
        </div>
      </div>

      {/* Status indicators */}
      <div className= "flex items-center space-x-4">
        <Badge variant={settings.isPublic ? &apos;default&apos; : &apos;secondary&apos;} className= "space-x-1">
          {settings.isPublic ? <Globe className= "h-3 w-3" /> : <Lock className= "h-3 w-3" />}
          <span>{settings.isPublic ? &apos;Public&apos; : &apos;Private&apos;}</span>
        </Badge>
        
        {settings.passwordProtected && (
          <Badge variant= "outline" className= "space-x-1">
            <Lock className= "h-3 w-3" />
            <span>Password Protected</span>
          </Badge>
        )}
        
        {settings.expiresAt && (
          <Badge variant= "outline" className= "space-x-1">
            <Clock className= "h-3 w-3" />
            <span>Expires {new Date(settings.expiresAt).toLocaleDateString()}</span>
          </Badge>
        )}
      </div>

      {/* Controls */}
      <div className= "flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className= "flex items-center space-x-4">
          <div className= "relative">
            <Search className= "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder= "Search items...
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className= "pl-10 w-64
            />
          </div>

          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className= "w-40">
              <SelectValue placeholder= "Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="&quot;>All tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: Record<string, unknown>) => setSortBy(value)}>
            <SelectTrigger className= "w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value= "date">Sort by date</SelectItem>
              <SelectItem value= "name">Sort by name</SelectItem>
              <SelectItem value= "views">Sort by views</SelectItem>
              <SelectItem value= "likes">Sort by likes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className= "flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size= "sm
            onClick={() => setViewMode('grid')}
          >
            <Grid className= "h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size= "sm
            onClick={() => setViewMode('list')}
          >
            <List className= "h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Gallery */}
      {viewMode === 'grid' ? (
        <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedItems.map((item) => (
            <Card key={item.id} className= "group overflow-hidden hover:shadow-lg transition-shadow">
              <div className= "relative aspect-square overflow-hidden">
                <img src={item.thumbnailUrl} alt={item.name}> setLightboxItem(item)}
                />
                
                {/* Overlay controls */}
                <div >
                  <Button >
                    <Eye >
                  </Button>
                  <Button >
                    <Heart >
                  </Button>
                  {settings.allowDownloads && (
                    <DropdownMenu >
                      <DropdownMenuTrigger >
                        <Button >
                          <Download >
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent >
                        {settings.showPricing ? (
                          <>
                            <DropdownMenuItem > handleDownload(item, 'digital')}>
                              Digital (${item.pricing.digital})
                            </DropdownMenuItem>
                            <DropdownMenuItem > handleDownload(item, 'print')}>
                              Print (${item.pricing.print})
                            </DropdownMenuItem>
                            <DropdownMenuItem > handleDownload(item, 'commercial')}>
                              Commercial (${item.pricing.commercial})
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem > handleDownload(item, 'digital')}>
                            Download
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Media type indicator */}
                {item.type === 'video' && (
                  <div >
                    <Badge >
                      <Play >
                      <span >Video</span>
                    </Badge>
                  </div>
                )}

                {/* Stats overlay */}
                <div >
                  <Badge >
                    <Eye >
                    <span >{item.stats.views}</span>
                  </Badge>
                  <Badge >
                    <Heart >
                    <span >{item.stats.likes}</span>
                  </Badge>
                </div>
              </div>

              <CardContent >
                <h3 >{item.name}</h3>
                
                <div >
                  <span >{formatFileSize(item.size)}</span>
                  <span >{item.dimensions.width} × {item.dimensions.height}</span>
                </div>
                
                {item.metadata.tags.length > 0 && (
                  <div >
                    {item.metadata.tags.slice(0, 3).map(tag => (
                      <Badge key={tag}>
                        {tag}
                      </Badge>
                    ))}
                    {item.metadata.tags.length > 3 && (
                      <Badge >
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
        <div >
          {filteredAndSortedItems.map((item) => (
            <Card key={item.id}>
              <div >
                <img src={item.thumbnailUrl} alt={item.name}> setLightboxItem(item)}
                />
                
                <div >
                  <h3 >{item.name}</h3>
                  <div >
                    <span >{formatFileSize(item.size)}</span>
                    <span >{item.dimensions.width} × {item.dimensions.height}</span>
                    <span >{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div >
                    <span >
                      <Eye >
                      <span >{item.stats.views}</span>
                    </span>
                    <span >
                      <Heart >
                      <span >{item.stats.likes}</span>
                    </span>
                    <span >
                      <Download >
                      <span >{item.stats.downloads}</span>
                    </span>
                  </div>
                </div>
                
                <div >
                  <Button > setLightboxItem(item)}
                  >
                    <Eye >
                  </Button>
                  
                  <Button > handleLike(item.id)}
                  >
                    <Heart >
                  </Button>
                  
                  {settings.allowDownloads && (
                    <DropdownMenu >
                      <DropdownMenuTrigger >
                        <Button >
                          <Download >
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent >
                        {settings.showPricing ? (
                          <>
                            <DropdownMenuItem > handleDownload(item, 'digital')}>
                              Digital (${item.pricing.digital})
                            </DropdownMenuItem>
                            <DropdownMenuItem > handleDownload(item, 'print')}>
                              Print (${item.pricing.print})
                            </DropdownMenuItem>
                            <DropdownMenuItem > handleDownload(item, 'commercial')}>
                              Commercial (${item.pricing.commercial})
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem > handleDownload(item, 'digital')}>
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
        <DialogContent >
          <DialogHeader >
            <DialogTitle >Share Gallery</DialogTitle>
            <DialogDescription >
              Share your gallery with clients and get detailed analytics on engagement
            </DialogDescription>
          </DialogHeader>
          
          <div >
            <div >
              <label >Gallery URL</label>
              <div >
                <Input value={publicShareUrl}>
                <Button > handleShare('copy')}
                >
                  <Copy >
                </Button>
              </div>
            </div>

            <div >
              <label >Custom Message (Optional)</label>
              <Textarea value={customMessage}> setCustomMessage(e.target.value)}
                className= "mt-1
              />
            </div>

            <div >
              <Button > handleShare('facebook')}
                className= "space-x-2
              >
                <Facebook >
                <span >Facebook</span>
              </Button>
              
              <Button > handleShare('twitter')}
                className= "space-x-2
              >
                <Twitter >
                <span >Twitter</span>
              </Button>
              
              <Button > handleShare('linkedin')}
                className= "space-x-2
              >
                <Linkedin >
                <span >LinkedIn</span>
              </Button>
              
              <Button > handleShare('email')}
                className= "space-x-2
              >
                <Mail >
                <span >Email</span>
              </Button>
            </div>

            <div >
              <Button > setQrCodeDialog(true)}
                className= "flex-1 space-x-2
              >
                <QrCode >
                <span >QR Code</span>
              </Button>
              
              <Button > navigator.clipboard.writeText(embedCode)}
                className= "flex-1 space-x-2
              >
                <Code >
                <span >Embed</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxItem && (
        <Dialog open={!!lightboxItem}> setLightboxItem(null)}>
          <DialogContent >
            <div >
              {lightboxItem.type === 'video' ? (
                <video src={lightboxItem.url}>
              ) : (
                <img src={lightboxItem.url} alt={lightboxItem.name}>
              )}
              
              <Button > setLightboxItem(null)}
                className= "absolute top-2 right-2 bg-purple-600/90 text-white hover:bg-purple-700/90 backdrop-blur-sm
              >
                <X >
              </Button>
            </div>
            
            <div >
              <div >
                <h3 >{lightboxItem.name}</h3>
                <div >
                  <Button > handleLike(lightboxItem.id)}
                  >
                    <Heart >
                    {lightboxItem.stats.likes}
                  </Button>
                  
                  {settings.allowDownloads && (
                    <DropdownMenu >
                      <DropdownMenuTrigger >
                        <Button >
                          <Download >
                          Download
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent >
                        {settings.showPricing ? (
                          <>
                            <DropdownMenuItem > handleDownload(lightboxItem, 'digital')}>
                              Digital License (${lightboxItem.pricing.digital})
                            </DropdownMenuItem>
                            <DropdownMenuItem > handleDownload(lightboxItem, 'print')}>
                              Print License (${lightboxItem.pricing.print})
                            </DropdownMenuItem>
                            <DropdownMenuItem > handleDownload(lightboxItem, 'commercial')}>
                              Commercial License (${lightboxItem.pricing.commercial})
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem > handleDownload(lightboxItem, 'digital')}>
                            Download Full Resolution
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              
              <div >
                <div >
                  <span >Size:</span>
                  <br >
                  {formatFileSize(lightboxItem.size)}
                </div>
                <div >
                  <span >Dimensions:</span>
                  <br >
                  {lightboxItem.dimensions.width} × {lightboxItem.dimensions.height}
                </div>
                <div >
                  <span >Views:</span>
                  <br >
                  {lightboxItem.stats.views}
                </div>
                <div >
                  <span >Downloads:</span>
                  <br >
                  {lightboxItem.stats.downloads}
                </div>
              </div>
              
              {lightboxItem.metadata.tags.length > 0 && (
                <div >
                  <span >Tags:</span>
                  <div >
                    {lightboxItem.metadata.tags.map(tag => (
                      <Badge key={tag}>
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