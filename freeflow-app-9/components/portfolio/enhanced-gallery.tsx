'use client'

import React, { useReducer, useState, useCallback, useEffect } from 'react'
 end: string } | null
  }
  sortBy: 'name' | 'date' | 'size' | 'views' | 'likes' | 'rating
  sortOrder: 'asc' | 'desc
  loading: boolean
  error: string | null
  shareDialog: {
    open: boolean
    fileId: string | null
    type: 'public' | 'private' | 'password
  }
  uploadProgress: { [key: string]: number }
}

type GalleryAction = 
  | { type: 'SET_FILES'; payload: GalleryFile[] }
  | { type: 'ADD_FILE'; payload: GalleryFile }
  | { type: &apos;UPDATE_FILE&apos;; payload: { id: string; updates: Partial<GalleryFile> } }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'SELECT_FILE'; payload: GalleryFile | null }
  | { type: 'SELECT_MULTIPLE'; payload: string[] }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' | 'masonry' }
  | { type: 'SET_GRID_SIZE'; payload: 'small' | 'medium' | 'large' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: &apos;SET_FILTERS&apos;; payload: Partial<GalleryState['filters']> }
  | { type: 'SET_SORT'; payload: { sortBy: string; sortOrder: 'asc' | 'desc' } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_SHARE_DIALOG'; payload: { fileId?: string; type?: 'public' | 'private' | 'password' } }
  | { type: 'UPDATE_UPLOAD_PROGRESS'; payload: { fileId: string; progress: number } }
  | { type: 'LIKE_FILE'; payload: string }
  | { type: 'VIEW_FILE'; payload: string }

const initialState: GalleryState = {
  files: [],
  collections: [],
  selectedFile: null,
  selectedFiles: [],
  viewMode: 'grid',
  gridSize: 'medium',
  searchQuery: '',
  filters: {
    type: [],
    category: [],
    status: [],
    tags: [],
    collection: null,
    dateRange: null
  },
  sortBy: 'date',
  sortOrder: 'desc',
  loading: false,
  error: null,
  shareDialog: {
    open: false,
    fileId: null,
    type: 'public
  },
  uploadProgress: {}
}

// Context7 Reducer Implementation
function galleryReducer(state: GalleryState, action: GalleryAction): GalleryState {
  switch (action.type) {
    case 'SET_FILES':
      return { ...state, files: action.payload, loading: false }
    
    case 'ADD_FILE':
      return { ...state, files: [action.payload, ...state.files] }
    
    case 'UPDATE_FILE':
      return {
        ...state,
        files: state.files.map(file => 
          file.id === action.payload.id ? { ...file, ...action.payload.updates } : file
        )
      }
    
    case 'DELETE_FILE':
      return {
        ...state,
        files: state.files.filter(file => file.id !== action.payload),
        selectedFile: state.selectedFile?.id === action.payload ? null : state.selectedFile,
        selectedFiles: state.selectedFiles.filter(id => id !== action.payload)
      }
    
    case 'SELECT_FILE':
      return { ...state, selectedFile: action.payload }
    
    case 'SELECT_MULTIPLE':
      return { ...state, selectedFiles: action.payload }
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }
    
    case 'SET_GRID_SIZE':
      return { ...state, gridSize: action.payload }
    
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload }
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } }
    
    case 'SET_SORT':
      return { ...state, sortBy: action.payload.sortBy as any, sortOrder: action.payload.sortOrder }
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'TOGGLE_SHARE_DIALOG':
      return {
        ...state,
        shareDialog: {
          open: !state.shareDialog.open,
          fileId: action.payload.fileId || state.shareDialog.fileId,
          type: action.payload.type || state.shareDialog.type
        }
      }
    
    case 'UPDATE_UPLOAD_PROGRESS':
      return {
        ...state,
        uploadProgress: {
          ...state.uploadProgress,
          [action.payload.fileId]: action.payload.progress
        }
      }
    
    case 'LIKE_FILE':
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload
            ? { ...file, metadata: { ...file.metadata, likes: file.metadata.likes + 1 } }
            : file
        )
      }
    
    case 'VIEW_FILE':
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload
            ? { 
                ...file, 
                metadata: { ...file.metadata, views: file.metadata.views + 1 },
                analytics: { 
                  ...file.analytics, 
                  totalViews: file.analytics.totalViews + 1,
                  uniqueViews: file.analytics.uniqueViews + 1 
                }
              }
            : file
        )
      }
    
    default:
      return state
  }
}

// Mock Data - Premium Portfolio Files
const mockFiles: GalleryFile[] = [
  {
    id: 'file_1',
    name: 'Brand Identity System',
    type: 'image',
    url: '/images/brand-identity.jpg',
    thumbnail: '/images/brand-identity-thumb.jpg',
    size: 4200000,
    dimensions: { width: 3840, height: 2160 },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
    tags: ['branding', 'identity', 'corporate', 'premium'],
    category: 'Branding',
    collection: 'Corporate Projects',
    metadata: {
      description: 'Complete brand identity system with logo, colors, typography, and guidelines',
      author: 'Alex Creative',
      views: 2847,
      likes: 342,
      downloads: 156,
      comments: 28,
      rating: 4.8,
      featured: true,
      status: 'published
    },
    sharing: {
      public: true,
      downloadable: true,
      commentable: true,
      price: 299,
      license: 'commercial
    },
    analytics: {
      totalViews: 2847,
      uniqueViews: 1923,
      averageTime: 185,
      sources: ['Direct', 'Social Media', 'Search'],
      locations: ['US', 'UK', 'Canada', 'Australia']
    }
  },
  {
    id: 'file_2',
    name: 'Product Demo Video',
    type: 'video',
    url: '/videos/product-demo.mp4',
    thumbnail: '/images/video-thumb-1.jpg',
    size: 15600000,
    dimensions: { width: 1920, height: 1080 },
    duration: 124,
    createdAt: '2024-01-18T14:20:00Z',
    updatedAt: '2024-01-22T09:15:00Z',
    tags: ['video', 'product', 'demo', 'animation'],
    category: 'Video Production',
    collection: 'Product Showcases',
    metadata: {
      description: 'Engaging product demonstration with smooth animations and professional narration',
      author: 'Alex Creative',
      views: 1456,
      likes: 187,
      downloads: 67,
      comments: 15,
      rating: 4.6,
      featured: false,
      status: 'published
    },
    sharing: {
      public: true,
      downloadable: false,
      commentable: true,
      price: 499,
      license: 'extended
    },
    analytics: {
      totalViews: 1456,
      uniqueViews: 1203,
      averageTime: 98,
      sources: ['Portfolio', 'Client Referral', 'LinkedIn'],
      locations: ['US', 'Germany', 'Japan']
    }
  },
  {
    id: 'file_3',
    name: 'Website Mockup Collection',
    type: 'image',
    url: '/images/website-mockups.jpg',
    thumbnail: '/images/website-mockups-thumb.jpg',
    size: 8400000,
    dimensions: { width: 2560, height: 1440 },
    createdAt: '2024-01-12T11:45:00Z',
    updatedAt: '2024-01-25T16:30:00Z',
    tags: ['ui', 'ux', 'website', 'mockup', 'responsive'],
    category: 'UI/UX Design',
    collection: 'Web Projects',
    metadata: {
      description: 'Responsive website mockups showcasing modern design principles and user experience',
      author: 'Alex Creative',
      views: 3251,
      likes: 428,
      downloads: 234,
      comments: 42,
      rating: 4.9,
      featured: true,
      status: 'published
    },
    sharing: {
      public: true,
      downloadable: true,
      commentable: true,
      price: 199,
      license: 'standard
    },
    analytics: {
      totalViews: 3251,
      uniqueViews: 2684,
      averageTime: 156,
      sources: ['Behance', 'Dribbble', 'Portfolio'],
      locations: ['US', 'UK', 'Netherlands', 'Sweden']
    }
  },
  {
    id: 'file_4',
    name: 'Mobile App Prototype',
    type: 'document',
    url: '/documents/app-prototype.figma',
    thumbnail: '/images/app-prototype-thumb.jpg',
    size: 2100000,
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-28T12:00:00Z',
    tags: ['mobile', 'app', 'prototype', 'figma', 'interactive'],
    category: 'Mobile Design',
    collection: 'App Projects',
    metadata: {
      description: 'Interactive mobile app prototype with micro-interactions and user flow diagrams',
      author: 'Alex Creative',
      views: 1834,
      likes: 245,
      downloads: 89,
      comments: 31,
      rating: 4.7,
      featured: false,
      status: 'published
    },
    sharing: {
      public: true,
      downloadable: false,
      commentable: true,
      price: 399,
      license: 'extended
    },
    analytics: {
      totalViews: 1834,
      uniqueViews: 1567,
      averageTime: 267,
      sources: ['Portfolio', 'Client Referral'],
      locations: ['US', 'Canada', 'Australia']
    }
  }
]

const mockCollections: GalleryCollection[] = [
  {
    id: 'col_1',
    name: 'Corporate Projects',
    description: 'Professional corporate branding and identity projects',
    thumbnail: '/images/corporate-collection.jpg',
    fileCount: 12,
    totalViews: 8456,
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z
  },
  {
    id: 'col_2',
    name: 'Product Showcases',
    description: 'Product videos and interactive demonstrations',
    thumbnail: '/images/product-collection.jpg',
    fileCount: 8,
    totalViews: 5234,
    isPublic: true,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-28T00:00:00Z
  },
  {
    id: 'col_3',
    name: 'Web Projects',
    description: 'Website designs and UI/UX projects',
    thumbnail: '/images/web-collection.jpg',
    fileCount: 15,
    totalViews: 12879,
    isPublic: true,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-30T00:00:00Z
  }
]

interface EnhancedGalleryProps {
  className?: string
  showCollections?: boolean
  allowUpload?: boolean
  showAnalytics?: boolean
  mode?: 'portfolio' | 'client' | 'admin
}

export function EnhancedGallery({ 
  className = '',
  showCollections = true,
  allowUpload = true,
  showAnalytics = true,
  mode = 'portfolio
}: EnhancedGalleryProps) {
  const [state, dispatch] = useReducer(galleryReducer, initialState)
  const [selectedView, setSelectedView] = useState<&apos;files&apos; | &apos;collections&apos;>('files')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Initialize mock data
  useEffect(() => {
    dispatch({ type: 'SET_FILES', payload: mockFiles })
  }, [])

  // Filtered and sorted files
  const filteredFiles = state.files.filter(file => {
    if (state.searchQuery && !file.name.toLowerCase().includes(state.searchQuery.toLowerCase()) &&
        !file.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()))) {
      return false
    }
    if (state.filters.type.length > 0 && !state.filters.type.includes(file.type)) {
      return false
    }
    if (state.filters.category.length > 0 && !state.filters.category.includes(file.category)) {
      return false
    }
    if (state.filters.collection && file.collection !== state.filters.collection) {
      return false
    }
    return true
  })

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    const multiplier = state.sortOrder === 'asc' ? 1 : -1
    switch (state.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name) * multiplier
      case 'date':
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier
      case 'size':
        return (a.size - b.size) * multiplier
      case 'views':
        return (a.metadata.views - b.metadata.views) * multiplier
      case 'likes':
        return (a.metadata.likes - b.metadata.likes) * multiplier
      case 'rating':
        return (a.metadata.rating - b.metadata.rating) * multiplier
      default:
        return 0
    }
  })

  const handleFileSelect = useCallback((file: GalleryFile) => {
    dispatch({ type: 'SELECT_FILE', payload: file })
    dispatch({ type: 'VIEW_FILE', payload: file.id })
  }, [])

  const handleLike = useCallback((fileId: string) => {
    dispatch({ type: 'LIKE_FILE', payload: fileId })
  }, [])

  const getFileIcon = (type: string) => {
    switch (type) {
      case &apos;image&apos;: return <ImageIcon className= "w-4 h-4" />
      case &apos;video&apos;: return <Video className= "w-4 h-4" />
      case &apos;document&apos;: return <FileText className= "w-4 h-4" />
      case &apos;code&apos;: return <Code className= "w-4 h-4" />
      case &apos;audio&apos;: return <Music className= "w-4 h-4" />
      case &apos;archive&apos;: return <Archive className= "w-4 h-4" />
      default: return <FileText className= "w-4 h-4" />
    }
  }

  const getGridSizeClass = () => {
    switch (state.gridSize) {
      case 'small': return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8
      case 'medium': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
      case 'large': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className= "flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className= "text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
            Enhanced Gallery
          </h1>
          <p className= "text-slate-600 font-light">
            Professional portfolio management inspired by Pixieset and Behance
          </p>
        </div>

        <div className= "flex items-center gap-2">
          <Badge variant= "outline" className= "bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 text-emerald-700">
            <TrendingUp className= "w-3 h-3 mr-1" />
            {state.files.reduce((sum, f) => sum + f.metadata.views, 0).toLocaleString()} Views
          </Badge>
          <Badge variant= "outline" className= "bg-gradient-to-r from-rose-50 to-orange-50 border-rose-200 text-rose-700">
            <Heart className= "w-3 h-3 mr-1" />
            {state.files.reduce((sum, f) => sum + f.metadata.likes, 0).toLocaleString()} Likes
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <Card className= "bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
        <CardContent className= "p-6">
          <div className= "flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className= "flex-1">
              <div className= "relative">
                <Search className= "absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder= "Search files, tags, or collections...
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                  className= "pl-10 bg-white/60 border-white/20 focus:bg-white
                />
              </div>
            </div>

            {/* View Options */}
            <div className= "flex items-center gap-2">
              <div className= "flex items-center border rounded-lg bg-white/60 border-white/20">
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
                  size= "sm
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'grid' })}
                  className= "rounded-r-none
                >
                  <Grid className= "w-4 h-4" />
                </Button>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'ghost'}
                  size= "sm
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
                  className= "rounded-none border-x
                >
                  <List className= "w-4 h-4" />
                </Button>
                <Button
                  variant={state.viewMode === 'masonry' ? 'default' : 'ghost'}
                  size= "sm
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'masonry' })}
                  className= "rounded-l-none
                >
                  <Layers className= "w-4 h-4" />
                </Button>
              </div>

              {/* Grid Size for Grid View */}
              {state.viewMode === 'grid' && (
                <div className= "flex items-center border rounded-lg bg-white/60 border-white/20">
                  <Button
                    variant={state.gridSize === 'small' ? 'default' : 'ghost'}
                    size= "sm
                    onClick={() => dispatch({ type: 'SET_GRID_SIZE', payload: 'small' })}
                    className= "rounded-r-none text-xs
                  >
                    S
                  </Button>
                  <Button
                    variant={state.gridSize === 'medium' ? 'default' : 'ghost'}
                    size= "sm
                    onClick={() => dispatch({ type: 'SET_GRID_SIZE', payload: 'medium' })}
                    className= "rounded-none border-x text-xs
                  >
                    M
                  </Button>
                  <Button
                    variant={state.gridSize === 'large' ? 'default' : 'ghost'}
                    size= "sm
                    onClick={() => dispatch({ type: 'SET_GRID_SIZE', payload: 'large' })}
                    className= "rounded-l-none text-xs
                  >
                    L
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Filters and Sort */}
          <div className= "flex flex-wrap items-center gap-2 mt-4">
            <Button variant= "outline" size= "sm" className= "bg-white/60 border-white/20">
              <Filter className= "w-4 h-4 mr-2" />
              Filters
            </Button>
            
            <select 
              value={`${state.sortBy}-${state.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder: sortOrder as 'asc' | 'desc' } })
              }}
              className= "px-3 py-1.5 text-sm border rounded-md bg-white/60 border-white/20 focus:bg-white
            >
              <option value= "date-desc">Newest First</option>
              <option value= "date-asc">Oldest First</option>
              <option value= "name-asc">Name A-Z</option>
              <option value= "name-desc">Name Z-A</option>
              <option value= "views-desc">Most Viewed</option>
              <option value= "likes-desc">Most Liked</option>
              <option value= "rating-desc">Highest Rated</option>
              <option value= "size-desc">Largest</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Collections/Files Toggle */}
      {showCollections && (
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as &apos;files&apos; | &apos;collections&apos;)}>
          <TabsList className= "grid w-full grid-cols-2 bg-white/60 backdrop-blur-xl border-white/20">
            <TabsTrigger value= "files" className= "flex items-center gap-2">
              <ImageIcon className= "w-4 h-4" />
              Files ({sortedFiles.length})
            </TabsTrigger>
            <TabsTrigger value= "collections" className= "flex items-center gap-2">
              <FolderOpen className= "w-4 h-4" />
              Collections ({mockCollections.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value= "files" className= "space-y-6">
            {/* Files Grid */}
            {state.viewMode === 'grid' && (
              <div className={`grid gap-4 ${getGridSizeClass()}`}>
                {sortedFiles.map((file, index) => (
                  <Card 
                    key={file.id} 
                    className= "group bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden
                    onClick={() => handleFileSelect(file)}
                  >
                    {/* Thumbnail */}
                    <div className= "relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      <div className= "absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"></div>
                      
                      {/* File Type Icon */}
                      <div className= "absolute top-2 left-2 z-10">
                        <div className= "p-1.5 bg-purple-100/80 backdrop-blur-sm rounded-lg">
                          {getFileIcon(file.type)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className= "absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className= "flex gap-1">
                          <Button 
                            size= "sm" 
                            variant= "outline" 
                            className= "w-8 h-8 p-0 bg-purple-100/80 backdrop-blur-sm border-purple-200 hover:bg-purple-200/80
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(file.id)
                            }}
                          >
                            <Heart className= "w-3 h-3" />
                          </Button>
                          <Button 
                            size= "sm" 
                            variant= "outline" 
                            className= "w-8 h-8 p-0 bg-purple-100/80 backdrop-blur-sm border-purple-200 hover:bg-purple-200/80
                            onClick={(e) => {
                              e.stopPropagation()
                              dispatch({ type: 'TOGGLE_SHARE_DIALOG', payload: { fileId: file.id } })
                            }}
                          >
                            <Share2 className= "w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Featured Badge */}
                      {file.metadata.featured && (
                        <div className= "absolute bottom-2 left-2 z-10">
                          <Badge className= "bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                            <Star className= "w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}

                      {/* Play Button for Videos */}
                      {file.type === 'video' && (
                        <div className= "absolute inset-0 flex items-center justify-center">
                          <div className= "w-16 h-16 bg-purple-600/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className= "w-8 h-8 text-white fill-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <CardContent className= "p-4">
                      <h3 className= "font-medium text-slate-800 mb-1 line-clamp-1">{file.name}</h3>
                      <p className= "text-xs text-slate-600 mb-2 line-clamp-2">{file.metadata.description}</p>
                      
                      {/* Stats */}
                      <div className= "flex items-center justify-between text-xs text-slate-500">
                        <div className= "flex items-center gap-3">
                          <span className= "flex items-center gap-1">
                            <Eye className= "w-3 h-3" />
                            {file.metadata.views.toLocaleString()}
                          </span>
                          <span className= "flex items-center gap-1">
                            <Heart className= "w-3 h-3" />
                            {file.metadata.likes}
                          </span>
                          {file.metadata.rating > 0 && (
                            <span className= "flex items-center gap-1">
                              <Star className= "w-3 h-3 fill-amber-400 text-amber-400" />
                              {file.metadata.rating}
                            </span>
                          )}
                        </div>
                        {file.sharing.price && (
                          <Badge variant= "outline" className= "text-xs bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 text-emerald-700">
                            ${file.sharing.price}
                          </Badge>
                        )}
                      </div>

                      {/* Tags */}
                      <div className= "flex flex-wrap gap-1 mt-2">
                        {file.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant= "outline" className= "text-xs bg-slate-50 text-slate-600 border-slate-200">
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 3 && (
                          <Badge variant= "outline" className= "text-xs bg-slate-50 text-slate-600 border-slate-200">
                            +{file.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* List View */}
            {state.viewMode === 'list' && (
              <div className= "space-y-3">
                {sortedFiles.map((file) => (
                  <Card 
                    key={file.id} 
                    className= "group bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury hover:shadow-xl transition-all duration-300 cursor-pointer
                    onClick={() => handleFileSelect(file)}
                  >
                    <CardContent className= "p-4">
                      <div className= "flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className= "w-16 h-16 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getFileIcon(file.type)}
                        </div>

                        {/* Content */}
                        <div className= "flex-1 min-w-0">
                          <div className= "flex items-center gap-2 mb-1">
                            <h3 className= "font-medium text-slate-800 truncate">{file.name}</h3>
                            {file.metadata.featured && (
                              <Badge className= "bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                                <Star className= "w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className= "text-sm text-slate-600 line-clamp-1 mb-2">{file.metadata.description}</p>
                          
                          {/* Tags */}
                          <div className= "flex flex-wrap gap-1">
                            {file.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} variant= "outline" className= "text-xs bg-slate-50 text-slate-600 border-slate-200">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className= "flex items-center gap-6 text-sm text-slate-500">
                          <div className= "flex items-center gap-1">
                            <Eye className= "w-4 h-4" />
                            <span>{file.metadata.views.toLocaleString()}</span>
                          </div>
                          <div className= "flex items-center gap-1">
                            <Heart className= "w-4 h-4" />
                            <span>{file.metadata.likes}</span>
                          </div>
                          {file.metadata.rating > 0 && (
                            <div className= "flex items-center gap-1">
                              <Star className= "w-4 h-4 fill-amber-400 text-amber-400" />
                              <span>{file.metadata.rating}</span>
                            </div>
                          )}
                          {file.sharing.price && (
                            <Badge variant= "outline" className= "bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 text-emerald-700">
                              ${file.sharing.price}
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className= "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size= "sm" 
                            variant= "outline" 
                            className= "w-8 h-8 p-0
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(file.id)
                            }}
                          >
                            <Heart className= "w-4 h-4" />
                          </Button>
                          <Button 
                            size= "sm" 
                            variant= "outline" 
                            className= "w-8 h-8 p-0
                            onClick={(e) => {
                              e.stopPropagation()
                              dispatch({ type: 'TOGGLE_SHARE_DIALOG', payload: { fileId: file.id } })
                            }}
                          >
                            <Share2 className= "w-4 h-4" />
                          </Button>
                          <Button size= "sm" variant= "outline" className= "w-8 h-8 p-0">
                            <MoreHorizontal className= "w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value= "collections" className= "space-y-6">
            {/* Collections Grid */}
            <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCollections.map((collection) => (
                <Card 
                  key={collection.id} 
                  className= "group bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden
                  onClick={() => dispatch({ type: 'SET_FILTERS', payload: { collection: collection.name } })}
                >
                  {/* Thumbnail */}
                  <div className= "relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    <div className= "absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"></div>
                    
                    {/* Collection Icon */}
                    <div className= "absolute inset-0 flex items-center justify-center">
                      <div className= "w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FolderOpen className= "w-10 h-10 text-slate-600" />
                      </div>
                    </div>

                    {/* Stats Badge */}
                    <div className= "absolute top-3 right-3">
                                              <Badge className= "bg-purple-600/90 backdrop-blur-sm text-white border-purple-200">
                        {collection.fileCount} files
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className= "p-6">
                    <h3 className= "font-medium text-slate-800 mb-2">{collection.name}</h3>
                    <p className= "text-sm text-slate-600 mb-4 line-clamp-2">{collection.description}</p>
                    
                    {/* Stats */}
                    <div className= "flex items-center justify-between">
                      <div className= "flex items-center gap-3 text-sm text-slate-500">
                        <span className= "flex items-center gap-1">
                          <Eye className= "w-4 h-4" />
                          {collection.totalViews.toLocaleString()}
                        </span>
                        <span className= "flex items-center gap-1">
                          <Calendar className= "w-4 h-4" />
                          {new Date(collection.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {collection.isPublic && (
                        <Badge variant= "outline" className= "text-xs bg-emerald-50 text-emerald-600 border-emerald-200">
                          Public
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {sortedFiles.length === 0 && (
        <Card className= "bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
          <CardContent className= "p-12 text-center">
            <div className= "w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ImageIcon className= "w-10 h-10 text-slate-400" />
            </div>
            <h3 className= "text-lg font-medium text-slate-800 mb-2">No files found</h3>
            <p className= "text-slate-600 mb-6">Try adjusting your search or filters to find what you&apos;re looking for.</p>
            {allowUpload && (
              <Button className= "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                <Camera className= "w-4 h-4 mr-2" />
                Upload Your First File
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Share Dialog */}
      <Dialog open={state.shareDialog.open} onOpenChange={() => dispatch({ type: &apos;TOGGLE_SHARE_DIALOG&apos;, payload: {} })}>
        <DialogContent className= "bg-white/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle>Share File</DialogTitle>
          </DialogHeader>
          <div className= "space-y-4">
            <div className= "flex items-center gap-2">
              <Input 
                value= "https://portfolio.alexcreative.com/file/brand-identity-system" 
                readOnly 
                className= "flex-1
              />
              <Button size= "sm" variant= "outline">
                <Copy className= "w-4 h-4" />
              </Button>
            </div>
            
            <div className= "flex gap-2">
              <Button className= "flex-1" variant= "outline">
                <Mail className= "w-4 h-4 mr-2" />
                Email
              </Button>
              <Button className= "flex-1" variant= "outline">
                <ExternalLink className= "w-4 h-4 mr-2" />
                Social
              </Button>
              <Button className= "flex-1" variant= "outline">
                <Link className= "w-4 h-4 mr-2" />
                Embed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 