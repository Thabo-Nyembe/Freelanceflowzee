"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
import {
  Image,
  Video,
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Folder,
  Calendar,
  User,
  Star,
  Play,
  Sparkles,
  Loader2,
  Trash2,
  Edit,
  Plus,
  Move,
  CheckSquare,
  Archive,
  Tag
} from 'lucide-react'

// PRODUCTION LOGGER
import { createFeatureLogger } from '@/lib/logger'
const logger = createFeatureLogger('Gallery')

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

// TYPES
interface ImageMetadata {
  id: string
  title: string
  description: string
  fileName: string
  fileSize: number // bytes
  width: number
  height: number
  format: string
  url: string
  thumbnail: string
  uploadDate: string
  tags: string[]
  albumId: string | null
  isFavorite: boolean
  type: 'image' | 'video'
  category: string
  client?: string
  project?: string
  likes: number
  comments: number
}

interface Album {
  id: string
  name: string
  description: string
  coverImage: string
  imageCount: number
  createdDate: string
  totalSize: number
}

export default function GalleryPage() {
  // A+++ STATE MANAGEMENT
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // REAL STATE
  const [images, setImages] = useState<ImageMetadata[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'slideshow'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('date')
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isBulkMode, setIsBulkMode] = useState(false)

  // SESSION_13: AI Image Generation state
  const [aiPrompt, setAiPrompt] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generatedImage, setGeneratedImage] = useState<string>('')

  // A+++ LOAD GALLERY DATA
  useEffect(() => {
    const loadGalleryData = async () => {
      try {
        setIsPageLoading(true)
        setError(null)

        logger.info('Loading gallery data')

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load gallery'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        // Initialize with mock data
        initializeMockData()

        setIsPageLoading(false)
        announce('Gallery loaded successfully', 'polite')
        logger.info('Gallery loaded successfully', {
          imageCount: images.length,
          albumCount: albums.length
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load gallery'
        setError(errorMessage)
        setIsPageLoading(false)
        announce('Error loading gallery', 'assertive')
        logger.error('Failed to load gallery', { error: err })
      }
    }

    loadGalleryData()
  }, [announce])

  // Initialize mock data
  const initializeMockData = () => {
    const mockImages: ImageMetadata[] = [
      {
        id: '1',
        title: 'Brand Identity Design',
        description: 'Complete brand identity package',
        fileName: 'brand-identity.jpg',
        fileSize: 2457600, // 2.4 MB
        width: 1920,
        height: 1080,
        format: 'jpg',
        url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=150&fit=crop',
        uploadDate: '2024-01-15T10:30:00Z',
        tags: ['logo', 'branding', 'identity'],
        albumId: 'album1',
        isFavorite: true,
        type: 'image',
        category: 'branding',
        client: 'Acme Corp',
        project: 'Brand Identity Package',
        likes: 24,
        comments: 8
      },
      {
        id: '2',
        title: 'Website Mockup',
        description: 'E-commerce platform design',
        fileName: 'website-mockup.png',
        fileSize: 3145728, // 3 MB
        width: 2560,
        height: 1440,
        format: 'png',
        url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=200&h=150&fit=crop',
        uploadDate: '2024-01-12T14:20:00Z',
        tags: ['web', 'design', 'mockup', 'ui'],
        albumId: 'album1',
        isFavorite: false,
        type: 'image',
        category: 'web-design',
        client: 'Tech Startup',
        project: 'E-commerce Platform',
        likes: 18,
        comments: 5
      },
      {
        id: '3',
        title: 'Mobile App Demo',
        description: 'iOS app walkthrough video',
        fileName: 'app-demo.mp4',
        fileSize: 15728640, // 15 MB
        width: 1280,
        height: 720,
        format: 'mp4',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=150&fit=crop',
        uploadDate: '2024-01-10T09:15:00Z',
        tags: ['mobile', 'app', 'demo', 'video'],
        albumId: 'album2',
        isFavorite: true,
        type: 'video',
        category: 'mobile',
        client: 'Mobile Solutions',
        project: 'iOS App Development',
        likes: 32,
        comments: 12
      },
      {
        id: '4',
        title: 'Social Media Campaign',
        description: 'Instagram campaign graphics',
        fileName: 'social-campaign.jpg',
        fileSize: 1835008, // 1.75 MB
        width: 1080,
        height: 1080,
        format: 'jpg',
        url: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=200&h=150&fit=crop',
        uploadDate: '2024-01-08T16:45:00Z',
        tags: ['social', 'campaign', 'graphics', 'instagram'],
        albumId: null,
        isFavorite: false,
        type: 'image',
        category: 'social',
        client: 'Social Brand',
        project: 'Social Media Package',
        likes: 15,
        comments: 3
      },
      {
        id: '5',
        title: 'Print Design Collection',
        description: 'Brochure and flyer designs',
        fileName: 'print-collection.pdf',
        fileSize: 5242880, // 5 MB
        width: 2480,
        height: 3508,
        format: 'pdf',
        url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=150&fit=crop',
        uploadDate: '2024-01-05T11:30:00Z',
        tags: ['print', 'brochure', 'design', 'marketing'],
        albumId: 'album2',
        isFavorite: true,
        type: 'image',
        category: 'print',
        client: 'Print Co.',
        project: 'Marketing Materials',
        likes: 21,
        comments: 7
      }
    ]

    const mockAlbums: Album[] = [
      {
        id: 'album1',
        name: 'Brand Projects',
        description: 'Client branding and identity work',
        coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=150&fit=crop',
        imageCount: 2,
        createdDate: '2024-01-15T10:00:00Z',
        totalSize: 5603328 // Sum of images in album
      },
      {
        id: 'album2',
        name: 'Mobile & Digital',
        description: 'Mobile apps and digital products',
        coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=150&fit=crop',
        imageCount: 2,
        createdDate: '2024-01-10T09:00:00Z',
        totalSize: 20971520
      }
    ]

    setImages(mockImages)
    setAlbums(mockAlbums)
  }

  // REAL HANDLERS

  // Upload Images
  const handleUploadMedia = () => {
    logger.info('Upload media initiated')
    toast.info('Opening file upload...')

    // Simulate file upload
    const title = prompt('Enter media title:')
    if (!title) {
      logger.debug('Upload cancelled - no title provided')
      return
    }

    const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}.jpg`
    const fileSize = Math.floor(Math.random() * 5000000) + 500000 // 0.5-5.5 MB
    const width = 1920
    const height = 1080

    const newImage: ImageMetadata = {
      id: Date.now().toString(),
      title,
      description: '',
      fileName,
      fileSize,
      width,
      height,
      format: 'jpg',
      url: `https://images.unsplash.com/photo-${Date.now()}?w=400&h=300&fit=crop`,
      thumbnail: `https://images.unsplash.com/photo-${Date.now()}?w=200&h=150&fit=crop`,
      uploadDate: new Date().toISOString(),
      tags: [],
      albumId: null,
      isFavorite: false,
      type: 'image',
      category: 'branding',
      likes: 0,
      comments: 0
    }

    setImages(prev => [newImage, ...prev])

    logger.info('Media uploaded successfully', {
      imageId: newImage.id,
      fileName: newImage.fileName,
      fileSize: newImage.fileSize,
      dimensions: `${width}x${height}`
    })

    toast.success('Media uploaded successfully', {
      description: `${fileName} (${formatFileSize(fileSize)}, ${width}x${height})`
    })
  }

  // Delete Image
  const handleDeleteImage = (imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (!image) return

    logger.info('Delete image initiated', { imageId, fileName: image.fileName })

    if (confirm(`Delete "${image.title}"?`)) {
      setImages(prev => prev.filter(img => img.id !== imageId))
      setSelectedImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(imageId)
        return newSet
      })

      logger.info('Image deleted successfully', {
        imageId,
        fileName: image.fileName,
        fileSize: image.fileSize
      })

      toast.success('Image deleted', {
        description: `${image.fileName} has been removed`
      })
    } else {
      logger.debug('Delete cancelled by user', { imageId })
    }
  }

  // Edit Image
  const handleEditImage = (imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (!image) return

    logger.info('Edit image initiated', { imageId, fileName: image.fileName })

    const newTitle = prompt('Enter new title:', image.title)
    if (!newTitle) {
      logger.debug('Edit cancelled - no title provided', { imageId })
      return
    }

    const newDescription = prompt('Enter description:', image.description) || ''
    const newTags = prompt('Enter tags (comma-separated):', image.tags.join(', '))?.split(',').map(t => t.trim()) || image.tags

    setImages(prev => prev.map(img =>
      img.id === imageId
        ? { ...img, title: newTitle, description: newDescription, tags: newTags }
        : img
    ))

    logger.info('Image updated successfully', {
      imageId,
      fileName: image.fileName,
      title: newTitle,
      tagsCount: newTags.length
    })

    toast.success('Image updated', {
      description: `${newTitle} - ${newTags.length} tags`
    })
  }

  // Create Album
  const handleCreateAlbum = () => {
    logger.info('Create album initiated')

    const name = prompt('Album name:')
    if (!name) {
      logger.debug('Album creation cancelled - no name provided')
      return
    }

    const description = prompt('Album description (optional):') || ''

    const newAlbum: Album = {
      id: Date.now().toString(),
      name,
      description,
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=150&fit=crop',
      imageCount: 0,
      createdDate: new Date().toISOString(),
      totalSize: 0
    }

    setAlbums(prev => [newAlbum, ...prev])

    logger.info('Album created successfully', {
      albumId: newAlbum.id,
      albumName: name
    })

    toast.success('Album created', {
      description: `"${name}" is ready for your media`
    })
  }

  // Add to Album
  const handleAddToAlbum = (imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (!image) return

    logger.info('Add to album initiated', { imageId, fileName: image.fileName })

    if (albums.length === 0) {
      toast.error('No albums available', {
        description: 'Create an album first'
      })
      logger.warn('Add to album failed - no albums exist')
      return
    }

    const albumNames = albums.map(a => `${a.name} (${a.id})`).join('\n')
    const albumId = prompt(`Select album:\n${albumNames}\n\nEnter album ID:`)

    if (!albumId) {
      logger.debug('Add to album cancelled', { imageId })
      return
    }

    const album = albums.find(a => a.id === albumId)
    if (!album) {
      toast.error('Album not found')
      logger.warn('Add to album failed - invalid album ID', { albumId })
      return
    }

    setImages(prev => prev.map(img =>
      img.id === imageId ? { ...img, albumId } : img
    ))

    setAlbums(prev => prev.map(a =>
      a.id === albumId
        ? { ...a, imageCount: a.imageCount + 1, totalSize: a.totalSize + image.fileSize }
        : a
    ))

    logger.info('Image added to album', {
      imageId,
      fileName: image.fileName,
      albumId,
      albumName: album.name
    })

    toast.success('Added to album', {
      description: `${image.fileName} → ${album.name}`
    })
  }

  // Remove from Album
  const handleRemoveFromAlbum = (imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (!image || !image.albumId) return

    const album = albums.find(a => a.id === image.albumId)

    logger.info('Remove from album initiated', {
      imageId,
      fileName: image.fileName,
      albumId: image.albumId,
      albumName: album?.name
    })

    setImages(prev => prev.map(img =>
      img.id === imageId ? { ...img, albumId: null } : img
    ))

    if (album) {
      setAlbums(prev => prev.map(a =>
        a.id === image.albumId
          ? { ...a, imageCount: a.imageCount - 1, totalSize: a.totalSize - image.fileSize }
          : a
      ))
    }

    logger.info('Image removed from album', {
      imageId,
      fileName: image.fileName,
      albumName: album?.name
    })

    toast.success('Removed from album', {
      description: `${image.fileName} is now unorganized`
    })
  }

  // Delete Album
  const handleDeleteAlbum = (albumId: string) => {
    const album = albums.find(a => a.id === albumId)
    if (!album) return

    logger.info('Delete album initiated', {
      albumId,
      albumName: album.name,
      imageCount: album.imageCount
    })

    if (confirm(`Delete album "${album.name}"? Images will be moved to unorganized.`)) {
      // Remove album reference from images
      setImages(prev => prev.map(img =>
        img.albumId === albumId ? { ...img, albumId: null } : img
      ))

      setAlbums(prev => prev.filter(a => a.id !== albumId))

      logger.info('Album deleted successfully', {
        albumId,
        albumName: album.name,
        imagesAffected: album.imageCount
      })

      toast.success('Album deleted', {
        description: `${album.name} - ${album.imageCount} images moved to unorganized`
      })
    } else {
      logger.debug('Album deletion cancelled', { albumId })
    }
  }

  // Move Images
  const handleMoveImages = (imageIds: string[], targetAlbumId: string) => {
    const album = albums.find(a => a.id === targetAlbumId)
    if (!album) return

    const movedImages = images.filter(img => imageIds.includes(img.id))
    const totalSize = movedImages.reduce((sum, img) => sum + img.fileSize, 0)

    logger.info('Move images initiated', {
      imageCount: imageIds.length,
      targetAlbumId,
      targetAlbumName: album.name,
      totalSize
    })

    setImages(prev => prev.map(img =>
      imageIds.includes(img.id) ? { ...img, albumId: targetAlbumId } : img
    ))

    setAlbums(prev => prev.map(a =>
      a.id === targetAlbumId
        ? { ...a, imageCount: a.imageCount + imageIds.length, totalSize: a.totalSize + totalSize }
        : a
    ))

    logger.info('Images moved successfully', {
      imageCount: imageIds.length,
      albumName: album.name,
      totalSize
    })

    toast.success('Images moved', {
      description: `${imageIds.length} images → ${album.name} (${formatFileSize(totalSize)})`
    })
  }

  // Bulk Operations
  const handleBulkDelete = () => {
    const count = selectedImages.size
    if (count === 0) {
      toast.error('No images selected')
      logger.warn('Bulk delete failed - no images selected')
      return
    }

    logger.info('Bulk delete initiated', { selectedCount: count })

    const imagesToDelete = images.filter(img => selectedImages.has(img.id))
    const totalSize = imagesToDelete.reduce((sum, img) => sum + img.fileSize, 0)

    if (confirm(`Delete ${count} images?`)) {
      setImages(prev => prev.filter(img => !selectedImages.has(img.id)))
      setSelectedImages(new Set())

      logger.info('Bulk delete successful', {
        deletedCount: count,
        totalSize
      })

      toast.success('Images deleted', {
        description: `${count} images removed (${formatFileSize(totalSize)})`
      })
    } else {
      logger.debug('Bulk delete cancelled')
    }
  }

  const handleBulkDownload = () => {
    const count = selectedImages.size
    if (count === 0) {
      toast.error('No images selected')
      logger.warn('Bulk download failed - no images selected')
      return
    }

    const imagesToDownload = images.filter(img => selectedImages.has(img.id))
    const totalSize = imagesToDownload.reduce((sum, img) => sum + img.fileSize, 0)
    const fileNames = imagesToDownload.map(img => img.fileName)

    logger.info('Bulk download initiated', {
      imageCount: count,
      totalSize,
      fileNames
    })

    toast.success('Preparing download', {
      description: `${count} images as ZIP (${formatFileSize(totalSize)})`
    })

    setTimeout(() => {
      logger.info('Bulk download ready', {
        imageCount: count,
        totalSize,
        format: 'ZIP'
      })

      toast.success('Download ready', {
        description: `gallery-${Date.now()}.zip (${formatFileSize(totalSize)})`
      })
    }, 1500)
  }

  // Toggle Favorite
  const handleToggleFavorite = (imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (!image) return

    const newFavoriteStatus = !image.isFavorite

    setImages(prev => prev.map(img =>
      img.id === imageId ? { ...img, isFavorite: newFavoriteStatus } : img
    ))

    logger.info('Favorite toggled', {
      imageId,
      fileName: image.fileName,
      isFavorite: newFavoriteStatus
    })

    toast.success(newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites', {
      description: image.fileName
    })
  }

  // SESSION_13: AI Image Generation
  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter an image description')
      logger.warn('AI generation failed - empty prompt')
      return
    }

    setIsGenerating(true)
    logger.info('AI image generation initiated', { prompt: aiPrompt })
    toast.info('Generating image with AI...')

    try {
      const response = await fetch('/api/ai-image-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          action: 'generate'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const data = await response.json()

      if (data.success) {
        setGeneratedImage(data.imageUrl)

        logger.info('AI image generated successfully', {
          prompt: aiPrompt,
          imageUrl: data.imageUrl
        })

        toast.success('Image generated successfully!')

        setTimeout(() => {
          toast.info('AI Image Generated - Next Steps', {
            description: 'Review, download, refine, and use in your projects or share with clients'
          })
        }, 500)
      } else {
        throw new Error('Image generation failed')
      }
    } catch (error) {
      logger.error('AI image generation failed', {
        error,
        prompt: aiPrompt
      })
      toast.error('Failed to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // View Mode Toggle
  const handleViewModeToggle = () => {
    const modes: ('grid' | 'list' | 'slideshow')[] = ['grid', 'list', 'slideshow']
    const currentIndex = modes.indexOf(viewMode)
    const newMode = modes[(currentIndex + 1) % modes.length]

    setViewMode(newMode)
    logger.info('View mode changed', { from: viewMode, to: newMode })
    toast.success(`Switched to ${newMode} view`)
  }

  // Bulk Selection Toggle
  const handleToggleBulkMode = () => {
    const newBulkMode = !isBulkMode
    setIsBulkMode(newBulkMode)

    if (!newBulkMode) {
      setSelectedImages(new Set())
    }

    logger.info('Bulk mode toggled', { enabled: newBulkMode })
    toast.info(newBulkMode ? 'Bulk selection enabled' : 'Bulk selection disabled')
  }

  const handleToggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(imageId)) {
        newSet.delete(imageId)
      } else {
        newSet.add(imageId)
      }
      return newSet
    })
  }

  // UTILITY FUNCTIONS
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (isoDate: string): string => {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // COMPUTED VALUES
  const totalStorageUsed = images.reduce((sum, img) => sum + img.fileSize, 0)
  const favoriteImages = images.filter(img => img.isFavorite)
  const recentImages = [...images].sort((a, b) =>
    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  ).slice(0, 10)

  // Filter and sort images
  let filteredImages = images.filter(img => {
    const matchesCategory = selectedCategory === 'all' || img.category === selectedCategory
    const matchesAlbum = !selectedAlbumId || img.albumId === selectedAlbumId
    const matchesFavorites = !showFavoritesOnly || img.isFavorite
    const matchesSearch = !searchTerm ||
      img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesCategory && matchesAlbum && matchesFavorites && matchesSearch
  })

  // Sort images
  filteredImages = [...filteredImages].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      case 'name':
        return a.title.localeCompare(b.title)
      case 'size':
        return b.fileSize - a.fileSize
      case 'type':
        return a.type.localeCompare(b.type)
      default:
        return 0
    }
  })

  const categories = [
    { id: 'all', label: 'All', count: images.length },
    { id: 'branding', label: 'Branding', count: images.filter(img => img.category === 'branding').length },
    { id: 'web-design', label: 'Web Design', count: images.filter(img => img.category === 'web-design').length },
    { id: 'mobile', label: 'Mobile', count: images.filter(img => img.category === 'mobile').length },
    { id: 'social', label: 'Social', count: images.filter(img => img.category === 'social').length },
    { id: 'print', label: 'Print', count: images.filter(img => img.category === 'print').length },
    { id: 'video', label: 'Video', count: images.filter(img => img.category === 'video').length }
  ]

  // A+++ LOADING STATE
  if (isPageLoading) {
    return (
      <div className="container mx-auto p-6">
        <DashboardSkeleton />
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <TextShimmer className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-pink-900 to-purple-900 dark:from-gray-100 dark:via-pink-100 dark:to-purple-100 bg-clip-text text-transparent">
            Gallery
          </TextShimmer>
          <p className="text-gray-600 dark:text-gray-300">
            {images.length} images • {formatFileSize(totalStorageUsed)} used • {albums.length} albums
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            data-testid="bulk-mode-toggle-btn"
            variant={isBulkMode ? "default" : "outline"}
            size="sm"
            onClick={handleToggleBulkMode}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            {isBulkMode ? `Selected (${selectedImages.size})` : 'Bulk Select'}
          </Button>
          <Button
            data-testid="view-mode-toggle-btn"
            variant="outline"
            size="sm"
            onClick={handleViewModeToggle}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4 mr-2" /> : <Grid className="h-4 w-4 mr-2" />}
            {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
          </Button>
          <Button
            data-testid="upload-media-btn"
            size="sm"
            onClick={handleUploadMedia}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button
            data-testid="create-album-btn"
            size="sm"
            variant="outline"
            onClick={handleCreateAlbum}
          >
            <Folder className="h-4 w-4 mr-2" />
            New Album
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {isBulkMode && selectedImages.size > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {selectedImages.size} images selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const albumId = prompt('Enter album ID to move to:')
                    if (albumId) {
                      handleMoveImages(Array.from(selectedImages), albumId)
                    }
                  }}
                >
                  <Move className="h-4 w-4 mr-2" />
                  Move
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Images</p>
                <p className="text-2xl font-bold">
                  <NumberFlow value={images.length} />
                </p>
              </div>
              <Image className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold">{formatFileSize(totalStorageUsed)}</p>
              </div>
              <Archive className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Albums</p>
                <p className="text-2xl font-bold">
                  <NumberFlow value={albums.length} />
                </p>
              </div>
              <Folder className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Favorites</p>
                <p className="text-2xl font-bold">
                  <NumberFlow value={favoriteImages.length} />
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Albums */}
      {albums.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Albums
            </CardTitle>
            <CardDescription>Organize your media into collections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {albums.map(album => (
                <Card key={album.id} className="kazi-card overflow-hidden group cursor-pointer">
                  <div className="relative">
                    <img
                      src={album.coverImage}
                      alt={album.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeleteAlbum(album.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold mb-1">{album.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{album.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{album.imageCount} images</span>
                      <span>{formatFileSize(album.totalSize)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SESSION_13: AI Image Generator */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Image Generator
          </CardTitle>
          <CardDescription>Create unique images with AI based on your descriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Describe the image you want to generate..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={isGenerating}
                className="flex-1"
              />
              <Button
                data-testid="generate-ai-image-btn"
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>

            {generatedImage && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Generated Image:</p>
                <div className="relative rounded-lg overflow-hidden border">
                  <img
                    src={generatedImage}
                    alt="AI Generated"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <Button
                      data-testid="download-generated-image-btn"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        logger.info('Download AI generated image', { imageUrl: generatedImage })
                        toast.success('Downloading AI generated image')
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      data-testid="clear-generated-image-btn"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        logger.info('Clear AI generated image')
                        setGeneratedImage('')
                        toast.info('Image cleared')
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Tip: Be specific with your descriptions for better results. Include style, mood, colors, and composition details.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Collection */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Collection</CardTitle>
          <CardDescription>Organize and manage your creative assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search, Filter, Sort */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, tags, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort: Date</option>
                <option value="name">Sort: Name</option>
                <option value="size">Sort: Size</option>
                <option value="type">Sort: Type</option>
              </select>
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowFavoritesOnly(!showFavoritesOnly)
                  logger.info('Favorites filter toggled', { enabled: !showFavoritesOnly })
                }}
              >
                <Star className="h-4 w-4 mr-2" />
                Favorites
              </Button>
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

              <div className="text-sm text-gray-600">
                {filteredImages.length} items
              </div>

              <TabsContent value="all">
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredImages.map((image) => (
                      <Card key={image.id} className="kazi-card overflow-hidden group cursor-pointer">
                        <div className="relative">
                          <img
                            src={image.thumbnail}
                            alt={image.title}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                            onClick={() => isBulkMode && handleToggleImageSelection(image.id)}
                          />
                          {image.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="h-8 w-8 text-white" />
                            </div>
                          )}
                          {isBulkMode && (
                            <div className="absolute top-2 left-2">
                              <input
                                type="checkbox"
                                checked={selectedImages.has(image.id)}
                                onChange={() => handleToggleImageSelection(image.id)}
                                className="h-5 w-5"
                              />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleToggleFavorite(image.id)}
                            >
                              <Star className={`h-4 w-4 ${image.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  logger.info('View image', { imageId: image.id, fileName: image.fileName })
                                  toast.info(`Viewing: ${image.title}`)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditImage(image.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  logger.info('Download image', {
                                    imageId: image.id,
                                    fileName: image.fileName,
                                    fileSize: image.fileSize
                                  })
                                  toast.success('Downloading', { description: image.fileName })
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDeleteImage(image.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium text-sm mb-1 truncate">{image.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {image.type === 'video' ? <Video className="h-3 w-3 mr-1" /> : <Image className="h-3 w-3 mr-1" />}
                              {image.format.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-600">{formatFileSize(image.fileSize)}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap mb-2">
                            {image.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-2 w-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {image.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{image.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatDate(image.uploadDate)}</span>
                            <span>{image.width}x{image.height}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="space-y-2">
                    {filteredImages.map((image) => (
                      <Card key={image.id} className="kazi-card">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {isBulkMode && (
                              <input
                                type="checkbox"
                                checked={selectedImages.has(image.id)}
                                onChange={() => handleToggleImageSelection(image.id)}
                                className="h-5 w-5"
                              />
                            )}
                            <img
                              src={image.thumbnail}
                              alt={image.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{image.title}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {image.format.toUpperCase()}
                                </Badge>
                                {image.isFavorite && (
                                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 truncate">{image.description || 'No description'}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                <span>{formatFileSize(image.fileSize)}</span>
                                <span>{image.width}x{image.height}</span>
                                <span>{formatDate(image.uploadDate)}</span>
                                <span>{image.tags.length} tags</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditImage(image.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddToAlbum(image.id)}
                              >
                                <Folder className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteImage(image.id)}>
                                <Trash2 className="h-4 w-4" />
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

            {filteredImages.length === 0 && (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No items found</p>
                <p className="text-sm text-gray-400 mt-2">
                  {searchTerm ? 'Try adjusting your search' : 'Upload media to get started'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
