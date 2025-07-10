'use client'

import React, { useState, useReducer, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  FolderOpen,
  FileText,
  File,
  Image,
  Video,
  Music,
  Archive,
  Code,
  Upload,
  Download,
  Share2,
  Search,
  Grid,
  List,
  FolderPlus,
  MoreHorizontal,
  Cloud,
  HardDrive,
  Star,
  StarOff,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw,
  Eye,
  Settings,
  Lock,
  WifiOff
} from 'lucide-react'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size: number
  mimeType: string
  createdAt: string
  modifiedAt: string
  path: string
  isShared: boolean
  isStarred: boolean
  isLocked: boolean
  owner: string
  permissions: 'read' | 'write' | 'admin'
  cloudProvider: 'google' | 'dropbox' | 'onedrive' | 'aws' | 'local'
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline'
  tags: string[]
  version: number
  thumbnail?: string
  previewUrl?: string
  downloadUrl?: string
  shareUrl?: string
  description?: string
  category?: string
  metadata?: unknown
}

interface CloudStorage {
  id: string
  name: string
  type: 'google' | 'dropbox' | 'onedrive' | 'aws' | 'local'
  connected: boolean
  storageUsed: number
  storageTotal: number
  lastSync: string
  syncEnabled: boolean
  autoSync: boolean
  syncInterval: number
  defaultFolder: string
  encryptionEnabled: boolean
  compressionEnabled: boolean
  versioningEnabled: boolean
  backupEnabled: boolean
  maxFileSize: number
  allowedFileTypes: string[]
}

interface FilesState {
  files: FileItem[]
  folders: FileItem[]
  currentFolder: string
  viewMode: 'grid' | 'list'
  sortBy: 'name' | 'size' | 'date' | 'type'
  sortOrder: 'asc' | 'desc'
  searchTerm: string
  selectedItems: string[]
  filterBy: 'all' | 'images' | 'videos' | 'documents' | 'audio' | 'archives' | 'starred' | 'shared' | 'recent'
  cloudStorages: CloudStorage[]
  activeProvider: string
  uploadProgress: number
  syncProgress: number
  loading: boolean
  error: string | null
  showPreview: boolean
  previewItem: FileItem | null
}

type FilesAction = 
  | { type: 'SET_FILES'; payload: FileItem[] }
  | { type: 'SET_FOLDERS'; payload: FileItem[] }
  | { type: 'SET_CURRENT_FOLDER'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_SORT'; payload: { by: string; order: 'asc' | 'desc' } }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'SET_SELECTED_ITEMS'; payload: string[] }
  | { type: 'TOGGLE_ITEM_SELECTION'; payload: string }
  | { type: 'SET_CLOUD_STORAGES'; payload: CloudStorage[] }
  | { type: 'SET_ACTIVE_PROVIDER'; payload: string }
  | { type: 'SET_UPLOAD_PROGRESS'; payload: number }
  | { type: 'SET_SYNC_PROGRESS'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PREVIEW'; payload: { show: boolean; item: FileItem | null } }
  | { type: 'ADD_FILE'; payload: FileItem }
  | { type: 'UPDATE_FILE'; payload: FileItem }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'STAR_FILE'; payload: string }
  | { type: 'UNSTAR_FILE'; payload: string }
  | { type: 'SHARE_FILE'; payload: string }
  | { type: 'UNSHARE_FILE'; payload: string }
  | { type: 'LOCK_FILE'; payload: string }
  | { type: 'UNLOCK_FILE'; payload: string }

const initialState: FilesState = {
  files: [],
  folders: [],
  currentFolder: '/',
  viewMode: 'grid',
  sortBy: 'name',
  sortOrder: 'asc',
  searchTerm: '',
  selectedItems: [],
  filterBy: 'all',
  cloudStorages: [],
  activeProvider: 'local',
  uploadProgress: 0,
  syncProgress: 0,
  loading: false,
  error: null,
  showPreview: false,
  previewItem: null
}

function filesReducer(state: FilesState, action: FilesAction): FilesState {
  switch (action.type) {
    case 'SET_FILES':
      return { ...state, files: action.payload }
    case 'SET_FOLDERS':
      return { ...state, folders: action.payload }
    case 'SET_CURRENT_FOLDER':
      return { ...state, currentFolder: action.payload }
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }
    case 'SET_SORT':
      return { ...state, sortBy: action.payload.by, sortOrder: action.payload.order }
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload }
    case 'SET_FILTER':
      return { ...state, filterBy: action.payload }
    case 'SET_SELECTED_ITEMS':
      return { ...state, selectedItems: action.payload }
    case 'TOGGLE_ITEM_SELECTION':
      return {
        ...state,
        selectedItems: state.selectedItems.includes(action.payload)
          ? state.selectedItems.filter(id => id !== action.payload)
          : [...state.selectedItems, action.payload]
      }
    case 'SET_CLOUD_STORAGES':
      return { ...state, cloudStorages: action.payload }
    case 'SET_ACTIVE_PROVIDER':
      return { ...state, activeProvider: action.payload }
    case 'SET_UPLOAD_PROGRESS':
      return { ...state, uploadProgress: action.payload }
    case 'SET_SYNC_PROGRESS':
      return { ...state, syncProgress: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_PREVIEW':
      return { ...state, showPreview: action.payload.show, previewItem: action.payload.item }
    case 'ADD_FILE':
      return { ...state, files: [...state.files, action.payload] }
    case 'UPDATE_FILE':
      return {
        ...state,
        files: state.files.map(f => f.id === action.payload.id ? action.payload : f)
      }
    case 'DELETE_FILE':
      return {
        ...state,
        files: state.files.filter(f => f.id !== action.payload),
        selectedItems: state.selectedItems.filter(id => id !== action.payload)
      }
    case 'STAR_FILE':
      return {
        ...state,
        files: state.files.map(f => f.id === action.payload ? { ...f, isStarred: true } : f)
      }
    case 'UNSTAR_FILE':
      return {
        ...state,
        files: state.files.map(f => f.id === action.payload ? { ...f, isStarred: false } : f)
      }
    case 'SHARE_FILE':
      return {
        ...state,
        files: state.files.map(f => f.id === action.payload ? { ...f, isShared: true } : f)
      }
    case 'UNSHARE_FILE':
      return {
        ...state,
        files: state.files.map(f => f.id === action.payload ? { ...f, isShared: false } : f)
      }
    case 'LOCK_FILE':
      return {
        ...state,
        files: state.files.map(f => f.id === action.payload ? { ...f, isLocked: true } : f)
      }
    case 'UNLOCK_FILE':
      return {
        ...state,
        files: state.files.map(f => f.id === action.payload ? { ...f, isLocked: false } : f)
      }
    default:
      return state
  }
}

export default function FilesHubPage() {
  const [state, dispatch] = useReducer(filesReducer, initialState)
  const [activeTab, setActiveTab] = useState<any>('files')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<any>(false)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState<any>(false)
  const [newFolderName, setNewFolderName] = useState<any>('')
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null)
  const [dragOver, setDragOver] = useState<any>(false)

  const mockCloudStorages: CloudStorage[] = [
    {
      id: 'local',
      name: 'Local Storage',
      type: 'local',
      connected: true,
      storageUsed: 2.5,
      storageTotal: 100,
      lastSync: '2024-01-15T10:30:00Z',
      syncEnabled: true,
      autoSync: true,
      syncInterval: 5,
      defaultFolder: '/',
      encryptionEnabled: false,
      compressionEnabled: false,
      versioningEnabled: false,
      backupEnabled: false,
      maxFileSize: 100,
      allowedFileTypes: ['*']
    },
    {
      id: 'google',
      name: 'Google Drive',
      type: 'google',
      connected: true,
      storageUsed: 8.2,
      storageTotal: 15,
      lastSync: '2024-01-15T10:25:00Z',
      syncEnabled: true,
      autoSync: true,
      syncInterval: 2,
      defaultFolder: '/KAZI',
      encryptionEnabled: true,
      compressionEnabled: true,
      versioningEnabled: true,
      backupEnabled: true,
      maxFileSize: 50,
      allowedFileTypes: ['*']
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      type: 'dropbox',
      connected: true,
      storageUsed: 4.7,
      storageTotal: 16,
      lastSync: '2024-01-15T10:20:00Z',
      syncEnabled: true,
      autoSync: false,
      syncInterval: 15,
      defaultFolder: '/KAZI Projects',
      encryptionEnabled: true,
      compressionEnabled: false,
      versioningEnabled: true,
      backupEnabled: true,
      maxFileSize: 25,
      allowedFileTypes: ['*']
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      type: 'onedrive',
      connected: false,
      storageUsed: 0,
      storageTotal: 5,
      lastSync: '2024-01-10T15:00:00Z',
      syncEnabled: false,
      autoSync: false,
      syncInterval: 10,
      defaultFolder: '/Documents',
      encryptionEnabled: false,
      compressionEnabled: false,
      versioningEnabled: false,
      backupEnabled: false,
      maxFileSize: 10,
      allowedFileTypes: ['*']
    },
    {
      id: 'aws',
      name: 'AWS S3',
      type: 'aws',
      connected: true,
      storageUsed: 12.8,
      storageTotal: 1000,
      lastSync: '2024-01-15T10:35:00Z',
      syncEnabled: true,
      autoSync: true,
      syncInterval: 1,
      defaultFolder: '/kazi-storage',
      encryptionEnabled: true,
      compressionEnabled: true,
      versioningEnabled: true,
      backupEnabled: true,
      maxFileSize: 500,
      allowedFileTypes: ['*']
    }
  ]

  const mockFiles: FileItem[] = [
    {
      id: '1',
      name: 'Project Proposal.pdf',
      type: 'file',
      size: 2048576,
      mimeType: 'application/pdf',
      createdAt: '2024-01-15T10:00:00Z',
      modifiedAt: '2024-01-15T10:00:00Z',
      path: '/Documents',
      isShared: true,
      isStarred: true,
      isLocked: false,
      owner: 'John Doe',
      permissions: 'admin',
      cloudProvider: 'google',
      syncStatus: 'synced',
      tags: ['proposal', 'client', 'important'],
      version: 1,
      thumbnail: '/thumbnails/pdf.png',
      category: 'Documents',
      description: 'Project proposal for TechCorp redesign'
    },
    {
      id: '2',
      name: 'Brand Assets',
      type: 'folder',
      size: 0,
      mimeType: 'folder',
      createdAt: '2024-01-12T14:30:00Z',
      modifiedAt: '2024-01-15T09:45:00Z',
      path: '/Design',
      isShared: false,
      isStarred: false,
      isLocked: false,
      owner: 'Jane Smith',
      permissions: 'write',
      cloudProvider: 'dropbox',
      syncStatus: 'synced',
      tags: ['branding', 'assets'],
      version: 1,
      category: 'Design'
    },
    {
      id: '3',
      name: 'demo-video.mp4',
      type: 'file',
      size: 52428800,
      mimeType: 'video/mp4',
      createdAt: '2024-01-14T16:20:00Z',
      modifiedAt: '2024-01-14T16:20:00Z',
      path: '/Media',
      isShared: true,
      isStarred: false,
      isLocked: false,
      owner: 'Mike Wilson',
      permissions: 'read',
      cloudProvider: 'aws',
      syncStatus: 'syncing',
      tags: ['video', 'demo', 'client'],
      version: 2,
      thumbnail: '/thumbnails/video.png',
      category: 'Media',
      description: 'Product demo video for client presentation'
    },
    {
      id: '4',
      name: 'logo-design.ai',
      type: 'file',
      size: 1048576,
      mimeType: 'application/illustrator',
      createdAt: '2024-01-13T11:15:00Z',
      modifiedAt: '2024-01-15T08:30:00Z',
      path: '/Design/Brand Assets',
      isShared: false,
      isStarred: true,
      isLocked: true,
      owner: 'Sarah Johnson',
      permissions: 'admin',
      cloudProvider: 'google',
      syncStatus: 'synced',
      tags: ['logo', 'design', 'final'],
      version: 5,
      thumbnail: '/thumbnails/ai.png',
      category: 'Design',
      description: 'Final logo design for KAZI brand'
    },
    {
      id: '5',
      name: 'invoice-template.xlsx',
      type: 'file',
      size: 24576,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      createdAt: '2024-01-10T09:00:00Z',
      modifiedAt: '2024-01-10T09:00:00Z',
      path: '/Templates',
      isShared: true,
      isStarred: false,
      isLocked: false,
      owner: 'Emma Thompson',
      permissions: 'write',
      cloudProvider: 'local',
      syncStatus: 'offline',
      tags: ['template', 'invoice', 'finance'],
      version: 1,
      thumbnail: '/thumbnails/excel.png',
      category: 'Templates',
      description: 'Standard invoice template for client billing'
    },
    {
      id: '6',
      name: 'client-feedback.docx',
      type: 'file',
      size: 98304,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      createdAt: '2024-01-14T13:45:00Z',
      modifiedAt: '2024-01-15T07:20:00Z',
      path: '/Documents',
      isShared: false,
      isStarred: false,
      isLocked: false,
      owner: 'David Chen',
      permissions: 'read',
      cloudProvider: 'dropbox',
      syncStatus: 'error',
      tags: ['feedback', 'client', 'notes'],
      version: 3,
      thumbnail: '/thumbnails/word.png',
      category: 'Documents',
      description: 'Client feedback compilation for project review'
    }
  ]

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      setTimeout(() => {
        dispatch({ type: 'SET_CLOUD_STORAGES', payload: mockCloudStorages })
        dispatch({ type: 'SET_FILES', payload: mockFiles })
        dispatch({ type: 'SET_LOADING', payload: false })
      }, 1000)
    }
    
    loadData()
  }, [])

  const filteredFiles = state.files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(state.searchTerm.toLowerCase()))
    
    const matchesFilter = state.filterBy === 'all' ||
                         (state.filterBy === 'images' && file.mimeType.startsWith('image/')) ||
                         (state.filterBy === 'videos' && file.mimeType.startsWith('video/')) ||
                         (state.filterBy === 'documents' && (file.mimeType.includes('pdf') || file.mimeType.includes('document') || file.mimeType.includes('text'))) ||
                         (state.filterBy === 'audio' && file.mimeType.startsWith('audio/')) ||
                         (state.filterBy === 'archives' && (file.mimeType.includes('zip') || file.mimeType.includes('rar') || file.mimeType.includes('tar'))) ||
                         (state.filterBy === 'starred' && file.isStarred) ||
                         (state.filterBy === 'shared' && file.isShared) ||
                         (state.filterBy === 'recent' && new Date(file.modifiedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    
    return matchesSearch && matchesFilter
  })

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let aValue: unknown = a[state.sortBy]
    let bValue: unknown = b[state.sortBy]
    
    if (state.sortBy === 'size') {
      aValue = a.size
      bValue = b.size
    } else if (state.sortBy === 'date') {
      aValue = new Date(a.modifiedAt).getTime()
      bValue = new Date(b.modifiedAt).getTime()
    } else {
      aValue = String(aValue).toLowerCase()
      bValue = String(bValue).toLowerCase()
    }
    
    if (state.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') return FolderOpen
    if (file.mimeType.startsWith('image/')) return Image
    if (file.mimeType.startsWith('video/')) return Video
    if (file.mimeType.startsWith('audio/')) return Music
    if (file.mimeType.includes('pdf')) return FileText
    if (file.mimeType.includes('zip') || file.mimeType.includes('rar')) return Archive
    if (file.mimeType.includes('code') || file.mimeType.includes('javascript') || file.mimeType.includes('html')) return Code
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCloudProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google': return <div className="w-4 h-4 bg-blue-500 rounded-full" />
      case 'dropbox': return <div className="w-4 h-4 bg-blue-600 rounded-full" />
      case 'onedrive': return <div className="w-4 h-4 bg-blue-700 rounded-full" />
      case 'aws': return <div className="w-4 h-4 bg-orange-500 rounded-full" />
      default: return <HardDrive className="w-4 h-4 text-gray-500" />
    }
  }

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'syncing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'offline': return <WifiOff className="w-4 h-4 text-gray-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const handleFileUpload = () => {
    if (uploadFiles) {
      dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: 0 })
      
      const interval = setInterval(() => {
        dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsUploadModalOpen(false)
            setUploadFiles(null)
            alert('Files uploaded successfully!')
            return 0
          }
          return prev + 10
        }})
      }, 200)
      
      Array.from(uploadFiles).forEach((file, index) => {
        const newFile: FileItem = {
          id: `upload_${Date.now()}_${index}`,
          name: file.name,
          type: 'file',
          size: file.size,
          mimeType: file.type,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          path: state.currentFolder,
          isShared: false,
          isStarred: false,
          isLocked: false,
          owner: 'You',
          permissions: 'admin',
          cloudProvider: state.activeProvider,
          syncStatus: 'syncing',
          tags: [],
          version: 1,
          category: 'Uploads'
        }
        
        setTimeout(() => {
          dispatch({ type: 'ADD_FILE', payload: newFile })
        }, 2000)
      })
    }
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FileItem = {
        id: `folder_${Date.now()}`,
        name: newFolderName.trim(),
        type: 'folder',
        size: 0,
        mimeType: 'folder',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        path: state.currentFolder,
        isShared: false,
        isStarred: false,
        isLocked: false,
        owner: 'You',
        permissions: 'admin',
        cloudProvider: state.activeProvider,
        syncStatus: 'synced',
        tags: [],
        version: 1,
        category: 'Folders'
      }
      
      dispatch({ type: 'ADD_FILE', payload: newFolder })
      setNewFolderName('')
      setIsCreateFolderModalOpen(false)
      alert('Folder created successfully!')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setUploadFiles(files)
      setIsUploadModalOpen(true)
    }
  }

  const handleFileAction = (action: string, fileId: string) => {
    const file = state.files.find(f => f.id === fileId)
    if (!file) return
    
    switch (action) {
      case 'star':
        dispatch({ type: file.isStarred ? 'UNSTAR_FILE' : 'STAR_FILE', payload: fileId })
        break
      case 'share':
        dispatch({ type: file.isShared ? 'UNSHARE_FILE' : 'SHARE_FILE', payload: fileId })
        break
      case 'lock':
        dispatch({ type: file.isLocked ? 'UNLOCK_FILE' : 'LOCK_FILE', payload: fileId })
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this file?')) {
          dispatch({ type: 'DELETE_FILE', payload: fileId })
        }
        break
      case 'preview':
        dispatch({ type: 'SET_PREVIEW', payload: { show: true, item: file } })
        break
      case 'download':
        alert(`Downloading: ${file.name}`)
        break
      default:
        break
    }
  }

  const activeStorage = state.cloudStorages.find(s => s.id === state.activeProvider)

  if (state.loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Files Hub</h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">A+++</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {activeStorage?.name || 'Local Storage'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={state.activeProvider} onValueChange={(value) => dispatch({ type: 'SET_ACTIVE_PROVIDER', payload: value })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {state.cloudStorages.map(storage => (
                  <SelectItem key={storage.id} value={storage.id}>
                    <div className="flex items-center gap-2">
                      {getCloudProviderIcon(storage.type)}
                      <span>{storage.name}</span>
                      {!storage.connected && <span className="text-xs text-red-500">(Offline)</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'SET_SYNC_PROGRESS', payload: 0 })}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync
            </Button>
            
            <Dialog open={isCreateFolderModalOpen} onOpenChange={setIsCreateFolderModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folderName">Folder Name</Label>
                    <Input
                      id="folderName"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Enter folder name"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateFolderModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFolder}>
                      Create Folder
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Files</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">Drag and drop files here or click to browse</p>
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => setUploadFiles(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer text-purple-600 hover:text-purple-700">
                      Choose Files
                    </Label>
                  </div>
                  
                  {uploadFiles && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Selected files:</p>
                      {Array.from(uploadFiles).map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{file.name}</span>
                          <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {state.uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{state.uploadProgress}%</span>
                      </div>
                      <Progress value={state.uploadProgress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleFileUpload} disabled={!uploadFiles || state.uploadProgress > 0}>
                      Upload Files
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="files">Files ({sortedFiles.length})</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="sync">Sync</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="files" className="space-y-6">
            {/* File Management Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search files and folders..."
                  value={state.searchTerm}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={state.filterBy} onValueChange={(value) => dispatch({ type: 'SET_FILTER', payload: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Files</SelectItem>
                    <SelectItem value="images">Images</SelectItem>
                    <SelectItem value="videos">Videos</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="archives">Archives</SelectItem>
                    <SelectItem value="starred">Starred</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: state.viewMode === 'grid' ? 'list' : 'grid' })}
                >
                  {state.viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                </Button>
                
                <Select value={`${state.sortBy}-${state.sortOrder}`} onValueChange={(value) => {
                  const [by, order] = value.split('-')
                  dispatch({ type: 'SET_SORT', payload: { by, order: order as 'asc' | 'desc' } })
                }}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="size-asc">Size Small-Large</SelectItem>
                    <SelectItem value="size-desc">Size Large-Small</SelectItem>
                    <SelectItem value="date-asc">Date Old-New</SelectItem>
                    <SelectItem value="date-desc">Date New-Old</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'SET_CURRENT_FOLDER', payload: '/' })}>
                <HardDrive className="w-4 h-4 mr-1" />
                Root
              </Button>
              {state.currentFolder !== '/' && (
                <>
                  <span>/</span>
                  <span>{state.currentFolder}</span>
                </>
              )}
            </div>

            {/* Files Grid/List */}
            <div 
              className={`${dragOver ? 'border-2 border-dashed border-purple-500 bg-purple-50' : ''} rounded-lg transition-all`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {sortedFiles.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                    <p className="text-gray-600 mb-4">
                      {state.searchTerm ? 'Try adjusting your search terms' : 'Upload some files to get started'}
                    </p>
                    <Button onClick={() => setIsUploadModalOpen(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={state.viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
                  {sortedFiles.map((file) => {
                    const FileIcon = getFileIcon(file)
                    const isSelected = state.selectedItems.includes(file.id)
                    
                    return (
                      <Card 
                        key={file.id} 
                        className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
                        onClick={() => dispatch({ type: 'TOGGLE_ITEM_SELECTION', payload: file.id })}
                      >
                        <CardContent className={state.viewMode === 'grid' ? 'p-4' : 'p-3'}>
                          {state.viewMode === 'grid' ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileIcon className="w-8 h-8 text-purple-600" />
                                  <div className="flex items-center gap-1">
                                    {getCloudProviderIcon(file.cloudProvider)}
                                    {getSyncStatusIcon(file.syncStatus)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {file.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                  {file.isShared && <Share2 className="w-4 h-4 text-blue-500" />}
                                  {file.isLocked && <Lock className="w-4 h-4 text-red-500" />}
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
                                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  {file.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleFileAction('star', file.id)
                                    }}
                                  >
                                    {file.isStarred ? <Star className="w-3 h-3 text-yellow-500 fill-current" /> : <StarOff className="w-3 h-3" />}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleFileAction('preview', file.id)
                                    }}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleFileAction('share', file.id)
                                    }}
                                  >
                                    <Share2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileIcon className="w-6 h-6 text-purple-600" />
                                <div>
                                  <h3 className="font-medium text-gray-900">{file.name}</h3>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>{formatFileSize(file.size)}</span>
                                    <span>•</span>
                                    <span>{new Date(file.modifiedAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{file.owner}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {getCloudProviderIcon(file.cloudProvider)}
                                  {getSyncStatusIcon(file.syncStatus)}
                                </div>
                                <div className="flex items-center gap-1">
                                  {file.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                  {file.isShared && <Share2 className="w-4 h-4 text-blue-500" />}
                                  {file.isLocked && <Lock className="w-4 h-4 text-red-500" />}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Show context menu
                                  }}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="storage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.cloudStorages.map((storage) => (
                <Card key={storage.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCloudProviderIcon(storage.type)}
                        <CardTitle className="text-lg">{storage.name}</CardTitle>
                      </div>
                      <Badge variant={storage.connected ? "default" : "destructive"}>
                        {storage.connected ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Storage Used</span>
                        <span>{storage.storageUsed.toFixed(1)} / {storage.storageTotal} GB</span>
                      </div>
                      <Progress value={(storage.storageUsed / storage.storageTotal) * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Last Sync</span>
                        <span>{new Date(storage.lastSync).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Auto Sync</span>
                        <Switch checked={storage.autoSync} />
                      </div>
                      <div className="flex justify-between">
                        <span>Encryption</span>
                        <Switch checked={storage.encryptionEnabled} />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => alert(`Configuring ${storage.name}...`)}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => alert(`Syncing ${storage.name}...`)}
                        disabled={!storage.connected}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Sync Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="sync" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sync Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.cloudStorages.filter(s => s.connected).map((storage) => (
                    <div key={storage.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getCloudProviderIcon(storage.type)}
                        <div>
                          <h4 className="font-medium">{storage.name}</h4>
                          <p className="text-sm text-gray-600">
                            Last synced: {new Date(storage.lastSync).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-600">Up to date</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sync Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { file: 'Project Proposal.pdf', action: 'Uploaded', time: '2 minutes ago', status: 'success' },
                    { file: 'Brand Assets/', action: 'Synced', time: '5 minutes ago', status: 'success' },
                    { file: 'demo-video.mp4', action: 'Uploading', time: 'In progress', status: 'pending' },
                    { file: 'client-feedback.docx', action: 'Sync failed', time: '1 hour ago', status: 'error' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'pending' ? 'bg-blue-500' :
                          'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium">{activity.file}</p>
                          <p className="text-sm text-gray-600">{activity.action}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>File Management Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-sync files</Label>
                    <p className="text-sm text-gray-500">Automatically sync files when they change</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compress uploads</Label>
                    <p className="text-sm text-gray-500">Compress files before uploading to save space</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Version control</Label>
                    <p className="text-sm text-gray-500">Keep previous versions of files</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Offline access</Label>
                    <p className="text-sm text-gray-500">Allow access to files when offline</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">File Size Limits</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max file size (MB)</Label>
                      <Input type="number" defaultValue="100" />
                    </div>
                    <div>
                      <Label>Max folder size (GB)</Label>
                      <Input type="number" defaultValue="10" />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Backup Settings</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic backups</Label>
                      <p className="text-sm text-gray-500">Create daily backups of important files</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div>
                    <Label>Backup frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* File Preview Modal */}
      {state.showPreview && state.previewItem && (
        <Dialog open={state.showPreview} onOpenChange={() => dispatch({ type: 'SET_PREVIEW', payload: { show: false, item: null } })}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {React.createElement(getFileIcon(state.previewItem), { className: "w-5 h-5" })}
                {state.previewItem.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Size:</span> {formatFileSize(state.previewItem.size)}
                </div>
                <div>
                  <span className="font-medium">Modified:</span> {new Date(state.previewItem.modifiedAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Owner:</span> {state.previewItem.owner}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {state.previewItem.path}
                </div>
              </div>
              
              {state.previewItem.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-gray-600 mt-1">{state.previewItem.description}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={() => handleFileAction('download', state.previewItem!.id)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => handleFileAction('share', state.previewItem!.id)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" onClick={() => handleFileAction('star', state.previewItem!.id)}>
                  {state.previewItem.isStarred ? <Star className="w-4 h-4 mr-2 text-yellow-500 fill-current" /> : <StarOff className="w-4 h-4 mr-2" />}
                  {state.previewItem.isStarred ? 'Unstar' : 'Star'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
