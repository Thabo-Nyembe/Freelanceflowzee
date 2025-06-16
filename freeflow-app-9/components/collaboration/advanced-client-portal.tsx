'use client'

import React, { useReducer, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download,
  Eye,
  Lock,
  Unlock,
  Calendar,
  Clock,
  DollarSign,
  Shield,
  CheckCircle,
  AlertTriangle,
  Star,
  MessageCircle,
  FileText,
  Image as ImageIcon,
  Video,
  Users,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Globe,
  Share,
  QrCode,
  ExternalLink
} from 'lucide-react'

// Context7 Pattern: Advanced State Management for Client Portal
interface ClientPortalState {
  selectedProject: Project | null
  accessLevel: 'guest' | 'preview' | 'premium'
  downloadRequests: DownloadRequest[]
  notifications: Notification[]
  analytics: ProjectAnalytics | null
  isLoading: boolean
  error: string | null
  activeTab: string
}

interface Project {
  id: string
  name: string
  description: string
  status: 'draft' | 'review' | 'approved' | 'delivered'
  progress: number
  files: ProjectFile[]
  milestones: Milestone[]
  pricing: ProjectPricing
  timeline: TimelineEvent[]
  shareSettings: ShareSettings
}

interface ProjectFile {
  id: string
  name: string
  type: 'image' | 'video' | 'document' | 'archive'
  size: number
  url: string
  thumbnail?: string
  accessLevel: 'guest' | 'preview' | 'premium'
  downloadCount: number
  lastAccessed: string
  watermark?: boolean
}

interface DownloadRequest {
  id: string
  fileId: string
  fileName: string
  requestedAt: string
  status: 'pending' | 'approved' | 'downloaded'
  expiresAt: string
}

interface Milestone {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed' | 'overdue'
  dueDate: string
  payment?: number
}

interface ProjectPricing {
  total: number
  paid: number
  currency: string
  licensing: {
    digital: number
    print: number
    commercial: number
  }
}

interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  type: 'milestone' | 'payment' | 'delivery' | 'feedback'
}

interface ShareSettings {
  publicLink: string
  qrCode: string
  password?: string
  expiryDate?: string
  allowDownloads: boolean
  showWatermarks: boolean
}

interface ProjectAnalytics {
  views: number
  downloads: number
  shares: number
  engagement: number
  topFiles: { name: string; views: number }[]
  viewerLocations: { country: string; count: number }[]
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  read: boolean
}

type ClientPortalAction =
  | { type: 'SET_PROJECT'; project: Project }
  | { type: 'SET_ACCESS_LEVEL'; level: ClientPortalState['accessLevel'] }
  | { type: 'ADD_DOWNLOAD_REQUEST'; request: DownloadRequest }
  | { type: 'UPDATE_DOWNLOAD_REQUEST'; requestId: string; updates: Partial<DownloadRequest> }
  | { type: 'SET_ANALYTICS'; analytics: ProjectAnalytics }
  | { type: 'ADD_NOTIFICATION'; notification: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; notificationId: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_ACTIVE_TAB'; tab: string }

function clientPortalReducer(state: ClientPortalState, action: ClientPortalAction): ClientPortalState {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, selectedProject: action.project }
    
    case 'SET_ACCESS_LEVEL':
      return { ...state, accessLevel: action.level }
    
    case 'ADD_DOWNLOAD_REQUEST':
      return { 
        ...state, 
        downloadRequests: [...state.downloadRequests, action.request] 
      }
    
    case 'UPDATE_DOWNLOAD_REQUEST':
      return {
        ...state,
        downloadRequests: state.downloadRequests.map(req =>
          req.id === action.requestId ? { ...req, ...action.updates } : req
        )
      }
    
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.analytics }
    
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [action.notification, ...state.notifications] 
      }
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.notificationId ? { ...notif, read: true } : notif
        )
      }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading }
    
    case 'SET_ERROR':
      return { ...state, error: action.error }
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab }
    
    default:
      return state
  }
}

interface AdvancedClientPortalProps {
  projectId: string
  clientId: string
  initialAccessLevel?: ClientPortalState['accessLevel']
  onUpgradeAccess?: (level: string) => void
  className?: string
}

// Mock project data - using our existing working patterns
const mockProject: Project = {
  id: 'proj_1',
  name: 'Brand Identity Redesign',
  description: 'Complete brand identity package including logo, color palette, typography, and brand guidelines.',
  status: 'review',
  progress: 85,
  files: [
    {
      id: 'file_1',
      name: 'Logo_Primary.svg',
      type: 'image',
      size: 245000,
      url: '/files/logo-primary.svg',
      thumbnail: '/images/logo-thumb.jpg',
      accessLevel: 'preview',
      downloadCount: 12,
      lastAccessed: '2024-01-15T10:30:00Z',
      watermark: true
    },
    {
      id: 'file_2',
      name: 'Brand_Guidelines.pdf',
      type: 'document',
      size: 15680000,
      url: '/files/brand-guidelines.pdf',
      accessLevel: 'premium',
      downloadCount: 5,
      lastAccessed: '2024-01-14T15:45:00Z'
    }
  ],
  milestones: [
    {
      id: 'ms_1',
      title: 'Logo Design',
      description: 'Initial logo concepts and revisions',
      status: 'completed',
      dueDate: '2024-01-10',
      payment: 2500
    }
  ],
  pricing: {
    total: 6000,
    paid: 4000,
    currency: 'USD',
    licensing: {
      digital: 1000,
      print: 1500,
      commercial: 3500
    }
  },
  timeline: [],
  shareSettings: {
    publicLink: 'https://freeflowzee.com/share/brand-identity-proj1',
    qrCode: '/qr/brand-identity-proj1.png',
    allowDownloads: true,
    showWatermarks: false
  }
}

export function AdvancedClientPortal({
  projectId,
  clientId,
  initialAccessLevel = 'guest',
  onUpgradeAccess,
  className = ''
}: AdvancedClientPortalProps) {
  const [state, dispatch] = useReducer(clientPortalReducer, {
    selectedProject: mockProject,
    accessLevel: initialAccessLevel,
    downloadRequests: [],
    notifications: [],
    analytics: { views: 156, downloads: 23, shares: 8, engagement: 78, topFiles: [], viewerLocations: [] },
    isLoading: false,
    error: null,
    activeTab: 'overview'
  })

  const requestDownload = useCallback((file: ProjectFile) => {
    const request: DownloadRequest = {
      id: `req_${Date.now()}`,
      fileId: file.id,
      fileName: file.name,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
    
    dispatch({ type: 'ADD_DOWNLOAD_REQUEST', request })
    
    // Simulate approval process
    setTimeout(() => {
      dispatch({ 
        type: 'UPDATE_DOWNLOAD_REQUEST', 
        requestId: request.id, 
        updates: { status: 'approved' } 
      })
    }, 2000)
  }, [])

  const getAccessBadge = (level: string) => {
    switch (level) {
      case 'guest':
        return <Badge variant="outline" className="bg-gray-50">Guest</Badge>
      case 'preview':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Preview</Badge>
      case 'premium':
        return <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">Premium</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const canAccess = (fileAccessLevel: string) => {
    const levels: Record<string, number> = { guest: 1, preview: 2, premium: 3 }
    return levels[state.accessLevel] >= (levels[fileAccessLevel] || 0)
  }

  if (!state.selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Project not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{state.selectedProject.name}</h1>
          <p className="text-gray-600 mt-1">{state.selectedProject.description}</p>
        </div>
        <div className="flex items-center gap-3">
          {getAccessBadge(state.accessLevel)}
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {state.selectedProject.status.charAt(0).toUpperCase() + state.selectedProject.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Project Progress</h3>
              <div className="flex items-center gap-3">
                <Progress value={state.selectedProject.progress} className="flex-1" />
                <span className="text-sm font-medium">{state.selectedProject.progress}%</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Total Value</h3>
              <p className="text-lg font-semibold text-gray-900">
                ${state.selectedProject.pricing.total.toLocaleString()}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Files Available</h3>
              <p className="text-lg font-semibold text-gray-900">
                {state.selectedProject.files.length}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Total Views</h3>
              <p className="text-lg font-semibold text-gray-900">
                {state.analytics?.views || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.selectedProject.files.map((file) => (
          <Card key={file.id} className="bg-white/70 backdrop-blur-sm border-white/20 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              {file.type === 'image' && <ImageIcon className="w-8 h-8 text-gray-400" />}
              {file.type === 'video' && <Video className="w-8 h-8 text-gray-400" />}
              {file.type === 'document' && <FileText className="w-8 h-8 text-gray-400" />}
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-sm truncate">{file.name}</h3>
                {getAccessBadge(file.accessLevel)}
              </div>
              <p className="text-xs text-gray-500 mb-3">{Math.round(file.size / 1024)} KB</p>
              
              <div className="flex gap-2">
                {canAccess(file.accessLevel) ? (
                  <>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => requestDownload(file)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onUpgradeAccess?.(file.accessLevel)}
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Upgrade to Access
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 