'use client'

import React, { useState, useEffect, useReducer } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LayoutDashboard,
  Calendar,
  FolderOpen,
  Users,
  CreditCard,
  FileText,
  Globe,
  User,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Shield,
  DollarSign,
  Image,
  Briefcase,
  CalendarDays,
  Receipt,
  Target,
  Clock,
  UserCheck,
  MessageSquare,
  Archive,
  PieChart,
  Zap,
  Award,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Rocket,
  Cloud,
  Eye,
  Download,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink,
  MoreHorizontal,
  Filter,
  Plus,
  Timer,
  Bookmark,
  Activity
} from 'lucide-react'

// ========================================
// ENHANCED CONSOLIDATED NAVIGATION STRUCTURE
// ========================================

// Main navigation hubs with consolidated features and better organization
const consolidatedNavigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Overview & insights',
    notifications: 0,
    testId: 'dashboard-nav'
  },
  { 
    name: 'My Day Today', 
    href: '/dashboard/my-day', 
    icon: Calendar, 
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    description: 'AI-powered daily planning',
    badge: 'AI',
    notifications: 3,
    testId: 'my-day-nav'
  },
  { 
    name: 'Projects Hub', 
    href: '/dashboard/projects-hub', 
    icon: FolderOpen, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Projects • Collaboration • Client Delivery',
    subTabs: [
      { name: 'Project Tracking', href: '/dashboard/project-tracker', icon: Target, description: 'Track project progress' },
      { name: 'Client Collaboration', href: '/dashboard/collaboration', icon: MessageSquare, description: 'Chat & feedback' },
      { name: 'Client Zone Gallery', href: '/dashboard/client-zone', icon: Eye, description: 'Client project access' }
    ],
    notifications: 5,
    isHub: true,
    testId: 'projects-hub-nav'
  },
  { 
    name: 'Team Hub', 
    href: '/dashboard/team-hub', 
    icon: Users, 
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    description: 'Team • Shared Calendar',
    subTabs: [
      { name: 'Team Members', href: '/dashboard/team', icon: UserCheck, description: 'Manage team members' },
      { name: 'Shared Calendar', href: '/dashboard/calendar', icon: CalendarDays, description: 'Team events & meetings' },
      { name: 'Time Tracking', href: '/dashboard/time-tracking', icon: Timer, description: 'Track work hours' }
    ],
    notifications: 2,
    isHub: true,
    testId: 'team-hub-nav'
  },
  { 
    name: 'Financial Hub', 
    href: '/dashboard/financial-hub', 
    icon: DollarSign, 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    description: 'Escrow • Invoices • Analytics',
    subTabs: [
      { name: 'Escrow System', href: '/dashboard/escrow', icon: Shield, description: 'Payment protection' },
      { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt, description: 'Billing & invoicing' },
      { name: 'Financial Analytics', href: '/dashboard/analytics', icon: PieChart, description: 'Financial insights' }
    ],
    notifications: 1,
    isHub: true,
    testId: 'financial-hub-nav'
  },
  { 
    name: 'Files Hub', 
    href: '/dashboard/files-hub', 
    icon: Archive, 
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Cloud Storage • Portfolio Gallery',
    subTabs: [
      { name: 'Cloud Storage', href: '/dashboard/cloud-storage', icon: Cloud, badge: '10GB', description: 'File management' },
      { name: 'Portfolio Gallery', href: '/dashboard/gallery', icon: Image, description: 'Showcase work' },
      { name: 'CV Portfolio', href: '/dashboard/cv-portfolio', icon: Bookmark, description: 'Professional CV' }
    ],
    notifications: 0,
    isHub: true,
    testId: 'files-hub-nav'
  },
  { 
    name: 'Profile', 
    href: '/dashboard/profile', 
    icon: User, 
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    description: 'Settings & preferences',
    notifications: 0,
    testId: 'profile-nav'
  },
  { 
    name: 'Notifications', 
    href: '/dashboard/notifications', 
    icon: Bell, 
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Stay up to date',
    notifications: 8,
    badge: '8',
    testId: 'notifications-nav'
  }
]

// ========================================
// COMPREHENSIVE NOTIFICATION SYSTEM
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
}

// Enhanced mock notifications data with smart routing
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Escrow Payment Received',
    message: 'Payment of $2,500 secured in escrow for Brand Identity Project',
    timestamp: '2 minutes ago',
    read: false,
    priority: 'high',
    actionUrl: '/dashboard/escrow',
    actionLabel: 'View Escrow',
    icon: DollarSign,
    color: 'text-emerald-600'
  },
  {
    id: '2',
    type: 'client',
    title: 'New Client Feedback',
    message: 'Sarah Johnson left feedback on your logo designs',
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
    message: 'Website mockups due in 2 hours for TechCorp project',
    timestamp: '1 hour ago',
    read: false,
    priority: 'high',
    actionUrl: '/dashboard/project-tracker',
    actionLabel: 'View Project',
    icon: Clock,
    color: 'text-red-600'
  },
  {
    id: '4',
    type: 'team',
    title: 'Team Meeting Reminder',
    message: 'Weekly standup in 30 minutes',
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
    message: 'Mobile app design phase completed successfully',
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
    title: 'Backup Completed',
    message: 'All project files backed up to cloud storage',
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
    message: 'WebFlow Agency wants to discuss new branding project',
    timestamp: '1 day ago',
    read: false,
    priority: 'medium',
    actionUrl: '/dashboard/projects-hub',
    actionLabel: 'View Request',
    icon: Briefcase,
    color: 'text-orange-600'
  },
  {
    id: '8',
    type: 'payment',
    title: 'Invoice Paid',
    message: 'Invoice #INV-2024-001 has been paid ($1,200)',
    timestamp: '2 days ago',
    read: true,
    priority: 'low',
    actionUrl: '/dashboard/invoices',
    actionLabel: 'View Invoice',
    icon: Receipt,
    color: 'text-green-600'
  }
]

// ========================================
// NOTIFICATION STATE MANAGEMENT
// ========================================

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  selectedType: string
  isExpanded: boolean
}

type NotificationAction = 
  | { type: 'MARK_READ'; id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'DELETE'; id: string }
  | { type: 'SET_FILTER'; filter: string }
  | { type: 'TOGGLE_EXPANDED' }
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
    case 'SET_FILTER':
      return { ...state, selectedType: action.filter }
    case 'TOGGLE_EXPANDED':
      return { ...state, isExpanded: !state.isExpanded }
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
// MAIN DASHBOARD NAVIGATION COMPONENT
// ========================================

interface DashboardNavProps {
  className?: string
}

export function DashboardNav({ className }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedHubs, setExpandedHubs] = useState<Set<string>>(new Set())

  // Notification state management
  const [notificationState, dispatch] = useReducer(notificationReducer, {
    notifications: mockNotifications,
    unreadCount: mockNotifications.filter(n => !n.read).length,
    selectedType: 'all',
    isExpanded: false
  })

  // Auto-refresh notifications
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'REFRESH_NOTIFICATIONS' })
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    dispatch({ type: 'MARK_READ', id: notification.id })
    
    // Navigate to action URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      setIsMobileMenuOpen(false)
    }
  }

  const toggleHub = (hubName: string) => {
    const newExpanded = new Set(expandedHubs)
    if (newExpanded.has(hubName)) {
      newExpanded.delete(hubName)
    } else {
      newExpanded.add(hubName)
    }
    setExpandedHubs(newExpanded)
  }

  const getActiveSection = () => {
    const activeItem = consolidatedNavigation.find(item => {
      if (item.href === pathname) return true
      if (item.subTabs) {
        return item.subTabs.some(subTab => subTab.href === pathname)
      }
      return false
    })
    return activeItem?.name || 'Dashboard'
  }

  const NavItem = ({ item }: { item: any }) => {
    const isActive = pathname === item.href || 
      (item.subTabs && item.subTabs.some((subTab: any) => pathname === subTab.href))
    const isExpanded = expandedHubs.has(item.name)
    const Icon = item.icon

    return (
      <div className="space-y-1" data-testid={item.testId}>
        <Button
          variant={isActive ? "default" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 h-12 px-4 group transition-all duration-200",
            isActive 
              ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg hover:shadow-xl" 
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 hover:shadow-md"
          )}
          onClick={() => {
            if (item.isHub) {
              toggleHub(item.name)
            } else {
              router.push(item.href)
              setIsMobileMenuOpen(false)
            }
          }}
        >
          <div className={cn(
            "p-2 rounded-lg transition-colors",
            isActive ? "bg-white/20" : item.bgColor
          )}>
            <Icon className={cn(
              "h-4 w-4 transition-colors",
              isActive ? "text-white" : item.color
            )} />
          </div>
          
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{item.name}</span>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <Badge 
                    variant={isActive ? "secondary" : "outline"} 
                    className="text-xs px-2 py-0.5"
                  >
                    {item.badge}
                  </Badge>
                )}
                {item.notifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {item.notifications}
                  </Badge>
                )}
                {item.isHub && (
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded ? "rotate-180" : ""
                  )} />
                )}
              </div>
            </div>
            <p className={cn(
              "text-xs mt-0.5 truncate",
              isActive ? "text-white/80" : "text-gray-500"
            )}>
              {item.description}
            </p>
          </div>
        </Button>

        {/* Sub-tabs */}
        {item.isHub && isExpanded && item.subTabs && (
          <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-4" data-testid={`sub-tabs-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
            {item.subTabs.map((subTab: any) => {
              const isSubActive = pathname === subTab.href
              
              return (
                <Button
                  key={subTab.name}
                  variant={isSubActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-2 h-10 text-sm group",
                    isSubActive 
                      ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-sm" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                  onClick={() => {
                    router.push(subTab.href)
                    setIsMobileMenuOpen(false)
                  }}
                  data-testid={`sub-tab-${subTab.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <subTab.icon className="h-3.5 w-3.5" />
                  <div className="flex-1 text-left">
                    <span className="truncate">{subTab.name}</span>
                    {subTab.description && (
                      <p className={cn(
                        "text-xs truncate",
                        isSubActive ? "text-white/70" : "text-gray-400"
                      )}>
                        {subTab.description}
                      </p>
                    )}
                  </div>
                  {subTab.badge && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 ml-auto">
                      {subTab.badge}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Enhanced Notification Item Component
  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const Icon = notification.icon || Bell
    const priorityColors = {
      high: 'border-l-red-500 bg-red-50',
      medium: 'border-l-yellow-500 bg-yellow-50',
      low: 'border-l-blue-500 bg-blue-50'
    }

    return (
      <div 
        className={cn(
          "p-4 border-l-4 hover:bg-gray-50 cursor-pointer transition-colors group",
          priorityColors[notification.priority],
          !notification.read ? 'bg-blue-50/50' : 'bg-white'
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            notification.read ? 'bg-gray-100' : 'bg-white shadow-sm'
          )}>
            <Icon className={cn("h-4 w-4", notification.color || 'text-gray-600')} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className={cn(
                "text-sm font-medium truncate",
                !notification.read ? 'text-gray-900' : 'text-gray-700'
              )}>
                {notification.title}
              </h4>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0" />
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{notification.timestamp}</span>
              {notification.actionLabel && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {notification.actionLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const notificationTypes = [
    { value: 'all', label: 'All', count: notificationState.notifications.length },
    { value: 'payment', label: 'Payments', count: notificationState.notifications.filter(n => n.type === 'payment').length },
    { value: 'project', label: 'Projects', count: notificationState.notifications.filter(n => n.type === 'project').length },
    { value: 'client', label: 'Clients', count: notificationState.notifications.filter(n => n.type === 'client').length },
    { value: 'team', label: 'Team', count: notificationState.notifications.filter(n => n.type === 'team').length },
    { value: 'deadline', label: 'Deadlines', count: notificationState.notifications.filter(n => n.type === 'deadline').length }
  ]

  const filteredNotifications = notificationState.selectedType === 'all' 
    ? notificationState.notifications 
    : notificationState.notifications.filter(n => n.type === notificationState.selectedType)

  return (
    <div className={cn("h-full bg-gradient-to-b from-gray-50 to-white", className)}>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        <h1 className="font-semibold text-lg">{getActiveSection()}</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-5 w-5" />
              {notificationState.unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {notificationState.unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: 'MARK_ALL_READ' })}
                className="h-6 text-xs"
              >
                Mark all read
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem key={notification.id} className="p-0">
                  <NotificationItem notification={notification} />
                </DropdownMenuItem>
              ))}
              {filteredNotifications.length > 5 && (
                <DropdownMenuItem>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => router.push('/dashboard/notifications')}
                  >
                    View all {filteredNotifications.length} notifications
                  </Button>
                </DropdownMenuItem>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Sidebar Navigation */}
      <div className={cn(
        "hidden lg:flex flex-col h-full w-72 border-r bg-white shadow-lg",
        "transform transition-transform duration-300 ease-in-out"
      )}>
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-gray-900" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">FreeflowZee</h1>
              <p className="text-sm text-gray-300">Freelancer Hub</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="flex-1 h-8">
              <Search className="h-3 w-3 mr-1" />
              Search
            </Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <Plus className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0 relative">
                  <Bell className="h-3 w-3" />
                  {notificationState.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications ({notificationState.unreadCount} unread)</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch({ type: 'MARK_ALL_READ' })}
                      className="h-6 text-xs"
                    >
                      Mark all read
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/dashboard/notifications')}
                      className="h-6 text-xs"
                    >
                      View all
                    </Button>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Notification Filters */}
                <div className="p-2">
                  <div className="flex flex-wrap gap-1">
                    {notificationTypes.map((type) => (
                      <Button
                        key={type.value}
                        variant={notificationState.selectedType === type.value ? "default" : "ghost"}
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => dispatch({ type: 'SET_FILTER', filter: type.value })}
                      >
                        {type.label} {type.count > 0 && `(${type.count})`}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {filteredNotifications.slice(0, 8).map((notification) => (
                    <DropdownMenuItem key={notification.id} className="p-0">
                      <NotificationItem notification={notification} />
                    </DropdownMenuItem>
                  ))}
                  {filteredNotifications.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications in this category</p>
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {consolidatedNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t bg-gray-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 h-12 p-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/user.jpg" />
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-gray-500">john@freeflowzee.com</p>
                </div>
                <Settings className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/notifications')}>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                  {notificationState.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 text-xs">
                      {notificationState.unreadCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Slide-out Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Slide-out Menu */}
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            {/* Mobile Header */}
            <div className="p-4 border-b bg-gradient-to-r from-gray-900 to-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-gray-900" />
                  </div>
                  <div>
                    <h1 className="font-bold text-white">FreeflowZee</h1>
                    <p className="text-xs text-gray-300">Freelancer Hub</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="p-4 h-full overflow-y-auto">
              <div className="space-y-2">
                {consolidatedNavigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}