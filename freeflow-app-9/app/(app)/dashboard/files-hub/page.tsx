'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState, FirstTimeState } from '@/components/ui/empty-states'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FolderOpen,
  Upload,
  Search,
  Filter,
  Grid3X3,
  List,
  File,
  FileText,
  FileImage,
  FileVideo,
  Download,
  Share2,
  MoreHorizontal,
  Plus,
  Folder,
  Star,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'

export default function FilesHubPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Mock file data
  const files = [
    {
      id: 1,
      name: 'Project Proposal.pdf',
      type: 'pdf',
      size: '2.4 MB',
      modified: new Date('2024-01-15'),
      shared: true,
      starred: true,
      folder: 'Documents'
    },
    {
      id: 2,
      name: 'Design Mockups.fig',
      type: 'design',
      size: '15.2 MB',
      modified: new Date('2024-01-14'),
      shared: false,
      starred: false,
      folder: 'Designs'
    },
    {
      id: 3,
      name: 'Team Photo.jpg',
      type: 'image',
      size: '3.8 MB',
      modified: new Date('2024-01-12'),
      shared: true,
      starred: false,
      folder: 'Images'
    },
    {
      id: 4,
      name: 'Presentation.pptx',
      type: 'presentation',
      size: '8.7 MB',
      modified: new Date('2024-01-10'),
      shared: false,
      starred: true,
      folder: 'Documents'
    }
  ]

  const folders = [
    { name: 'Documents', count: 12, color: 'blue' },
    { name: 'Images', count: 24, color: 'green' },
    { name: 'Videos', count: 8, color: 'purple' },
    { name: 'Designs', count: 15, color: 'orange' }
  ]

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'presentation':
        return FileText
      case 'image':
        return FileImage
      case 'video':
        return FileVideo
      case 'design':
        return File
      default:
        return File
    }
  }

  const filteredFiles = files.filter(file => {
    // Handle folder filtering from search query
    if (searchQuery.startsWith('folder:')) {
      const folderName = searchQuery.replace('folder:', '')
      return file.folder.toLowerCase().includes(folderName)
    }
    
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'starred' && file.starred) ||
      (selectedFilter === 'shared' && file.shared) ||
      (selectedFilter === 'recent' && file.modified > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    
    return matchesSearch && matchesFilter
  })

  const handleCreateFolder = () => {
    // Create a new folder in the current directory
    const folderName = prompt('Enter folder name:')
    if (folderName) {
      // Add folder creation logic here
      console.log('Creating folder:', folderName)
      // For now, show success message
      alert(`Folder "${folderName}" created successfully`)
    }
  }

  const handleUploadFiles = () => {
    // Trigger file upload dialog
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '*/*'
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        console.log('Uploading files:', Array.from(files).map(f => f.name))
        // Add file upload logic here
        alert(`${files.length} file(s) selected for upload`)
      }
    }
    input.click()
  }

  return (
    <div className="p-6 space-y-6 kazi-bg-light min-h-screen">
      <PageHeader
        title="Files Hub"
        description="Organize, share, and manage all your project files in one place"
        icon={FileText}
        actions={
          <>
            <Button variant="outline" onClick={handleCreateFolder}>
              <Plus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <Button onClick={handleUploadFiles}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Files Hub' }
        ]}
      />

      <Tabs value="files" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="files">All Files</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-6">
          {/* Quick Access Folders */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <Card 
                key={folder.name} 
                className="kazi-card-interactive cursor-pointer hover:shadow-lg transition-all"
                onClick={() => {
                  console.log(`Opening folder: ${folder.name}`)
                  // Navigate to folder or filter by folder
                  setSelectedFilter('all')
                  setSearchQuery(`folder:${folder.name.toLowerCase()}`)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-${folder.color}-100 dark:bg-${folder.color}-900/20`}>
                      <Folder className={`h-5 w-5 text-${folder.color}-600 dark:text-${folder.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium kazi-text-primary">{folder.name}</p>
                      <p className="text-sm kazi-text-tertiary">{folder.count} files</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedFilter === 'starred' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter('starred')}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Starred
                </Button>
                <Button
                  variant={selectedFilter === 'shared' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter('shared')}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Shared
                </Button>
                <Button
                  variant={selectedFilter === 'recent' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter('recent')}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Recent
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Files Display */}
          {filteredFiles.length === 0 ? (
            searchQuery ? (
              <EmptyState
                icon={Search}
                title="No files found"
                description={`No files match "${searchQuery}". Try adjusting your search terms.`}
                action={{
                  label: "Clear search",
                  onClick: () => setSearchQuery(''),
                  variant: 'outline'
                }}
              />
            ) : (
              <FirstTimeState
                title="Start organizing your files"
                description="Upload your first files to get started with the Files Hub. Organize, share, and collaborate on all your project assets."
                actionLabel="Upload Files"
                onAction={handleUploadFiles}
              />
            )
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
                : 'space-y-2'
            }>
              {filteredFiles.map((file) => {
                const IconComponent = getFileIcon(file.type)
                
                if (viewMode === 'grid') {
                  return (
                    <Card 
                      key={file.id} 
                      className="kazi-card-interactive group cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => {
                        console.log(`Opening file: ${file.name}`)
                        // Add file preview/open logic here
                        alert(`Opening ${file.name}`)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="p-2 rounded-lg kazi-bg-tertiary">
                              <IconComponent className="h-5 w-5 kazi-text-secondary" />
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {file.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                              {file.shared && <Share2 className="h-4 w-4 kazi-text-tertiary" />}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="font-medium kazi-text-primary text-sm truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs kazi-text-tertiary">{file.size}</p>
                            <p className="text-xs kazi-text-tertiary">
                              {format(file.modified, 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }

                return (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between p-3 rounded-lg kazi-hover kazi-card cursor-pointer hover:shadow-md transition-all"
                    onClick={() => {
                      console.log(`Opening file: ${file.name}`)
                      // Add file preview/open logic here
                      alert(`Opening ${file.name}`)
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded kazi-bg-tertiary">
                        <IconComponent className="h-4 w-4 kazi-text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium kazi-text-primary">{file.name}</p>
                        <p className="text-sm kazi-text-tertiary">
                          {file.size} • Modified {format(file.modified, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {file.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      {file.shared && <Share2 className="h-4 w-4 kazi-text-tertiary" />}
                      <Badge variant="outline">{file.folder}</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log(`File menu for: ${file.name}`)
                          // Add file menu logic here
                          alert(`File menu for ${file.name}`)
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent">
          <EmptyState
            icon={Clock}
            title="No recent files"
            description="Files you've worked on recently will appear here."
          />
        </TabsContent>

        <TabsContent value="shared">
          <EmptyState
            icon={Share2}
            title="No shared files"
            description="Files that have been shared with you or by you will appear here."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}