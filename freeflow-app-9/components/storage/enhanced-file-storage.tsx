'use client'

import React, { useReducer, useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Archive,
  Clock,
  Download,
  Edit,
  File,
  FileText,
  Folder,
  Grid,
  Image,
  List,
  MoreHorizontal,
  Move,
  Music,
  Search,
  Share2,
  Star,
  Trash2,
  Upload,
  Video,
} from 'lucide-react'

// SVG Icon Components
function Settings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function Home(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function BarChart3(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  )
}

// Type Definitions
interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  size: number;
  dateModified: Date;
  dateCreated: Date;
  path: string;
  isStarred: boolean;
  isShared: boolean;
  permissions: 'view' | 'edit' | 'public' | 'private';
  downloadCount: number;
  views: number;
  tags: string[];
  thumbnail?: string;
}

interface FolderItem {
  id: string;
  name: string;
  path: string;
  itemCount: number;
  size: number;
  dateModified: Date;
  isShared: boolean;
  permissions: 'view' | 'edit';
}

interface UploadProgress {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

interface FileStorageState {
  files: FileItem[];
  folders: FolderItem[];
  selectedItems: string[];
  uploadProgress: UploadProgress[];
  viewMode: 'grid' | 'list';
  currentFolder: string | null;
  searchQuery: string;
  filterType: 'all' | 'image' | 'video' | 'audio' | 'document' | 'archive';
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  analytics: {
    totalStorage: number;
    usedStorage: number;
    fileCount: number;
    folderCount: number;
    sharedItems: number;
    recentActivity: {
      id: string;
      action: 'upload' | 'share' | 'download';
      fileName: string;
      timestamp: Date;
      user: string;
    }[];
  };
}

type FileStorageAction =
  | { type: 'SET_FILES'; payload: FileItem[] }
  | { type: 'ADD_FILE'; payload: FileItem }
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
      permissions: 'view'
    },
    {
      id: 'f2',
      name: 'Website Assets',
      path: '/projects/website',
      itemCount: 8,
      size: 73400320, // 70MB
      dateModified: new Date('2024-01-14'),
      isShared: true,
      permissions: 'edit'
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
        user: 'John Doe'
      },
      {
        id: 'a2',
        action: 'share',
        fileName: 'Hero_Animation_v3.mp4',
        timestamp: new Date('2024-01-14T14:22:00'),
        user: 'Sarah Wilson'
      },
      {
        id: 'a3',
        action: 'download',
        fileName: 'Logo_Variations.zip',
        timestamp: new Date('2024-01-13T09:15:00'),
        user: 'Mike Chen'
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
  mode?: 'personal' | 'team' | 'client'
  className?: string
}

export function EnhancedFileStorage({ 
  showAnalytics = true, allowUpload = true, mode = 'personal', className = ''
}: EnhancedFileStorageProps) {
  const [state, dispatch] = useReducer(fileStorageReducer, initialState)
  const [dragOver, setDragOver] = useState<any>(false)

  // File type icons mapping
  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-blue-500"  loading="lazy"/>
      case 'video': return <Video className="w-5 h-5 text-purple-500" />
      case 'audio': return <Music className="w-5 h-5 text-green-500" />
      case 'document': return <FileText className="w-5 h-5 text-red-500" />
      case 'archive': return <Archive className="w-5 h-5 text-orange-500" />
      default: return <File className="w-5 h-5 text-gray-500" />
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Filter and sort files
  const filteredFiles = state.files
    .filter(file => {
      const searchMatch = file.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                          file.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()))
      
      const typeMatch = state.filterType === 'all' || file.type === state.filterType

      return searchMatch && typeMatch
    })
    .sort((a, b) => {
      const order = state.sortOrder === 'asc' ? 1 : -1
      switch (state.sortBy) {
        case 'name': return a.name.localeCompare(b.name) * order
        case 'size': return (a.size - b.size) * order
        case 'type': return a.type.localeCompare(b.type) * order
        default: return (b.dateModified.getTime() - a.dateModified.getTime()) * order
      }
    })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [/* add dependencies */])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [/* add dependencies */])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    // Handle file upload logic here
    console.log(e.dataTransfer.files)
  }, [/* add dependencies */])

  return (
    <div className={`bg-gray-50/50 rounded-2xl overflow-hidden border border-gray-200/50 shadow-sm ${className}`}>
      {/* Sidebar */}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 border-r border-gray-200/50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-800">My Storage</h2>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Home className="w-5 h-5" />
            Home
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Folder className="w-5 h-5" />
            All Files
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Share2 className="w-5 h-5" />
            Shared with me
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Clock className="w-5 h-5" />
            Recents
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Star className="w-5 h-5" />
            Starred
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Trash2 className="w-5 h-5" />
            Trash
          </Button>
        </nav>

        {showAnalytics && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 px-2">Analytics</h3>
            <div className="space-y-4">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        )}
        
        {/* Storage Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Storage Used</span>
            <span>{Math.round((state.analytics.usedStorage / state.analytics.totalStorage) * 100)}%</span>
          </div>
          <Progress 
            value={(state.analytics.usedStorage / state.analytics.totalStorage) * 100} 
            className="h-2 bg-white/20"
          />
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="files" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Shared
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="starred" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Starred
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-6">
            {/* Upload Area */}
            {allowUpload && (
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Drop files here or click to upload
                </h3>
                <p className="text-gray-500 mb-4">
                  Support for images, videos, documents and more
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
              </div>
            )}

            {/* Search and Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search files, tags, or content..."
                    value={state.searchQuery}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                    className="pl-10"
                  />
                </div>
                
                <select 
                  value={state.filterType}
                  onChange={(e) => dispatch({ type: 'SET_FILTER_TYPE', payload: e.target.value as FileStorageState['filterType'] })}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="all">All Files</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="document">Documents</option>
                  <option value="audio">Audio</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'grid' })}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Files Grid/List */}
            {state.viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <Card 
                    key={file.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      state.selectedItems.includes(file.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => dispatch({ type: 'TOGGLE_SELECTION', payload: file.id })}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {getFileIcon(file.type)}
                        <Checkbox checked={state.selectedItems.includes(file.id)} />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">{file.name}</h3>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>{formatFileSize(file.size)}</div>
                        <div>{file.dateModified.toLocaleDateString()}</div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {file.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{file.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={state.selectedItems.length === filteredFiles.length && filteredFiles.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            dispatch({ type: 'CLEAR_SELECTION' });
                            filteredFiles.forEach(file => dispatch({ type: 'TOGGLE_SELECTION', payload: file.id }))
                          } else {
                            dispatch({ type: 'CLEAR_SELECTION' })
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Date Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <Checkbox checked={state.selectedItems.includes(file.id)} onCheckedChange={() => dispatch({ type: 'TOGGLE_SELECTION', payload: file.id })} />
                      </TableCell>
                      <TableCell className="font-medium flex items-center gap-2">
                        {getFileIcon(file.type)}
                        {file.name}
                      </TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>{file.dateModified.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </div>

       {/* Selection Actions */}
       {state.selectedItems.length > 0 && (
         <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-6 py-3 flex items-center gap-4 border">
           <span className="text-sm font-medium">
             {state.selectedItems.length} selected
           </span>
           <div className="flex items-center gap-2">
             <Button size="sm" variant="outline">
               <Download className="w-4 h-4 mr-1" />
               Download
             </Button>
             <Button size="sm" variant="outline">
               <Share2 className="w-4 h-4 mr-1" />
               Share
             </Button>
             <Button size="sm" variant="outline">
               <Move className="w-4 h-4 mr-1" />
               Move
             </Button>
             <Button 
               size="sm" 
               variant="outline"
               onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}
             >
               <Trash2 className="w-4 h-4 mr-1" />
               Delete
             </Button>
           </div>
         </div>
       )}
    </div>
  )
} 