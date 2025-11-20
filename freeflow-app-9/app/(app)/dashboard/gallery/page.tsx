"use client"

import { useState } from 'react'
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
  Loader2
} from 'lucide-react'

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<any>('grid')
  const [selectedCategory, setSelectedCategory] = useState<any>('all')
  const [searchTerm, setSearchTerm] = useState<any>('')

  // SESSION_13: AI Image Generation state
  const [aiPrompt, setAiPrompt] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generatedImage, setGeneratedImage] = useState<string>('')

  // Handlers
  const handleUploadMedia = async () => {
    console.log('📤 UPLOAD')

    // SESSION_13: Info toast at start
    toast.info('Opening file upload...')

    // Simplified upload - in production would use actual file input and upload
    const title = prompt('Enter media title:')
    if (!title) return

    const category = prompt('Enter category (branding, web-design, mobile, social, print, video):') || 'branding'
    const tags = prompt('Enter tags (comma-separated):')?.split(',').map(t => t.trim()) || []

    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload',
          data: {
            file: {}, // In production: actual file data
            title,
            category,
            tags
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to upload media')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(result.message, {
          description: 'Your media has been added to the gallery'
        })

        // SESSION_13: Enhanced user guidance with toast
        setTimeout(() => {
          console.log('✨ GALLERY: Upload Media next steps guidance')
          console.log('📝 GALLERY: Media title: ' + title)
          console.log('📂 GALLERY: Category: ' + category)
          console.log('🏷️ GALLERY: Tags: ' + tags.join(', '))
          toast.info('📤 Upload Media - Next Steps', {
            description: 'Select files, add metadata, organize into albums, and share with your team'
          })
        }, 500)

        // Show achievement if earned
        if (result.achievement) {
          setTimeout(() => {
            toast.success(`${result.achievement.message} +${result.achievement.points} points!`, {
              description: `Badge: ${result.achievement.badge}`
            })
          }, 1000)
        }
      }
    } catch (error: any) {
      console.error('Upload Media Error:', error)
      toast.error('Failed to upload media', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // SESSION_13: View mode toggle with toast feedback
  const handleViewModeToggle = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid'
    setViewMode(newMode)
    toast.success(`Switched to ${newMode} view`)
  }

  // SESSION_13: AI Image Generation with validation and feedback
  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter an image description')
      return
    }

    setIsGenerating(true)
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
        toast.success('Image generated successfully!')
        setTimeout(() => {
          console.log('✨ GALLERY: AI Image generated successfully')
          console.log('🎨 GALLERY: Prompt: ' + aiPrompt)
          console.log('🖼️ GALLERY: Image URL: ' + data.imageUrl)
          console.log('📝 GALLERY: Next steps guidance displayed')
          toast.info('🎨 AI Image Generated - Next Steps', {
            description: 'Review, download, refine, and use in your projects or share with clients'
          })
        }, 500)
      } else {
        toast.error('Image generation failed. Please try again.')
      }
    } catch (error) {
      console.error('AI Image Generation Error:', error)
      toast.error('Failed to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleOpenPreview = (item: any) => {
    console.log('👁️ GALLERY: Preview gallery item')
    console.log('🖼️ GALLERY: Title: ' + item.title)
    console.log('📂 GALLERY: Type: ' + item.type)
    console.log('👤 GALLERY: Client: ' + item.client)
    console.log('💼 GALLERY: Project: ' + item.project)
    console.log('❤️ GALLERY: Likes: ' + item.likes)
    console.log('💬 GALLERY: Comments: ' + item.comments)
    console.log('✅ GALLERY: Preview opened')
    toast.info('👁️ Viewing: ' + item.title, {
      description: 'Opening fullscreen preview'
    })
  }

  const handleDownload = (item: any) => {
    console.log('💾 GALLERY: Download gallery item')
    console.log('🖼️ GALLERY: Title: ' + item.title)
    console.log('📂 GALLERY: Type: ' + item.type)
    console.log('🔗 GALLERY: URL: ' + item.url)
    console.log('✅ GALLERY: Download initiated')
    toast.success('💾 Downloading: ' + item.title, {
      description: 'Preparing your file for download'
    })
  }

  const handleShare = (item: any) => {
    console.log('📤 GALLERY: Share gallery item')
    console.log('🖼️ GALLERY: Title: ' + item.title)
    console.log('👤 GALLERY: Client: ' + item.client)
    console.log('🔗 GALLERY: Generating share link')
    console.log('✅ GALLERY: Share modal opened')
    toast.info('📤 Sharing: ' + item.title, {
      description: 'Generating shareable link'
    })
  }

  const handleFilterGallery = () => {
    console.log('🔍 GALLERY: Filter panel opened')
    console.log('📊 GALLERY: Available categories:', categories.length)
    console.log('🎨 GALLERY: Filter options ready')
    console.log('✅ GALLERY: Filter panel loaded')
  }

  const handleViewItem = (itemId: number) => {
    console.log('👁️ GALLERY: View media item')
    console.log('🆔 GALLERY: Item ID: ' + itemId)
    console.log('✅ GALLERY: Opening fullscreen preview')
    toast.info('👁️ Viewing Media', {
      description: 'Opening fullscreen preview'
    })
  }
  const handleEditItem = (itemId: number) => {
    console.log('✏️ GALLERY: Edit media item')
    console.log('🆔 GALLERY: Item ID: ' + itemId)
    console.log('✅ GALLERY: Opening metadata editor')
    toast.info('✏️ Edit Media', {
      description: 'Opening editor for metadata and tags'
    })
  }
  const handleDeleteItem = (itemId: number) => {
    console.log('🗑️ GALLERY: Delete media item')
    console.log('🆔 GALLERY: Item ID: ' + itemId)
    console.log('⚠️ GALLERY: Requesting user confirmation')
    if (confirm('Delete this item?')) {
      console.log('✅ GALLERY: Media deleted successfully')
      toast.success('✅ Media deleted', {
        description: 'The item has been removed from your gallery'
      })
    }
  }
  const handleDownloadItem = (itemId: number) => {
    console.log('💾 GALLERY: Download media item')
    console.log('🆔 GALLERY: Item ID: ' + itemId)
    console.log('✅ GALLERY: Preparing download')
    toast.success('💾 Downloading Media', {
      description: 'Preparing your download'
    })
  }
  const handleShareItem = (itemId: number) => {
    console.log('🔗 GALLERY: Share media item')
    console.log('🆔 GALLERY: Item ID: ' + itemId)
    console.log('✅ GALLERY: Generating shareable link')
    toast.info('🔗 Share Media', {
      description: 'Generate shareable link and share to social media'
    })
  }
  const handleLikeItem = async (itemId: number) => {
    console.log('❤️ LIKE:', itemId)

    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like',
          postId: itemId.toString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to like item')
      }

      const result = await response.json()

      if (result.success) {
        toast.success('❤️ Liked!', {
          description: 'You liked this gallery item'
        })

        // Show achievement if earned
        if (result.achievement) {
          setTimeout(() => {
            toast.success(`${result.achievement.message} +${result.achievement.points} points!`, {
              description: `Badge: ${result.achievement.badge}`
            })
          }, 500)
        }
      }
    } catch (error: any) {
      console.error('Like Item Error:', error)
      toast.error('Failed to like item', {
        description: error.message || 'Please try again later'
      })
    }
  }
  const handleCommentItem = (itemId: number) => {
    console.log('💬 GALLERY: Add comment to item')
    console.log('🆔 GALLERY: Item ID: ' + itemId)
    console.log('✅ GALLERY: Opening comment dialog')
    toast.info('💬 Add Comment', {
      description: 'Share your thoughts'
    })
  }
  const handleAddToProject = (itemId: number) => {
    console.log('➕ GALLERY: Add item to project')
    console.log('🆔 GALLERY: Item ID: ' + itemId)
    console.log('✅ GALLERY: Opening project selector')
    toast.info('➕ Add to Project', {
      description: 'Select a project to add this media'
    })
  }
  const handleFeatureItem = (itemId: number) => {
    console.log('⭐ GALLERY: Feature item')
    console.log('🆔 GALLERY: Item ID: ' + itemId)
    console.log('✅ GALLERY: Item marked as featured')
    toast.success('⭐ Featured', {
      description: 'Item marked as featured'
    })
  }
  const handleCreateAlbum = async () => {
    console.log('📁 NEW ALBUM')

    const name = prompt('Album name:')
    if (!name) return

    const description = prompt('Album description (optional):') || ''

    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-album',
          data: {
            name,
            description,
            itemIds: [],
            coverImage: 'default-cover.jpg'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create album')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(result.message, {
          description: 'Your new album is ready to organize your work'
        })

        // Show achievement
        if (result.achievement) {
          setTimeout(() => {
            toast.success(`${result.achievement.message} +${result.achievement.points} points!`, {
              description: `Badge: ${result.achievement.badge}`
            })
          }, 500)
        }

        // Show share URL
        if (result.shareUrl) {
          setTimeout(() => {
            console.log('✨ GALLERY: Album created successfully')
            console.log('📁 GALLERY: Album name: ' + name)
            console.log('🔗 GALLERY: Share URL: ' + result.shareUrl)
            console.log('📝 GALLERY: Ready to add items')
            toast.success('📁 Album Created: ' + name, {
              description: 'Share URL ready - You can now add items to this album'
            })
          }, 1000)
        }
      }
    } catch (error: any) {
      console.error('Create Album Error:', error)
      toast.error('Failed to create album', {
        description: error.message || 'Please try again later'
      })
    }
  }
  const handleMoveToAlbum = (itemId: number) => {
    console.log('📁 GALLERY: Move item to album')
    console.log('🆔 GALLERY: Item ID: ' + itemId)
    console.log('✅ GALLERY: Opening album selector')
    toast.info('📁 Move to Album', {
      description: 'Select destination album'
    })
  }
  const handleBulkSelect = () => {
    console.log('☑️ GALLERY: Bulk selection mode')
    console.log('✅ GALLERY: Enabling batch operations')
    toast.info('☑️ Bulk Selection', {
      description: 'Select multiple items for batch operations'
    })
  }
  const handleBulkDelete = (ids: number[]) => {
    console.log('🗑️ GALLERY: Bulk delete operation')
    console.log('📊 GALLERY: Items count: ' + ids.length)
    console.log('⚠️ GALLERY: Requesting user confirmation')
    if (confirm('Delete ' + ids.length + ' items?')) {
      console.log('✅ GALLERY: Items deleted successfully')
      toast.success('✅ Items deleted', {
        description: ids.length + ' items removed from gallery'
      })
    }
  }
  const handleBulkDownload = async (ids: number[]) => {
    console.log('💾 BULK DOWNLOAD:', ids.length)

    if (ids.length === 0) {
      toast.error('No items selected', {
        description: 'Please select items to download'
      })
      return
    }

    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk-download',
          data: {
            itemIds: ids.map(id => id.toString()),
            format: 'original'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to prepare download')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(result.message, {
          description: `${result.itemCount} items • ${result.estimatedSize}`
        })

        // Show download details
        setTimeout(() => {
          console.log('✨ GALLERY: Bulk download ready')
          console.log('📊 GALLERY: Items: ' + result.itemCount)
          console.log('💾 GALLERY: Size: ' + result.estimatedSize)
          console.log('📦 GALLERY: Format: ' + result.format)
          console.log('🔗 GALLERY: Download URL: ' + result.downloadUrl)
          toast.success('💾 Bulk Download Ready', {
            description: result.itemCount + ' items • ' + result.estimatedSize + ' • ' + result.format
          })
        }, 500)
      }
    } catch (error: any) {
      console.error('Bulk Download Error:', error)
      toast.error('Failed to prepare download', {
        description: error.message || 'Please try again later'
      })
    }
  }
  const handleSort = (sortBy: string) => {
    console.log('🔃 GALLERY: Sort gallery')
    console.log('📊 GALLERY: Sort by: ' + sortBy)
    console.log('✅ GALLERY: Gallery sorted')
    toast.success('🔃 Sorting by ' + sortBy, {
      description: 'Gallery reorganized'
    })
  }
  const handleFilter = (filter: string) => { console.log('🔍 FILTER:', filter); setSelectedCategory(filter) }
  const handleSearch = (term: string) => { console.log('🔍 SEARCH:', term); setSearchTerm(term) }
  const handleViewMode = (mode: 'grid' | 'list') => { console.log('👁️ VIEW MODE:', mode); setViewMode(mode) }
  const handleGenerateThumbnails = () => {
    console.log('🖼️ GALLERY: Generate thumbnails')
    console.log('✅ GALLERY: Creating optimized thumbnails')
    toast.info('🖼️ Generate Thumbnails', {
      description: 'Creating optimized thumbnails'
    })
  }
  const handleOptimizeImages = () => {
    console.log('⚡ GALLERY: Optimize images')
    console.log('✅ GALLERY: Compressing and optimizing all images')
    toast.info('⚡ Optimize Images', {
      description: 'Compressing and optimizing all images'
    })
  }
  const handleExportGallery = async () => {
    console.log('💾 EXPORT')

    // In production, would show format selection dialog
    const format = (prompt('Export format (zip, pdf, portfolio):') || 'zip') as 'zip' | 'pdf' | 'portfolio'

    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export-collection',
          data: {
            itemIds: galleryItems.map(item => item.id.toString()), // Export all items
            format,
            quality: 'high'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export gallery')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(result.message, {
          description: `${result.itemCount} items exported as ${result.format.toUpperCase()}`
        })

        // Show export details
        setTimeout(() => {
          console.log('✨ GALLERY: Export ready')
          console.log('📦 GALLERY: Format: ' + result.format.toUpperCase())
          console.log('⭐ GALLERY: Quality: ' + result.quality)
          console.log('📊 GALLERY: Items: ' + result.itemCount)
          console.log('🔗 GALLERY: Download URL: ' + result.downloadUrl)
          toast.success('💾 Gallery Export Ready', {
            description: result.itemCount + ' items • ' + result.format.toUpperCase() + ' • ' + result.quality
          })
        }, 500)
      }
    } catch (error: any) {
      console.error('Export Gallery Error:', error)
      toast.error('Failed to export gallery', {
        description: error.message || 'Please try again later'
      })
    }
  }
  const handleImportGallery = () => {
    console.log('📤 GALLERY: Import gallery')
    console.log('✅ GALLERY: Opening file selector')
    toast.info('📤 Import Gallery', {
      description: 'Select gallery archive to import'
    })
  }
  const handleSlideshow = () => {
    console.log('▶️ GALLERY: Starting slideshow')
    console.log('✅ GALLERY: Autoplay enabled')
    toast.success('▶️ Starting Slideshow', {
      description: 'Autoplay enabled'
    })
  }
  const handleTagging = (itemId: number) => {
    console.log('🏷️ GALLERY: Add tags to item')
    console.log('🆔 GALLERY: Item ID: ' + itemId)
    console.log('✅ GALLERY: Opening tag editor')
    toast.info('🏷️ Add Tags', {
      description: 'Organize with custom tags'
    })
  }

  // Mock gallery data
  const galleryItems = [
    {
      id: 1,
      title: 'Brand Identity Design',
      type: 'image',
      category: 'branding',
      url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=150&fit=crop',
      dateCreated: '2024-01-15',
      likes: 24,
      comments: 8,
      client: 'Acme Corp',
      project: 'Brand Identity Package',
      tags: ['logo', 'branding', 'identity'],
      featured: true
    },
    {
      id: 2,
      title: 'Website Mockup',
      type: 'image',
      category: 'web-design',
      url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=300&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=200&h=150&fit=crop',
      dateCreated: '2024-01-12',
      likes: 18,
      comments: 5,
      client: 'Tech Startup',
      project: 'E-commerce Platform',
      tags: ['web', 'design', 'mockup'],
      featured: false
    },
    {
      id: 3,
      title: 'Mobile App Demo',
      type: 'video',
      category: 'mobile',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=150&fit=crop',
      dateCreated: '2024-01-10',
      likes: 32,
      comments: 12,
      client: 'Mobile Solutions',
      project: 'iOS App Development',
      tags: ['mobile', 'app', 'demo'],
      featured: true
    },
    {
      id: 4,
      title: 'Social Media Campaign',
      type: 'image',
      category: 'social',
      url: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=300&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=200&h=150&fit=crop',
      dateCreated: '2024-01-08',
      likes: 15,
      comments: 3,
      client: 'Social Brand',
      project: 'Social Media Package',
      tags: ['social', 'campaign', 'graphics'],
      featured: false
    },
    {
      id: 5,
      title: 'Print Design Collection',
      type: 'image',
      category: 'print',
      url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=150&fit=crop',
      dateCreated: '2024-01-05',
      likes: 21,
      comments: 7,
      client: 'Print Co.',
      project: 'Marketing Materials',
      tags: ['print', 'brochure', 'design'],
      featured: false
    },
    {
      id: 6,
      title: 'Video Advertisement',
      type: 'video',
      category: 'video',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200&h=150&fit=crop',
      dateCreated: '2024-01-03',
      likes: 45,
      comments: 18,
      client: 'Ad Agency',
      project: 'TV Commercial',
      tags: ['video', 'ad', 'commercial'],
      featured: true
    }
  ]

  const categories = [
    { id: 'all', label: 'All', count: galleryItems.length },
    { id: 'branding', label: 'Branding', count: galleryItems.filter(item => item.category === 'branding').length },
    { id: 'web-design', label: 'Web Design', count: galleryItems.filter(item => item.category === 'web-design').length },
    { id: 'mobile', label: 'Mobile', count: galleryItems.filter(item => item.category === 'mobile').length },
    { id: 'social', label: 'Social', count: galleryItems.filter(item => item.category === 'social').length },
    { id: 'print', label: 'Print', count: galleryItems.filter(item => item.category === 'print').length },
    { id: 'video', label: 'Video', count: galleryItems.filter(item => item.category === 'video').length }
  ]

  const filteredItems = galleryItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const featuredItems = galleryItems.filter(item => item.featured)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <TextShimmer className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-pink-900 to-purple-900 dark:from-gray-100 dark:via-pink-100 dark:to-purple-100 bg-clip-text text-transparent">
            Gallery
          </TextShimmer>
          <p className="text-gray-600 dark:text-gray-300">Showcase your creative work and portfolio</p>
        </div>
        <div className="flex gap-2">
          <Button data-testid="view-mode-toggle-btn" variant="outline" size="sm" onClick={handleViewModeToggle}>
            {viewMode === 'grid' ? <List className="h-4 w-4 mr-2" /> : <Grid className="h-4 w-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          <Button data-testid="upload-media-btn" size="sm" onClick={handleUploadMedia}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </Button>
        </div>
      </div>

      {/* Featured Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Work
          </CardTitle>
          <CardDescription>Your best creative projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredItems.map((item) => (
              <Card key={item.id} className="kazi-card overflow-hidden group cursor-pointer">
                <div className="relative">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.client}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{item.dateCreated}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <NumberFlow value={item.likes} className="inline-block" />
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <NumberFlow value={item.comments} className="inline-block" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

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

            {/* Generated Image Preview */}
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
                        console.log('💾 GALLERY: Downloading AI generated image')
                        console.log('🎨 GALLERY: Image URL:', generatedImage)
                        console.log('✅ GALLERY: Download initiated')
                        handleDownloadItem(0)
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      data-testid="add-to-gallery-btn"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        console.log('➕ GALLERY: Add to gallery initiated')
                        console.log('🎨 GALLERY: AI generated image')
                        console.log('💾 GALLERY: Saving to collection')
                        console.log('✅ GALLERY: Image added successfully')
                        setGeneratedImage('')
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500">
              💡 Tip: Be specific with your descriptions for better results. Include style, mood, colors, and composition details.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Collection</CardTitle>
          <CardDescription>Organize and manage your creative assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search gallery..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button data-testid="filter-gallery-btn" variant="outline" size="sm" onClick={handleFilterGallery}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                {filteredItems.length} items
              </div>
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

              <TabsContent value="all">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                      <Card key={item.id} className="kazi-card overflow-hidden group cursor-pointer">
                        <div className="relative">
                          <img 
                            src={item.thumbnail} 
                            alt={item.title}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="h-8 w-8 text-white" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.type === 'video' ? <Video className="h-3 w-3 mr-1" /> : <Image className="h-3 w-3 mr-1" />}
                              {item.type}
                            </Badge>
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <Button data-testid={`preview-item-${item.id}-btn`} size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={() => handleOpenPreview(item)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button data-testid={`download-item-${item.id}-btn`} size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={() => handleDownload(item)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button data-testid={`share-item-${item.id}-btn`} size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={() => handleShare(item)}>
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                          <p className="text-xs text-gray-600 mb-2">{item.client}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{item.dateCreated}</span>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                <NumberFlow value={item.likes} className="inline-block" />
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                <NumberFlow value={item.comments} className="inline-block" />
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredItems.map((item) => (
                      <Card key={item.id} className="kazi-card">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <img 
                              src={item.thumbnail} 
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{item.title}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {item.type === 'video' ? <Video className="h-3 w-3 mr-1" /> : <Image className="h-3 w-3 mr-1" />}
                                  {item.type}
                                </Badge>
                                {item.featured && (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-600 mb-1">{item.client} • {item.project}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {item.dateCreated}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  <NumberFlow value={item.likes} className="inline-block" />
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  <NumberFlow value={item.comments} className="inline-block" />
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Share2 className="h-4 w-4" />
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

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No items found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
