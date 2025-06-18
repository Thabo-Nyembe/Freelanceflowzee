'use client'

import { useState } from 'react'
import { StorageAnalytics, FileMetadata, uploadFile } from '@/lib/storage/multi-cloud-storage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Archive, 
  Cloud, 
  Image, 
  Plus, 
  Upload,
  Download,
  Eye,
  Share,
  Folder,
  File,
  Video,
  FileText,
  Music,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Heart,
  ExternalLink,
  MoreHorizontal,
  Calendar,
  Users,
  Globe,
  Lock,
  Unlock,
  Link as LinkIcon,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

// Mock cloud storage data
const mockCloudFiles = [
  {
    id: 1,
    name: 'Brand_Identity_Final.zip',
    type: 'zip',
    size: '45.2 MB',
    uploadDate: '2024-01-12',
    sharedWith: 3,
    isPublic: false,
    downloads: 12,
    project: 'Brand Identity Design'
  },
  {
    id: 2,
    name: 'Website_Mockups_V2.fig',
    type: 'figma',
    size: '12.8 MB',
    uploadDate: '2024-01-10',
    sharedWith: 5,
    isPublic: true,
    downloads: 8,
    project: 'E-commerce Website'
  },
  {
    id: 3,
    name: 'Client_Presentation.pdf',
    type: 'pdf',
    size: '3.4 MB',
    uploadDate: '2024-01-08',
    sharedWith: 2,
    isPublic: false,
    downloads: 15,
    project: 'Mobile App UI'
  },
  {
    id: 4,
    name: 'Demo_Video.mp4',
    type: 'video',
    size: '128.5 MB',
    uploadDate: '2024-01-05',
    sharedWith: 1,
    isPublic: true,
    downloads: 24,
    project: 'Brand Identity Design'
  }
]

// Mock portfolio gallery data
const mockGalleryProjects = [
  {
    id: 1,
    title: 'Modern E-commerce Platform',
    category: 'Web Design',
    thumbnail: '/gallery/ecommerce-thumb.jpg',
    images: 12,
    views: 1247,
    likes: 89,
    featured: true,
    tags: ['UI/UX', 'E-commerce', 'Responsive'],
    client: 'Fashion Forward',
    year: '2024',
    description: 'Complete e-commerce platform redesign with modern aesthetics'
  },
  {
    id: 2,
    title: 'Brand Identity System',
    category: 'Branding',
    thumbnail: '/gallery/brand-thumb.jpg',
    images: 8,
    views: 892,
    likes: 67,
    featured: false,
    tags: ['Branding', 'Logo', 'Identity'],
    client: 'TechCorp Inc.',
    year: '2024',
    description: 'Complete brand identity including logo, colors, and guidelines'
  },
  {
    id: 3,
    title: 'Mobile Banking App',
    category: 'Mobile Design',
    thumbnail: '/gallery/mobile-thumb.jpg',
    images: 15,
    views: 1534,
    likes: 123,
    featured: true,
    tags: ['Mobile', 'UI/UX', 'Fintech'],
    client: 'FinanceFlow',
    year: '2023',
    description: 'Intuitive mobile banking application with advanced security'
  }
]

const fileTypeConfig = {
  zip: { icon: Archive, color: 'text-purple-600 bg-purple-50' },
  figma: { icon: FileText, color: 'text-blue-600 bg-blue-50' },
  pdf: { icon: FileText, color: 'text-red-600 bg-red-50' },
  video: { icon: Video, color: 'text-green-600 bg-green-50' },
  image: { icon: Image, color: 'text-yellow-600 bg-yellow-50' },
  audio: { icon: Music, color: 'text-indigo-600 bg-indigo-50' },
  document: { icon: File, color: 'text-gray-600 bg-gray-50' }
}

export default function FilesHubPage() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFiles, setSelectedFiles] = useState<number[]>([])

  // Calculate storage stats
  const totalStorageUsed = 8.5 // GB
  const totalStorageLimit = 10 // GB
  const storagePercentage = (totalStorageUsed / totalStorageLimit) * 100

  const FileCard = ({ file }: { file: any }) => {
    const typeInfo = fileTypeConfig[file.type as keyof typeof fileTypeConfig] || fileTypeConfig.document
    const TypeIcon = typeInfo.icon

    return (
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-lg ${typeInfo.color} group-hover:scale-105 transition-transform`}>
              <TypeIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{file.name}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>{file.size}</span>
                <span>•</span>
                <span>{file.uploadDate}</span>
                {file.project && (
                  <>
                    <span>•</span>
                    <span className="truncate">{file.project}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{file.sharedWith}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  <span>{file.downloads}</span>
                </div>
                {file.isPublic && (
                  <Badge variant="outline" className="text-xs">
                    <Globe className="h-2 w-2 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
            </div>
            <MoreHorizontal className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="flex-1 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs">
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <Share className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const GalleryProjectCard = ({ project }: { project: any }) => {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="font-medium text-sm">{project.title}</h3>
            <p className="text-xs opacity-90">{project.category}</p>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            {project.featured && (
              <Badge variant="secondary" className="bg-yellow-500 text-white">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-gray-600">
                  <Image className="h-3 w-3" />
                  <span>{project.images}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Eye className="h-3 w-3" />
                  <span>{project.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Heart className="h-3 w-3" />
                  <span>{project.likes}</span>
                </div>
              </div>
              <span className="text-xs text-gray-500">{project.year}</span>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 line-clamp-2">
              {project.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Share className="h-3 w-3 mr-1" />
                Share
              </Button>
              <Button size="sm" variant="outline">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Files Hub
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage cloud storage and showcase your portfolio
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white gap-2">
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-indigo-700 flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Storage Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-900">{totalStorageUsed}GB</div>
              <div className="mt-2">
                <Progress value={storagePercentage} className="h-2" />
                <p className="text-xs text-indigo-600 mt-1">of {totalStorageLimit}GB limit</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Total Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{mockCloudFiles.length}</div>
              <p className="text-xs text-purple-600 mt-1">Uploaded this month: 12</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Image className="h-4 w-4" />
                Portfolio Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{mockGalleryProjects.length}</div>
              <p className="text-xs text-blue-600 mt-1">Total views: 3.6K</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Share className="h-4 w-4" />
                Shared Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {mockCloudFiles.reduce((sum, file) => sum + file.sharedWith, 0)}
              </div>
              <p className="text-xs text-green-600 mt-1">Active shares</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="overview" className="gap-2" data-testid="overview-tab">
              <Archive className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="storage" className="gap-2" data-testid="storage-tab">
              <Cloud className="h-4 w-4" />
              Cloud Storage
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2" data-testid="gallery-tab">
              <Image className="h-4 w-4" />
              Portfolio Gallery
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Storage Overview */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-indigo-600" />
                    Storage Overview
                  </h2>
                  <Link href="/dashboard/cloud-storage">
                    <Button variant="outline" size="sm" className="gap-2">
                      Manage Storage
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                      <span className="font-medium">Used Storage</span>
                    </div>
                    <span className="font-bold text-indigo-600">{totalStorageUsed}GB</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gray-400 rounded-full" />
                      <span className="font-medium">Available</span>
                    </div>
                    <span className="font-bold text-gray-600">{totalStorageLimit - totalStorageUsed}GB</span>
                  </div>
                  <Progress value={storagePercentage} className="h-3" />
                  <p className="text-sm text-gray-600 text-center">
                    {storagePercentage.toFixed(1)}% of storage used
                  </p>
                </div>
              </Card>

              {/* Gallery Performance */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Image className="h-5 w-5 text-purple-600" />
                    Gallery Performance
                  </h2>
                  <Link href="/dashboard/gallery">
                    <Button variant="outline" size="sm" className="gap-2">
                      View Gallery
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-blue-600">
                        {mockGalleryProjects.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Total Views</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-red-600">
                        {mockGalleryProjects.reduce((sum, p) => sum + p.likes, 0)}
                      </div>
                      <div className="text-xs text-gray-500">Total Likes</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-yellow-600">
                        {mockGalleryProjects.filter(p => p.featured).length}
                      </div>
                      <div className="text-xs text-gray-500">Featured</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {mockGalleryProjects.slice(0, 2).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded flex items-center justify-center text-white text-xs font-semibold">
                            {project.title.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{project.title}</div>
                            <div className="text-xs text-gray-500">{project.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{project.views.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">views</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Cloud Storage Tab */}
          <TabsContent value="storage" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Cloud className="h-6 w-6 text-indigo-600" />
                  Cloud Storage
                  <Badge variant="outline" className="ml-2">
                    {totalStorageUsed}GB / {totalStorageLimit}GB
                  </Badge>
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                  </Button>
                  <Link href="/dashboard/cloud-storage">
                    <Button variant="outline" className="gap-2">
                      Full Storage Manager
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className={cn(
                "gap-6",
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "space-y-3"
              )}>
                {mockCloudFiles.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Portfolio Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Image className="h-6 w-6 text-purple-600" />
                  Portfolio Gallery
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                  <Link href="/dashboard/gallery">
                    <Button variant="outline" className="gap-2">
                      Full Gallery Manager
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockGalleryProjects.map((project) => (
                  <GalleryProjectCard key={project.id} project={project} />
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
} 