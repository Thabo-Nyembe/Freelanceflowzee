'use client'

import React, { useReducer, useState, useEffect } from 'react'
 payload: 'grid' | 'list' }
  | { type: 'SET_FILTER_STATUS'; payload: 'all' | 'locked' | 'unlocked' | 'pending' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_LIGHTBOX'; payload: { open: boolean; index?: number } }
  | { type: 'TOGGLE_PAYMENT_MODAL'; payload: boolean }
  | { type: 'UNLOCK_GALLERY'; payload: string }
  | { type: 'FAVORITE_ITEM'; payload: { galleryId: string; itemId: string; type: 'image' | 'video' } }
  | { type: 'INCREMENT_VIEWS'; payload: { galleryId: string; itemId: string; type: 'image' | 'video' } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// Mock data
const mockGalleries: ClientGallery[] = [
  {
    id: 'gallery_001',
    title: 'Wedding Photography Collection',
    description: 'Beautiful moments from Sarah & Mike\'s special day','
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah@example.com',
    clientAvatar: '/avatars/sarah.jpg',
    clientCompany: 'Johnson Family',
    coverImage: '/images/wedding-cover.jpg',
    status: 'unlocked',
    escrowStatus: 'fully_released',
    totalAmount: 2500,
    paidAmount: 2500,
    createdAt: '2024-02-01',
    expiresAt: '2024-12-31',
    downloadPassword: 'WEDDING2024!',
    watermarkEnabled: false,
    downloadLimit: 100,
    analytics: {
      totalViews: 234,
      totalDownloads: 45,
      totalFavorites: 67,
      uniqueVisitors: 23,
      lastAccessed: '2024-02-15T14:30:00Z'
    },
    unlockMethods: [
      { type: 'escrow_release', isEnabled: true },
      { type: 'password', isEnabled: true, password: 'WEDDING2024!' }
    ],
    images: [
      {
        id: 'img_001',
        name: 'First Kiss',
        url: '/images/wedding-1.jpg',
        thumbnailUrl: '/images/wedding-1-thumb.jpg',
        width: 4000,
        height: 6000,
        size: '12.5 MB',
        format: 'RAW',
        tags: ['ceremony', 'kiss', 'romantic'],
        isFavorited: true,
        downloadCount: 8,
        viewCount: 45,
        uploadedAt: '2024-02-01T14:30:00Z'
      }
    ],
    videos: [
      {
        id: 'vid_001',
        name: 'Wedding Highlights',
        url: '/videos/wedding-highlights.mp4',
        thumbnailUrl: '/images/video-thumb.jpg',
        duration: 180,
        size: '245 MB',
        format: '4K MP4',
        tags: ['highlights', 'cinematic'],
        isFavorited: false,
        downloadCount: 5,
        viewCount: 89,
        uploadedAt: '2024-02-01T21:00:00Z'
      }
    ]
  },
  {
    id: 'gallery_002',
    title: 'Brand Identity Package',
    description: 'Complete brand identity for Acme Corporation',
    clientName: 'John Smith',
    clientEmail: 'john@acme.com',
    clientAvatar: '/avatars/john.jpg',
    clientCompany: 'Acme Corporation',
    coverImage: '/images/brand-cover.jpg',
    status: 'locked',
    escrowStatus: 'funded',
    totalAmount: 5000,
    paidAmount: 2500,
    createdAt: '2024-02-10',
    expiresAt: '2024-06-30',
    watermarkEnabled: true,
    analytics: {
      totalViews: 45,
      totalDownloads: 0,
      totalFavorites: 12,
      uniqueVisitors: 8
    },
    unlockMethods: [
      { type: 'payment', isEnabled: true, amount: 2500 },
      { type: 'escrow_release', isEnabled: true }
    ],
    images: [
      {
        id: 'img_002',
        name: 'Logo Design',
        url: '/images/logo-preview.jpg',
        thumbnailUrl: '/images/logo-thumb.jpg',
        previewUrl: '/images/logo-watermark.jpg',
        width: 2000,
        height: 2000,
        size: '8.2 MB',
        format: 'PNG',
        tags: ['logo', 'branding'],
        isFavorited: false,
        downloadCount: 0,
        viewCount: 23,
        uploadedAt: '2024-02-10T10:00:00Z'
      }
    ],
    videos: []
  }
]

// Reducer function following Context7 patterns
function clientGalleryReducer(state: ClientGalleryState, action: ClientGalleryAction): ClientGalleryState {
  switch (action.type) {
    case 'SET_GALLERIES':
      return { ...state, galleries: action.payload }
    
    case 'SELECT_GALLERY':
      return { ...state, selectedGallery: action.payload }
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }
    
    case 'SET_FILTER_STATUS':
      return { ...state, filterStatus: action.payload }
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    
    case 'TOGGLE_LIGHTBOX':
      return { 
        ...state, 
        lightboxOpen: action.payload.open,
        lightboxIndex: action.payload.index || 0
      }
    
    case 'TOGGLE_PAYMENT_MODAL':
      return { ...state, paymentModalOpen: action.payload }
    
    case 'UNLOCK_GALLERY':
      return {
        ...state,
        galleries: state.galleries.map(gallery =>
          gallery.id === action.payload
            ? { ...gallery, status: 'unlocked' as const }
            : gallery
        )
      }
    
    case 'FAVORITE_ITEM':
      return {
        ...state,
        galleries: state.galleries.map(gallery =>
          gallery.id === action.payload.galleryId
            ? {
                ...gallery,
                [action.payload.type === 'image' ? 'images' : 'videos']: 
                  gallery[action.payload.type === 'image' ? 'images' : 'videos'].map(item =>
                    item.id === action.payload.itemId
                      ? { ...item, isFavorited: !item.isFavorited }
                      : item
                  )
              }
            : gallery
        )
      }
    
    case 'INCREMENT_VIEWS':
      return {
        ...state,
        galleries: state.galleries.map(gallery =>
          gallery.id === action.payload.galleryId
            ? {
                ...gallery,
                [action.payload.type === 'image' ? 'images' : 'videos']: 
                  gallery[action.payload.type === 'image' ? 'images' : 'videos'].map(item =>
                    item.id === action.payload.itemId
                      ? { ...item, viewCount: item.viewCount + 1 }
                      : item
                  )
              }
            : gallery
        )
      }
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    default:
      return state
  }
}

// Initial state
const initialState: ClientGalleryState = {
  galleries: mockGalleries,
  selectedGallery: null,
  viewMode: 'grid',
  filterStatus: 'all',
  searchQuery: '','
  lightboxOpen: false,
  lightboxIndex: 0,
  paymentModalOpen: false,
  loading: false,
  error: null
}

export function ClientZoneGallery() {
  const [state, dispatch] = useReducer(clientGalleryReducer, initialState)
  const [passwordInput, setPasswordInput] = useState('')'

  // Filter galleries based on search and status
  const filteredGalleries = state.galleries.filter(gallery => {
    const matchesSearch = gallery.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                         gallery.clientName.toLowerCase().includes(state.searchQuery.toLowerCase())
    
    const matchesStatus = state.filterStatus === 'all' || gallery.status === state.filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Get status badge color
  const getStatusBadge = (status: string, escrowStatus: string) => {
    switch (status) {
      case 'unlocked':
        return <Badge className= "bg-green-100 text-green-800"><Unlock className= "h-3 w-3 mr-1" />Unlocked</Badge>
      case 'locked':
        return <Badge className= "bg-red-100 text-red-800"><Lock className= "h-3 w-3 mr-1" />Locked</Badge>
      case 'pending':
        return <Badge className= "bg-amber-100 text-amber-800"><Clock className= "h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge className= "bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  // Handle gallery unlock
  const handleUnlockGallery = async (galleryId: string, method: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (method === 'payment') {
        dispatch({ type: 'TOGGLE_PAYMENT_MODAL', payload: true })
      } else if (method === 'password') {
        // Validate password
        const gallery = state.galleries.find(g => g.id === galleryId)
        const passwordMethod = gallery?.unlockMethods.find(m => m.type === 'password')
        
        if (passwordMethod?.password === passwordInput) {
          dispatch({ type: 'UNLOCK_GALLERY', payload: galleryId })
          setPasswordInput('')'
        } else {
          dispatch({ type: 'SET_ERROR', payload: 'Invalid password' })
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to unlock gallery' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Handle payment completion
  const handlePaymentComplete = (galleryId: string) => {
    dispatch({ type: 'UNLOCK_GALLERY', payload: galleryId })
    dispatch({ type: 'TOGGLE_PAYMENT_MODAL', payload: false })
  }

  return (
    <div className= "min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className= "max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className= "flex items-center justify-between">
          <div>
            <h1 className= "text-4xl font-light text-slate-800 mb-2">Client Zone</h1>
            <p className= "text-xl text-slate-600">Access your exclusive galleries</p>
          </div>
          <div className= "flex items-center gap-4">
            <Badge className= "bg-indigo-100 text-indigo-800 px-4 py-2">
              {filteredGalleries.length} Galleries
            </Badge>
          </div>
        </div>

        {/* Search & Filters */}
        <Card className= "bg-white/70 backdrop-blur-sm border-slate-200/50">
          <CardContent className= "p-6">
            <div className= "flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className= "flex items-center gap-4 flex-1">
                <div className= "relative flex-1 max-w-md">
                  <Search className= "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder= "Search galleries..."
                    value={state.searchQuery}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                    className= "pl-10 bg-white/70 border-slate-200"
                  />
                </div>
                
                <div className= "flex gap-2">
                  {['all', 'unlocked', 'locked', 'pending'].map((status) => (
                    <Button
                      key={status}
                      size= "sm"
                      variant={state.filterStatus === status ? 'default' : 'outline'}
                      onClick={() => dispatch({ type: 'SET_FILTER_STATUS', payload: status as any })}
                      className= "capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              <div className= "flex items-center gap-2">
                <Button
                  size= "sm"
                  variant={state.viewMode === 'grid' ? 'default' : 'outline'}
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'grid' })}
                >
                  <Grid3X3 className= "h-4 w-4" />
                </Button>
                <Button
                  size= "sm"
                  variant={state.viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
                >
                  <List className= "h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Galleries Grid/List */}
        <div className={state.viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
          : 'space-y-6'
        }>
          {filteredGalleries.map((gallery) => (
            <Card 
              key={gallery.id} 
              className= "group bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Gallery Cover */}
              <div className= "relative aspect-video overflow-hidden">
                <div 
                  className= "absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 bg-cover bg-center"
                  style={{ backgroundImage: `url(${gallery.coverImage})` }}
                />
                
                {/* Lock Overlay for Locked Galleries */}
                {gallery.status === 'locked' && (
                  <div className= "absolute inset-0 bg-purple-100/80 flex items-center justify-center">
                    <div className= "text-center text-white">
                      <Lock className= "h-12 w-12 mx-auto mb-3 opacity-80" />
                      <p className= "text-lg font-medium">Payment Required</p>
                      <p className= "text-sm opacity-80">${gallery.totalAmount - gallery.paidAmount} remaining</p>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className= "absolute top-4 left-4">
                  {getStatusBadge(gallery.status, gallery.escrowStatus)}
                </div>

                {/* Analytics Overlay */}
                <div className= "absolute bottom-4 right-4 flex gap-2 text-white text-sm">
                  <div className= "bg-purple-600/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <Eye className= "h-3 w-3" />
                    {gallery.analytics.totalViews}
                  </div>
                  <div className= "bg-purple-600/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <ImageIcon className= "h-3 w-3" />
                    {gallery.images.length + gallery.videos.length}
                  </div>
                </div>
              </div>

              <CardContent className= "p-6">
                <div className= "space-y-4">
                  {/* Gallery Info */}
                  <div>
                    <h3 className= "text-xl font-semibold text-slate-800 mb-1">{gallery.title}</h3>
                    <p className= "text-slate-600 text-sm mb-3">{gallery.description}</p>
                    
                    <div className= "flex items-center gap-3">
                      <Avatar className= "h-8 w-8">
                        <AvatarImage src={gallery.clientAvatar} />
                        <AvatarFallback>{gallery.clientName.split(' ').map(n => n[0]).join('&apos;)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className= "text-sm font-medium text-slate-800">{gallery.clientName}</p>
                        <p className= "text-xs text-slate-500">{gallery.clientCompany}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Payment Info */}
                  {gallery.status === 'locked' && (
                    <div className= "space-y-3">
                      <div>
                        <div className= "flex justify-between text-sm mb-1">
                          <span className= "text-slate-600">Payment Progress</span>
                          <span className= "text-slate-800">${gallery.paidAmount} / ${gallery.totalAmount}</span>
                        </div>
                        <Progress 
                          value={(gallery.paidAmount / gallery.totalAmount) * 100} 
                          className= "h-2"
                        />
                      </div>
                      
                      <div className= "flex gap-2">
                        {gallery.unlockMethods.find(m => m.type === 'payment')?.isEnabled && (
                          <Button 
                            className= "flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                            onClick={() => handleUnlockGallery(gallery.id, 'payment')}
                          >
                            <CreditCard className= "h-4 w-4 mr-2" />
                            Pay ${gallery.totalAmount - gallery.paidAmount}
                          </Button>
                        )}
                        
                        {gallery.unlockMethods.find(m => m.type === 'password')?.isEnabled && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant= "outline" size= "sm">
                                <Lock className= "h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Enter Access Password</DialogTitle>
                              </DialogHeader>
                              <div className= "space-y-4">
                                <Input
                                  type= "password"
                                  placeholder= "Enter password"
                                  value={passwordInput}
                                  onChange={(e) => setPasswordInput(e.target.value)}
                                />
                                <div className= "flex justify-end gap-2">
                                  <Button 
                                    onClick={() => handleUnlockGallery(gallery.id, 'password')}
                                    disabled={state.loading}
                                  >
                                    Unlock Gallery
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Unlocked Gallery Actions */}
                  {gallery.status === 'unlocked' && (
                    <div className= "flex gap-2">
                      <Button 
                        className= "flex-1"
                        onClick={() => dispatch({ type: 'SELECT_GALLERY', payload: gallery.id })}
                      >
                        <Eye className= "h-4 w-4 mr-2" />
                        View Gallery
                      </Button>
                      <Button variant= "outline" size= "sm">
                        <Download className= "h-4 w-4" />
                      </Button>
                      <Button variant= "outline" size= "sm">
                        <Share2 className= "h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Gallery Stats */}
                  <div className= "flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                    <span>Created {new Date(gallery.createdAt).toLocaleDateString()}</span>
                    {gallery.expiresAt && (
                      <span>Expires {new Date(gallery.expiresAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gallery Detail View */}
        {state.selectedGallery && (
          <Dialog open={!!state.selectedGallery} onOpenChange={() => dispatch({ type: &apos;SELECT_GALLERY&apos;, payload: null })}>
            <DialogContent className= "max-w-7xl max-h-[90vh] p-0">
              {(() => {
                const gallery = state.galleries.find(g => g.id === state.selectedGallery)
                if (!gallery) return null

                const allItems = [
                  ...gallery.images.map(img => ({ ...img, type: 'image' as const })),
                  ...gallery.videos.map(vid => ({ ...vid, type: 'video' as const }))
                ]

                return (
                  <div className= "bg-white text-gray-900 border-2 border-purple-200">
                    {/* Header */}
                                          <div className= "flex items-center justify-between p-6 border-b border-purple-200">
                      <div>
                        <h2 className= "text-2xl font-light">{gallery.title}</h2>
                                                  <p className= "text-gray-600">{allItems.length} items</p>
                      </div>
                      <div className= "flex items-center gap-4">
                                                  <Button variant= "outline" className= "border-purple-300 text-gray-900 hover:bg-purple-50">
                          <Download className= "h-4 w-4 mr-2" />
                          Download All
                        </Button>
                        <Button 
                          variant= "ghost" 
                          size= "sm"
                          onClick={() => dispatch({ type: 'SELECT_GALLERY', payload: null })}
                        >
                          <X className= "h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className= "p-6 max-h-[70vh] overflow-y-auto">
                      <div className= "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {allItems.map((item, index) => (
                          <div 
                            key={item.id}
                            className= "group relative aspect-square bg-white border-2 border-purple-200 rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => dispatch({ type: 'TOGGLE_LIGHTBOX', payload: { open: true, index } })}
                          >
                            <img src={item.thumbnailUrl} alt={item.name}>
                            
                            {/* Video Play Button */}
                            {item.type === 'video' && (
                              <div >
                                <div >
                                  <Play >
                                </div>
                              </div>
                            )}

                            {/* Item Info Overlay */}
                            <div >
                              <div >
                                <p >{item.name}</p>
                                <div >
                                  <span >{item.size}</span>
                                  <div >
                                    <span >
                                      <Eye >
                                      {item.viewCount}
                                    </span>
                                    <span >
                                      <Heart className={`h-3 w-3 ${item.isFavorited ? &apos;fill-red-500 text-red-500&apos; : '&apos;}>'
                                      {item.isFavorited ? '1' : '0'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </DialogContent>
          </Dialog>
        )}

        {/* Payment Modal */}
        <Dialog open={state.paymentModalOpen}> dispatch({ type: &apos;TOGGLE_PAYMENT_MODAL&apos;, payload: open })}>
          <DialogContent >
            <DialogHeader >
              <DialogTitle >Complete Payment</DialogTitle>
            </DialogHeader>
            <div >
              <div >
                <p >Escrow Protection</p>
                <p >Your payment is secure</p>
                <p >Funds are held in escrow until project completion</p>
              </div>
              
              <div >
                <Button > {
                    // Simulate payment completion
                    const selectedGallery = filteredGalleries.find(g => g.status === 'locked')
                    if (selectedGallery) {
                      handlePaymentComplete(selectedGallery.id)
                    }
                  }}
                >
                  <Shield >
                  Pay Securely
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
} 