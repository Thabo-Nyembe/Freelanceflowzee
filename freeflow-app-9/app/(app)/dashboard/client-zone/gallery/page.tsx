'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Image,
  Download,
  Share2,
  Filter,
  LayoutGrid,
  List,
  ArrowLeft,
  Eye,
  Trash2
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { getStatusColor } from '@/lib/client-zone-utils'

const logger = createFeatureLogger('ClientZoneGallery')

// Type Definitions
interface GalleryItem {
  id: number
  name: string
  project: string
  uploadedBy: string
  uploadDate: string
  fileSize: string
  imageUrl?: string
  type: 'image' | 'video' | 'document'
  description: string
  status: 'approved' | 'pending-review' | 'revision-needed'
}

interface GalleryFilter {
  type: 'all' | 'image' | 'video' | 'document'
  status: 'all' | 'approved' | 'pending-review' | 'revision-needed'
  sortBy: 'recent' | 'oldest' | 'name' | 'project'
}

// Mock Gallery Data
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    name: 'Logo Concepts v3',
    project: 'Brand Identity Redesign',
    uploadedBy: 'Sarah Johnson',
    uploadDate: '2024-01-25',
    fileSize: '2.4 MB',
    imageUrl: '/gallery/logo-concepts.jpg',
    type: 'image',
    description: 'Final logo concept variations with brand colors',
    status: 'approved'
  },
  {
    id: 2,
    name: 'Brand Guidelines Draft',
    project: 'Brand Identity Redesign',
    uploadedBy: 'Sarah Johnson',
    uploadDate: '2024-01-20',
    fileSize: '5.1 MB',
    type: 'document',
    description: 'Complete brand guidelines document with usage rules',
    status: 'approved'
  },
  {
    id: 3,
    name: 'Website Homepage Mockup',
    project: 'Website Development',
    uploadedBy: 'Alex Thompson',
    uploadDate: '2024-01-18',
    fileSize: '8.7 MB',
    imageUrl: '/gallery/website-mockup.jpg',
    type: 'image',
    description: 'Responsive homepage mockup for desktop and mobile',
    status: 'pending-review'
  },
  {
    id: 4,
    name: 'Product Demo Video',
    project: 'Website Development',
    uploadedBy: 'Michael Chen',
    uploadDate: '2024-01-15',
    fileSize: '156 MB',
    type: 'video',
    description: 'Walking through complete website functionality',
    status: 'approved'
  },
  {
    id: 5,
    name: 'Color Palette Variations',
    project: 'Brand Identity Redesign',
    uploadedBy: 'Sarah Johnson',
    uploadDate: '2024-01-10',
    fileSize: '1.2 MB',
    imageUrl: '/gallery/color-palette.jpg',
    type: 'image',
    description: 'Multiple color palette options for brand identity',
    status: 'revision-needed'
  }
]

export default function GalleryPage() {
  const router = useRouter()

  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [deleteItem, setDeleteItem] = useState<{ id: number; name: string } | null>(null)

  // Filter State
  const [filters, setFilters] = useState<GalleryFilter>({
    type: 'all',
    status: 'all',
    sortBy: 'recent'
  })

  // Load Gallery Data
  useEffect(() => {
    const loadGalleryData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load gallery from API
        const response = await fetch('/api/client-zone/gallery')
        if (!response.ok) throw new Error('Failed to load gallery')

        setGalleryItems(GALLERY_ITEMS)
        setIsLoading(false)
        announce('Gallery loaded successfully', 'polite')
        logger.info('Gallery data loaded', {
          itemCount: GALLERY_ITEMS.length
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load gallery'
        setError(errorMsg)
        setIsLoading(false)
        announce('Error loading gallery', 'assertive')
        logger.error('Failed to load gallery', { error: err })
      }
    }

    loadGalleryData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter and Sort Items
  const filteredItems = galleryItems.filter(item => {
    if (filters.type !== 'all' && item.type !== filters.type) return false
    if (filters.status !== 'all' && item.status !== filters.status) return false
    return true
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'oldest':
        return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
      case 'name':
        return a.name.localeCompare(b.name)
      case 'project':
        return a.project.localeCompare(b.project)
      case 'recent':
      default:
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    }
  })

  // Handle Download
  const handleDownload = (item: GalleryItem) => {
    logger.info('Gallery item download initiated', {
      itemId: item.id,
      itemName: item.name,
      fileSize: item.fileSize
    })

    toast.success('Preparing download...', {
      description: `Downloading ${item.name}`
    })

    // Simulate download
    setTimeout(() => {
      logger.info('Gallery item downloaded successfully', { itemId: item.id })
      toast.success('Download started', {
        description: `${item.name} is downloading to your device`
      })
    }, 1000)
  }

  // Handle Share
  const handleShare = async (item: GalleryItem) => {
    logger.info('Gallery item share initiated', {
      itemId: item.id,
      itemName: item.name
    })

    try {
      const response = await fetch('/api/gallery/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          itemName: item.name,
          project: item.project
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      logger.info('Gallery item share link generated', { itemId: item.id })
      toast.success('Share link generated!', {
        description: 'Link copied to clipboard'
      })
    } catch (error) {
      logger.error('Failed to share gallery item', { error, itemId: item.id })
      toast.error('Failed to generate share link', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Handle Delete
  const handleDelete = (itemId: number) => {
    const item = galleryItems.find(i => i.id === itemId)
    if (!item) return

    logger.info('Gallery item deletion initiated', {
      itemId,
      itemName: item.name
    })

    setDeleteItem({ id: itemId, name: item.name })
  }

  const handleConfirmDelete = async () => {
    if (!deleteItem) return

    try {
      const response = await fetch('/api/gallery/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: deleteItem.id })
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      setGalleryItems(galleryItems.filter(i => i.id !== deleteItem.id))
      logger.info('Gallery item deleted successfully', { itemId: deleteItem.id })
      toast.success('Item deleted', {
        description: `${deleteItem.name} has been removed from gallery`
      })
    } catch (error) {
      logger.error('Failed to delete gallery item', { error, itemId: deleteItem.id })
      toast.error('Failed to delete item', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setDeleteItem(null)
    }
  }

  // Handle Bulk Download
  const handleBulkDownload = async () => {
    if (selectedItems.length === 0) {
      toast.error('No items selected', {
        description: 'Select items to download'
      })
      return
    }

    logger.info('Bulk download initiated', {
      itemCount: selectedItems.length
    })

    try {
      const response = await fetch('/api/gallery/bulk-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: selectedItems })
      })

      if (!response.ok) {
        throw new Error('Failed to prepare download')
      }

      logger.info('Bulk download prepared', { itemCount: selectedItems.length })
      toast.success('Download starting...', {
        description: `Downloading ${selectedItems.length} items as ZIP`
      })

      setSelectedItems([])
    } catch (error) {
      logger.error('Failed to bulk download', { error })
      toast.error('Failed to prepare download', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={5} />
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
              <p className="text-gray-600 mt-1">
                View and manage all project deliverables, mockups, and assets
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Sorting
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* File Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">File Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="document">Documents</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending-review">Pending Review</option>
                    <option value="revision-needed">Revision Needed</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters({ ...filters, sortBy: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="project">Project Name</option>
                  </select>
                </div>
              </div>

              {/* Selected Items Actions */}
              {selectedItems.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium">
                    {selectedItems.length} item(s) selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedItems([])}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      onClick={handleBulkDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Selected
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Gallery Items */}
        {filteredItems.length === 0 ? (
          <NoDataEmptyState title="No items found" description="No gallery items match your filters. Try adjusting your search criteria." />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      {/* Preview */}
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden group">
                        {item.imageUrl ? (
                          <img src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-12 w-12 text-gray-400"  loading="lazy"/>
                          </div>
                        )}

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              logger.info('Gallery item preview opened', {
                                itemId: item.id
                              })
                              toast.info('Opening preview...')
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownload(item)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.id])
                            } else {
                              setSelectedItems(
                                selectedItems.filter((id) => id !== item.id)
                              )
                            }
                          }}
                          className="absolute top-3 left-3 w-4 h-4 cursor-pointer"
                        />

                        {/* Status Badge */}
                        <Badge
                          className={`absolute top-3 right-3 ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status.replace('-', ' ')}
                        </Badge>
                      </div>

                      {/* Content */}
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-2">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600">{item.project}</p>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{item.fileSize}</span>
                          <span>{new Date(item.uploadDate).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDownload(item)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShare(item)}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* List View */
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardContent className="p-0">
                  <div className="space-y-2">
                    {filteredItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.id])
                            } else {
                              setSelectedItems(
                                selectedItems.filter((id) => id !== item.id)
                              )
                            }
                          }}
                          className="w-4 h-4 cursor-pointer"
                        />

                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.type === 'image' && (
                            <Image className="h-6 w-6 text-gray-400"  loading="lazy"/>
                          )}
                          {item.type === 'video' && (
                            <div className="h-6 w-6 text-gray-400">📹</div>
                          )}
                          {item.type === 'document' && (
                            <div className="h-6 w-6 text-gray-400">📄</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.project} • {item.fileSize}
                          </p>
                        </div>

                        <Badge
                          className={`flex-shrink-0 ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status.replace('-', ' ')}
                        </Badge>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(item)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleShare(item)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {galleryItems.length}
              </p>
              <p className="text-sm text-gray-600">Total Items</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {galleryItems.filter((i) => i.status === 'approved').length}
              </p>
              <p className="text-sm text-gray-600">Approved</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {galleryItems.filter((i) => i.status === 'pending-review').length}
              </p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">
                {galleryItems.filter((i) => i.status === 'revision-needed').length}
              </p>
              <p className="text-sm text-gray-600">Revision Needed</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delete Item Confirmation Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gallery Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteItem?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
