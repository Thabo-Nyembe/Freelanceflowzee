'use client'

import { useState, useReducer, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCircle, 
  X, 
  Check,
  Archive,
  Trash2,
  Volume2,
  VolumeX,
  Settings,
  Mail,
  MessageSquare,
  DollarSign,
  Clock,
  User,
  FileText,
  AlertTriangle,
  Info,
  Target,
  Zap,
  Calendar,
  Star,
  Eye,
  EyeOff,
  MoreHorizontal,
  Bookmark,
  Download,
  Share2,
  RefreshCw
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'project' | 'message' | 'system'
  read: boolean
  timestamp: Date
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionUrl?: string
  avatar?: string
  archived?: boolean
}

interface NotificationState {
  notifications: Notification[]
  filter: 'all' | 'unread' | 'read' | 'archived'
  search: string
  loading: boolean
  soundEnabled: boolean
  showPreviews: boolean
}

type NotificationAction = 
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'ARCHIVE_NOTIFICATION'; payload: string }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'SET_FILTER'; payload: NotificationState['filter'] }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_PREVIEWS' }

const initialState: NotificationState = {
  notifications: [],
  filter: 'all',
  search: '',
  loading: false,
  soundEnabled: true,
  showPreviews: true
}

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload }
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      }
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      }
    case 'ARCHIVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, archived: true } : n
        )
      }
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }
    case 'SET_FILTER':
      return { ...state, filter: action.payload }
    case 'SET_SEARCH':
      return { ...state, search: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled }
    case 'TOGGLE_PREVIEWS':
      return { ...state, showPreviews: !state.showPreviews }
    default:
      return state
  }
}

export default function NotificationsPage() {
  const [state, dispatch] = useReducer(notificationReducer, initialState)
  const [activeTab, setActiveTab] = useState<string>('inbox')

  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'New Project Message',
        message: 'Sarah Johnson sent you a message about the website redesign project.',
        type: 'message',
        read: false,
        timestamp: new Date(Date.now() - 5 * 60000),
        category: 'Communication',
        priority: 'high',
        actionUrl: '/dashboard/messages',
        avatar: '/avatars/sarah.jpg'
      },
      {
        id: '2',
        title: 'Payment Received',
        message: 'You received a payment of $2,500 from TechCorp Inc.',
        type: 'payment',
        read: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60000),
        category: 'Finance',
        priority: 'medium',
        actionUrl: '/dashboard/escrow'
      },
      {
        id: '3',
        title: 'Project Deadline Reminder',
        message: 'E-commerce redesign project is due in 3 days.',
        type: 'warning',
        read: true,
        timestamp: new Date(Date.now() - 4 * 60 * 60000),
        category: 'Projects',
        priority: 'urgent',
        actionUrl: '/dashboard/projects-hub'
      },
      {
        id: '4',
        title: 'New Review Posted',
        message: 'Mike Rodriguez left a 5-star review for your video editing work.',
        type: 'success',
        read: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60000),
        category: 'Reviews',
        priority: 'low',
        actionUrl: '/dashboard/cv-portfolio'
      },
      {
        id: '5',
        title: 'System Update',
        message: 'FreeFlow platform has been updated with new features.',
        type: 'system',
        read: false,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000),
        category: 'System',
        priority: 'low'
      },
      {
        id: '6',
        title: 'Collaboration Request',
        message: 'Emma Thompson invited you to collaborate on a brand identity project.',
        type: 'project',
        read: false,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000),
        category: 'Collaboration',
        priority: 'medium',
        actionUrl: '/dashboard/collaboration'
      },
      {
        id: '7',
        title: 'File Upload Complete',
        message: 'Your video files have been successfully uploaded to the cloud.',
        type: 'info',
        read: true,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60000),
        category: 'Files',
        priority: 'low',
        actionUrl: '/dashboard/files-hub'
      },
      {
        id: '8',
        title: 'Invoice Overdue',
        message: 'Invoice #INV-2024-001 is 5 days overdue.',
        type: 'error',
        read: false,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60000),
        category: 'Finance',
        priority: 'urgent',
        actionUrl: '/dashboard/invoices'
      }
    ]
    dispatch({ type: 'SET_NOTIFICATIONS', payload: mockNotifications })
  }, [])

  const filteredNotifications = state.notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(state.search.toLowerCase()) ||
                         notification.message.toLowerCase().includes(state.search.toLowerCase())
    
    const matchesFilter = state.filter === 'all' || 
                         (state.filter === 'unread' && !notification.read) ||
                         (state.filter === 'read' && notification.read) ||
                         (state.filter === 'archived' && notification.archived)
    
    return matchesSearch && matchesFilter && !notification.archived
  })

  const unreadCount = state.notifications.filter(n => !n.read && !n.archived).length

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageSquare
      case 'payment': return DollarSign
      case 'project': return FileText
      case 'system': return Settings
      case 'success': return CheckCircle
      case 'warning': return AlertTriangle
      case 'error': return X
      default: return Info
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-600 bg-blue-50'
      case 'payment': return 'text-green-600 bg-green-50'
      case 'project': return 'text-purple-600 bg-purple-50'
      case 'system': return 'text-gray-600 bg-gray-50'
      case 'success': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString()
  }

  const handleNotificationClick = (notification: Notification) => {
    dispatch({ type: 'MARK_AS_READ', payload: notification.id })
    if (notification.actionUrl) {
      // In a real app, navigate to the URL
      alert(`Navigating to: ${notification.actionUrl}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">A+++</Badge>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{unreadCount} unread</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'MARK_ALL_READ' })}>
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inbox">Inbox ({filteredNotifications.length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inbox" className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={state.search}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={state.filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}
                >
                  All
                </Button>
                <Button
                  variant={state.filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_FILTER', payload: 'unread' })}
                >
                  Unread
                </Button>
                <Button
                  variant={state.filter === 'read' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_FILTER', payload: 'read' })}
                >
                  Read
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                    <p className="text-gray-600">
                      {state.search ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => {
                  const TypeIcon = getTypeIcon(notification.type)
                  const typeColor = getTypeColor(notification.type)
                  const priorityColor = getPriorityColor(notification.priority)
                  
                  return (
                    <Card 
                      key={notification.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        !notification.read ? 'bg-blue-50/50 border-blue-200' : 'bg-white'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full ${typeColor}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${priorityColor}`} />
                                <span className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {notification.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {notification.priority}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    dispatch({ type: 'ARCHIVE_NOTIFICATION', payload: notification.id })
                                  }}
                                >
                                  <Archive className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    dispatch({ type: 'DELETE_NOTIFICATION', payload: notification.id })
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sound">Sound Notifications</Label>
                    <p className="text-sm text-gray-500">Play sound when new notifications arrive</p>
                  </div>
                  <Switch
                    id="sound"
                    checked={state.soundEnabled}
                    onCheckedChange={() => dispatch({ type: 'TOGGLE_SOUND' })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="previews">Show Previews</Label>
                    <p className="text-sm text-gray-500">Show notification content in previews</p>
                  </div>
                  <Switch
                    id="previews"
                    checked={state.showPreviews}
                    onCheckedChange={() => dispatch({ type: 'TOGGLE_PREVIEWS' })}
                  />
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Types</h4>
                  {[
                    { type: 'Messages', enabled: true, description: 'New messages and communications' },
                    { type: 'Payments', enabled: true, description: 'Payment confirmations and alerts' },
                    { type: 'Projects', enabled: true, description: 'Project updates and deadlines' },
                    { type: 'System', enabled: false, description: 'System updates and maintenance' },
                    { type: 'Marketing', enabled: false, description: 'Product updates and promotions' }
                  ].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>{setting.type}</Label>
                        <p className="text-sm text-gray-500">{setting.description}</p>
                      </div>
                      <Switch defaultChecked={setting.enabled} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="archive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Archived Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Archive className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No archived notifications</h3>
                  <p className="text-gray-600">Archived notifications will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}