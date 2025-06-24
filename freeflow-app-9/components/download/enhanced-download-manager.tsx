"use client"

import React, { useReducer, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Download,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Eye,
  Star,
  Clock,
  AlertCircle,
  CheckCircle,
  Globe,
  Lock,
  Zap,
  Heart,
  Shield,
  DollarSign,
  Unlock,
  CreditCard,
  TrendingUp
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// Context7 Pattern: Enhanced Download Item with Escrow Integration
interface DownloadItem {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  downloadUrl: string
  shareUrl: string
  progress: number
  status: 'pending' | 'downloading' | 'completed' | 'paused' | 'error' | 'cancelled' | 'escrow_locked' | 'payment_required'
  speed: number // bytes per second
  timeRemaining: number // seconds
  startTime?: Date
  completedTime?: Date
  error?: string
  isPublic: boolean
  downloadCount: number
  views: number
  seoTitle: string
  seoDescription: string
  thumbnailUrl?: string
  previewUrl?: string
  // Escrow Integration
  escrowProtected: boolean
  escrowAmount?: number
  escrowStatus?: 'none' | 'pending' | 'secured' | 'released' | 'disputed'
  accessLevel: 'public' | 'password' | 'escrow' | 'premium'
  unlockPrice?: number
  paymentRequired: boolean
  clientId?: string
  projectId?: string
  milestoneId?: string
}

interface EscrowTransaction {
  id: string
  downloadId: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'disputed'
  clientName: string
  projectTitle: string
  createdAt: Date
  completedAt?: Date
}

// Context7 Enhanced State Management
interface DownloadState {
  downloads: DownloadItem[]
  filter: 'all' | 'downloading' | 'completed' | 'error' | 'escrow_locked'
  selectedItems: string[]
  copiedLinks: Set<string>
  escrowTransactions: EscrowTransaction[]
  analytics: {
    totalDownloads: number
    successRate: number
    averageSpeed: number
    escrowProtectedFiles: number
    totalEscrowValue: number
  }
  paymentModalOpen: boolean
  selectedPaymentItem: string | null
}

type DownloadAction =
  | { type: 'SET_DOWNLOADS'; payload: DownloadItem[] }
  | { type: 'ADD_DOWNLOAD'; payload: DownloadItem }
  | { type: 'UPDATE_DOWNLOAD'; payload: { id: string; updates: Partial<DownloadItem> } }
  | { type: 'REMOVE_DOWNLOAD'; payload: string }
  | { type: 'SET_FILTER'; payload: DownloadState['filter'] }
  | { type: 'TOGGLE_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_COPIED_LINK'; payload: { id: string; copied: boolean } }
  | { type: 'ADD_ESCROW_TRANSACTION'; payload: EscrowTransaction }
  | { type: 'UPDATE_ESCROW_TRANSACTION'; payload: { id: string; updates: Partial<EscrowTransaction> } }
  | { type: 'UPDATE_ANALYTICS'; payload: Partial<DownloadState['analytics']> }
  | { type: 'TOGGLE_PAYMENT_MODAL'; payload: { open: boolean; itemId?: string } }

// Context7 Reducer Pattern
function downloadReducer(state: DownloadState, action: DownloadAction): DownloadState {
  switch (action.type) {
    case 'SET_DOWNLOADS':
      return { ...state, downloads: action.payload }
    case 'ADD_DOWNLOAD':
      return { ...state, downloads: [...state.downloads, action.payload] }
    case 'UPDATE_DOWNLOAD':
      return {
        ...state,
        downloads: state.downloads.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        )
      }
    case 'REMOVE_DOWNLOAD':
      return {
        ...state,
        downloads: state.downloads.filter(item => item.id !== action.payload),
        selectedItems: state.selectedItems.filter(id => id !== action.payload)
      }
    case 'SET_FILTER':
      return { ...state, filter: action.payload }
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
    case 'SET_COPIED_LINK':
      const newCopiedLinks = new Set<string>(state.copiedLinks)
      if (action.payload.copied) {
        newCopiedLinks.add(action.payload.id)
      } else {
        newCopiedLinks.delete(action.payload.id)
      }
      return { ...state, copiedLinks: newCopiedLinks }
    case 'ADD_ESCROW_TRANSACTION':
      return {
        ...state,
        escrowTransactions: [...state.escrowTransactions, action.payload]
      }
    case 'UPDATE_ESCROW_TRANSACTION':
      return {
        ...state,
        escrowTransactions: state.escrowTransactions.map(transaction =>
          transaction.id === action.payload.id
            ? { ...transaction, ...action.payload.updates }
            : transaction
        )
      }
    case 'UPDATE_ANALYTICS':
      return {
        ...state,
        analytics: { ...state.analytics, ...action.payload }
      }
    case 'TOGGLE_PAYMENT_MODAL':
      return {
        ...state,
        paymentModalOpen: action.payload.open,
        selectedPaymentItem: action.payload.itemId || null
      }
    default:
      return state
  }
}

interface EnhancedDownloadManagerProps {
  downloads?: DownloadItem[]
  onDownloadComplete?: (item: DownloadItem) => void
  onShare?: (item: DownloadItem) => void
  onEscrowPayment?: (item: DownloadItem, amount: number) => void
  enableAnalytics?: boolean
  enableEscrow?: boolean
  brandName?: string
}

export function EnhancedDownloadManager({
  downloads: initialDownloads = [],
  onDownloadComplete,
  onShare,
  onEscrowPayment,
  enableAnalytics = true,
  enableEscrow = true,
  brandName = 'FreeflowZee'
}: EnhancedDownloadManagerProps) {

  // Context7 Pattern: Central State Management
  const [state, dispatch] = useReducer(downloadReducer, {
    downloads: initialDownloads.length > 0 ? initialDownloads : [
      {
        id: 'dl_001',
        fileName: 'Brand-Guidelines-Final.pdf',
        fileSize: 15728640, // 15MB
        fileType: 'application/pdf',
        downloadUrl: '/api/files/dl_001/download',
        shareUrl: '/files/dl_001',
        progress: 100,
        status: 'completed',
        speed: 0,
        timeRemaining: 0,
        completedTime: new Date(Date.now() - 3600000), // 1 hour ago
        isPublic: true,
        downloadCount: 12,
        views: 45,
        seoTitle: 'Professional Brand Guidelines PDF',
        seoDescription: 'Complete brand identity guidelines with logo, colors, and typography.',
        escrowProtected: true,
        escrowAmount: 2500,
        escrowStatus: 'secured',
        accessLevel: 'escrow',
        unlockPrice: 2500,
        paymentRequired: false,
        projectId: 'proj_001',
        clientId: 'client_001'
      },
      {
        id: 'dl_002',
        fileName: 'Website-Mockups-v2.zip',
        fileSize: 89478485, // 85MB
        fileType: 'application/zip',
        downloadUrl: '/api/files/dl_002/download',
        shareUrl: '/files/dl_002',
        progress: 65,
        status: 'downloading',
        speed: 2097152, // 2MB/s
        timeRemaining: 18,
        startTime: new Date(),
        isPublic: false,
        downloadCount: 3,
        views: 18,
        seoTitle: 'Website Design Mockups Archive',
        seoDescription: 'Complete website design mockups and assets in high resolution.',
        escrowProtected: true,
        escrowAmount: 5000,
        escrowStatus: 'pending',
        accessLevel: 'escrow',
        unlockPrice: 5000,
        paymentRequired: true,
        projectId: 'proj_002',
        clientId: 'client_002'
      },
      {
        id: 'dl_003',
        fileName: 'Logo-Variations.ai',
        fileSize: 3145728, // 3MB
        fileType: 'application/postscript',
        downloadUrl: '/api/files/dl_003/download',
        shareUrl: '/files/dl_003',
        progress: 0,
        status: 'escrow_locked',
        speed: 0,
        timeRemaining: 0,
        isPublic: false,
        downloadCount: 0,
        views: 7,
        seoTitle: 'Vector Logo Design Files',
        seoDescription: 'Professional logo variations in vector format.',
        escrowProtected: true,
        escrowAmount: 1500,
        escrowStatus: 'pending',
        accessLevel: 'escrow',
        unlockPrice: 1500,
        paymentRequired: true,
        projectId: 'proj_003',
        clientId: 'client_003'
      }
    ],
    filter: 'all',
    selectedItems: [],
    copiedLinks: new Set<string>(),
    escrowTransactions: [],
    analytics: {
      totalDownloads: 127,
      successRate: 94.5,
      averageSpeed: 1.8,
      escrowProtectedFiles: 15,
      totalEscrowValue: 24500
    },
    paymentModalOpen: false,
    selectedPaymentItem: null
  })
  
  const { toast } = useToast()

  // Helper functions
  const getFileIcon = useCallback((type: string) => {
    if (type.startsWith('image/')) return Image
    if (type.startsWith('video/')) return Video
    if (type.startsWith('audio/')) return Music
    if (type.includes('zip') || type.includes('rar')) return Archive
    return FileText
  }, [])

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  const formatSpeed = useCallback((bytesPerSecond: number) => {
    return `${formatFileSize(bytesPerSecond)}/s`
  }, [formatFileSize])

  const formatTime = useCallback((seconds: number) => {
    if (!seconds || seconds === Infinity) return '--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Context7 Pattern: Enhanced Action Handlers
  const startDownload = useCallback(async (id: string) => {
    const item = state.downloads.find(d => d.id === id)
    if (!item) return

    // Check escrow protection
    if (item.escrowProtected && item.paymentRequired) {
      dispatch({ type: 'TOGGLE_PAYMENT_MODAL', payload: { open: true, itemId: id } })
      return
    }

    dispatch({
      type: 'UPDATE_DOWNLOAD',
      payload: {
        id,
        updates: { status: 'downloading', startTime: new Date() }
      }
    })

    // Simulate download progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10
      
      if (progress >= 100) {
        clearInterval(interval)
        
        const completedItem: Partial<DownloadItem> = {
          status: 'completed',
          progress: 100,
          completedTime: new Date(),
          speed: 0,
          timeRemaining: 0
        }

        dispatch({
          type: 'UPDATE_DOWNLOAD',
          payload: { id, updates: completedItem }
        })

        onDownloadComplete?.({...item, ...completedItem} as DownloadItem)

        toast({
          title: "Download Complete! 🎉",
          description: `${item.fileName} downloaded successfully.`,
        })

        // Update analytics
        dispatch({
          type: 'UPDATE_ANALYTICS',
          payload: {
            totalDownloads: state.analytics.totalDownloads + 1
          }
        })
      } else {
        const bytesDownloaded = (progress / 100) * item.fileSize
        const elapsed = (Date.now() - (item.startTime?.getTime() || Date.now())) / 1000
        const speed = elapsed > 0 ? bytesDownloaded / elapsed : 0
        const remaining = speed > 0 ? (item.fileSize - bytesDownloaded) / speed : 0

        dispatch({
          type: 'UPDATE_DOWNLOAD',
          payload: {
            id,
            updates: {
              progress: Math.min(progress, 100),
              speed,
              timeRemaining: remaining
            }
          }
        })
      }
    }, 500)
  }, [state.downloads, state.analytics.totalDownloads, onDownloadComplete, toast])

  const pauseDownload = useCallback((id: string) => {
    dispatch({
      type: 'UPDATE_DOWNLOAD',
      payload: { id, updates: { status: 'paused', speed: 0 } }
    })
  }, [])

  const resumeDownload = useCallback((id: string) => {
    startDownload(id)
  }, [startDownload])

  const cancelDownload = useCallback((id: string) => {
    dispatch({
      type: 'UPDATE_DOWNLOAD',
      payload: {
        id,
        updates: {
          status: 'cancelled',
          progress: 0,
          speed: 0,
          timeRemaining: 0
        }
      }
    })
  }, [])

  const retryDownload = useCallback((id: string) => {
    dispatch({
      type: 'UPDATE_DOWNLOAD',
      payload: {
        id,
        updates: {
          status: 'pending',
          progress: 0,
          error: undefined
        }
      }
    })
  }, [])

  const removeDownload = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_DOWNLOAD', payload: id })
  }, [])

  const copyToClipboard = useCallback(async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      dispatch({ type: 'SET_COPIED_LINK', payload: { id: itemId, copied: true } })
      
      setTimeout(() => {
        dispatch({ type: 'SET_COPIED_LINK', payload: { id: itemId, copied: false } })
      }, 2000)

      toast({
        title: "Copied to Clipboard! 📋",
        description: "Link has been copied successfully.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Context7 Pattern: Escrow Payment Handler
  const handleEscrowPayment = useCallback(async (item: DownloadItem) => {
    if (!item.escrowAmount) return

    // Create escrow transaction
    const transaction: EscrowTransaction = {
      id: `escrow_${Date.now()}`,
      downloadId: item.id,
      amount: item.escrowAmount,
      currency: 'USD',
      status: 'processing',
      clientName: 'Client Name',
      projectTitle: item.fileName.replace(/\.[^/.]+$/, ""),
      createdAt: new Date()
    }

    dispatch({ type: 'ADD_ESCROW_TRANSACTION', payload: transaction })

    // Simulate payment processing
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_ESCROW_TRANSACTION',
        payload: {
          id: transaction.id,
          updates: { status: 'completed', completedAt: new Date() }
        }
      })

      dispatch({
        type: 'UPDATE_DOWNLOAD',
        payload: {
          id: item.id,
          updates: {
            escrowStatus: 'secured',
            paymentRequired: false,
            status: 'pending'
          }
        }
      })

      dispatch({ type: 'TOGGLE_PAYMENT_MODAL', payload: { open: false } })

      toast({
        title: "Payment Successful! ✅",
        description: `$${item.escrowAmount} secured in escrow. Download is now available.`,
      })

      onEscrowPayment?.(item, item.escrowAmount || 0)
    }, 2000)

    toast({
      title: "Processing Payment...",
      description: "Your escrow payment is being processed.",
    })
  }, [onEscrowPayment, toast])

  const shareItem = useCallback(async (item: DownloadItem) => {
    const shareData = {
      title: item.seoTitle,
      text: item.seoDescription,
      url: item.shareUrl
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        onShare?.(item)
      } catch (error) {
        copyToClipboard(item.shareUrl, item.id)
      }
    } else {
      copyToClipboard(item.shareUrl, item.id)
    }
  }, [onShare, copyToClipboard])

  // Filter downloads
  const filteredDownloads = state.downloads.filter(item => {
    switch (state.filter) {
      case 'downloading':
        return item.status === 'downloading' || item.status === 'paused'
      case 'completed':
        return item.status === 'completed'
      case 'error':
        return item.status === 'error' || item.status === 'cancelled'
      case 'escrow_locked':
        return item.status === 'escrow_locked' || item.paymentRequired
      default:
        return true
    }
  })

  const getStatusBadge = (item: DownloadItem) => {
    if (item.escrowProtected && item.paymentRequired) {
      return (
        <Badge className="bg-amber-100 text-amber-800">
          <Lock className="h-3 w-3 mr-1" />
          Payment Required
        </Badge>
      )
    }

    switch (item.status) {
      case 'downloading':
        return <Badge className="bg-blue-100 text-blue-800">Downloading</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      case 'escrow_locked':
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <Shield className="h-3 w-3 mr-1" />
            Escrow Locked
          </Badge>
        )
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6" data-testid="enhanced-download-manager">
      {/* Analytics Overview */}
      {enableAnalytics && (
        <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <TrendingUp className="h-5 w-5" />
              Download Analytics
            </CardTitle>
            <CardDescription className="text-indigo-600">
              Track your download performance and escrow protection metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-700">{state.analytics.totalDownloads}</div>
                <div className="text-sm text-indigo-600">Total Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-700">{state.analytics.successRate}%</div>
                <div className="text-sm text-indigo-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-700">{state.analytics.averageSpeed} MB/s</div>
                <div className="text-sm text-indigo-600">Avg Speed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-700">{state.analytics.escrowProtectedFiles}</div>
                <div className="text-sm text-indigo-600">Escrow Protected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-700">${state.analytics.totalEscrowValue.toLocaleString()}</div>
                <div className="text-sm text-indigo-600">Escrow Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Download Manager
              </CardTitle>
              <CardDescription>
                Manage your downloads with escrow protection and analytics
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select 
                value={state.filter} 
                onValueChange={(value: any) => dispatch({ type: 'SET_FILTER', payload: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Downloads</SelectItem>
                  <SelectItem value="downloading">Downloading</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="escrow_locked">Escrow Locked</SelectItem>
                  <SelectItem value="error">Errors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Batch Actions */}
          {state.selectedItems.length > 0 && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {state.selectedItems.length} item(s) selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-1" />
                    Start All
                  </Button>
                  <Button size="sm" variant="outline">
                    <Pause className="h-4 w-4 mr-1" />
                    Pause All
                  </Button>
                  <Button size="sm" variant="outline">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Retry All
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Download List */}
          <div className="space-y-4">
            {filteredDownloads.length === 0 ? (
              <div className="text-center py-12">
                <Download className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No downloads</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your downloads will appear here.
                </p>
              </div>
            ) : (
              filteredDownloads.map((item) => {
                const FileIcon = getFileIcon(item.fileType)
                const isSelected = state.selectedItems.includes(item.id)
                const isCopied = state.copiedLinks.has(item.id)

                return (
                  <Card key={item.id} className={cn(
                    "transition-all duration-200",
                    isSelected && "ring-2 ring-primary"
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* File Icon */}
                        <div className="flex-shrink-0 mt-1">
                          <FileIcon className="h-8 w-8 text-primary" />
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-lg truncate">{item.fileName}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{formatFileSize(item.fileSize)}</span>
                                <span>•</span>
                                <span>{item.views} views</span>
                                <span>•</span>
                                <span>{item.downloadCount} downloads</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(item)}
                              {item.escrowProtected && (
                                <Badge className="bg-emerald-100 text-emerald-800">
                                  <Shield className="h-3 w-3 mr-1" />
                                  ${item.escrowAmount} Escrow
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {(item.status === 'downloading' || item.status === 'paused') && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>{item.progress.toFixed(1)}%</span>
                                <div className="flex items-center gap-4">
                                  <span>{formatSpeed(item.speed)}</span>
                                  <span>ETA: {formatTime(item.timeRemaining)}</span>
                                </div>
                              </div>
                              <Progress value={item.progress} className="h-2" />
                            </div>
                          )}

                          {/* Error Message */}
                          {item.status === 'error' && item.error && (
                            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                              <AlertCircle className="h-4 w-4 inline mr-1" />
                              {item.error}
                            </div>
                          )}

                          {/* Escrow Payment Required */}
                          {item.escrowProtected && item.paymentRequired && (
                            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded">
                              <div className="flex items-center gap-2 text-amber-800 mb-2">
                                <CreditCard className="h-4 w-4" />
                                <span className="font-medium">Payment Required</span>
                              </div>
                              <p className="text-sm text-amber-700 mb-3">
                                This file is protected by escrow. Complete payment to download.
                              </p>
                              <Button
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700"
                                onClick={() => handleEscrowPayment(item)}
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Pay ${item.escrowAmount} - Secure Escrow
                              </Button>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-3 border-t">
                            {/* Download Control */}
                            {item.status === 'pending' && (
                              <Button 
                                size="sm" 
                                onClick={() => startDownload(item.id)}
                                disabled={item.paymentRequired}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Start
                              </Button>
                            )}
                            {item.status === 'downloading' && (
                              <Button size="sm" variant="outline" onClick={() => pauseDownload(item.id)}>
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </Button>
                            )}
                            {item.status === 'paused' && (
                              <Button size="sm" onClick={() => resumeDownload(item.id)}>
                                <Play className="h-4 w-4 mr-1" />
                                Resume
                              </Button>
                            )}
                            {item.status === 'error' && (
                              <Button size="sm" onClick={() => retryDownload(item.id)}>
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Retry
                              </Button>
                            )}
                            {item.status === 'completed' && (
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-1" />
                                Open
                              </Button>
                            )}

                            {/* Other Actions */}
                            <Button size="sm" variant="outline" onClick={() => shareItem(item)}>
                              <Share2 className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => copyToClipboard(item.downloadUrl, item.id)}
                            >
                              {isCopied ? (
                                <Check className="h-4 w-4 mr-1" />
                              ) : (
                                <Copy className="h-4 w-4 mr-1" />
                              )}
                              Copy Link
                            </Button>

                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>

                            {item.status !== 'downloading' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => removeDownload(item.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            )}

                            {/* Escrow Actions */}
                            {item.escrowProtected && item.escrowStatus === 'secured' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              >
                                <Unlock className="h-4 w-4 mr-1" />
                                Release Escrow
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Marketing Footer */}
      <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 border-purple-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="font-semibold">Powered by {brandName}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional download management with enterprise-grade escrow protection
            </p>
            <div className="flex justify-center items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>Escrow Protected</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span>High-Speed Downloads</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span>Advanced Analytics</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="mt-4">
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={state.paymentModalOpen} onOpenChange={(open) => 
        dispatch({ type: 'TOGGLE_PAYMENT_MODAL', payload: { open } })
      }>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Secure Escrow Payment
            </DialogTitle>
            <DialogDescription>
              Complete payment to unlock download access. Funds are held securely in escrow.
            </DialogDescription>
          </DialogHeader>
          
          {state.selectedPaymentItem && (() => {
            const item = state.downloads.find(d => d.id === state.selectedPaymentItem)
            if (!item) return null
            
            return (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.fileName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(item.fileSize)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>File Access</span>
                    <span className="font-medium">${item.escrowAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Processing Fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center font-medium">
                      <span>Total</span>
                      <span>${item.escrowAmount}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Shield className="h-4 w-4" />
                    <span>Funds held securely in escrow</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Instant download access after payment</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => dispatch({ type: 'TOGGLE_PAYMENT_MODAL', payload: { open: false } })}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleEscrowPayment(item)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
} 