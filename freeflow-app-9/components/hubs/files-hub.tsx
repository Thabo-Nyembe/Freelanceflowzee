"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Upload,
  Download,
  Share2,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  Grid,
  List,
  FolderOpen,
  Star,
  Clock,
  Users,
  Link,
  Eye,
  Edit,
  Cloud,
  HardDrive,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react'

// Types
interface FileItem {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
  size: number
  url: string
  thumbnailUrl?: string
  uploadedAt: string
  uploadedBy: {
    id: string
    name: string
    avatar?: string
  }
  shared: boolean
  starred: boolean
  downloads: number
  views: number
  folder?: string
  tags: string[]
  metadata?: unknown
}

interface FilesHubProps {
  userId: string
  onFileUpload?: (files: FileItem[]) => void
  onFileDelete?: (fileId: string) => void
  onFileShare?: (fileId: string) => void
}

const FILE_TYPES = {
  image: { icon: Image, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  video: { icon: Video, color: 'text-purple-500', bgColor: 'bg-purple-50' },
  audio: { icon: Music, color: 'text-green-500', bgColor: 'bg-green-50' },
  document: { icon: FileText, color: 'text-orange-500', bgColor: 'bg-orange-50' },
  archive: { icon: Archive, color: 'text-gray-500', bgColor: 'bg-gray-50' },
  other: { icon: FileText, color: 'text-gray-500', bgColor: 'bg-gray-50' }
}

const MOCK_FILES: FileItem[] = [
  {
    id: 'file_001',
    name: 'Brand Guidelines Final.pdf',
    type: 'document',
    size: 2457600, // 2.4 MB
    url: '/files/brand-guidelines.pdf',
    thumbnailUrl: '/thumbnails/brand-guidelines.png',
    uploadedAt: '2024-01-15T10:30:00Z',
    uploadedBy: {
      id: 'user_001',
      name: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    shared: true,
    starred: false,
    downloads: 45,
    views: 123,
    folder: 'Projects/Brand Identity',
    tags: ['branding', 'guidelines', 'final'],
    metadata: {
      pages: 24,
      version: '1.0'
    }
  },
  {
    id: 'file_002',
    name: 'Hero Video Draft.mp4',
    type: 'video',
    size: 157286400, // 150 MB
    url: '/files/hero-video.mp4',
    thumbnailUrl: '/thumbnails/hero-video.png',
    uploadedAt: '2024-01-20T14:15:00Z',
    uploadedBy: {
      id: 'user_002',
      name: 'Mike Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
    },
    shared: false,
    starred: true,
    downloads: 12,
    views: 67,
    folder: 'Projects/Website',
    tags: ['video', 'hero', 'draft'],
    metadata: {
      duration: 180,
      resolution: '1920x1080',
      format: 'mp4'
    }
  },
  {
    id: 'file_003',
    name: 'Logo Variations.zip',
    type: 'archive',
    size: 8388608, // 8 MB
    url: '/files/logo-variations.zip',
    uploadedAt: '2024-01-25T09:00:00Z',
    uploadedBy: {
      id: 'user_003',
      name: 'Alex Rivera',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
    },
    shared: true,
    starred: false,
    downloads: 89,
    views: 156,
    folder: 'Assets/Logos',
    tags: ['logo', 'variations', 'final'],
    metadata: {
      files: 12,
      compressed: true
    }
  },
  {
    id: 'file_004',
    name: 'Product Photo 1.jpg',
    type: 'image',
    size: 3145728, // 3 MB
    url: '/files/product-photo-1.jpg',
    thumbnailUrl: '/thumbnails/product-photo-1.jpg',
    uploadedAt: '2024-02-01T11:20:00Z',
    uploadedBy: {
      id: 'user_001',
      name: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    shared: false,
    starred: true,
    downloads: 23,
    views: 89,
    folder: 'Photos/Products',
    tags: ['product', 'photo', 'high-res'],
    metadata: {
      dimensions: '3840x2160',
      format: 'jpeg'
    }
  }
]

export default function FilesHub({ userId, onFileUpload, onFileDelete, onFileShare }: FilesHubProps) {
  const [files, setFiles] = useState<FileItem[]>(MOCK_FILES)
  const [searchQuery, setSearchQuery] = useState<any>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'downloads'>('date')
  const [filterType, setFilterType] = useState<string>('all')
  const [uploadProgress, setUploadProgress] = useState<any>(0)
  const [uploading, setUploading] = useState<any>(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFolder = !selectedFolder || file.folder === selectedFolder
    const matchesType = filterType === 'all' || file.type === filterType
    return matchesSearch && matchesFolder && matchesType
  })

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'size':
        return b.size - a.size
      case 'downloads':
        return b.downloads - a.downloads
      case 'date':
      default:
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    }
  })

  const folders = [...new Set(files.map(f => f.folder).filter(Boolean))]
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const totalDownloads = files.reduce((sum, file) => sum + file.downloads, 0)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles) return

    setUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Process files (mock implementation)
    const newFiles: FileItem[] = Array.from(uploadedFiles).map((file, index) => ({
      id: `file_${Date.now()}_${index}`,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' :
            file.type.startsWith('audio/') ? 'audio' :
            file.type.includes('pdf') || file.type.includes('document') ? 'document' :
            file.type.includes('zip') || file.type.includes('archive') ? 'archive' : 'other',
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      uploadedBy: {
        id: userId,
        name: 'Current User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'
      },
      shared: false,
      starred: false,
      downloads: 0,
      views: 0,
      folder: selectedFolder || 'Uploads',
      tags: [],
      metadata: {}
    }))

    setTimeout(() => {
      setFiles(prev => [...newFiles, ...prev])
      onFileUpload?.(newFiles)
    }, 2000)
  }

  const handleFileDelete = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    onFileDelete?.(fileId)
  }

  const handleFileShare = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, shared: !f.shared } : f
    ))
    onFileShare?.(fileId)
  }

  const toggleStar = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, starred: !f.starred } : f
    ))
  }

  const FileCard = ({ file }: { file: FileItem }) => {
    const FileIcon = FILE_TYPES[file.type].icon
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${FILE_TYPES[file.type].bgColor}`}>
                <FileIcon className={`w-5 h-5 ${FILE_TYPES[file.type].color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm line-clamp-1">{file.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStar(file.id)}
                className={file.starred ? 'text-yellow-500' : 'text-gray-400'}
              >
                <Star className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFileShare(file.id)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    {file.shared ? 'Unshare' : 'Share'}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => handleFileDelete(file.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Avatar className="w-4 h-4">
                <AvatarImage src={file.uploadedBy.avatar} alt={file.uploadedBy.name} />
                <AvatarFallback>{file.uploadedBy.name[0]}</AvatarFallback>
              </Avatar>
              <span>{file.uploadedBy.name}</span>
              <span>•</span>
              <span>{formatDate(file.uploadedAt)}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {file.views}
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {file.downloads}
              </div>
              {file.shared && (
                <div className="flex items-center gap-1">
                  <Share2 className="w-3 h-3" />
                  Shared
                </div>
              )}
            </div>
            {file.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {file.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Files Hub</h1>
          <p className="text-gray-600 mt-1">
            Manage and share your files with clients and team members
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button asChild className="cursor-pointer">
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Uploading files...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Files</p>
                <p className="text-2xl font-bold">{files.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
              </div>
              <HardDrive className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold">{totalDownloads}</p>
              </div>
              <Download className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shared Files</p>
                <p className="text-2xl font-bold">{files.filter(f => f.shared).length}</p>
              </div>
              <Share2 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
          <option value="archive">Archives</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="size">Sort by Size</option>
          <option value="downloads">Sort by Downloads</option>
        </select>
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Files Grid */}
      {sortedFiles.length > 0 ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {sortedFiles.map(file => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No files found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'Upload your first file to get started'}
          </p>
          <label htmlFor="file-upload-empty">
            <Button asChild className="cursor-pointer">
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </span>
            </Button>
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload-empty"
          />
        </div>
      )}
    </div>
  )
}