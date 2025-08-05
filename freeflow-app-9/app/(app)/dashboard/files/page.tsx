"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  File, 
  FolderOpen, 
  Upload, 
  Download, 
  Search, 
  Filter,
  Grid,
  List,
  MoreHorizontal,
  Star,
  Share2,
  Eye,
  Archive,
  FileText,
  Image,
  Video,
  FileCode,
  FileSpreadsheet,
  HardDrive,
  Plus
} from 'lucide-react'

export default function FilesPage() {
  const [viewMode, setViewMode] = useState<string>('grid')
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Mock files data
  const files = [
    {
      id: 1,
      name: 'Project Proposal.pdf',
      type: 'pdf',
      size: '2.4 MB',
      dateModified: '2024-01-15',
      owner: 'Sarah Johnson',
      folder: 'Documents',
      starred: true,
      shared: true,
      thumbnail: null,
      tags: ['proposal', 'client', 'important']
    },
    {
      id: 2,
      name: 'Brand Identity Design.fig',
      type: 'figma',
      size: '15.8 MB',
      dateModified: '2024-01-14',
      owner: 'Mike Chen',
      folder: 'Design',
      starred: false,
      shared: true,
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=150&fit=crop',
      tags: ['design', 'branding', 'figma']
    },
    {
      id: 3,
      name: 'Website Screenshots',
      type: 'folder',
      size: '45.2 MB',
      dateModified: '2024-01-12',
      owner: 'Emma Wilson',
      folder: 'Images',
      starred: false,
      shared: false,
      fileCount: 24,
      tags: ['screenshots', 'web', 'reference']
    },
    {
      id: 4,
      name: 'Client Meeting Recording.mp4',
      type: 'video',
      size: '156.7 MB',
      dateModified: '2024-01-10',
      owner: 'David Kim',
      folder: 'Videos',
      starred: true,
      shared: false,
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=150&h=150&fit=crop',
      tags: ['meeting', 'client', 'video']
    },
    {
      id: 5,
      name: 'Marketing Analytics.xlsx',
      type: 'excel',
      size: '892 KB',
      dateModified: '2024-01-08',
      owner: 'Lisa Brown',
      folder: 'Documents',
      starred: false,
      shared: true,
      thumbnail: null,
      tags: ['analytics', 'marketing', 'data']
    },
    {
      id: 6,
      name: 'Logo Concepts.png',
      type: 'image',
      size: '3.2 MB',
      dateModified: '2024-01-05',
      owner: 'Alex Rivera',
      folder: 'Images',
      starred: true,
      shared: false,
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=150&fit=crop',
      tags: ['logo', 'concepts', 'design']
    },
    {
      id: 7,
      name: 'Project Code.zip',
      type: 'archive',
      size: '28.5 MB',
      dateModified: '2024-01-03',
      owner: 'Mike Chen',
      folder: 'Code',
      starred: false,
      shared: true,
      thumbnail: null,
      tags: ['code', 'project', 'archive']
    },
    {
      id: 8,
      name: 'Team Photo.jpg',
      type: 'image',
      size: '4.8 MB',
      dateModified: '2024-01-01',
      owner: 'Emma Wilson',
      folder: 'Images',
      starred: false,
      shared: true,
      thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop',
      tags: ['team', 'photo', 'company']
    }
  ]

  const folders = [
    { name: 'all', label: 'All Files', count: files.length, icon: File },
    { name: 'Documents', label: 'Documents', count: files.filter(f => f.folder === 'Documents').length, icon: FileText },
    { name: 'Images', label: 'Images', count: files.filter(f => f.folder === 'Images').length, icon: Image },
    { name: 'Videos', label: 'Videos', count: files.filter(f => f.folder === 'Videos').length, icon: Video },
    { name: 'Design', label: 'Design', count: files.filter(f => f.folder === 'Design').length, icon: FileCode },
    { name: 'Code', label: 'Code', count: files.filter(f => f.folder === 'Code').length, icon: FileCode },
    { name: 'starred', label: 'Starred', count: files.filter(f => f.starred).length, icon: Star },
    { name: 'shared', label: 'Shared', count: files.filter(f => f.shared).length, icon: Share2 }
  ]

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="h-8 w-8 text-red-500" />
      case 'figma': return <FileCode className="h-8 w-8 text-purple-500" />
      case 'folder': return <FolderOpen className="h-8 w-8 text-blue-500" />
      case 'video': return <Video className="h-8 w-8 text-green-500" />
      case 'excel': return <FileSpreadsheet className="h-8 w-8 text-green-600" />
      case 'image': return <Image className="h-8 w-8 text-orange-500" />
      case 'archive': return <Archive className="h-8 w-8 text-gray-500" />
      default: return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const filteredFiles = files.filter(file => {
    const matchesFolder = selectedFolder === 'all' || 
                         (selectedFolder === 'starred' && file.starred) ||
                         (selectedFolder === 'shared' && file.shared) ||
                         file.folder === selectedFolder
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesFolder && matchesSearch
  })

  const totalSize = files.reduce((sum, file) => {
    const sizeInMB = parseFloat(file.size.includes('MB') ? file.size : (parseFloat(file.size) / 1024).toFixed(1))
    return sum + sizeInMB
  }, 0)

  const storageUsed = 65 // percentage
  const storageTotal = '100 GB'

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">Files</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage and organize your project files</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4 mr-2" /> : <Grid className="h-4 w-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          <Button size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <File className="h-4 w-4 kazi-text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold kazi-text-primary">{files.length}</div>
            <p className="text-xs text-gray-500">Across all folders</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{storageUsed}%</div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${storageUsed}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{totalSize.toFixed(1)} MB of {storageTotal}</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Files</CardTitle>
            <Share2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{files.filter(f => f.shared).length}</div>
            <p className="text-xs text-gray-500">Shared with team</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Starred Files</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{files.filter(f => f.starred).length}</div>
            <p className="text-xs text-gray-500">Marked as important</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folders Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Folders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {folders.map((folder) => {
                  const IconComponent = folder.icon
                  return (
                    <button
                      key={folder.name}
                      onClick={() => setSelectedFolder(folder.name)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                        selectedFolder === folder.name
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm">{folder.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {folder.count}
                      </Badge>
                    </button>
                  )
                })}
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Files Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Files</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredFiles.map((file) => (
                    <Card key={file.id} className="kazi-card group cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {file.thumbnail ? (
                              <div className="relative">
                                <img 
                                  src={file.thumbnail} 
                                  alt={`Thumbnail for ${file.name}`}
                                  className="w-10 h-10 rounded object-cover"
                                />
                                {file.type === 'video' && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Video className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              getFileIcon(file.type)
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {file.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                            {file.shared && <Share2 className="h-4 w-4 text-green-500" />}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-medium text-sm mb-1 truncate" title={file.name}>
                          {file.name}
                        </h3>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex justify-between">
                            <span>{file.size}</span>
                            <span>{file.dateModified}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{file.owner}</span>
                            <span>{file.folder}</span>
                          </div>
                        </div>
                        {file.type === 'folder' && (
                          <div className="text-xs text-gray-500 mt-1">
                            {file.fileCount} files
                          </div>
                        )}
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" variant="outline" className="h-7 text-xs flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 group">
                      <div className="flex items-center gap-3">
                        {file.thumbnail ? (
                          <img 
                            src={file.thumbnail} 
                            alt={`Thumbnail for ${file.name}`}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{file.name}</h3>
                          <div className="text-sm text-gray-500">
                            {file.folder} • {file.owner}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1" />
                      <div className="text-sm text-gray-500">
                        {file.size}
                      </div>
                      <div className="text-sm text-gray-500">
                        {file.dateModified}
                      </div>
                      <div className="flex items-center gap-1">
                        {file.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        {file.shared && <Share2 className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredFiles.length === 0 && (
                <div className="text-center py-12">
                  <File className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No files found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
