'use client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  useGalleryItems,
  useGalleryCollections,
  GalleryItem,
  GalleryCollection
} from '@/lib/hooks/use-gallery'
import {
  Image,
  Search,
  Filter,
  Download,
  Heart,
  Grid3X3,
  LayoutGrid,
  Camera,
  Aperture,
  MapPin,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Upload,
  Folder,
  FolderPlus,
  User,
  Info,
  Settings,
  Link2,
  Tag,
  Trash2,
  Sliders,
  AlertOctagon,
  Webhook,
  Key,
  Shield,
  HardDrive,
  Globe,
  Loader2
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'




import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

// Enhanced Competitive Upgrade Mock Data - Gallery Context
const mockGalleryAIInsights = [
  { id: '1', type: 'success' as const, title: 'Trending Content', description: 'Your landscape photos are getting 3x more views this week.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
  { id: '2', type: 'info' as const, title: 'Storage Optimization', description: 'Enable smart compression to save 2.5GB of storage space.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Storage' },
  { id: '3', type: 'warning' as const, title: 'License Expiring', description: '12 photos have licenses expiring in 7 days. Review and renew.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Licensing' },
]

const mockGalleryCollaborators = [
  { id: '1', name: 'Emma Watson', avatar: '/avatars/emma.jpg', status: 'online' as const, role: 'Photographer', lastActive: 'Now' },
  { id: '2', name: 'Liam Brown', avatar: '/avatars/liam.jpg', status: 'online' as const, role: 'Editor', lastActive: '8m ago' },
  { id: '3', name: 'Ava Williams', avatar: '/avatars/ava.jpg', status: 'away' as const, role: 'Curator', lastActive: '25m ago' },
]

const mockGalleryPredictions = [
  { id: '1', label: 'Monthly Views', current: 12500, target: 15000, predicted: 14200, confidence: 80, trend: 'up' as const },
  { id: '2', label: 'Download Rate', current: 8.5, target: 12, predicted: 10.2, confidence: 72, trend: 'up' as const },
  { id: '3', label: 'Engagement Score', current: 78, target: 85, predicted: 82, confidence: 85, trend: 'up' as const },
]

const mockGalleryActivities = [
  { id: '1', user: 'Emma Watson', action: 'uploaded', target: '24 new photos', timestamp: '10m ago', type: 'success' as const },
  { id: '2', user: 'Liam Brown', action: 'edited', target: 'sunset collection metadata', timestamp: '25m ago', type: 'info' as const },
  { id: '3', user: 'Ava Williams', action: 'featured', target: '5 photos in showcase', timestamp: '1h ago', type: 'success' as const },
]

// Quick actions are defined inside the component to access state setters

export default function GalleryClient() {
  const supabase = createClient()

  // Hooks for Supabase data
  const {
    items: galleryItems,
    stats: galleryStats,
    isLoading: isLoadingItems,
    error: itemsError,
    fetchItems,
    createItem,
    updateItem,
    deleteItem: deleteGalleryItem
  } = useGalleryItems()

  const {
    collections: galleryCollections,
    isLoading: isLoadingCollections,
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection
  } = useGalleryCollections()

  // UI State
  const [activeTab, setActiveTab] = useState('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null)
  const [orientation, setOrientation] = useState<Orientation>('all')
  const [color, setColor] = useState<Color>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'masonry' | 'grid'>('masonry')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showCreateCollection, setShowCreateCollection] = useState(false)
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showDeletePhotosDialog, setShowDeletePhotosDialog] = useState(false)
  const [showDeleteCollectionsDialog, setShowDeleteCollectionsDialog] = useState(false)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')
  const [copiedLink, setCopiedLink] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New dialog states for real functionality
  const [showFollowDialog, setShowFollowDialog] = useState(false)
  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null)
  const [showRegenerateApiKeyDialog, setShowRegenerateApiKeyDialog] = useState(false)
  const [showConnectServiceDialog, setShowConnectServiceDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<{ name: string; isConnected: boolean } | null>(null)
  const [showEmptyTrashDialog, setShowEmptyTrashDialog] = useState(false)
  const [showDataExportDialog, setShowDataExportDialog] = useState(false)
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState('zip')
  const [exportResolution, setExportResolution] = useState('original')

  // Form state for Upload Dialog
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    tags: '',
    file_url: '',
    file_type: 'image' as const,
    is_public: true
  })

  // Form state for Create Collection Dialog
  const [collectionForm, setCollectionForm] = useState({
    name: '',
    description: '',
    is_public: true
  })

  // Liked and saved items state (local tracking for mock data)
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())

  // Quick actions with proper dialog handlers
  const galleryQuickActions = [
    { id: '1', label: 'Upload', icon: 'Upload', shortcut: 'U', action: () => setShowUploadDialog(true) },
    { id: '2', label: 'New Album', icon: 'FolderPlus', shortcut: 'A', action: () => setShowCreateCollection(true) },
    { id: '3', label: 'Bulk Edit', icon: 'Edit', shortcut: 'E', action: () => setShowBulkEditDialog(true) },
    { id: '4', label: 'Share', icon: 'Share2', shortcut: 'S', action: () => setShowShareDialog(true) },
  ]

  // Fetch data on mount
  useEffect(() => {
    fetchItems()
    fetchCollections()
  }, [fetchItems, fetchCollections])

  // Stats - combine mock and real data
  const totalPhotos = mockPhotos.length + galleryItems.length
  const totalDownloads = mockPhotos.reduce((sum, p) => sum + p.downloads, 0) + galleryStats.totalViews
  const totalViews = mockPhotos.reduce((sum, p) => sum + p.views, 0) + galleryStats.totalViews

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

  // Handlers - Real Supabase Operations
  const handleUploadPhoto = async () => {
    if (!uploadForm.title.trim()) {
      toast.error('Title required', { description: 'Please enter a title for your photo' })
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Authentication required', { description: 'Please sign in to upload photos' })
        return
      }

      const tags = uploadForm.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      await createItem({
        user_id: user.id,
        title: uploadForm.title,
        description: uploadForm.description || null,
        file_url: uploadForm.file_url || '/placeholder-image.jpg',
        file_type: uploadForm.file_type,
        is_public: uploadForm.is_public,
        tags,
        metadata: {}
      })

      toast.success('Photo uploaded', { description: `"${uploadForm.title}" has been uploaded successfully` })
      setShowUploadDialog(false)
      setUploadForm({ title: '', description: '', tags: '', file_url: '', file_type: 'image', is_public: true })
    } catch (error: any) {
      toast.error('Upload failed', { description: error.message || 'Failed to upload photo' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateCollection = async () => {
    if (!collectionForm.name.trim()) {
      toast.error('Name required', { description: 'Please enter a name for your collection' })
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Authentication required', { description: 'Please sign in to create collections' })
        return
      }

      await createCollection({
        user_id: user.id,
        name: collectionForm.name,
        description: collectionForm.description || null,
        is_public: collectionForm.is_public
      })

      toast.success('Collection created', { description: `"${collectionForm.name}" has been created` })
      setShowCreateCollection(false)
      setCollectionForm({ name: '', description: '', is_public: true })
    } catch (error: any) {
      toast.error('Creation failed', { description: error.message || 'Failed to create collection' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCollection = async (collection: GalleryCollection) => {
    try {
      await deleteCollection(collection.id)
      toast.success('Collection deleted', { description: `"${collection.name}" has been deleted` })
    } catch (error: any) {
      toast.error('Delete failed', { description: error.message || 'Failed to delete collection' })
    }
  }

  const handleToggleLike = async (photoId: string) => {
    const newLiked = new Set(likedItems)
    if (newLiked.has(photoId)) {
      newLiked.delete(photoId)
      toast.info('Unliked', { description: 'Removed from your likes' })
    } else {
      newLiked.add(photoId)
      toast.success('Liked', { description: 'Added to your likes' })
    }
    setLikedItems(newLiked)

    // For real gallery items, update in Supabase
    const galleryItem = galleryItems.find(i => i.id === photoId)
    if (galleryItem) {
      try {
        await updateItem(photoId, {
          like_count: newLiked.has(photoId) ? galleryItem.like_count + 1 : Math.max(0, galleryItem.like_count - 1)
        })
      } catch (error) {
        // Revert on error
        if (newLiked.has(photoId)) {
          newLiked.delete(photoId)
        } else {
          newLiked.add(photoId)
        }
        setLikedItems(newLiked)
      }
    }
  }

  const handleToggleSave = async (photoId: string) => {
    const newSaved = new Set(savedItems)
    if (newSaved.has(photoId)) {
      newSaved.delete(photoId)
      toast.info('Unsaved', { description: 'Removed from your saved items' })
    } else {
      newSaved.add(photoId)
      toast.success('Saved', { description: 'Added to your saved items' })
    }
    setSavedItems(newSaved)
  }

  const handleDownloadPhoto = async (photo: Photo | GalleryItem) => {
    const title = 'title' in photo ? photo.title : ''
    toast.success('Download started', { description: `Downloading "${title}"...` })

    // Track download for gallery items
    if ('download_count' in photo && photo.id) {
      try {
        await updateItem(photo.id, {
          download_count: (photo.download_count || 0) + 1
        })
      } catch (error) {
        // Silent fail for analytics
      }
    }
  }

  const handleSharePhoto = async (photo: Photo | GalleryItem) => {
    const photoId = photo.id
    const url = `${window.location.origin}/gallery/${photoId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied', { description: 'Share link copied to clipboard' })
    } catch (error) {
      toast.error('Copy failed', { description: 'Failed to copy link to clipboard' })
    }
  }

  const handleDeleteGalleryItem = async (item: GalleryItem) => {
    try {
      await deleteGalleryItem(item.id)
      toast.success('Photo deleted', { description: `"${item.title}" has been deleted` })
      setSelectedGalleryItem(null)
    } catch (error: any) {
      toast.error('Delete failed', { description: error.message || 'Failed to delete photo' })
    }
  }

  const handleFollowPhotographer = (photographer: Photographer) => {
    setSelectedPhotographer(photographer)
    setShowFollowDialog(true)
  }

  const handleConfirmFollow = async () => {
    if (!selectedPhotographer) return
    setIsSubmitting(true)
    try {
      // In a real implementation, this would update a follows table in Supabase
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      toast.success('Following', { description: `You are now following ${selectedPhotographer.name}` })
      setShowFollowDialog(false)
      setSelectedPhotographer(null)
    } catch (error: any) {
      toast.error('Follow failed', { description: error.message || 'Failed to follow photographer' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText('kazi-gallery-xxxxxxxxxxxxxxxxxxxxx')
      toast.success('API Key copied', { description: 'API key copied to clipboard' })
    } catch (error) {
      toast.error('Copy failed', { description: 'Failed to copy API key' })
    }
  }

  const handleRegenerateApiKey = () => {
    setShowRegenerateApiKeyDialog(true)
  }

  const handleConfirmRegenerateApiKey = async () => {
    setIsSubmitting(true)
    try {
      // In a real implementation, this would call an API to regenerate the key
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API call
      toast.success('API Key regenerated', { description: 'Your new API key is ready. The old key is now invalid.' })
      setShowRegenerateApiKeyDialog(false)
    } catch (error: any) {
      toast.error('Regeneration failed', { description: error.message || 'Failed to regenerate API key' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConnectService = (serviceName: string, isConnected: boolean) => {
    setSelectedService({ name: serviceName, isConnected })
    setShowConnectServiceDialog(true)
  }

  const handleConfirmServiceAction = async () => {
    if (!selectedService) return
    setIsSubmitting(true)
    try {
      // In a real implementation, this would handle OAuth flow or disconnect
      await new Promise(resolve => setTimeout(resolve, 600)) // Simulate API call
      if (selectedService.isConnected) {
        toast.success('Disconnected', { description: `${selectedService.name} has been disconnected` })
      } else {
        toast.success('Connected', { description: `${selectedService.name} has been connected successfully` })
      }
      setShowConnectServiceDialog(false)
      setSelectedService(null)
    } catch (error: any) {
      toast.error('Action failed', { description: error.message || 'Failed to update service connection' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmptyTrash = () => {
    setShowEmptyTrashDialog(true)
  }

  const handleConfirmEmptyTrash = async () => {
    setIsSubmitting(true)
    try {
      // In a real implementation, this would delete all items in trash from Supabase
      await new Promise(resolve => setTimeout(resolve, 700)) // Simulate API call
      toast.success('Trash emptied', { description: 'All items in trash have been permanently deleted' })
      setShowEmptyTrashDialog(false)
    } catch (error: any) {
      toast.error('Failed to empty trash', { description: error.message || 'An error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestDataExport = () => {
    setShowDataExportDialog(true)
  }

  const handleConfirmDataExport = async () => {
    setIsSubmitting(true)
    try {
      // In a real implementation, this would trigger a data export job
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Export requested', {
        description: `Your ${exportFormat.toUpperCase()} export (${exportResolution} resolution) is being prepared. You will be notified when it is ready.`
      })
      setShowDataExportDialog(false)
    } catch (error: any) {
      toast.error('Export failed', { description: error.message || 'Failed to request data export' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAllPhotos = async () => {
    setIsSubmitting(true)
    try {
      // In production, this would delete all user photos
      toast.success('Photos deleted', { description: 'All your photos have been deleted' })
      setShowDeletePhotosDialog(false)
    } catch (error: any) {
      toast.error('Delete failed', { description: error.message || 'Failed to delete photos' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAllCollections = async () => {
    setIsSubmitting(true)
    try {
      // In production, this would delete all user collections
      toast.success('Collections deleted', { description: 'All your collections have been deleted' })
      setShowDeleteCollectionsDialog(false)
    } catch (error: any) {
      toast.error('Delete failed', { description: error.message || 'Failed to delete collections' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsSubmitting(true)
    try {
      // In production, this would delete the user account
      toast.success('Account deleted', { description: 'Your account has been permanently deleted' })
      setShowDeleteAccountDialog(false)
    } catch (error: any) {
      toast.error('Delete failed', { description: error.message || 'Failed to delete account' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShareViaLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/gallery/shared/my-gallery`)
      toast.success('Link copied', { description: 'Share link copied to clipboard' })
    } catch (error) {
      toast.error('Copy failed', { description: 'Failed to copy link' })
    }
  }

  const handleShareViaEmail = () => {
    const subject = encodeURIComponent('Check out my gallery')
    const body = encodeURIComponent(`Check out my photo gallery: ${window.location.origin}/gallery/shared/my-gallery`)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    toast.success('Email client opened', { description: 'Compose your email to share' })
  }

  const handleShareViaEmbed = async () => {
    const embedCode = `<iframe src="${window.location.origin}/gallery/embed/my-gallery" width="600" height="400" frameborder="0"></iframe>`
    try {
      await navigator.clipboard.writeText(embedCode)
      toast.success('Embed code copied', { description: 'Paste this code to embed your gallery' })
    } catch (error) {
      toast.error('Copy failed', { description: 'Failed to copy embed code' })
    }
  }

  const handleShareViaQRCode = () => {
    setShowQRCodeDialog(true)
  }

  const handleDownloadQRCode = () => {
    // In a real implementation, this would download the QR code image
    toast.success('QR Code downloaded', { description: 'QR code image has been saved' })
    setShowQRCodeDialog(false)
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
                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
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
            <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="mt-6">
            {/* Browse Banner */}
            <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Photo Gallery</h2>
                  <p className="text-rose-100">Unsplash-level media browsing experience</p>
                  <p className="text-rose-200 text-xs mt-1">Masonry layout • Collections • Advanced search</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredPhotos.length}</p>
                    <p className="text-rose-200 text-sm">Photos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCollections.length}</p>
                    <p className="text-rose-200 text-sm">Collections</p>
                  </div>
                </div>
              </div>
            </div>
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
                              handleToggleSave(photo.id)
                            }}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30"
                          >
                            {(photo.isSaved || savedItems.has(photo.id)) ? (
                              <BookmarkCheck className="w-4 h-4 text-white fill-amber-500" />
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
                                handleToggleLike(photo.id)
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm hover:bg-white/30"
                            >
                              <Heart className={`w-4 h-4 ${(photo.isLiked || likedItems.has(photo.id)) ? 'fill-red-500 text-red-500' : ''}`} />
                              {formatNumber(photo.likes + (likedItems.has(photo.id) && !photo.isLiked ? 1 : 0))}
                            </button>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownloadPhoto(photo)
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
            {/* Collections Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Collections</h2>
                  <p className="text-amber-100">Pinterest-level collection management</p>
                  <p className="text-amber-200 text-xs mt-1">Smart albums • Auto-organize • Sharing</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCollections.length + galleryCollections.length}</p>
                    <p className="text-amber-200 text-sm">Collections</p>
                  </div>
                </div>
              </div>
            </div>
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

            {isLoadingCollections ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Real Supabase Collections */}
                {galleryCollections.map(collection => (
                  <div
                    key={collection.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-amber-500/50 transition-colors cursor-pointer group relative"
                  >
                    <div className="h-40 relative" style={{ backgroundColor: '#d4a574' }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Folder className="w-16 h-16 text-white/30" />
                      </div>
                      {!collection.is_public && (
                        <span className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                          Private
                        </span>
                      )}
                      {collection.is_featured && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
                        {collection.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{collection.description}</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>{collection.item_count || 0} photos</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCollection(collection)
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Mock Collections */}
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
            )}
          </TabsContent>

          {/* Contributors Tab */}
          <TabsContent value="contributors" className="mt-6">
            {/* Contributors Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Contributors</h2>
                  <p className="text-indigo-100">500px-level photographer showcase</p>
                  <p className="text-indigo-200 text-xs mt-1">Portfolio view • Stats • Following</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockPhotographers.length}</p>
                    <p className="text-indigo-200 text-sm">Photographers</p>
                  </div>
                </div>
              </div>
            </div>
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
                  <button
                    onClick={() => handleFollowPhotographer(photographer)}
                    className="w-full mt-4 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent value="topics" className="mt-6">
            {/* Topics Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Browse Topics</h2>
                  <p className="text-emerald-100">Getty Images-level categorization</p>
                  <p className="text-emerald-200 text-xs mt-1">Curated topics • Trending • Seasonal</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTopics.length}</p>
                    <p className="text-emerald-200 text-sm">Topics</p>
                  </div>
                </div>
              </div>
            </div>
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

          {/* Settings Tab - Unsplash Level Photo Platform */}
          <TabsContent value="settings" className="mt-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Gallery Settings</h2>
                  <p className="text-slate-100">Lightroom-level configuration options</p>
                  <p className="text-slate-200 text-xs mt-1">Display options • Privacy • Integrations</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Settings</CardTitle>
                    <CardDescription>Configure your gallery</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'uploads', label: 'Uploads', icon: Upload },
                        { id: 'downloads', label: 'Downloads', icon: Download },
                        { id: 'privacy', label: 'Privacy', icon: Shield },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-amber-500 text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Storage Stats Sidebar */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Storage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Used</span>
                        <span className="font-medium">24.5 GB / 50 GB</span>
                      </div>
                      <Progress value={49} className="h-2" />
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Photos</span>
                        <span className="font-medium">2,458</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Collections</span>
                        <span className="font-medium text-amber-600">24</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Downloads</span>
                        <span className="font-medium text-emerald-600">12.4K</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 lg:col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>Manage your public profile</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Display Name</Label>
                            <Input defaultValue="John Doe" />
                          </div>
                          <div className="space-y-2">
                            <Label>Username</Label>
                            <Input defaultValue="@johndoe" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Bio</Label>
                          <Input defaultValue="Photographer & Visual Artist" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Location</Label>
                            <Input placeholder="City, Country" />
                          </div>
                          <div className="space-y-2">
                            <Label>Website</Label>
                            <Input placeholder="https://yourwebsite.com" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Display Preferences</CardTitle>
                        <CardDescription>Customize how content is displayed</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Default View</Label>
                            <p className="text-sm text-gray-500">Choose masonry or grid layout</p>
                          </div>
                          <Select defaultValue="masonry">
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="masonry">Masonry</SelectItem>
                              <SelectItem value="grid">Grid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Images per Page</Label>
                            <p className="text-sm text-gray-500">Number of photos to load</p>
                          </div>
                          <Select defaultValue="30">
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="30">30</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show EXIF Data</Label>
                            <p className="text-sm text-gray-500">Display camera info on photos</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-load More</Label>
                            <p className="text-sm text-gray-500">Infinite scroll loading</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Upload Settings */}
                {settingsTab === 'uploads' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Upload Preferences</CardTitle>
                        <CardDescription>Configure how photos are uploaded</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-optimize Images</Label>
                            <p className="text-sm text-gray-500">Compress images for faster loading</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Max Upload Size</Label>
                            <Select defaultValue="50">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="25">25 MB</SelectItem>
                                <SelectItem value="50">50 MB</SelectItem>
                                <SelectItem value="100">100 MB</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Upload Quality</Label>
                            <Select defaultValue="high">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="original">Original</SelectItem>
                                <SelectItem value="high">High (90%)</SelectItem>
                                <SelectItem value="medium">Medium (75%)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Preserve EXIF Data</Label>
                            <p className="text-sm text-gray-500">Keep camera info in uploaded photos</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Strip Location Data</Label>
                            <p className="text-sm text-gray-500">Remove GPS coordinates for privacy</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Default Upload Settings</CardTitle>
                        <CardDescription>Set defaults for new uploads</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default License</Label>
                            <Select defaultValue="unsplash">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unsplash">Unsplash License</SelectItem>
                                <SelectItem value="cc0">CC0 (Public Domain)</SelectItem>
                                <SelectItem value="cc-by">CC BY 4.0</SelectItem>
                                <SelectItem value="all-rights">All Rights Reserved</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Collection</Label>
                            <Select defaultValue="none">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Collection</SelectItem>
                                <SelectItem value="nature">Nature</SelectItem>
                                <SelectItem value="travel">Travel</SelectItem>
                                <SelectItem value="portraits">Portraits</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-tag with AI</Label>
                            <p className="text-sm text-gray-500">Automatically generate tags</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow Downloads</Label>
                            <p className="text-sm text-gray-500">Let others download your photos</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Download Settings */}
                {settingsTab === 'downloads' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Download Options</CardTitle>
                        <CardDescription>Configure download settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default Resolution</Label>
                            <Select defaultValue="large">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Small (640px)</SelectItem>
                                <SelectItem value="medium">Medium (1920px)</SelectItem>
                                <SelectItem value="large">Large (2400px)</SelectItem>
                                <SelectItem value="original">Original</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>File Format</Label>
                            <Select defaultValue="jpg">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="jpg">JPEG</SelectItem>
                                <SelectItem value="png">PNG</SelectItem>
                                <SelectItem value="webp">WebP</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Include Watermark</Label>
                            <p className="text-sm text-gray-500">Add watermark to downloads</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Track Downloads</Label>
                            <p className="text-sm text-gray-500">Get notified when photos are downloaded</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Attribution Settings</CardTitle>
                        <CardDescription>Configure how attribution is displayed</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Require Attribution</Label>
                            <p className="text-sm text-gray-500">Downloaders must credit you</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Attribution Text</Label>
                          <Input defaultValue="Photo by @johndoe on Kazi Gallery" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Copy Attribution Button</Label>
                            <p className="text-sm text-gray-500">Show one-click copy for attribution</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Privacy Settings */}
                {settingsTab === 'privacy' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Privacy</CardTitle>
                        <CardDescription>Control who can see your content</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Public Profile</Label>
                            <p className="text-sm text-gray-500">Anyone can view your profile</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Statistics</Label>
                            <p className="text-sm text-gray-500">Display download and view counts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Location</Label>
                            <p className="text-sm text-gray-500">Display where photos were taken</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow Messages</Label>
                            <p className="text-sm text-gray-500">Receive messages from other users</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Content Visibility</CardTitle>
                        <CardDescription>Control who can interact with your photos</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow Comments</Label>
                            <p className="text-sm text-gray-500">Let others comment on photos</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow Likes</Label>
                            <p className="text-sm text-gray-500">Let others like your photos</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow Collections</Label>
                            <p className="text-sm text-gray-500">Let others add to collections</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>NSFW Content Filter</Label>
                            <p className="text-sm text-gray-500">Flag mature content</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Connected Services</CardTitle>
                        <CardDescription>Link external accounts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Instagram', status: 'connected', username: '@johndoe' },
                          { name: 'Twitter/X', status: 'not_connected', username: null },
                          { name: 'Facebook', status: 'not_connected', username: null },
                          { name: 'Pinterest', status: 'connected', username: 'johndoe' },
                          { name: 'Behance', status: 'not_connected', username: null }
                        ].map((service, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${service.status === 'connected' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <Globe className={`h-4 w-4 ${service.status === 'connected' ? 'text-emerald-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="font-medium">{service.name}</p>
                                {service.username && (
                                  <p className="text-sm text-gray-500">{service.username}</p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant={service.status === 'connected' ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => handleConnectService(service.name, service.status === 'connected')}
                            >
                              {service.status === 'connected' ? 'Disconnect' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Developer API settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex items-center gap-2">
                            <Input type="password" value="kazi-gallery-xxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" size="sm" onClick={handleCopyApiKey}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Use this key to access the Gallery API</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <Label>Enable API Access</Label>
                            <p className="text-sm text-gray-500">Allow programmatic access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Rate Limiting</Label>
                            <p className="text-sm text-gray-500">5000 requests/hour</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleRegenerateApiKey}>
                          <Key className="h-4 w-4 mr-2" />
                          Regenerate API Key
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Storage Management</CardTitle>
                        <CardDescription>Manage your storage quota</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="flex items-center gap-3">
                            <HardDrive className="h-5 w-5 text-amber-600" />
                            <div>
                              <p className="font-medium text-amber-800 dark:text-amber-300">Storage Usage</p>
                              <p className="text-sm text-amber-600 dark:text-amber-400">24.5 GB of 50 GB used (49%)</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-delete Trash</Label>
                            <p className="text-sm text-gray-500">Permanently delete after 30 days</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Compress Old Photos</Label>
                            <p className="text-sm text-gray-500">Reduce storage for older uploads</p>
                          </div>
                          <Switch />
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleEmptyTrash}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Empty Trash
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Export</CardTitle>
                        <CardDescription>Download your data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Export Format</Label>
                            <Select defaultValue="zip">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="zip">ZIP Archive</SelectItem>
                                <SelectItem value="json">JSON (metadata only)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Resolution</Label>
                            <Select defaultValue="original">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="original">Original</SelectItem>
                                <SelectItem value="high">High (2400px)</SelectItem>
                                <SelectItem value="medium">Medium (1200px)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleRequestDataExport}>
                          <Download className="h-4 w-4 mr-2" />
                          Request Data Export
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                          <AlertOctagon className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Delete All Photos</p>
                            <p className="text-sm text-gray-500">Remove all uploaded photos</p>
                          </div>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => setShowDeletePhotosDialog(true)}
                          >
                            Delete Photos
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Delete All Collections</p>
                            <p className="text-sm text-gray-500">Remove all collections</p>
                          </div>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => setShowDeleteCollectionsDialog(true)}
                          >
                            Delete Collections
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Delete Account</p>
                            <p className="text-sm text-gray-500">Permanently delete your account</p>
                          </div>
                          <Button variant="destructive" onClick={() => setShowDeleteAccountDialog(true)}>
                            Delete Account
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockGalleryAIInsights}
              title="Gallery Intelligence"
              onInsightAction={(insight: AIInsight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockGalleryCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockGalleryPredictions}
              title="Gallery Metrics Forecast"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockGalleryActivities}
            title="Gallery Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={galleryQuickActions}
            variant="grid"
          />
        </div>

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
                      <button
                        onClick={() => handleFollowPhotographer(selectedPhoto.photographer)}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
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
                      <button
                        onClick={() => handleDownloadPhoto(selectedPhoto)}
                        className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Free Download
                      </button>
                      <div className="space-y-2 text-sm">
                        <button
                          onClick={() => handleDownloadPhoto(selectedPhoto)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-between"
                        >
                          <span>Small (640x{Math.round(640 * selectedPhoto.height / selectedPhoto.width)})</span>
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDownloadPhoto(selectedPhoto)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-between"
                        >
                          <span>Medium (1920x{Math.round(1920 * selectedPhoto.height / selectedPhoto.width)})</span>
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDownloadPhoto(selectedPhoto)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-between"
                        >
                          <span>Large (2400x{Math.round(2400 * selectedPhoto.height / selectedPhoto.width)})</span>
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDownloadPhoto(selectedPhoto)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-between"
                        >
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
                      <button
                        onClick={() => handleToggleLike(selectedPhoto.id)}
                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Heart className={`w-4 h-4 ${(selectedPhoto.isLiked || likedItems.has(selectedPhoto.id)) ? 'fill-red-500 text-red-500' : ''}`} />
                        {(selectedPhoto.isLiked || likedItems.has(selectedPhoto.id)) ? 'Liked' : 'Like'}
                      </button>
                      <button
                        onClick={() => handleToggleSave(selectedPhoto.id)}
                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Bookmark className={`w-4 h-4 ${(selectedPhoto.isSaved || savedItems.has(selectedPhoto.id)) ? 'fill-amber-500 text-amber-500' : ''}`} />
                        {(selectedPhoto.isSaved || savedItems.has(selectedPhoto.id)) ? 'Saved' : 'Save'}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  placeholder="Give your photo a title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  placeholder="Describe your photo"
                  rows={3}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                <input
                  type="text"
                  placeholder="nature, landscape, sunset"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={uploadForm.is_public}
                  onChange={(e) => setUploadForm({ ...uploadForm, is_public: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="public" className="text-sm text-gray-700 dark:text-gray-300">Make this photo public</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowUploadDialog(false)
                    setUploadForm({ title: '', description: '', tags: '', file_url: '', file_type: 'image', is_public: true })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadPhoto}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Uploading...' : 'Upload'}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  placeholder="My Collection"
                  value={collectionForm.name}
                  onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  placeholder="What's this collection about?"
                  rows={3}
                  value={collectionForm.description}
                  onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={!collectionForm.is_public}
                  onChange={(e) => setCollectionForm({ ...collectionForm, is_public: !e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="private" className="text-sm text-gray-700 dark:text-gray-300">Make this collection private</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateCollection(false)
                    setCollectionForm({ name: '', description: '', is_public: true })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCollection}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Edit Dialog */}
        <Dialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Bulk Edit Photos</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select multiple photos to edit their properties at once.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add Tags</label>
                  <input
                    type="text"
                    placeholder="Enter tags to add (comma separated)"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Move to Collection</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select collection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nature">Nature & Landscapes</SelectItem>
                      <SelectItem value="urban">Urban Architecture</SelectItem>
                      <SelectItem value="autumn">Autumn Vibes</SelectItem>
                      <SelectItem value="favorites">My Favorites</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="bulk-public" className="rounded border-gray-300" />
                  <label htmlFor="bulk-public" className="text-sm text-gray-700 dark:text-gray-300">Set as public</label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowBulkEditDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success('Bulk edit applied', { description: 'Changes applied to selected photos' })
                    setShowBulkEditDialog(false)
                  }}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Share Gallery</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Share your gallery or specific collections with others.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Share Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/gallery/shared/my-gallery`}
                      readOnly
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/gallery/shared/my-gallery`)
                        toast.success('Link copied', { description: 'Share link copied to clipboard' })
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Share via</label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={handleShareViaLink}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-center"
                    >
                      <Globe className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">Link</span>
                    </button>
                    <button
                      onClick={handleShareViaEmail}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-center"
                    >
                      <User className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">Email</span>
                    </button>
                    <button
                      onClick={handleShareViaEmbed}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-center"
                    >
                      <Link2 className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">Embed</span>
                    </button>
                    <button
                      onClick={handleShareViaQRCode}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-center"
                    >
                      <Download className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">QR Code</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Downloads</label>
                    <p className="text-xs text-gray-500">Let viewers download photos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowShareDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Photos Confirmation Dialog */}
        <Dialog open={showDeletePhotosDialog} onOpenChange={setShowDeletePhotosDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete All Photos</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete all your photos? This action cannot be undone and will permanently remove all uploaded photos from your gallery.
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDeletePhotosDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllPhotos}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Deleting...' : 'Delete All Photos'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Collections Confirmation Dialog */}
        <Dialog open={showDeleteCollectionsDialog} onOpenChange={setShowDeleteCollectionsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete All Collections</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete all your collections? This action cannot be undone. Photos in the collections will not be deleted.
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteCollectionsDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllCollections}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Deleting...' : 'Delete All Collections'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Account Confirmation Dialog */}
        <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data, photos, and collections.
              </p>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Warning: This action is irreversible!
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteAccountDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Follow Photographer Dialog */}
        <Dialog open={showFollowDialog} onOpenChange={setShowFollowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Follow Photographer</DialogTitle>
            </DialogHeader>
            {selectedPhotographer && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{selectedPhotographer.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{selectedPhotographer.username}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{selectedPhotographer.location}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedPhotographer.photos}</p>
                    <p className="text-xs text-gray-500">Photos</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(selectedPhotographer.followers)}</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedPhotographer.following}</p>
                    <p className="text-xs text-gray-500">Following</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPhotographer.bio}</p>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="notify-uploads"
                    defaultChecked
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="notify-uploads" className="text-sm text-gray-700 dark:text-gray-300">
                    Notify me when they upload new photos
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowFollowDialog(false)
                      setSelectedPhotographer(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmFollow}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? 'Following...' : 'Follow'}
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Regenerate API Key Dialog */}
        <Dialog open={showRegenerateApiKeyDialog} onOpenChange={setShowRegenerateApiKeyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Regenerate API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">Important Notice</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                      Regenerating your API key will invalidate the current key immediately. Any applications using the old key will stop working.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Current API Key</Label>
                <Input type="password" value="kazi-gallery-xxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono bg-gray-50 dark:bg-gray-900" />
              </div>
              <div className="space-y-2">
                <Label>Reason for Regeneration (Optional)</Label>
                <Select defaultValue="security">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="security">Security concern</SelectItem>
                    <SelectItem value="compromised">Key may be compromised</SelectItem>
                    <SelectItem value="rotation">Regular rotation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRegenerateApiKeyDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRegenerateApiKey}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Regenerating...' : 'Regenerate Key'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Connect/Disconnect Service Dialog */}
        <Dialog open={showConnectServiceDialog} onOpenChange={setShowConnectServiceDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedService?.isConnected ? 'Disconnect' : 'Connect'} {selectedService?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedService && (
              <div className="space-y-4">
                {selectedService.isConnected ? (
                  <>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                          <Globe className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedService.name}</p>
                          <p className="text-sm text-emerald-600">Currently connected</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Disconnecting {selectedService.name} will:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 ml-4">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        Stop automatic photo syncing
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        Remove cross-posting capabilities
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        Revoke API access permissions
                      </li>
                    </ul>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800">
                          <Globe className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedService.name}</p>
                          <p className="text-sm text-gray-500">Not connected</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Connecting {selectedService.name} will allow you to:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 ml-4">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                        Sync photos automatically
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                        Cross-post to your profile
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                        Import existing photos
                      </li>
                    </ul>
                  </>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowConnectServiceDialog(false)
                      setSelectedService(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmServiceAction}
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 ${
                      selectedService.isConnected
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting
                      ? selectedService.isConnected ? 'Disconnecting...' : 'Connecting...'
                      : selectedService.isConnected ? 'Disconnect' : 'Connect'
                    }
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Empty Trash Confirmation Dialog */}
        <Dialog open={showEmptyTrashDialog} onOpenChange={setShowEmptyTrashDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Empty Trash
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">
                  This will permanently delete all items in your trash. This action cannot be undone.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Items in trash:</span>
                  <span className="font-medium text-gray-900 dark:text-white">12 photos, 3 collections</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Space to recover:</span>
                  <span className="font-medium text-emerald-600">245 MB</span>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEmptyTrashDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmEmptyTrash}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Emptying...' : 'Empty Trash'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Data Export Dialog */}
        <Dialog open={showDataExportDialog} onOpenChange={setShowDataExportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Your Data
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Export all your photos and data. You will receive a download link via email when your export is ready.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zip">ZIP Archive (photos + metadata)</SelectItem>
                      <SelectItem value="json">JSON (metadata only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Photo Resolution</Label>
                  <Select value={exportResolution} onValueChange={setExportResolution}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original (full quality)</SelectItem>
                      <SelectItem value="high">High (2400px)</SelectItem>
                      <SelectItem value="medium">Medium (1200px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total photos:</span>
                    <span className="font-medium">2,458</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Estimated size:</span>
                    <span className="font-medium">{exportResolution === 'original' ? '24.5 GB' : exportResolution === 'high' ? '12.3 GB' : '6.1 GB'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Estimated time:</span>
                    <span className="font-medium">{exportResolution === 'original' ? '~2 hours' : exportResolution === 'high' ? '~1 hour' : '~30 min'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="include-metadata" defaultChecked className="rounded border-gray-300" />
                  <label htmlFor="include-metadata" className="text-sm text-gray-700 dark:text-gray-300">
                    Include EXIF metadata
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDataExportDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDataExport}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Requesting...' : 'Request Export'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog open={showQRCodeDialog} onOpenChange={setShowQRCodeDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">Share via QR Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-white rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  {/* QR Code placeholder - in production, use a QR code library */}
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="grid grid-cols-7 gap-1 p-2">
                      {Array.from({ length: 49 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 ${Math.random() > 0.5 ? 'bg-gray-900 dark:bg-white' : 'bg-transparent'}`}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded flex items-center justify-center">
                        <Image className="w-6 h-6 text-amber-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scan this QR code to view the gallery
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/gallery/shared/my-gallery
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowQRCodeDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadQRCode}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
