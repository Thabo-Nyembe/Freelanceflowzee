'use client'

import React, { useState, useReducer, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Filter, 
  Search, 
  Trash2, 
  DollarSign,
  MessageSquare,
  Users,
  Target,
  Clock,
  Cloud,
  Briefcase,
  Receipt,
  Settings,
  RefreshCw,
  Archive,
  Star,
  MoreHorizontal,
  ChevronRight,
  CalendarDays,
  Shield,
  Activity,
  TrendingUp,
  Zap,
  Download,
  Eye,
  Edit,
  CheckSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ========================================
// ENHANCED NOTIFICATION SYSTEM
// ========================================

interface Notification {
  id: string
  type: 'payment' | 'project' | 'team' | 'client' | 'system' | 'deadline'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'high' | 'medium' | 'low'
  actionUrl?: string
  actionLabel?: string
  icon?: React.ComponentType<{ className?: string }>
  color?: string
  starred?: boolean
  archived?: boolean
}

// Enhanced mock notifications with comprehensive routing
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Escrow Payment Received',
    message: 'Payment of $2,500 secured in escrow for Brand Identity Project. Client funds are now protected and available upon milestone completion.',
    timestamp: '2 minutes ago',
    read: false,
    priority: 'high',
    actionUrl: '/dashboard/escrow',
    actionLabel: 'View Escrow',
    icon: DollarSign,
    color: 'text-emerald-600',
    starred: true
  },
  {
    id: '2',
    type: 'client',
    title: 'New Client Feedback',
    message: 'Sarah Johnson left detailed feedback on your logo designs: "Love the color palette! Can we explore a few more minimalist options for the icon?"',
    timestamp: '15 minutes ago',
    read: false,
    priority: 'high',
    actionUrl: '/dashboard/collaboration',
    actionLabel: 'View Feedback',
    icon: MessageSquare,
    color: 'text-purple-600'
  },
  {
    id: '3',
    type: 'deadline',
    title: 'Project Deadline Approaching',
    message: 'Website mockups due in 2 hours for TechCorp project. Remember to include mobile responsive designs and accessibility features.',
    timestamp: '1 hour ago',
    read: false,
    priority: 'high',
    actionUrl: '/dashboard/project-tracker',
    actionLabel: 'View Project',
    icon: Clock,
    color: 'text-red-600',
    starred: true
  },
  {
    id: '4',
    type: 'team',
    title: 'Team Meeting Reminder',
    message: 'Weekly standup meeting starts in 30 minutes. We\'ll be discussing the Q1 roadmap and upcoming client presentations.',
    timestamp: '2 hours ago',
    read: true,
    priority: 'medium',
    actionUrl: '/dashboard/calendar',
    actionLabel: 'View Calendar',
    icon: Users,
    color: 'text-cyan-600'
  },
  {
    id: '5',
    type: 'project',
    title: 'Project Milestone Completed',
    message: 'Mobile app design phase completed successfully! All screens approved by client. Ready to move to development phase.',
    timestamp: '3 hours ago',
    read: true,
    priority: 'medium',
    actionUrl: '/dashboard/project-tracker',
    actionLabel: 'View Progress',
    icon: CheckCircle,
    color: 'text-green-600'
  },
  {
    id: '6',
    type: 'system',
    title: 'Automatic Backup Completed',
    message: 'All project files have been successfully backed up to cloud storage. Last backup: 127 files (2.3GB).',
    timestamp: '6 hours ago',
    read: true,
    priority: 'low',
    actionUrl: '/dashboard/cloud-storage',
    actionLabel: 'View Files',
    icon: Cloud,
    color: 'text-blue-600'
  },
  {
    id: '7',
    type: 'client',
    title: 'New Project Request',
    message: 'WebFlow Agency wants to discuss a new branding project: E-commerce redesign for fashion startup with $15K budget.',
    timestamp: '1 day ago',
    read: false,
    priority: 'medium',
    actionUrl: '/dashboard/projects-hub',
    actionLabel: 'View Request',
    icon: Briefcase,
    color: 'text-orange-600',
    starred: true
  },
  {
    id: '8',
    type: 'payment',
    title: 'Invoice Payment Received',
    message: 'Invoice #INV-2024-001 has been paid ($1,200). Payment processed successfully via Stripe.',
    timestamp: '2 days ago',
    read: true,
    priority: 'low',
    actionUrl: '/dashboard/invoices',
    actionLabel: 'View Invoice',
    icon: Receipt,
    color: 'text-green-600'
  },
  {
    id: '9',
    type: 'team',
    title: 'New Team Member Added',
    message: 'Alex Chen has been added to the Brand Identity Project team as UI/UX Designer. Welcome message sent.',
    timestamp: '3 days ago',
    read: true,
    priority: 'low',
    actionUrl: '/dashboard/team',
    actionLabel: 'View Team',
    icon: Users,
    color: 'text-cyan-600'
  },
  {
    id: '10',
    type: 'deadline',
    title: 'Project Review Due',
    message: 'Client review scheduled for tomorrow at 2 PM. Make sure all deliverables are uploaded to the client portal.',
    timestamp: '4 days ago',
    read: false,
    priority: 'medium',
    actionUrl: '/dashboard/client-zone',
    actionLabel: 'Upload Files',
    icon: Eye,
    color: 'text-yellow-600'
  }
]

// ========================================
// NOTIFICATION STATE MANAGEMENT
// ========================================

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  selectedType: string
  searchQuery: string
  sortBy: 'date' | 'priority' | 'type'
  view: 'all' | 'unread' | 'starred' | 'archived'
}

type NotificationAction = 
  | { type: 'MARK_READ'; id: string }
  | { type: 'MARK_UNREAD'; id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'DELETE'; id: string }
  | { type: 'STAR'; id: string }
  | { type: 'ARCHIVE'; id: string }
  | { type: 'SET_FILTER'; filter: string }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_SORT'; sort: 'date' | 'priority' | 'type' }
  | { type: 'SET_VIEW'; view: 'all' | 'unread' | 'starred' | 'archived' }
  | { type: 'REFRESH_NOTIFICATIONS' }

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'MARK_READ':
      const updatedNotifications = state.notifications.map(n => 
        n.id === action.id ? { ...n, read: true } : n
      )
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      }
    case 'MARK_UNREAD':
      const unreadNotifications = state.notifications.map(n => 
        n.id === action.id ? { ...n, read: false } : n
      )
      return {
        ...state,
        notifications: unreadNotifications,
        unreadCount: unreadNotifications.filter(n => !n.read).length
      }
    case 'MARK_ALL_READ':
      const allReadNotifications = state.notifications.map(n => ({ ...n, read: true }))
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0
      }
    case 'DELETE':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.id)
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.read).length
      }
    case 'STAR':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.id ? { ...n, starred: !n.starred } : n
        )
      }
    case 'ARCHIVE':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.id ? { ...n, archived: !n.archived } : n
        )
      }
    case 'SET_FILTER':
      return { ...state, selectedType: action.filter }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query }
    case 'SET_SORT':
      return { ...state, sortBy: action.sort }
    case 'SET_VIEW':
      return { ...state, view: action.view }
    case 'REFRESH_NOTIFICATIONS':
      return {
        ...state,
        notifications: mockNotifications,
        unreadCount: mockNotifications.filter(n => !n.read).length
      }
    default:
      return state
  }
}

// ========================================
// MAIN NOTIFICATIONS PAGE COMPONENT
// ========================================

export default function NotificationsPage() {
  const router = useRouter()
  
  // Notification state management
  const [notificationState, dispatch] = useReducer(notificationReducer, {
    notifications: mockNotifications,
    unreadCount: mockNotifications.filter(n => !n.read).length,
    selectedType: 'all',
    searchQuery: '',
    sortBy: 'date',
    view: 'all'
  })

  // Auto-refresh notifications
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'REFRESH_NOTIFICATIONS' })
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      dispatch({ type: 'MARK_READ', id: notification.id })
    }
    
    // Navigate to action URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  // Filter and sort notifications
  const getFilteredNotifications = () => {
    let filtered = notificationState.notifications

    // Filter by view
    switch (notificationState.view) {
      case 'unread':
        filtered = filtered.filter(n => !n.read && !n.archived)
        break
      case 'starred':
        filtered = filtered.filter(n => n.starred && !n.archived)
        break
      case 'archived':
        filtered = filtered.filter(n => n.archived)
        break
      default:
        filtered = filtered.filter(n => !n.archived)
    }

    // Filter by type
    if (notificationState.selectedType !== 'all') {
      filtered = filtered.filter(n => n.type === notificationState.selectedType)
    }

    // Filter by search query
    if (notificationState.searchQuery) {
      const query = notificationState.searchQuery.toLowerCase()
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.message.toLowerCase().includes(query)
      )
    }

    // Sort notifications
    switch (notificationState.sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
        break
      case 'type':
        filtered.sort((a, b) => a.type.localeCompare(b.type))
        break
      default: // date
        // Mock date sorting based on timestamp
        filtered.sort((a, b) => {
          const timeA = a.timestamp.includes('minute') ? 0 : 
                     a.timestamp.includes('hour') ? 1 : 
                     a.timestamp.includes('day') ? 2 : 3
          const timeB = b.timestamp.includes('minute') ? 0 : 
                     b.timestamp.includes('hour') ? 1 : 
                     b.timestamp.includes('day') ? 2 : 3
          return timeA - timeB
        })
    }

    return filtered
  }

  const filteredNotifications = getFilteredNotifications()

  // Notification categories with counts
  const notificationTypes = [
    { value: 'all', label: 'All Types', count: notificationState.notifications.filter(n => !n.archived).length },
    { value: 'payment', label: 'Payments', count: notificationState.notifications.filter(n => n.type === 'payment' && !n.archived).length },
    { value: 'project', label: 'Projects', count: notificationState.notifications.filter(n => n.type === 'project' && !n.archived).length },
    { value: 'client', label: 'Clients', count: notificationState.notifications.filter(n => n.type === 'client' && !n.archived).length },
    { value: 'team', label: 'Team', count: notificationState.notifications.filter(n => n.type === 'team' && !n.archived).length },
    { value: 'deadline', label: 'Deadlines', count: notificationState.notifications.filter(n => n.type === 'deadline' && !n.archived).length },
    { value: 'system', label: 'System', count: notificationState.notifications.filter(n => n.type === 'system' && !n.archived).length }
  ]

  // Enhanced Notification Item Component
  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const Icon = notification.icon || Bell
    const priorityColors = {
      high: 'border-l-red-500 bg-red-50/50',
      medium: 'border-l-yellow-500 bg-yellow-50/50',
      low: 'border-l-blue-500 bg-blue-50/50'
    }

    return (
      <Card 
        className={cn(
          "mb-4 cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
          priorityColors[notification.priority],
          !notification.read ? 'bg-blue-50/30 border-r-4 border-r-blue-500' : 'bg-white',
          notification.starred && 'ring-2 ring-yellow-400/30'
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={cn(
              "p-3 rounded-xl flex-shrink-0",
              notification.read ? 'bg-gray-100' : 'bg-white shadow-sm border'
            )}>
              <Icon className={cn("h-5 w-5", notification.color || 'text-gray-600')} />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "font-semibold text-lg",
                    !notification.read ? 'text-gray-900' : 'text-gray-700'
                  )}>
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0" />
                  )}
                  {notification.starred && (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={notification.priority === 'high' ? 'destructive' : 
                            notification.priority === 'medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {notification.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {notification.type}
                  </Badge>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {notification.timestamp}
                </span>
                
                <div className="flex items-center gap-2">
                  {notification.actionLabel && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNotificationClick(notification)
                      }}
                      className="h-8"
                    >
                      {notification.actionLabel}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch({ type: 'STAR', id: notification.id })
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Star className={cn(
                        "h-3 w-3",
                        notification.starred ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
                      )} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch({ 
                          type: notification.read ? 'MARK_UNREAD' : 'MARK_READ', 
                          id: notification.id 
                        })
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <CheckCircle className={cn(
                        "h-3 w-3",
                        notification.read ? "text-green-600" : "text-gray-400"
                      )} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch({ type: 'ARCHIVE', id: notification.id })
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Archive className="h-3 w-3 text-gray-400" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch({ type: 'DELETE', id: notification.id })
                      }}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">
                Stay updated with your projects, payments, and team activities
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => dispatch({ type: 'REFRESH_NOTIFICATIONS' })}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                onClick={() => dispatch({ type: 'MARK_ALL_READ' })}
                disabled={notificationState.unreadCount === 0}
                className="gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Mark All Read
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total</p>
                    <p className="text-2xl font-bold">{notificationState.notifications.filter(n => !n.archived).length}</p>
                  </div>
                  <Bell className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Unread</p>
                    <p className="text-2xl font-bold">{notificationState.unreadCount}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Starred</p>
                    <p className="text-2xl font-bold">
                      {notificationState.notifications.filter(n => n.starred && !n.archived).length}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">High Priority</p>
                    <p className="text-2xl font-bold">
                      {notificationState.notifications.filter(n => n.priority === 'high' && !n.read && !n.archived).length}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={notificationState.searchQuery}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
              
              {/* View Filters */}
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All', icon: Bell },
                  { value: 'unread', label: 'Unread', icon: AlertCircle },
                  { value: 'starred', label: 'Starred', icon: Star },
                  { value: 'archived', label: 'Archived', icon: Archive }
                ].map((view) => {
                  const IconComponent = view.icon
                  return (
                    <Button
                      key={view.value}
                      variant={notificationState.view === view.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => dispatch({ type: 'SET_VIEW', view: view.value as any })}
                      className="gap-2"
                    >
                      <IconComponent className="h-3 w-3" />
                      {view.label}
                    </Button>
                  )
                })}
              </div>
              
              {/* Sort */}
              <select
                value={notificationState.sortBy}
                onChange={(e) => dispatch({ type: 'SET_SORT', sort: e.target.value as any })}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="type">Sort by Type</option>
              </select>
            </div>
            
            {/* Type Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {notificationTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={notificationState.selectedType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_FILTER', filter: type.value })}
                  className="gap-2"
                >
                  {type.label}
                  {type.count > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                      {type.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-500 mb-6">
                  {notificationState.searchQuery 
                    ? `No notifications match "${notificationState.searchQuery}"` 
                    : 'You\'re all caught up! No notifications in this category.'}
                </p>
                {notificationState.searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => dispatch({ type: 'SET_SEARCH', query: '' })}
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="group">
              {filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </div>

        {/* Load More / Pagination could go here */}
        {filteredNotifications.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Showing {filteredNotifications.length} of {notificationState.notifications.filter(n => !n.archived).length} notifications
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 