'use client'

/**
 * File Gallery Component
 *
 * Features:
 * - Grid and list view modes
 * - File preview thumbnails
 * - Lock icons for protected files
 * - Price display for paid files
 * - Download counter
 * - Search and filter
 * - Sort options
 * - Pagination
 * - Loading states
 */

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Grid,
  List,
  Lock,
  DollarSign,
  Shield,
  Download,
  Calendar,
  Search,
  Filter,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export interface FileItem {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  storageKey: string
  accessType: string
  requiresPayment: boolean
  paymentAmount: number
  status: string
  downloadCount: number
  maxDownloads: number | null
  expiresAt: string | null
  createdAt: string
  thumbnail?: string
}

export interface FileGalleryProps {
  collectionId?: string
  viewMode?: 'grid' | 'list'
  onFileClick?: (file: FileItem) => void
  showPricing?: boolean
  allowDownload?: boolean
  ownerId?: string
}

export function FileGallery({
  collectionId,
  viewMode: initialViewMode = 'grid',
  onFileClick,
  showPricing = true,
  allowDownload = true,
  ownerId
}: FileGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode)
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'downloads'>('date')
  const [filterBy, setFilterBy] = useState<'all' | 'images' | 'documents' | 'videos' | 'archives'>('all')

  useEffect(() => {
    fetchFiles()
  }, [collectionId, ownerId])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (collectionId) params.append('collectionId', collectionId)
      if (ownerId) params.append('ownerId', ownerId)

      const response = await fetch(`/api/files/list?${params}`)
      const data = await response.json()

      if (data.success) {
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Failed to fetch files:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />
    if (fileType.startsWith('video/')) return <Film className="h-5 w-5" />
    if (fileType.startsWith('audio/')) return <Music className="h-5 w-5" />
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) {
      return <Archive className="h-5 w-5" />
    }
    return <FileText className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFilteredAndSortedFiles = () => {
    const filtered = files.filter(file => {
      // Search filter
      const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      // Type filter
      if (filterBy === 'all') return true
      if (filterBy === 'images') return file.fileType.startsWith('image/')
      if (filterBy === 'documents') return file.fileType.includes('pdf') || file.fileType.includes('document')
      if (filterBy === 'videos') return file.fileType.startsWith('video/')
      if (filterBy === 'archives') return file.fileType.includes('zip') || file.fileType.includes('rar')

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fileName.localeCompare(b.fileName)
        case 'size':
          return b.fileSize - a.fileSize
        case 'downloads':
          return b.downloadCount - a.downloadCount
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }

  const filteredFiles = getFilteredAndSortedFiles()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Files</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
              <SelectItem value="videos">Videos</SelectItem>
              <SelectItem value="archives">Archives</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Latest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
              <SelectItem value="downloads">Downloads</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Files Grid/List */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No files found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try adjusting your search or filters' : 'Upload files to get started'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <Card
              key={file.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onFileClick?.(file)}
            >
              <CardHeader className="pb-4">
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-2">
                  {file.thumbnail ? (
                    <img src={file.thumbnail}
                      alt={file.fileName}
                      className="w-full h-full object-cover rounded-md"
                    loading="lazy" />
                  ) : (
                    getFileIcon(file.fileType)
                  )}
                </div>
                <CardTitle className="text-sm line-clamp-2" title={file.fileName}>
                  {file.fileName}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {file.accessType === 'password' && (
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Protected
                    </Badge>
                  )}
                  {file.requiresPayment && showPricing && (
                    <Badge variant="secondary" className="text-xs">
                      <DollarSign className="h-3 w-3 mr-1" />
                      ${file.paymentAmount}
                    </Badge>
                  )}
                  {file.status === 'escrowed' && (
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Escrow
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>{formatFileSize(file.fileSize)}</div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {file.downloadCount}
                    {file.maxDownloads && ` / ${file.maxDownloads}`}
                  </div>
                  {file.expiresAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(file.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
              {allowDownload && (
                <CardFooter className="pt-0">
                  <Button className="w-full" size="sm">
                    {file.requiresPayment ? 'Purchase' : 'Download'}
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <Card
              key={file.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onFileClick?.(file)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                    {file.thumbnail ? (
                      <img src={file.thumbnail}
                        alt={file.fileName}
                        className="w-full h-full object-cover rounded-md"
                      loading="lazy" />
                    ) : (
                      getFileIcon(file.fileType)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{file.fileName}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(file.fileSize)}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {file.downloadCount}
                        {file.maxDownloads && ` / ${file.maxDownloads}`}
                      </span>
                      {file.expiresAt && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(file.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {file.accessType === 'password' && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Protected
                        </Badge>
                      )}
                      {file.requiresPayment && showPricing && (
                        <Badge variant="secondary" className="text-xs">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${file.paymentAmount}
                        </Badge>
                      )}
                      {file.status === 'escrowed' && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Escrow
                        </Badge>
                      )}
                    </div>
                  </div>
                  {allowDownload && (
                    <div className="flex-shrink-0">
                      <Button onClick={() => file.requiresPayment ? toast.info('Purchase', { description: `Processing purchase for ${file.name}...` }) : toast.success('Download', { description: `Downloading ${file.name}...` })}>
                        {file.requiresPayment ? 'Purchase' : 'Download'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
