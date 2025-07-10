'use client'

import React, { useReducer, useState } from 'react'
import {
  Upload,
  Star,
  Share2,
  Trash2,
  Grid,
  List,
  Search,
  ChevronDown,
  Zap,
  Check,
  Unlock,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

// Type definitions
interface CloudFile {
  id: string
  name: string
  type: 'document' | 'image' | 'video' | 'audio' | 'archive'
  size: number // in bytes
  uploadDate: string
  shared: boolean
  starred: boolean
  tags: string[]
}

interface StorageState {
  files: CloudFile[]
  totalStorage: number
  usedStorage: number
  currentPlan: 'free' | 'pro' | 'enterprise'
  viewMode: 'grid' | 'list'
  searchQuery: string
  filterType: string
  sortBy: string
  selectedFiles: string[]
  uploadQueue: File[]
  isUploading: boolean
}

type StorageAction =
  | { type: 'ADD_FILE'; file: CloudFile }
  | { type: 'DELETE_FILE'; fileId: string }
  | { type: 'TOGGLE_STAR'; fileId: string }
  | { type: 'TOGGLE_SHARE'; fileId: string }
  | { type: 'SET_VIEW_MODE'; mode: 'grid' | 'list' }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_FILTER'; filter: string }
  | { type: 'SET_SORT'; sort: string }
  | { type: 'SELECT_FILE'; fileId: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'UPGRADE_PLAN'; plan: 'free' | 'pro' | 'enterprise' }
  | { type: 'START_UPLOAD' }
  | { type: 'FINISH_UPLOAD' }

// Subscription plans
const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    storage: 10 * 1024 * 1024 * 1024, // 10GB
    shareLimit: 6 * 1024 * 1024 * 1024, // 6GB
    features: [
      '10 GB cloud storage',
      'Upload files of any size',
      'Share files up to 6 GB only',
      'Basic file management',
      'Standard support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    storage: 100 * 1024 * 1024 * 1024, // 100GB
    shareLimit: 200 * 1024 * 1024 * 1024, // 200GB
    features: [
      '100 GB cloud storage',
      'Upload files of any size',
      'Share files up to 200 GB',
      'Advanced file management',
      'Team collaboration tools',
      'Priority support',
      'Version history',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 29.99,
    storage: 1024 * 1024 * 1024 * 1024, // 1TB
    shareLimit: Infinity,
    features: [
      '1 TB cloud storage',
      'Upload files of any size',
      'Share files of any size (unlimited)',
      'Enterprise features',
      '24/7 premium support',
      'Advanced security',
      'API access',
    ],
  },
}

// Initial state
const initialState: StorageState = {
  files: [
    {
      id: '1',
      name: 'Brand_Guidelines_Final.pdf',
      type: 'document',
      size: 15 * 1024 * 1024, // 15MB
      uploadDate: '2024-06-08',
      shared: true,
      starred: true,
      tags: ['brand', 'guidelines']
    },
    {
      id: '2',
      name: 'Logo_Variations.zip',
      type: 'archive',
      size: 125 * 1024 * 1024, // 125MB
      uploadDate: '2024-06-07',
      shared: false,
      starred: false,
      tags: ['logo', 'assets']
    },
    {
      id: '3',
      name: 'Website_Mockup_V2.psd',
      type: 'image',
      size: 340 * 1024 * 1024, // 340MB
      uploadDate: '2024-06-06',
      shared: false,
      starred: true,
      tags: ['design', 'mockup']
    },
    {
      id: '4',
      name: 'Presentation_Video.mp4',
      type: 'video',
      size: 890 * 1024 * 1024, // 890MB
      uploadDate: '2024-06-05',
      shared: false,
      starred: false,
      tags: ['video', 'presentation']
    }
  ],
  totalStorage: 10 * 1024 * 1024 * 1024, // 10GB
  usedStorage: 7.2 * 1024 * 1024 * 1024, // 7.2GB
  currentPlan: 'free',
  viewMode: 'grid',
  searchQuery: '',
  filterType: 'all',
  sortBy: 'name',
  selectedFiles: [],
  uploadQueue: [],
  isUploading: false
}

// Reducer function
function storageReducer(state: StorageState, action: StorageAction): StorageState {
  switch (action.type) {
    case 'ADD_FILE':
      return {
        ...state,
        files: [...state.files, action.file],
        usedStorage: state.usedStorage + action.file.size
      }
    case 'DELETE_FILE':
      const fileToDelete = state.files.find(f => f.id === action.fileId)
      return {
        ...state,
        files: state.files.filter(f => f.id !== action.fileId),
        usedStorage: state.usedStorage - (fileToDelete?.size || 0)
      }
    case 'TOGGLE_STAR':
      return {
        ...state,
        files: state.files.map(f => 
          f.id === action.fileId ? { ...f, starred: !f.starred } : f
        )
      }
    case 'TOGGLE_SHARE':
      return {
        ...state,
        files: state.files.map(f => 
          f.id === action.fileId ? { ...f, shared: !f.shared } : f
        )
      }
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query }
    case 'SET_FILTER':
      return { ...state, filterType: action.filter }
    case 'SET_SORT':
      return { ...state, sortBy: action.sort }
    case 'SELECT_FILE':
      const isSelected = state.selectedFiles.includes(action.fileId)
      return {
        ...state,
        selectedFiles: isSelected 
          ? state.selectedFiles.filter(id => id !== action.fileId)
          : [...state.selectedFiles, action.fileId]
      }
    case 'CLEAR_SELECTION':
      return { ...state, selectedFiles: [] }
    case 'UPGRADE_PLAN':
      const newPlan = SUBSCRIPTION_PLANS[action.plan]
      return {
        ...state,
        currentPlan: action.plan,
        totalStorage: newPlan.storage
      }
    case 'START_UPLOAD':
      return { ...state, isUploading: true }
    case 'FINISH_UPLOAD':
      return { ...state, isUploading: false }
    default:
      return state
  }
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const canShareFile = (file: CloudFile, plan: string): boolean => {
  const planLimit = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS].shareLimit
  return file.size <= planLimit
}

export function CloudStorageSystem() {
  const [state, dispatch] = useReducer(storageReducer, initialState)
  const [showUpload, setShowUpload] = useState(false)
  const [showSubscription, setShowSubscription] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentPlan = SUBSCRIPTION_PLANS[state.currentPlan]
  const storageUsedPercent = (state.usedStorage / state.totalStorage) * 100

  // Filter and sort files
  const filteredFiles = state.files
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(state.searchQuery.toLowerCase())
      const matchesFilter = state.filterType === 'all' || file.type === state.filterType
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (state.sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'size': return b.size - a.size
        case 'date': return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        default: return 0
      }
    })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    dispatch({ type: 'START_UPLOAD' })

    Array.from(files).forEach((file, index) => {
      setTimeout(() => {
        const newFile: CloudFile = {
          id: Date.now().toString() + index,
          name: file.name,
          type: file.type.startsWith('image/')
            ? 'image'
            : file.type.startsWith('video/')
            ? 'video'
            : file.type.startsWith('audio/')
            ? 'audio'
            : file.name.endsWith('.zip') || file.name.endsWith('.rar')
            ? 'archive'
            : 'document',
          size: file.size,
          uploadDate: new Date().toISOString().split('T')[0],
          shared: false,
          starred: false,
          tags: [],
        }
        dispatch({ type: 'ADD_FILE', file: newFile })
      }, index * 500)
    })

    setTimeout(() => {
      dispatch({ type: 'FINISH_UPLOAD' })
      setShowUpload(false)
    }, files.length * 500 + 1000)
  }

  const handleShare = (file: CloudFile) => {
    if (canShareFile(file, state.currentPlan)) {
      dispatch({ type: 'TOGGLE_SHARE', fileId: file.id })
    } else {
      setShowSubscription(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-slate-800">Cloud Storage</h1>
            <p className="text-slate-600 mt-1">Manage your files and collaborate securely</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              <Crown className="w-4 h-4 mr-1" />
              {currentPlan.name} Plan
            </Badge>
            <Button onClick={() => setShowSubscription(true)} variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </div>

        {/* Storage Overview */}
        <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Storage Overview</span>
              <span className="text-sm font-normal text-slate-600">
                {formatFileSize(state.usedStorage)} of {formatFileSize(state.totalStorage)} used
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={storageUsedPercent} className="h-3 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-light text-slate-800">{state.files.length}</div>
                <div className="text-sm text-slate-600">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-slate-800">{state.files.filter(f => f.shared).length}</div>
                <div className="text-sm text-slate-600">Shared Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-slate-800">{state.files.filter(f => f.starred).length}</div>
                <div className="text-sm text-slate-600">Starred Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-slate-800">{storageUsedPercent.toFixed(1)}%</div>
                <div className="text-sm text-slate-600">Storage Used</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button onClick={() => setShowUpload(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
                <div className="flex items-center border rounded-lg bg-white/50">
                  <Button
                    variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'grid' })}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={state.viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'list' })}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search files..."
                    value={state.searchQuery}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
                    className="pl-10 bg-white/50"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-32">
                      {state.filterType === 'all'
                        ? 'All Files'
                        : state.filterType.charAt(0).toUpperCase() +
                          state.filterType.slice(1) +
                          's'}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() =>
                        dispatch({ type: 'SET_FILTER', filter: 'all' })
                      }
                    >
                      All Files
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() =>
                        dispatch({ type: 'SET_FILTER', filter: 'document' })
                      }
                    >
                      Documents
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() =>
                        dispatch({ type: 'SET_FILTER', filter: 'image' })
                      }
                    >
                      Images
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() =>
                        dispatch({ type: 'SET_FILTER', filter: 'video' })
                      }
                    >
                      Videos
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() =>
                        dispatch({ type: 'SET_FILTER', filter: 'audio' })
                      }
                    >
                      Audio
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() =>
                        dispatch({ type: 'SET_FILTER', filter: 'archive' })
                      }
                    >
                      Archives
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-32">
                      Sort by{' '}
                      {state.sortBy.charAt(0).toUpperCase() +
                        state.sortBy.slice(1)}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => dispatch({ type: 'SET_SORT', sort: 'name' })}
                    >
                      Name
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => dispatch({ type: 'SET_SORT', sort: 'size' })}
                    >
                      Size
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => dispatch({ type: 'SET_SORT', sort: 'date' })}
                    >
                      Date
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Grid/List */}
        <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-lg">
          <CardContent className="p-6">
            {state.viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFiles.map(file => (
                  <div
                    key={file.id}
                    className="group bg-white/50 rounded-xl p-4 border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            dispatch({ type: 'TOGGLE_STAR', fileId: file.id })
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              file.starred
                                ? 'fill-yellow-400 text-yellow-400'
                                : ''
                            }`}
                          />
                        </Button>
                        {canShareFile(file, state.currentPlan) ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(file)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Share2
                              className={`w-4 h-4 ${
                                file.shared
                                  ? 'text-blue-500'
                                  : 'text-gray-500'
                              }`}
                            />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSubscription(true)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Share2 className="w-4 h-4 text-gray-400" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            dispatch({ type: 'DELETE_FILE', fileId: file.id })
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-800 truncate mb-1">
                      {file.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left font-semibold p-3">Name</th>
                    <th className="text-left font-semibold p-3">Size</th>
                    <th className="text-left font-semibold p-3">
                      Last Modified
                    </th>
                    <th className="text-left font-semibold p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map(file => (
                    <tr
                      key={file.id}
                      className="border-b border-white/10 hover:bg-white/10"
                    >
                      <td className="p-3 flex items-center gap-3">
                        <span className="font-medium text-gray-800">
                          {file.name}
                        </span>
                      </td>
                      <td className="p-3">{formatFileSize(file.size)}</td>
                      <td className="p-3">{file.uploadDate}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              dispatch({
                                type: 'TOGGLE_STAR',
                                fileId: file.id,
                              })
                            }
                          >
                            <Star
                              className={`w-4 h-4 ${
                                file.starred
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : ''
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(file)}
                          >
                            <Share2
                              className={`w-4 h-4 ${
                                file.shared
                                  ? 'text-blue-500'
                                  : 'text-gray-500'
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              dispatch({
                                type: 'DELETE_FILE',
                                fileId: file.id,
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-800 mb-2">Drag & drop files here</h3>
                <p className="text-slate-600 mb-4">or click to browse</p>
                <Badge className="bg-green-100 text-green-800">No file size limit for uploads!</Badge>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              {state.isUploading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-slate-600">Uploading files...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Subscription Dialog */}
        <Dialog open={showSubscription} onOpenChange={setShowSubscription}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Choose Your Plan</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                <Card key={key} className={`relative ${state.currentPlan === key ? 'ring-2 ring-blue-500' : ''}`}>
                  {key === 'pro' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      {key === 'free' && <Unlock className="w-5 h-5" />}
                      {key === 'pro' && <Zap className="w-5 h-5" />}
                      {key === 'enterprise' && <Crown className="w-5 h-5" />}
                      {plan.name}
                    </CardTitle>
                    <div className="text-3xl font-light">
                      ${plan.price}<span className="text-sm text-slate-600">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={state.currentPlan === key ? "outline" : "default"}
                      onClick={() => {
                        if (state.currentPlan !== key) {
                          dispatch({ type: 'UPGRADE_PLAN', plan: key as any })
                          setShowSubscription(false)
                        }
                      }}
                      disabled={state.currentPlan === key}
                    >
                      {state.currentPlan === key ? 'Current Plan' : 'Choose Plan'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
} 