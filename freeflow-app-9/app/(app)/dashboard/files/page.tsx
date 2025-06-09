'use client'

import { useState } from 'react'
import { FileText, Upload, Download, Folder, Search, Filter, Grid, List, MoreHorizontal, Star, Share } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function FilesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [files] = useState([
    {
      id: 1,
      name: 'Logo Design v2.ai',
      type: 'Adobe Illustrator',
      size: '2.4 MB',
      project: 'ABC Corp Branding',
      modified: '2 hours ago',
      starred: true,
      thumbnail: '/images/logo-preview.jpg'
    },
    {
      id: 2,
      name: 'Brand Guidelines.pdf',
      type: 'PDF Document',
      size: '1.8 MB',
      project: 'ABC Corp Branding',
      modified: '1 day ago',
      starred: false,
      thumbnail: null
    },
    {
      id: 3,
      name: 'Website Mockup.psd',
      type: 'Photoshop',
      size: '15.2 MB',
      project: 'XYZ Inc Website',
      modified: '3 days ago',
      starred: true,
      thumbnail: '/images/website-preview.jpg'
    },
    {
      id: 4,
      name: 'Icon Set.zip',
      type: 'Archive',
      size: '845 KB',
      project: 'StartupCo App',
      modified: '1 week ago',
      starred: false,
      thumbnail: null
    },
    {
      id: 5,
      name: 'Presentation Deck.pptx',
      type: 'PowerPoint',
      size: '5.1 MB',
      project: 'Client Presentation',
      modified: '2 weeks ago',
      starred: false,
      thumbnail: null
    }
  ])

  const [folders] = useState([
    { id: 1, name: 'ABC Corp Branding', files: 12, modified: '2 hours ago' },
    { id: 2, name: 'XYZ Inc Website', files: 8, modified: '1 day ago' },
    { id: 3, name: 'StartupCo App', files: 15, modified: '3 days ago' },
    { id: 4, name: 'Templates', files: 6, modified: '1 week ago' }
  ])

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf document':
        return '📄'
      case 'adobe illustrator':
        return '🎨'
      case 'photoshop':
        return '🖼️'
      case 'archive':
        return '📦'
      case 'powerpoint':
        return '📊'
      default:
        return '📁'
    }
  }

  const totalFiles = files.length
  const totalSize = files.reduce((acc, file) => {
    const size = parseFloat(file.size.split(' ')[0])
    const unit = file.size.split(' ')[1]
    return acc + (unit === 'GB' ? size * 1024 : size)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Files</h1>
          <p className="text-gray-600">Manage and organize your project files</p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
      </div>

      {/* File Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{totalFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Folder className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Folders</p>
                <p className="text-2xl font-bold text-gray-900">{folders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">MB</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">{totalSize.toFixed(1)} MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Starred</p>
                <p className="text-2xl font-bold text-gray-900">{files.filter(f => f.starred).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search files and folders..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* File Browser */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Folders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Folders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center p-3 border rounded-lg hover:shadow-sm transition-all cursor-pointer"
                  >
                    <Folder className="h-8 w-8 text-yellow-500 mr-3" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{folder.name}</p>
                      <p className="text-sm text-gray-500">{folder.files} files</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Files</CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 border rounded-lg hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        {file.thumbnail ? (
                          <img 
                            src={file.thumbnail} 
                            alt={file.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-4xl">{getFileIcon(file.type)}</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-gray-900 truncate flex-1">{file.name}</p>
                          {file.starred && <Star className="h-4 w-4 text-yellow-500 ml-2" />}
                        </div>
                        <p className="text-sm text-gray-500">{file.type}</p>
                        <p className="text-xs text-gray-400">{file.size} • {file.modified}</p>
                        <Badge variant="outline" className="text-xs">
                          {file.project}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <span className="text-2xl">{getFileIcon(file.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900 truncate">{file.name}</p>
                            {file.starred && <Star className="h-4 w-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-gray-500">{file.type} • {file.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {file.project}
                        </Badge>
                        <span className="text-sm text-gray-500">{file.modified}</span>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Recent files will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="starred">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {files.filter(file => file.starred).map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{file.type} • {file.size}</p>
                      </div>
                    </div>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Shared files will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 