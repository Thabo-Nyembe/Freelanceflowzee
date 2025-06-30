'use client'

import React, { useReducer, useState, useCallback } from 'react'
 payload: FileItem }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'TOGGLE_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTER_TYPE'; payload: FileStorageState['filterType'] }
  | { type: 'SET_SORT'; payload: { sortBy: FileStorageState['sortBy']; sortOrder: FileStorageState['sortOrder'] } }
  | { type: 'UPDATE_UPLOAD_PROGRESS'; payload: UploadProgress }
  | { type: 'STAR_FILE'; payload: string }
  | { type: 'SHARE_FILE'; payload: { fileId: string; permissions: FileItem['permissions'] } }

const initialState: FileStorageState = {
  files: [
    {
      id: '1',
      name: 'Brand_Guidelines_Final.pdf',
      type: 'document',
      size: 2457600, // 2.4MB
      dateModified: new Date('2024-01-15'),
      dateCreated: new Date('2024-01-10'),
      path: '/projects/branding',
      isStarred: true,
      isShared: true,
      permissions: 'view',
      downloadCount: 23,
      views: 156,
      tags: ['branding', 'guidelines', 'final']
    },
    {
      id: '2',
      name: 'Hero_Animation_v3.mp4',
      type: 'video',
      size: 15728640, // 15MB
      dateModified: new Date('2024-01-14'),
      dateCreated: new Date('2024-01-12'),
      path: '/projects/website',
      thumbnail: '/videos/hero-thumb.jpg',
      isStarred: false,
      isShared: true,
      permissions: 'public',
      downloadCount: 8,
      views: 89,
      tags: ['animation', 'hero', 'website']
    },
    {
      id: '3',
      name: 'Logo_Variations.zip',
      type: 'archive',
      size: 5242880, // 5MB
      dateModified: new Date('2024-01-13'),
      dateCreated: new Date('2024-01-08'),
      path: '/projects/branding',
      isStarred: true,
      isShared: false,
      permissions: 'private',
      downloadCount: 45,
      views: 234,
      tags: ['logo', 'variations', 'assets']
    },
    {
      id: '4',
      name: 'Product_Photos.zip',
      type: 'archive',
      size: 52428800, // 50MB
      dateModified: new Date('2024-01-12'),
      dateCreated: new Date('2024-01-05'),
      path: '/projects/photography',
      isStarred: false,
      isShared: true,
      permissions: 'edit',
      downloadCount: 12,
      views: 67,
      tags: ['photography', 'products', 'high-res']
    }
  ],
  folders: [
    {
      id: 'f1',
      name: 'Brand Identity',
      path: '/projects/branding',
      itemCount: 12,
      size: 25165824, // 24MB
      dateModified: new Date('2024-01-15'),
      isShared: true,
      permissions: 'view
    },
    {
      id: 'f2',
      name: 'Website Assets',
      path: '/projects/website',
      itemCount: 8,
      size: 73400320, // 70MB
      dateModified: new Date('2024-01-14'),
      isShared: true,
      permissions: 'edit
    }
  ],
  selectedItems: [],
  uploadProgress: [],
  viewMode: 'grid',
  currentFolder: null,
  searchQuery: '',
  filterType: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
  analytics: {
    totalStorage: 107374182400, // 100GB
    usedStorage: 16106127360, // 15GB
    fileCount: 234,
    folderCount: 18,
    sharedItems: 45,
    recentActivity: [
      {
        id: 'a1',
        action: 'upload',
        fileName: 'Brand_Guidelines_Final.pdf',
        timestamp: new Date('2024-01-15T10:30:00'),
        user: 'John Doe
      },
      {
        id: 'a2',
        action: 'share',
        fileName: 'Hero_Animation_v3.mp4',
        timestamp: new Date('2024-01-14T14:22:00'),
        user: 'Sarah Wilson
      },
      {
        id: 'a3',
        action: 'download',
        fileName: 'Logo_Variations.zip',
        timestamp: new Date('2024-01-13T09:15:00'),
        user: 'Mike Chen
      }
    ]
  }
}

function fileStorageReducer(state: FileStorageState, action: FileStorageAction): FileStorageState {
  switch (action.type) {
    case 'SET_FILES':
      return { ...state, files: action.payload }
    
    case 'ADD_FILE':
      return { 
        ...state, 
        files: [...state.files, action.payload],
        analytics: {
          ...state.analytics,
          fileCount: state.analytics.fileCount + 1,
          usedStorage: state.analytics.usedStorage + action.payload.size
        }
      }
    
    case 'DELETE_FILE':
      const fileToDelete = state.files.find(f => f.id === action.payload)
      return { 
        ...state, 
        files: state.files.filter(f => f.id !== action.payload),
        selectedItems: state.selectedItems.filter(id => id !== action.payload),
        analytics: {
          ...state.analytics,
          fileCount: state.analytics.fileCount - 1,
          usedStorage: fileToDelete ? state.analytics.usedStorage - fileToDelete.size : state.analytics.usedStorage
        }
      }
    
    case 'TOGGLE_SELECTION':
      const isSelected = state.selectedItems.includes(action.payload)
      return {
        ...state,
        selectedItems: isSelected 
          ? state.selectedItems.filter(id => id !== action.payload)
          : [...state.selectedItems, action.payload]
      }
    
    case 'CLEAR_SELECTION':
      return { ...state, selectedItems: [] }
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    
    case 'SET_FILTER_TYPE':
      return { ...state, filterType: action.payload }
    
    case 'SET_SORT':
      return { 
        ...state, 
        sortBy: action.payload.sortBy, 
        sortOrder: action.payload.sortOrder 
      }
    
    case 'STAR_FILE':
      return {
        ...state,
        files: state.files.map(file => 
          file.id === action.payload 
            ? { ...file, isStarred: !file.isStarred }
            : file
        )
      }
    
    case 'SHARE_FILE':
      return {
        ...state,
        files: state.files.map(file => 
          file.id === action.payload.fileId 
            ? { ...file, isShared: true, permissions: action.payload.permissions }
            : file
        )
      }
    
    default:
      return state
  }
}

interface EnhancedFileStorageProps {
  showAnalytics?: boolean
  allowUpload?: boolean
  mode?: 'personal' | 'team' | 'client
  className?: string
}

export function EnhancedFileStorage({ 
  showAnalytics = true, 
  allowUpload = true,
  mode = 'personal',
  className = 
}: EnhancedFileStorageProps) {
  const [state, dispatch] = useReducer(fileStorageReducer, initialState)
  const [dragOver, setDragOver] = useState(false)

  // File type icons mapping
  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case &apos;image&apos;: return <Image className= "w-5 h-5 text-blue-500" />
      case &apos;video&apos;: return <Video className= "w-5 h-5 text-purple-500" />
      case &apos;audio&apos;: return <Music className= "w-5 h-5 text-green-500" />
      case &apos;document&apos;: return <FileText className= "w-5 h-5 text-red-500" />
      case &apos;archive&apos;: return <Archive className= "w-5 h-5 text-orange-500" />
      default: return <File className= "w-5 h-5 text-gray-500" />
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Filter and sort files
  const filteredFiles = state.files
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                           file.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()))
      const matchesFilter = state.filterType === 'all' || 
                           (state.filterType === 'images' && file.type === 'image') ||
                           (state.filterType === 'videos' && file.type === 'video') ||
                           (state.filterType === 'documents' && file.type === 'document') ||
                           (state.filterType === 'audio' && file.type === 'audio')
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let aValue: Record<string, unknown>, bValue: Record<string, unknown>
      switch (state.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'date':
          aValue = a.dateModified.getTime()
          bValue = b.dateModified.getTime()
          break
        case 'size':
          aValue = a.size
          bValue = b.size
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        default:
          return 0
      }
      
      if (state.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    // Handle file drop logic here
  }, [])

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl ${className}`}>
      {/* Header */}
      <div className= "bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-t-2xl p-6 text-white">
        <div className= "flex items-center justify-between">
          <div>
            <h1 className= "text-2xl font-bold flex items-center gap-2">
              <Cloud className= "w-7 h-7" />
              Enhanced File Storage
            </h1>
            <p className= "text-blue-100 mt-1">
              Dropbox & WeTransfer inspired cloud storage system
            </p>
          </div>
          
          {showAnalytics && (
            <div className= "flex items-center gap-4">
              <div className= "text-center">
                <div className= "text-xl font-bold">{formatFileSize(state.analytics.usedStorage)}</div>
                <div className= "text-xs text-blue-200">Used of {formatFileSize(state.analytics.totalStorage)}</div>
              </div>
              <div className= "text-center">
                <div className= "text-xl font-bold">{state.analytics.fileCount}</div>
                <div className= "text-xs text-blue-200">Files</div>
              </div>
              <Button variant= "secondary" size= "sm">
                <BarChart3 className= "w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          )}
        </div>
        
        {/* Storage Progress */}
        <div className= "mt-4">
          <div className= "flex justify-between text-sm mb-2">
            <span>Storage Used</span>
            <span>{Math.round((state.analytics.usedStorage / state.analytics.totalStorage) * 100)}%</span>
          </div>
          <Progress 
            value={(state.analytics.usedStorage / state.analytics.totalStorage) * 100} 
            className= "h-2 bg-white/20
          />
        </div>
      </div>

      <div className= "p-6">
        <Tabs defaultValue= "files" className= "space-y-6">
          <TabsList className= "grid w-full grid-cols-4">
            <TabsTrigger value= "files" className= "flex items-center gap-2">
              <Folder className= "w-4 h-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value= "shared" className= "flex items-center gap-2">
              <Share2 className= "w-4 h-4" />
              Shared
            </TabsTrigger>
            <TabsTrigger value= "recent" className= "flex items-center gap-2">
              <Clock className= "w-4 h-4" />
              Recent
            </TabsTrigger>
            <TabsTrigger value= "starred" className= "flex items-center gap-2">
              <Star className= "w-4 h-4" />
              Starred
            </TabsTrigger>
          </TabsList>

          <TabsContent value= "files" className= "space-y-6">
            {/* Upload Area */}
            {allowUpload && (
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className= "w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className= "text-lg font-semibold text-gray-700 mb-2">
                  Drop files here or click to upload
                </h3>
                <p className= "text-gray-500 mb-4">
                  Support for images, videos, documents and more
                </p>
                <Button className= "bg-gradient-to-r from-blue-600 to-purple-600">
                  <Upload className= "w-4 h-4 mr-2" />
                  Choose Files
                </Button>
              </div>
            )}

            {/* Search and Filters */}
            <div className= "flex items-center justify-between">
              <div className= "flex items-center gap-4 flex-1">
                <div className= "relative flex-1 max-w-md">
                  <Search className= "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder= "Search files, tags, or content...
                    value={state.searchQuery}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                    className= "pl-10
                  />
                </div>
                
                <select 
                  value={state.filterType}
                  onChange={(e) => dispatch({ 
                    type: 'SET_FILTER_TYPE', 
                    payload: e.target.value as FileStorageState['filterType'] 
                  })}
                  className= "px-3 py-2 border rounded-lg
                >
                  <option value= "all">All Files</option>
                  <option value= "images">Images</option>
                  <option value= "videos">Videos</option>
                  <option value= "documents">Documents</option>
                  <option value= "audio">Audio</option>
                </select>
              </div>

              <div className= "flex items-center gap-2">
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'outline'}
                  size= "sm
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'grid' })}
                >
                  <Grid className= "w-4 h-4" />
                </Button>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'outline'}
                  size= "sm
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
                >
                  <List className= "w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Files Grid/List */}
            {state.viewMode === 'grid' ? (
              <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <Card 
                    key={file.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      state.selectedItems.includes(file.id) ? 'ring-2 ring-blue-500' : 
                    }`}
                    onClick={() => dispatch({ type: 'TOGGLE_SELECTION', payload: file.id })}
                  >
                    <CardContent className= "p-4">
                      <div className= "flex items-center justify-between mb-3">
                        {getFileIcon(file.type)}
                        <div className= "flex items-center gap-1">
                          {file.isStarred && <Star className= "w-4 h-4 text-yellow-500 fill-current" />}
                          {file.isShared && <Share2 className= "w-4 h-4 text-blue-500" />}
                          <Button variant= "ghost" size= "sm">
                            <MoreHorizontal className= "w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <h3 className= "font-medium text-sm mb-2 line-clamp-2">{file.name}</h3>
                      
                      <div className= "text-xs text-gray-500 space-y-1">
                        <div>{formatFileSize(file.size)}</div>
                        <div>{file.dateModified.toLocaleDateString()}</div>
                        <div className= "flex items-center gap-2">
                          <Eye className= "w-3 h-3" />
                          {file.views}
                          <Download className= "w-3 h-3" />
                          {file.downloadCount}
                        </div>
                      </div>
                      
                      <div className= "flex flex-wrap gap-1 mt-2">
                        {file.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant= "secondary" className= "text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 2 && (
                          <Badge variant= "outline" className= "text-xs">
                            +{file.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className= "space-y-2">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      state.selectedItems.includes(file.id) ? 'bg-blue-50 border-blue-200' : 
                    }`}
                    onClick={() => dispatch({ type: 'TOGGLE_SELECTION', payload: file.id })}
                  >
                    <div className= "flex items-center gap-4 flex-1">
                      {getFileIcon(file.type)}
                      <div className= "flex-1">
                        <div className= "flex items-center gap-2">
                          <h3 className= "font-medium">{file.name}</h3>
                          {file.isStarred && <Star className= "w-4 h-4 text-yellow-500 fill-current" />}
                          {file.isShared && <Share2 className= "w-4 h-4 text-blue-500" />}
                        </div>
                        <div className= "text-sm text-gray-500">
                          {formatFileSize(file.size)} • {file.dateModified.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className= "flex items-center gap-4 text-sm text-gray-500">
                      <div className= "flex items-center gap-1">
                        <Eye className= "w-4 h-4" />
                        {file.views}
                      </div>
                      <div className= "flex items-center gap-1">
                        <Download className= "w-4 h-4" />
                        {file.downloadCount}
                      </div>
                      <Button variant= "ghost" size= "sm">
                        <MoreHorizontal className= "w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value= "shared">
            <div className= "text-center py-12">
              <Share2 className= "w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className= "text-lg font-semibold text-gray-600 mb-2">Shared Files</h3>
              <p className= "text-gray-500">Files shared with clients and team members appear here</p>
            </div>
          </TabsContent>

          <TabsContent value= "recent">
            <div className= "space-y-4">
              <h3 className= "text-lg font-semibold">Recent Activity</h3>
              {state.analytics.recentActivity.map((activity) => (
                <div key={activity.id} className= "flex items-center gap-4 p-4 border rounded-lg">
                  <div className= "p-2 bg-blue-100 rounded-full">
                    {activity.action === 'upload' && <Upload className= "w-4 h-4 text-blue-600" />}
                    {activity.action === 'download' && <Download className= "w-4 h-4 text-green-600" />}
                    {activity.action === 'share' && <Share2 className= "w-4 h-4 text-purple-600" />}
                  </div>
                  <div className= "flex-1">
                    <div className= "font-medium">{activity.fileName}</div>
                    <div className= "text-sm text-gray-500">
                      {activity.action} by {activity.user} • {activity.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value= "starred">
            <div className= "text-center py-12">
              <Star className= "w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className= "text-lg font-semibold text-gray-600 mb-2">Starred Files</h3>
              <p className= "text-gray-500">Your favorite files appear here for quick access</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Selection Actions */}
      {state.selectedItems.length > 0 && (
        <div className= "fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-6 py-3 flex items-center gap-4 border">
          <span className= "text-sm font-medium">
            {state.selectedItems.length} selected
          </span>
          <div className= "flex items-center gap-2">
            <Button size= "sm" variant= "outline">
              <Download className= "w-4 h-4 mr-1" />
              Download
            </Button>
            <Button size= "sm" variant= "outline">
              <Share2 className= "w-4 h-4 mr-1" />
              Share
            </Button>
            <Button size= "sm" variant= "outline">
              <Copy className= "w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button size= "sm" variant= "outline">
              <Move className= "w-4 h-4 mr-1" />
              Move
            </Button>
            <Button 
              size= "sm" 
              variant= "outline
              onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}
            >
              <Trash2 className= "w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 