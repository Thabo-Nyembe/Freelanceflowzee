"use client"

import React, { useState, useReducer, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EnhancedUploadProgress } from '@/components/upload/enhanced-upload-progress'
import { EnhancedDownloadManager } from '@/components/download/enhanced-download-manager'
import { 
  FileText,
  Upload,
  Download,
  Folder,
  Search,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  Star,
  Share,
  Trash2,
  Eye,
  Edit,
  Image,
  Video,
  Music,
  Archive,
  Cloud,
  HardDrive,
  RefreshCw,
  Plus,
  FolderPlus,
  Users,
  Lock,
  Clock,
  TrendingUp,
  Zap,
  Settings,
  File
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileUploadDialog } from '@/components/files/file-upload-dialog'
import { createBrowserClient } from '@supabase/ssr'

interface FilesHubProps {
  projects: any[]
  userId: string
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (mimeType: string) => {
  if (mimeType?.includes('image')) return Image
  if (mimeType?.includes('video')) return Video
  if (mimeType?.includes('audio')) return Music
  if (mimeType?.includes('pdf')) return FileText
  return FileText
}

const getFileColor = (mimeType: string): string => {
  if (mimeType?.includes('image')) return 'text-purple-500'
  if (mimeType?.includes('video')) return 'text-blue-500'
  if (mimeType?.includes('audio')) return 'text-green-500'
  if (mimeType?.includes('pdf')) return 'text-red-500'
  return 'text-gray-500'
}

// Context7 useReducer pattern for file state management
interface FileState {
  files: any[]
  folders: any[]
  selectedItems: string[]
  viewMode: 'grid' | 'list'
  searchQuery: string
  currentFolder: string | null
  uploadProgress: number
  isUploading: boolean
  storageStats: {
    used: number
    total: number
    files: number
    folders: number
  }
}

type FileAction = 
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'DESELECT_ITEM'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_CURRENT_FOLDER'; payload: string | null }
  | { type: 'START_UPLOAD' }
  | { type: 'UPDATE_UPLOAD_PROGRESS'; payload: number }
  | { type: 'COMPLETE_UPLOAD' }
  | { type: 'ADD_FILE'; payload: any }
  | { type: 'DELETE_FILES'; payload: string[] }
  | { type: 'UPLOAD_SUCCESS'; payload: { files: any[] } }
  | { type: 'UPLOAD_ERROR'; payload: { error: string } }
  | { type: 'DOWNLOAD_START'; payload: { fileId: string } }
  | { type: 'DOWNLOAD_SUCCESS'; payload: { fileId: string } }
  | { type: 'DOWNLOAD_ERROR'; payload: { fileId: string; error: string } }

const initialState: FileState = {
  files: [
    {
      id: '1',
      name: 'Brand_Guidelines_V2.pdf',
      type: 'pdf',
      size: '2.4 MB',
      modified: '2 hours ago',
      author: 'Sarah Chen',
      shared: true,
      starred: true,
      icon: FileText,
      color: 'text-red-500'
    },
    {
      id: '2',
      name: 'Logo_Concepts.psd',
      type: 'image',
      size: '45.2 MB',
      modified: '1 day ago',
      author: 'You',
      shared: false,
      starred: false,
      icon: Image,
      color: 'text-purple-500'
    },
    {
      id: '3',
      name: 'Presentation_Video.mp4',
      type: 'video',
      size: '127.8 MB',
      modified: '3 days ago',
      author: 'Mike Johnson',
      shared: true,
      starred: false,
      icon: Video,
      color: 'text-blue-500'
    },
    {
      id: '4',
      name: 'Project_Archive.zip',
      type: 'archive',
      size: '89.1 MB',
      modified: '1 week ago',
      author: 'Team',
      shared: false,
      starred: true,
      icon: Archive,
      color: 'text-orange-500'
    },
    {
      id: '5',
      name: 'Audio_Branding.wav',
      type: 'audio',
      size: '15.6 MB',
      modified: '2 weeks ago',
      author: 'Audio Team',
      shared: true,
      starred: false,
      icon: Music,
      color: 'text-green-500'
    }
  ],
  folders: [
    {
      id: 'f1',
      name: 'Brand Assets',
      filesCount: 23,
      modified: '1 day ago',
      shared: true,
      color: 'text-purple-600'
    },
    {
      id: 'f2',
      name: 'Client Reviews',
      filesCount: 8,
      modified: '3 days ago',
      shared: false,
      color: 'text-blue-600'
    },
    {
      id: 'f3',
      name: 'Final Deliverables',
      filesCount: 12,
      modified: '1 week ago',
      shared: true,
      color: 'text-green-600'
    },
    {
      id: 'f4',
      name: 'Work in Progress',
      filesCount: 34,
      modified: '2 hours ago',
      shared: false,
      color: 'text-orange-600'
    }
  ],
  selectedItems: [],
  viewMode: 'grid',
  searchQuery: '',
  currentFolder: null,
  uploadProgress: 0,
  isUploading: false,
  storageStats: {
    used: 869.5,
    total: 2000,
    files: 156,
    folders: 24
  }
}

function fileReducer(state: FileState, action: FileAction): FileState {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    case 'SELECT_ITEM':
      return { 
        ...state, 
        selectedItems: [...state.selectedItems, action.payload] 
      }
    case 'DESELECT_ITEM':
      return { 
        ...state, 
        selectedItems: state.selectedItems.filter(id => id !== action.payload) 
      }
    case 'CLEAR_SELECTION':
      return { ...state, selectedItems: [] }
    case 'SET_CURRENT_FOLDER':
      return { ...state, currentFolder: action.payload }
    case 'START_UPLOAD':
      return { ...state, isUploading: true, uploadProgress: 0 }
    case 'UPDATE_UPLOAD_PROGRESS':
      return { ...state, uploadProgress: action.payload }
    case 'COMPLETE_UPLOAD':
      return { ...state, isUploading: false, uploadProgress: 0 }
    case 'ADD_FILE':
      return { ...state, files: [...state.files, action.payload] }
    case 'DELETE_FILES':
      return { 
        ...state, 
        files: state.files.filter(file => !action.payload.includes(file.id)),
        selectedItems: []
      }
    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        files: [...state.files, ...action.payload.files],
        isUploading: false,
        uploadProgress: 0
      }
    case 'UPLOAD_ERROR':
      return {
        ...state,
        isUploading: false,
        uploadProgress: 0
      }
    case 'DOWNLOAD_START':
      return state // Could add download tracking if needed
    case 'DOWNLOAD_SUCCESS':
      return state // Could add download tracking if needed
    case 'DOWNLOAD_ERROR':
      return state // Could add download tracking if needed
    default:
      return state
  }
}

export function FilesHub({ projects, userId }: FilesHubProps) {
  const [state, dispatch] = useReducer(fileReducer, initialState)
  const [activeTab, setActiveTab] = useState('files')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Interactive handlers using Context7 patterns
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    console.log('Starting file upload...', files[0].name)
    dispatch({ type: 'START_UPLOAD' })
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'uploads')
        formData.append('publicRead', 'false')
        formData.append('project_id', 'sample-project')
        
        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }
        
        const result = await response.json()
        return {
          id: result.file.file_id || `file_${Date.now()}_${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: result.file.url,
          provider: result.file.provider,
          uploadedAt: new Date().toISOString(),
          status: 'completed' as const
        }
      })
      
      const uploadedFiles = await Promise.all(uploadPromises)
      
      dispatch({ 
        type: 'UPLOAD_SUCCESS',
        payload: { files: uploadedFiles }
      })
    } catch (error) {
      console.error('Upload error:', error)
      dispatch({ 
        type: 'UPLOAD_ERROR',
        payload: { error: error instanceof Error ? error.message : 'Upload failed' }
      })
    }
    
    // Reset file input
    event.target.value = ''
  }, [])

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('folders')
        .insert([{
          user_id: user.id,
          name: newFolderName.trim(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      dispatch({ type: 'ADD_FILE', payload: data })
      setIsNewFolderDialogOpen(false)
      setNewFolderName('')
    } catch (error) {
      console.error('Error creating folder:', error)
      alert('Failed to create folder. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadFile = useCallback(async (file: any) => {
    try {
      dispatch({ type: 'DOWNLOAD_START', payload: { fileId: file.id } })
      
      const response = await fetch(`/api/storage/download?fileId=${file.id}`)
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      dispatch({ 
        type: 'DOWNLOAD_SUCCESS',
        payload: { fileId: file.id }
      })
    } catch (error) {
      console.error('Download error:', error)
      dispatch({ 
        type: 'DOWNLOAD_ERROR',
        payload: { 
          fileId: file.id,
          error: error instanceof Error ? error.message : 'Download failed' 
        }
      })
    }
  }, [])

  const handleShareFile = useCallback((file: any) => {
    console.log(`Sharing ${file.name}...`)
    alert(`Share link copied for ${file.name}!`)
  }, [])

  const handleDeleteSelected = useCallback(() => {
    if (state.selectedItems.length > 0) {
      const confirmed = confirm(`Delete ${state.selectedItems.length} item(s)?`)
      if (confirmed) {
        dispatch({ type: 'DELETE_FILES', payload: state.selectedItems })
        alert('Files deleted successfully!')
      }
    }
  }, [state.selectedItems])

  const handleItemSelect = useCallback((id: string) => {
    if (state.selectedItems.includes(id)) {
      dispatch({ type: 'DESELECT_ITEM', payload: id })
    } else {
      dispatch({ type: 'SELECT_ITEM', payload: id })
    }
  }, [state.selectedItems])

  const filteredFiles = state.files.filter(file =>
    file.name.toLowerCase().includes(state.searchQuery.toLowerCase())
  )

  const filteredFolders = state.folders.filter(folder =>
    folder.name.toLowerCase().includes(state.searchQuery.toLowerCase())
  )

  const handleUploadComplete = (uploadedFiles: any[]) => {
    dispatch({ 
      type: 'UPLOAD_SUCCESS',
      payload: { files: uploadedFiles }
    })
    setIsUploadDialogOpen(false)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Enterprise Files Hub
          </h1>
          <p className="text-gray-600 mt-1">
            Professional file management with cloud storage optimization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsNewFolderDialogOpen(true)}
            data-testid="new-folder-btn"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Button 
            onClick={() => setIsUploadDialogOpen(true)}
            disabled={state.isUploading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            data-testid="upload-file-btn"
          >
            <Upload className="w-4 h-4 mr-2" />
            {state.isUploading ? `Uploading ${state.uploadProgress}%` : 'Upload Files'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.zip,.txt,.json,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            multiple={true}
          />
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Cloud className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">{state.storageStats.used} MB</div>
                <div className="text-sm opacity-90">Storage Used</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">{state.storageStats.files}</div>
                <div className="text-sm opacity-90">Total Files</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Folder className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">{state.storageStats.folders}</div>
                <div className="text-sm opacity-90">Folders</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">{Math.round((state.storageStats.used / state.storageStats.total) * 100)}%</div>
                <div className="text-sm opacity-90">Usage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search files and folders..."
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                  className="pl-10 bg-white/80"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {state.selectedItems.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}>
                    Clear ({state.selectedItems.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeleteSelected} data-testid="delete-file-btn">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'grid' })}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="files" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Files
          </TabsTrigger>
          <TabsTrigger value="shared" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
            <Share className="w-4 h-4 mr-2" />
            Shared
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="mt-6">
          {/* Folders */}
          {filteredFolders.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Folders
              </h3>
              <div className={`grid gap-4 ${state.viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
                {filteredFolders.map(folder => (
                  <Card 
                    key={folder.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${state.selectedItems.includes(folder.id) ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleItemSelect(folder.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Folder className={`w-8 h-8 ${folder.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{folder.name}</div>
                          <div className="text-sm text-gray-500">{folder.filesCount} files</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {folder.shared && <Users className="w-4 h-4 text-blue-500" />}
                          <Button variant="ghost" size="sm" className="p-1">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Files
            </h3>
            <div className={`grid gap-4 ${state.viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {filteredFiles.map(file => (
                <Card 
                  key={file.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${state.selectedItems.includes(file.id) ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleItemSelect(file.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <file.icon className={`w-8 h-8 ${file.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate flex items-center gap-2">
                          {file.name}
                          {file.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                        <div className="text-sm text-gray-500">{file.size}</div>
                        <div className="text-xs text-gray-400">Modified {file.modified}</div>
                        <div className="text-xs text-gray-400">by {file.author}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {file.shared && <Badge variant="secondary" className="text-xs">Shared</Badge>}
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownloadFile(file)
                            }}
                            data-testid="download-file-btn"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShareFile(file)
                            }}
                            data-testid="share-file-btn"
                          >
                            <Share className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-1">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shared" className="mt-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Share className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Shared Files</h3>
              <p className="text-gray-600 mb-4">Files shared with team members and clients</p>
              <Button onClick={() => alert('Shared files feature coming soon!')}>
                View Shared Files
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">File Analytics</h3>
              <p className="text-gray-600 mb-4">Track file usage, downloads, and collaboration metrics</p>
              <Button onClick={() => alert('Analytics dashboard coming soon!')}>
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* File Upload Dialog */}
      <FileUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUploadComplete={handleUploadComplete}
      />

      {/* New Folder Dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
            />
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setIsNewFolderDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || loading}
              >
                {loading ? 'Creating...' : 'Create Folder'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 