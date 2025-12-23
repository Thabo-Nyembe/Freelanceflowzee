'use client'

import { useState, useMemo } from 'react'
import {
  Image,
  Search,
  Filter,
  Download,
  Heart,
  Share2,
  Plus,
  MoreHorizontal,
  Grid3X3,
  LayoutGrid,
  Camera,
  Aperture,
  MapPin,
  Calendar,
  Eye,
  Copy,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Bookmark,
  BookmarkCheck,
  Upload,
  Folder,
  FolderPlus,
  User,
  Users,
  TrendingUp,
  Clock,
  Info,
  Settings,
  ExternalLink,
  Link2,
  Tag,
  Palette,
  Maximize2,
  ZoomIn,
  Edit,
  Trash2,
  LayoutList
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// Types
type Orientation = 'all' | 'landscape' | 'portrait' | 'square'
type Color = 'all' | 'black_white' | 'warm' | 'cool' | 'vibrant' | 'muted'

interface Photo {
  id: string
  url: string
  thumbnailUrl: string
  title: string
  description: string
  width: number
  height: number
  color: string
  photographer: Photographer
  location: string | null
  camera: string | null
  lens: string | null
  aperture: string | null
  shutterSpeed: string | null
  iso: number | null
  focalLength: string | null
  takenAt: string | null
  uploadedAt: string
  views: number
  downloads: number
  likes: number
  isLiked: boolean
  isSaved: boolean
  tags: string[]
  license: 'free' | 'premium' | 'editorial'
  collections: string[]
}

interface Photographer {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  location: string
  photos: number
  followers: number
  following: number
}

interface Collection {
  id: string
  name: string
  description: string
  coverPhoto: string
  photoCount: number
  isPrivate: boolean
  createdBy: string
  createdAt: string
}

interface Topic {
  id: string
  name: string
  slug: string
  description: string
  coverPhoto: string
  photoCount: number
  featured: boolean
}

// Mock Data
const mockPhotographers: Photographer[] = [
  {
    id: '1',
    name: 'Alex Rivera',
    username: 'alexrivera',
    avatar: '/avatars/alex.jpg',
    bio: 'Travel and landscape photographer. Capturing moments around the world.',
    location: 'San Francisco, CA',
    photos: 342,
    followers: 12500,
    following: 156
  },
  {
    id: '2',
    name: 'Sarah Kim',
    username: 'sarahkim',
    avatar: '/avatars/sarah.jpg',
    bio: 'Portrait and lifestyle photographer based in NYC.',
    location: 'New York, NY',
    photos: 218,
    followers: 8900,
    following: 234
  },
  {
    id: '3',
    name: 'James Chen',
    username: 'jameschen',
    avatar: '/avatars/james.jpg',
    bio: 'Architecture and urban photography enthusiast.',
    location: 'Chicago, IL',
    photos: 156,
    followers: 5600,
    following: 89
  }
]

const mockPhotos: Photo[] = [
  {
    id: '1',
    url: '/gallery/mountain-sunset.jpg',
    thumbnailUrl: '/gallery/thumb/mountain-sunset.jpg',
    title: 'Mountain Sunset',
    description: 'Golden hour at the mountain peak with breathtaking views',
    width: 4000,
    height: 2667,
    color: '#f97316',
    photographer: mockPhotographers[0],
    location: 'Yosemite National Park, CA',
    camera: 'Sony A7R IV',
    lens: 'Sony 24-70mm f/2.8 GM',
    aperture: 'f/11',
    shutterSpeed: '1/125s',
    iso: 100,
    focalLength: '35mm',
    takenAt: '2024-10-15T18:30:00Z',
    uploadedAt: '2024-10-20T10:00:00Z',
    views: 15420,
    downloads: 892,
    likes: 1256,
    isLiked: true,
    isSaved: false,
    tags: ['nature', 'sunset', 'mountains', 'landscape', 'golden hour'],
    license: 'free',
    collections: ['1', '3']
  },
  {
    id: '2',
    url: '/gallery/city-skyline.jpg',
    thumbnailUrl: '/gallery/thumb/city-skyline.jpg',
    title: 'City Skyline at Night',
    description: 'Urban nightscape with city lights reflecting on the water',
    width: 5000,
    height: 3333,
    color: '#3b82f6',
    photographer: mockPhotographers[2],
    location: 'Chicago, IL',
    camera: 'Canon EOS R5',
    lens: 'Canon RF 15-35mm f/2.8L',
    aperture: 'f/8',
    shutterSpeed: '30s',
    iso: 400,
    focalLength: '24mm',
    takenAt: '2024-11-05T21:00:00Z',
    uploadedAt: '2024-11-10T14:30:00Z',
    views: 8932,
    downloads: 456,
    likes: 789,
    isLiked: false,
    isSaved: true,
    tags: ['city', 'night', 'architecture', 'urban', 'skyline'],
    license: 'free',
    collections: ['2']
  },
  {
    id: '3',
    url: '/gallery/portrait-studio.jpg',
    thumbnailUrl: '/gallery/thumb/portrait-studio.jpg',
    title: 'Studio Portrait',
    description: 'Professional studio portrait with dramatic lighting',
    width: 3000,
    height: 4500,
    color: '#1f2937',
    photographer: mockPhotographers[1],
    location: null,
    camera: 'Nikon Z9',
    lens: 'Nikon 85mm f/1.4S',
    aperture: 'f/2.0',
    shutterSpeed: '1/200s',
    iso: 200,
    focalLength: '85mm',
    takenAt: '2024-11-20T14:00:00Z',
    uploadedAt: '2024-11-22T09:15:00Z',
    views: 5678,
    downloads: 234,
    likes: 567,
    isLiked: false,
    isSaved: false,
    tags: ['portrait', 'studio', 'people', 'dramatic', 'lighting'],
    license: 'premium',
    collections: []
  },
  {
    id: '4',
    url: '/gallery/ocean-waves.jpg',
    thumbnailUrl: '/gallery/thumb/ocean-waves.jpg',
    title: 'Ocean Waves',
    description: 'Powerful waves crashing on the rocky shore',
    width: 4500,
    height: 3000,
    color: '#0ea5e9',
    photographer: mockPhotographers[0],
    location: 'Big Sur, CA',
    camera: 'Sony A7R IV',
    lens: 'Sony 70-200mm f/2.8 GM',
    aperture: 'f/5.6',
    shutterSpeed: '1/1000s',
    iso: 200,
    focalLength: '135mm',
    takenAt: '2024-09-28T07:45:00Z',
    uploadedAt: '2024-10-01T16:00:00Z',
    views: 12345,
    downloads: 678,
    likes: 945,
    isLiked: true,
    isSaved: true,
    tags: ['ocean', 'waves', 'seascape', 'nature', 'water'],
    license: 'free',
    collections: ['1']
  },
  {
    id: '5',
    url: '/gallery/autumn-forest.jpg',
    thumbnailUrl: '/gallery/thumb/autumn-forest.jpg',
    title: 'Autumn Forest Path',
    description: 'A winding path through colorful autumn foliage',
    width: 3500,
    height: 5250,
    color: '#ea580c',
    photographer: mockPhotographers[0],
    location: 'Vermont',
    camera: 'Sony A7R IV',
    lens: 'Sony 24mm f/1.4 GM',
    aperture: 'f/8',
    shutterSpeed: '1/60s',
    iso: 400,
    focalLength: '24mm',
    takenAt: '2024-10-20T11:30:00Z',
    uploadedAt: '2024-10-25T12:00:00Z',
    views: 9876,
    downloads: 543,
    likes: 821,
    isLiked: false,
    isSaved: false,
    tags: ['autumn', 'forest', 'fall', 'nature', 'path', 'trees'],
    license: 'free',
    collections: ['1', '3']
  },
  {
    id: '6',
    url: '/gallery/coffee-shop.jpg',
    thumbnailUrl: '/gallery/thumb/coffee-shop.jpg',
    title: 'Cozy Coffee Shop',
    description: 'Warm atmosphere in a local coffee shop',
    width: 4000,
    height: 4000,
    color: '#92400e',
    photographer: mockPhotographers[1],
    location: 'Brooklyn, NY',
    camera: 'Fujifilm X-T5',
    lens: 'Fujinon 35mm f/1.4',
    aperture: 'f/2.0',
    shutterSpeed: '1/125s',
    iso: 800,
    focalLength: '35mm',
    takenAt: '2024-11-15T10:00:00Z',
    uploadedAt: '2024-11-18T11:30:00Z',
    views: 4567,
    downloads: 189,
    likes: 423,
    isLiked: false,
    isSaved: false,
    tags: ['coffee', 'cafe', 'interior', 'lifestyle', 'cozy'],
    license: 'free',
    collections: []
  }
]

const mockCollections: Collection[] = [
  {
    id: '1',
    name: 'Nature & Landscapes',
    description: 'Beautiful natural scenery from around the world',
    coverPhoto: '/gallery/thumb/mountain-sunset.jpg',
    photoCount: 156,
    isPrivate: false,
    createdBy: 'Alex Rivera',
    createdAt: '2024-06-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Urban Architecture',
    description: 'City skylines and architectural marvels',
    coverPhoto: '/gallery/thumb/city-skyline.jpg',
    photoCount: 89,
    isPrivate: false,
    createdBy: 'James Chen',
    createdAt: '2024-07-20T00:00:00Z'
  },
  {
    id: '3',
    name: 'Autumn Vibes',
    description: 'Fall colors and seasonal photography',
    coverPhoto: '/gallery/thumb/autumn-forest.jpg',
    photoCount: 42,
    isPrivate: false,
    createdBy: 'Alex Rivera',
    createdAt: '2024-09-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'My Favorites',
    description: 'Personal collection of inspiring images',
    coverPhoto: '/gallery/thumb/ocean-waves.jpg',
    photoCount: 28,
    isPrivate: true,
    createdBy: 'You',
    createdAt: '2024-10-01T00:00:00Z'
  }
]

const mockTopics: Topic[] = [
  { id: '1', name: 'Nature', slug: 'nature', description: 'Photos of natural landscapes and wildlife', coverPhoto: '/topics/nature.jpg', photoCount: 45000, featured: true },
  { id: '2', name: 'Architecture', slug: 'architecture', description: 'Buildings and structural photography', coverPhoto: '/topics/arch.jpg', photoCount: 28000, featured: true },
  { id: '3', name: 'Travel', slug: 'travel', description: 'Destinations and adventures worldwide', coverPhoto: '/topics/travel.jpg', photoCount: 52000, featured: true },
  { id: '4', name: 'People', slug: 'people', description: 'Portraits and human moments', coverPhoto: '/topics/people.jpg', photoCount: 38000, featured: false },
  { id: '5', name: 'Food & Drink', slug: 'food-drink', description: 'Culinary photography', coverPhoto: '/topics/food.jpg', photoCount: 21000, featured: false },
  { id: '6', name: 'Business', slug: 'business', description: 'Work and professional life', coverPhoto: '/topics/business.jpg', photoCount: 15000, featured: false }
]

export default function GalleryClient() {
  const [activeTab, setActiveTab] = useState('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [orientation, setOrientation] = useState<Orientation>('all')
  const [color, setColor] = useState<Color>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'masonry' | 'grid'>('masonry')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showCreateCollection, setShowCreateCollection] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Stats
  const totalPhotos = mockPhotos.length
  const totalDownloads = mockPhotos.reduce((sum, p) => sum + p.downloads, 0)
  const totalViews = mockPhotos.reduce((sum, p) => sum + p.views, 0)

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return mockPhotos.filter(photo => {
      const matchesSearch = photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           photo.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))

      let matchesOrientation = true
      if (orientation !== 'all') {
        const ratio = photo.width / photo.height
        if (orientation === 'landscape') matchesOrientation = ratio > 1.2
        else if (orientation === 'portrait') matchesOrientation = ratio < 0.8
        else if (orientation === 'square') matchesOrientation = ratio >= 0.8 && ratio <= 1.2
      }

      return matchesSearch && matchesOrientation
    })
  }, [searchQuery, orientation])

  const handleCopyLink = () => {
    if (selectedPhoto) {
      navigator.clipboard.writeText(`https://gallery.app/photo/${selectedPhoto.id}`)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const getAspectRatio = (photo: Photo) => {
    const ratio = photo.width / photo.height
    if (ratio > 1.5) return 'col-span-2'
    if (ratio < 0.7) return 'row-span-2'
    return ''
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">

        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Image className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Photo Gallery</h1>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                    Unsplash Level
                  </span>
                </div>
                <p className="text-amber-100 max-w-2xl">
                  Beautiful, free images and photos for creative projects
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowUploadDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
                <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  <Settings className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-amber-200 text-sm mb-1">Photos</div>
                <div className="text-3xl font-bold text-white">{totalPhotos}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-amber-200 text-sm mb-1">Total Views</div>
                <div className="text-3xl font-bold text-white">{formatNumber(totalViews)}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-amber-200 text-sm mb-1">Downloads</div>
                <div className="text-3xl font-bold text-white">{formatNumber(totalDownloads)}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-amber-200 text-sm mb-1">Collections</div>
                <div className="text-3xl font-bold text-white">{mockCollections.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
              showFilters
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-600'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-3 ${viewMode === 'masonry' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 ${viewMode === 'grid' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Orientation</label>
                <div className="flex items-center gap-2">
                  {(['all', 'landscape', 'portrait', 'square'] as Orientation[]).map(o => (
                    <button
                      key={o}
                      onClick={() => setOrientation(o)}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                        orientation === o
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <div className="flex items-center gap-2">
                  {(['all', 'black_white', 'warm', 'cool', 'vibrant'] as Color[]).map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                        color === c
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {c.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl">
            <TabsTrigger value="browse" className="rounded-lg">Browse</TabsTrigger>
            <TabsTrigger value="collections" className="rounded-lg">Collections</TabsTrigger>
            <TabsTrigger value="contributors" className="rounded-lg">Contributors</TabsTrigger>
            <TabsTrigger value="topics" className="rounded-lg">Topics</TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="mt-6">
            {viewMode === 'masonry' ? (
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {filteredPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="break-inside-avoid group relative rounded-xl overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-800"
                    onClick={() => {
                      setSelectedPhoto(photo)
                      setLightboxIndex(index)
                    }}
                  >
                    <div
                      className="w-full"
                      style={{
                        paddingBottom: `${(photo.height / photo.width) * 100}%`,
                        backgroundColor: photo.color
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image className="w-12 h-12 text-white/30" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                      <div className="absolute inset-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="text-white text-sm font-medium">{photo.photographer.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Toggle save
                            }}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30"
                          >
                            {photo.isSaved ? (
                              <BookmarkCheck className="w-4 h-4 text-white" />
                            ) : (
                              <Bookmark className="w-4 h-4 text-white" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                // Toggle like
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm hover:bg-white/30"
                            >
                              <Heart className={`w-4 h-4 ${photo.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                              {formatNumber(photo.likes)}
                            </button>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPhoto(photo)
                            }}
                            className="px-4 py-1.5 bg-white rounded-lg text-gray-900 text-sm font-medium hover:bg-gray-100"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="aspect-square group relative rounded-xl overflow-hidden cursor-pointer"
                    style={{ backgroundColor: photo.color }}
                    onClick={() => {
                      setSelectedPhoto(photo)
                      setLightboxIndex(index)
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image className="w-12 h-12 text-white/30" />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                        <p className="text-white/70 text-xs">{photo.photographer.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Collections</h2>
              <button
                onClick={() => setShowCreateCollection(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                <FolderPlus className="w-4 h-4" />
                Create Collection
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockCollections.map(collection => (
                <div
                  key={collection.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-amber-500/50 transition-colors cursor-pointer group"
                >
                  <div className="h-40 relative" style={{ backgroundColor: '#d4a574' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Folder className="w-16 h-16 text-white/30" />
                    </div>
                    {collection.isPrivate && (
                      <span className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                        Private
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{collection.description}</p>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{collection.photoCount} photos</span>
                      <span>by {collection.createdBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Contributors Tab */}
          <TabsContent value="contributors" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockPhotographers.map(photographer => (
                <div
                  key={photographer.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-amber-500/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{photographer.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{photographer.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {photographer.location}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">{photographer.bio}</p>
                  <div className="flex items-center gap-6 mt-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">{photographer.photos}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">photos</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(photographer.followers)}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">followers</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent value="topics" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {mockTopics.map(topic => (
                <div
                  key={topic.id}
                  className="relative rounded-xl overflow-hidden cursor-pointer group aspect-[4/3]"
                  style={{ backgroundColor: '#d4a574' }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Tag className="w-8 h-8 text-white/30" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <h3 className="text-white font-semibold">{topic.name}</h3>
                    <p className="text-white/70 text-sm">{formatNumber(topic.photoCount)} photos</p>
                  </div>
                  {topic.featured && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                      Featured
                    </span>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Photo Detail Dialog */}
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedPhoto && (
              <div className="space-y-6">
                {/* Photo Preview */}
                <div
                  className="w-full rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: selectedPhoto.color,
                    aspectRatio: `${selectedPhoto.width}/${selectedPhoto.height}`,
                    maxHeight: '400px'
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-20 h-20 text-white/30" />
                  </div>
                </div>

                {/* Photo Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPhoto.title}</h2>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">{selectedPhoto.description}</p>
                    </div>

                    {/* Photographer */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{selectedPhoto.photographer.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{selectedPhoto.photographer.username}</p>
                      </div>
                      <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                        Follow
                      </button>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPhoto.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* EXIF Data */}
                    {selectedPhoto.camera && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Camera Info</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Camera className="w-4 h-4" />
                            {selectedPhoto.camera}
                          </div>
                          {selectedPhoto.lens && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Aperture className="w-4 h-4" />
                              {selectedPhoto.lens}
                            </div>
                          )}
                          {selectedPhoto.aperture && (
                            <div className="text-gray-600 dark:text-gray-400">{selectedPhoto.aperture}</div>
                          )}
                          {selectedPhoto.shutterSpeed && (
                            <div className="text-gray-600 dark:text-gray-400">{selectedPhoto.shutterSpeed}</div>
                          )}
                          {selectedPhoto.iso && (
                            <div className="text-gray-600 dark:text-gray-400">ISO {selectedPhoto.iso}</div>
                          )}
                          {selectedPhoto.focalLength && (
                            <div className="text-gray-600 dark:text-gray-400">{selectedPhoto.focalLength}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {selectedPhoto.location && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        {selectedPhoto.location}
                      </div>
                    )}
                  </div>

                  {/* Download Panel */}
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Download</h4>
                      <button className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Free Download
                      </button>
                      <div className="space-y-2 text-sm">
                        <button className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-between">
                          <span>Small (640x{Math.round(640 * selectedPhoto.height / selectedPhoto.width)})</span>
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-between">
                          <span>Medium (1920x{Math.round(1920 * selectedPhoto.height / selectedPhoto.width)})</span>
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-between">
                          <span>Large (2400x{Math.round(2400 * selectedPhoto.height / selectedPhoto.width)})</span>
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-between">
                          <span>Original ({selectedPhoto.width}x{selectedPhoto.height})</span>
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(selectedPhoto.views)}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(selectedPhoto.downloads)}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Downloads</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(selectedPhoto.likes)}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Likes</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Heart className={`w-4 h-4 ${selectedPhoto.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        Like
                      </button>
                      <button className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Bookmark className={`w-4 h-4 ${selectedPhoto.isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                        Save
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* License */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div className="flex items-center gap-2 text-sm">
                        <Info className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {selectedPhoto.license === 'free' ? 'Free to use' : selectedPhoto.license === 'premium' ? 'Premium license' : 'Editorial use only'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-amber-500 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Drag and drop your photo here</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">or click to browse</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Give your photo a title"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  placeholder="Describe your photo"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                <input
                  type="text"
                  placeholder="nature, landscape, sunset"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowUploadDialog(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                  Upload
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Collection Dialog */}
        <Dialog open={showCreateCollection} onOpenChange={setShowCreateCollection}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="My Collection"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  placeholder="What's this collection about?"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="private" className="rounded border-gray-300" />
                <label htmlFor="private" className="text-sm text-gray-700 dark:text-gray-300">Make this collection private</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowCreateCollection(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                  Create
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
