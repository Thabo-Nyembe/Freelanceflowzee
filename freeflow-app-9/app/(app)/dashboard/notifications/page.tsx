'use client'

import { useState, useReducer } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Trash2,
  Settings,
  DollarSign,
  Target,
  Users,
  UserCheck,
  ExternalLink,
  MoreHorizontal,
  Clock,
  Calendar,
  X,
  Archive
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Enhanced notification interface with more details
interface EnhancedNotification {
  id: string
  type: 'payment' | 'project' | 'team' | 'client' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'high' | 'medium' | 'low'
  actionUrl?: string
  actionLabel?: string
  sender?: string
  projectId?: string
  relatedData?: any
}

// Comprehensive mock notifications data
const mockNotifications: EnhancedNotification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Escrow Payment Received',
    message: 'Payment of $2,500 secured in escrow for Brand Identity Project. Milestone 4 has been funded and is ready for release upon completion.',
    timestamp: '2 minutes ago',
    read: false,
    priority: 'high',
    actionUrl: '/dashboard/escrow',
    actionLabel: 'View Escrow Details',
    sender: 'TechCorp Inc.',
    projectId: 'proj_001',
    relatedData: { amount: 2500, milestone: 'Brand Guidelines' }
  },
  {
    id: '2',
    type: 'client',
    title: 'New Client Feedback Received',
    message: 'Sarah Johnson left detailed feedback on your logo designs with 3 specific revision requests. She also approved the color palette and requested final files.',
    timestamp: '15 minutes ago',
    read: false,
    priority: 'medium',
    actionUrl: '/dashboard/collaboration',
    actionLabel: 'Review Feedback',
    sender: 'Sarah Johnson',
    projectId: 'proj_001',
    relatedData: { revisions: 3, approved: ['color-palette'], type: 'feedback' }
  },
  {
    id: '3',
    type: 'project',
    title: 'Milestone Completed',
    message: 'E-commerce Website Design milestone reached - 75% complete. The design phase has been finalized and development can now begin.',
    timestamp: '1 hour ago',
    read: false,
    priority: 'medium',
    actionUrl: '/dashboard/project-tracker',
    actionLabel: 'View Progress',
    projectId: 'proj_002',
    relatedData: { progress: 75, phase: 'design', nextPhase: 'development' }
  },
  {
    id: '4',
    type: 'team',
    title: 'Team Meeting Reminder',
    message: 'Design Review Session starts in 30 minutes. Sarah and Marcus will be presenting their work on the mobile app project.',
    timestamp: '1 hour ago',
    read: true,
    priority: 'low',
    actionUrl: '/dashboard/calendar',
    actionLabel: 'Join Meeting',
    relatedData: { meetingType: 'design-review', attendees: ['Sarah', 'Marcus'], duration: '1 hour' }
  },
  {
    id: '5',
    type: 'client',
    title: 'Gallery Access Request',
    message: 'TechCorp Inc requested access to premium gallery section to download high-resolution files and brand assets.',
    timestamp: '2 hours ago',
    read: false,
    priority: 'medium',
    actionUrl: '/dashboard/client-zone',
    actionLabel: 'Grant Access',
    sender: 'TechCorp Inc.',
    relatedData: { accessType: 'premium', requestedFiles: ['high-res', 'brand-assets'] }
  },
  {
    id: '6',
    type: 'system',
    title: 'Storage Limit Warning',
    message: 'Cloud storage is 85% full (8.5GB of 10GB used). Consider upgrading your plan or removing unused files to prevent storage issues.',
    timestamp: '3 hours ago',
    read: true,
    priority: 'low',
    actionUrl: '/dashboard/cloud-storage',
    actionLabel: 'Manage Storage',
    relatedData: { usedSpace: 8.5, totalSpace: 10, percentage: 85 }
  },
  {
    id: '7',
    type: 'payment',
    title: 'Invoice Payment Received',
    message: 'Invoice #INV-2024-001 has been paid in full ($1,200). The payment has been processed and funds are available in your account.',
    timestamp: '4 hours ago',
    read: true,
    priority: 'high',
    actionUrl: '/dashboard/invoices',
    actionLabel: 'View Invoice',
    sender: 'Fashion Forward',
    relatedData: { invoiceId: 'INV-2024-001', amount: 1200, status: 'paid' }
  },
  {
    id: '8',
    type: 'project',
    title: 'Day to Day Fund Milestone',
    message: 'Daily fund milestone reached for Brand Identity project. Next payment of $625 has been unlocked and is ready for release.',
    timestamp: '5 hours ago',
    read: false,
    priority: 'high',
    actionUrl: '/dashboard/escrow',
    actionLabel: 'View Day Fund',
    projectId: 'proj_001',
    relatedData: { dailyFund: true, amount: 625, milestone: 'daily-progress' }
  },
  {
    id: '9',
    type: 'team',
    title: 'New Team Member Added',
    message: 'Marcus Chen has been added to the E-commerce Website project team. Please review his portfolio and assign appropriate tasks.',
    timestamp: '6 hours ago',
    read: true,
    priority: 'low',
    actionUrl: '/dashboard/team',
    actionLabel: 'View Team',
    relatedData: { memberName: 'Marcus Chen', role: 'Frontend Developer', projectId: 'proj_002' }
  },
  {
    id: '10',
    type: 'client',
    title: 'Project Deadline Reminder',
    message: 'Mobile App UI project deadline is approaching in 3 days. Current progress is 60% - consider scheduling additional work sessions.',
    timestamp: '8 hours ago',
    read: false,
    priority: 'medium',
    actionUrl: '/dashboard/project-tracker',
    actionLabel: 'Check Progress',
    projectId: 'proj_003',
    relatedData: { daysLeft: 3, progress: 60, deadline: '2024-01-20' }
  }
]

// Notification state management
interface NotificationState {
  notifications: EnhancedNotification[]
  unreadCount: number
  selectedType: string
  searchQuery: string
}

type NotificationAction = 
  | { type: 'MARK_READ'; id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'DELETE'; id: string }
  | { type: 'SET_FILTER'; filter: string }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'ARCHIVE'; id: string }

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }
    case 'DELETE':
      const notification = state.notifications.find(n => n.id === action.id)
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id),
        unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount
      }
    case 'SET_FILTER':
      return {
        ...state,
        selectedType: action.filter
      }
    case 'SET_SEARCH':
      return {
        ...state,
        searchQuery: action.query
      }
    case 'ARCHIVE':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id)
      }
    default:
      return state
  }
}

// Notification type configurations
const notificationTypes = {
  payment: { icon: DollarSign, color: 'text-green-600 bg-green-50 border-green-200', label: 'Payment' },
  project: { icon: Target, color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Project' },
  team: { icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-200', label: 'Team' },
  client: { icon: UserCheck, color: 'text-orange-600 bg-orange-50 border-orange-200', label: 'Client' },
  system: { icon: Settings, color: 'text-gray-600 bg-gray-50 border-gray-200', label: 'System' }
}

const priorityIcons = {
  high: { icon: AlertCircle, color: 'text-red-500' },
  medium: { icon: Info, color: 'text-yellow-500' },
  low: { icon: CheckCircle, color: 'text-gray-400' }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: mockNotifications,
    unreadCount: mockNotifications.filter(n => !n.read).length,
    selectedType: 'all',
    searchQuery: ''
  })

  // Smart notification routing
  const handleNotificationClick = (notification: EnhancedNotification) => {
    // Mark as read
    if (!notification.read) {
      dispatch({ type: 'MARK_READ', id: notification.id })
    }
    
    // Navigate to relevant section
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  // Filter notifications based on type and search
  const filteredNotifications = state.notifications.filter(notification => {
    const matchesType = state.selectedType === 'all' || notification.type === state.selectedType
    const matchesSearch = state.searchQuery === '' || 
      notification.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      notification.sender?.toLowerCase().includes(state.searchQuery.toLowerCase())
    
    return matchesType && matchesSearch
  })

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = notification.timestamp.includes('minutes') || notification.timestamp.includes('hour') 
      ? 'Today' 
      : notification.timestamp.includes('day') 
        ? 'This Week' 
        : 'Earlier'
    
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(notification)
    return groups
  }, {} as Record<string, EnhancedNotification[]>)

  const NotificationCard = ({ notification }: { notification: EnhancedNotification }) => {
    const typeConfig = notificationTypes[notification.type]
    const priorityConfig = priorityIcons[notification.priority]
    const TypeIcon = typeConfig.icon
    const PriorityIcon = priorityConfig.icon

    return (
      <Card 
        className={`transition-all duration-200 hover:shadow-md cursor-pointer border-l-4 ${typeConfig.color} ${
          notification.read ? 'opacity-60' : 'opacity-100'
        }`}
        onClick={() => handleNotificationClick(notification)}
        data-testid={`notification-${notification.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${typeConfig.color.replace('text-', 'bg-').replace('border-', '').replace('bg-bg-', 'bg-')} bg-opacity-20`}>
              <TypeIcon className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{notification.title}</h3>
                  <PriorityIcon className={`h-4 w-4 ${priorityConfig.color}`} />
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{notification.timestamp}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      dispatch({ type: 'DELETE', id: notification.id })
                    }}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {notification.message}
              </p>
              
              {notification.sender && (
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    <UserCheck className="h-3 w-3 mr-1" />
                    {notification.sender}
                  </Badge>
                  {notification.relatedData && (
                    <Badge variant="secondary" className="text-xs">
                      {typeConfig.label}
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {!notification.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch({ type: 'MARK_READ', id: notification.id })
                      }}
                      className="text-xs"
                    >
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      dispatch({ type: 'ARCHIVE', id: notification.id })
                    }}
                    className="text-xs"
                  >
                    <Archive className="h-3 w-3 mr-1" />
                    Archive
                  </Button>
                </div>
                
                {notification.actionLabel && (
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNotificationClick(notification)
                    }}
                  >
                    {notification.actionLabel}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Notifications
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Stay updated with your projects and collaborations
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'MARK_ALL_READ' })}
              className="gap-2"
              disabled={state.unreadCount === 0}
            >
              <CheckCircle className="h-4 w-4" />
              Mark All Read
            </Button>
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {state.unreadCount} unread
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(notificationTypes).map(([type, config]) => {
            const count = state.notifications.filter(n => n.type === type).length
            const unreadCount = state.notifications.filter(n => n.type === type && !n.read).length
            const TypeIcon = config.icon

            return (
              <Card 
                key={type}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  state.selectedType === type ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => dispatch({ type: 'SET_FILTER', filter: type })}
              >
                <CardContent className="p-4 text-center">
                  <div className={`inline-flex p-2 rounded-lg ${config.color} mb-2`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-xs text-gray-500 capitalize">{type}</div>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="mt-1 text-xs">
                      {unreadCount} new
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters and Search */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={state.searchQuery}
                onChange={(e) => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Tabs value={state.selectedType} onValueChange={(value) => dispatch({ type: 'SET_FILTER', filter: value })}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="payment">Payments</TabsTrigger>
                <TabsTrigger value="project">Projects</TabsTrigger>
                <TabsTrigger value="client">Clients</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Card>

        {/* Notifications List */}
        <div className="space-y-6">
          {Object.keys(groupedNotifications).length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {state.searchQuery 
                  ? `No notifications match "${state.searchQuery}"`
                  : 'You\'re all caught up! No new notifications.'
                }
              </p>
            </Card>
          ) : (
            Object.entries(groupedNotifications).map(([date, notifications]) => (
              <div key={date} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {date}
                  <Badge variant="outline" className="ml-2">
                    {notifications.length} notifications
                  </Badge>
                </h2>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 