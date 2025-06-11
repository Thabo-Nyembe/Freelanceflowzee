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
  MoreHorizontal
} from 'lucide-react'

// ========================================
// CONSOLIDATED NAVIGATION STRUCTURE
// ========================================

// Main navigation hubs with consolidated features
const consolidatedNavigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Overview & insights',
    notifications: 0
  },
  { 
    name: 'My Day Today', 
    href: '/dashboard/my-day', 
    icon: Calendar, 
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    description: 'AI-powered daily planning',
    badge: 'AI',
    notifications: 3
  },
  { 
    name: 'Projects Hub', 
    href: '/dashboard/projects-hub', 
    icon: FolderOpen, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Projects • Collaboration • Client Delivery',
    subTabs: [
      { name: 'Project Tracking', href: '/dashboard/project-tracker', icon: Target },
      { name: 'Client Collaboration', href: '/dashboard/collaboration', icon: MessageSquare },
      { name: 'Client Zone Gallery', href: '/dashboard/client-zone', icon: Eye }
    ],
    notifications: 5,
    isHub: true
  },
  { 
    name: 'Team Hub', 
    href: '/dashboard/team-hub', 
    icon: Users, 
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    description: 'Team • Shared Calendar',
    subTabs: [
      { name: 'Team Members', href: '/dashboard/team', icon: UserCheck },
      { name: 'Shared Calendar', href: '/dashboard/calendar', icon: CalendarDays }
    ],
    notifications: 2,
    isHub: true
  },
  { 
    name: 'Financial Hub', 
    href: '/dashboard/financial-hub', 
    icon: DollarSign, 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    description: 'Escrow • Invoices',
    subTabs: [
      { name: 'Escrow System', href: '/dashboard/escrow', icon: Shield },
      { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt }
    ],
    notifications: 1,
    isHub: true
  },
  { 
    name: 'Files Hub', 
    href: '/dashboard/files-hub', 
    icon: Archive, 
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Cloud Storage • Portfolio Gallery',
    subTabs: [
      { name: 'Cloud Storage', href: '/dashboard/cloud-storage', icon: Cloud, badge: '10GB' },
      { name: 'Portfolio Gallery', href: '/dashboard/gallery', icon: Image }
    ],
    notifications: 0,
    isHub: true
  },
  { 
    name: 'Profile', 
    href: '/dashboard/profile', 
    icon: User, 
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    description: 'Settings & preferences',
    notifications: 0
  },
  { 
    name: 'Notifications', 
    href: '/dashboard/notifications', 
    icon: Bell, 
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Stay up to date',
    notifications: 8,
    badge: '8'
  }
]

// ========================================
// NOTIFICATION SYSTEM
// ========================================

interface Notification {
  id: string
  type: 'payment' | 'project' | 'team' | 'client' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'high' | 'medium' | 'low'
  actionUrl?: string
  actionLabel?: string
}

// Mock notifications data with smart routing
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
    actionLabel: 'View Escrow'
  },
  {
    id: '2',
    type: 'client',
    title: 'New Client Feedback',
    message: 'Sarah Johnson left feedback on your logo design',
    timestamp: '15 minutes ago',
    read: false,
    priority: 'medium',
    actionUrl: '/dashboard/collaboration',
    actionLabel: 'View Feedback'
  },
  {
    id: '3',
    type: 'project',
    title: 'Project Milestone Completed',
    message: 'Website Design Phase 1 has been marked as complete',
    timestamp: '1 hour ago',
    read: false,
    priority: 'medium',
    actionUrl: '/dashboard/projects-hub',
    actionLabel: 'View Project'
  },
  {
    id: '4',
    type: 'team',
    title: 'Team Meeting Reminder',
    message: 'Weekly standup meeting starts in 30 minutes',
    timestamp: '2 hours ago',
    read: true,
    priority: 'low',
    actionUrl: '/dashboard/team-hub',
    actionLabel: 'Join Meeting'
  },
  {
    id: '5',
    type: 'system',
    title: 'Storage Almost Full',
    message: 'Your cloud storage is 85% full. Consider upgrading.',
    timestamp: '3 hours ago',
    read: true,
    priority: 'low',
    actionUrl: '/dashboard/files-hub',
    actionLabel: 'Manage Storage'
  }
]

// ========================================
// NOTIFICATION STATE MANAGEMENT
// ========================================

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  selectedType: string
}

type NotificationAction = 
  | { type: 'MARK_READ'; id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'DELETE'; id: string }
  | { type: 'SET_FILTER'; filter: string }

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.id ? { ...n, read: true } : n
        ),
        unreadCount: state.notifications.filter(n => 
          !n.read && n.id !== action.id
        ).length
      }
    
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }
    
    case 'DELETE':
      const updatedNotifications = state.notifications.filter(n => n.id !== action.id)
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      }
    
    case 'SET_FILTER':
      return {
        ...state,
        selectedType: action.filter
      }
    
    default:
      return state
  }
}

// ========================================
// MAIN COMPONENT
// ========================================

interface DashboardNavProps {
  className?: string
}

export function DashboardNav({ className }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedHubs, setExpandedHubs] = useState<string[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Initialize notification state
  const [notificationState, dispatch] = useReducer(notificationReducer, {
    notifications: mockNotifications,
    unreadCount: mockNotifications.filter(n => !n.read).length,
    selectedType: 'all'
  })

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    dispatch({ type: 'MARK_READ', id: notification.id })
    
    // Close dropdown
    setShowNotifications(false)
    
    // Navigate to action URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const toggleHub = (hubName: string) => {
    setExpandedHubs(prev => 
      prev.includes(hubName) 
        ? prev.filter(h => h !== hubName)
        : [...prev, hubName]
    )
  }

  const getActiveSection = () => {
    return consolidatedNavigation.find(item => 
      item.href === pathname || 
      (item.subTabs && item.subTabs.some(sub => sub.href === pathname))
    )
  }

  const activeSection = getActiveSection()

  const NavItem = ({ item }: { item: any }) => {
    const isActive = pathname === item.href
    const isHubExpanded = expandedHubs.includes(item.name)
    const hasActiveSubTab = item.subTabs?.some((sub: any) => pathname === sub.href)
    
    return (
      <div className="space-y-1" data-testid={`nav-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
        <Button
          variant={isActive ? "default" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 h-12 text-left font-medium transition-all duration-200",
            isActive 
              ? `${item.color} bg-gradient-to-r ${item.bgColor} shadow-md border-l-4 border-current` 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
            hasActiveSubTab && !isActive && "bg-gray-50 text-gray-900"
          )}
          onClick={() => {
            if (item.isHub) {
              toggleHub(item.name)
            } else {
              router.push(item.href)
            }
            setIsMobileMenuOpen(false)
          }}
        >
          <div className={cn(
            "p-2 rounded-lg transition-colors",
            isActive ? item.bgColor : "bg-gray-100"
          )}>
            <item.icon className={cn(
              "h-4 w-4",
              isActive ? item.color : "text-gray-600"
            )} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate">{item.name}</span>
              {item.badge && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs px-2 py-0.5",
                    item.badge === 'AI' && "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{item.description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {item.notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="h-5 min-w-[20px] text-xs px-1.5"
                data-testid={`notification-badge-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.notifications}
              </Badge>
            )}
            
            {item.isHub && (
              <ChevronRight 
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isHubExpanded && "rotate-90"
                )} 
              />
            )}
          </div>
        </Button>

        {/* Sub-tabs for hubs */}
        {item.isHub && isHubExpanded && item.subTabs && (
          <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-4" data-testid={`sub-tabs-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
            {item.subTabs.map((subTab: any) => {
              const isSubActive = pathname === subTab.href
              
              return (
                <Button
                  key={subTab.name}
                  variant={isSubActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-2 h-9 text-sm",
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
                  <span className="truncate">{subTab.name}</span>
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

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const Icon = notification.type === 'payment' ? DollarSign :
                notification.type === 'project' ? Target :
                notification.type === 'team' ? Users :
                notification.type === 'client' ? MessageSquare :
                Bell

    const priorityColor = notification.priority === 'high' ? 'text-red-600' :
                         notification.priority === 'medium' ? 'text-yellow-600' :
                         'text-gray-600'

    return (
      <DropdownMenuItem
        className={cn(
          "flex-col items-start gap-2 p-3 cursor-pointer",
          !notification.read && "bg-blue-50"
        )}
        onClick={() => handleNotificationClick(notification)}
        data-testid={`notification-${notification.id}`}
      >
        <div className="flex items-start gap-3 w-full">
          <div className={cn("p-1.5 rounded-lg", notification.read ? "bg-gray-100" : "bg-blue-100")}>
            <Icon className={cn("h-4 w-4", notification.read ? "text-gray-600" : priorityColor)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className={cn(
                "font-medium text-sm truncate",
                !notification.read && "text-gray-900"
              )}>
                {notification.title}
              </h4>
              <span className="text-xs text-gray-500 shrink-0">
                {notification.timestamp}
              </span>
            </div>
            
            <p className={cn(
              "text-xs mt-1 line-clamp-2",
              notification.read ? "text-gray-500" : "text-gray-700"
            )}>
              {notification.message}
            </p>
            
            {notification.actionLabel && (
              <div className="flex items-center gap-1 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-6 text-xs px-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNotificationClick(notification)
                  }}
                >
                  {notification.actionLabel}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DropdownMenuItem>
    )
  }

  return (
    <nav className={cn(
      "fixed left-0 top-0 z-50 h-full w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
      isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
      "lg:static lg:transform-none",
      className
    )} data-testid="dashboard-navigation">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          data-testid="mobile-overlay"
        />
      )}

      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-bold text-lg">Navigation</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="mobile-menu-toggle"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation Content */}
      <div className={cn(
        "flex flex-col h-full",
        "lg:block",
        isMobileMenuOpen ? "block" : "hidden lg:block"
      )}>
        {/* Header */}
        <div className="hidden lg:flex items-center gap-3 p-6 border-b border-gray-200/50">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
            <Rocket className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FreeflowZee
            </h2>
            <p className="text-xs text-gray-500">Professional Dashboard</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200/50">
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start text-xs"
              onClick={() => router.push('/projects/new')}
              data-testid="quick-add-project"
            >
              <Target className="h-3 w-3 mr-1" />
              Project
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start text-xs"
              onClick={() => router.push('/dashboard/calendar')}
              data-testid="quick-calendar"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Calendar
            </Button>
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start text-xs relative"
                  data-testid="notifications-dropdown-trigger"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Alerts
                  {notificationState.unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 min-w-[20px] text-xs px-1"
                    >
                      {notificationState.unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-96 max-h-96 overflow-y-auto" 
                align="start"
                data-testid="notifications-dropdown"
              >
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch({ type: 'MARK_ALL_READ' })}
                    className="h-6 text-xs"
                    data-testid="mark-all-read"
                  >
                    Mark all read
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {notificationState.notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-2 p-2">
                    {notificationState.notifications.slice(0, 5).map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                    
                    {notificationState.notifications.length > 5 && (
                      <DropdownMenuItem
                        className="justify-center text-blue-600 font-medium"
                        onClick={() => {
                          setShowNotifications(false)
                          router.push('/dashboard/notifications')
                        }}
                        data-testid="view-all-notifications"
                      >
                        View all {notificationState.notifications.length} notifications
                      </DropdownMenuItem>
                    )}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2" data-testid="main-navigation">
          {consolidatedNavigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>

        {/* Current Context */}
        {activeSection && (
          <div className="p-4 border-t border-gray-200/50 bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <activeSection.icon className="h-4 w-4" />
              <span className="font-medium">{activeSection.name}</span>
              {activeSection.notifications > 0 && (
                <Badge variant="outline" className="text-xs">
                  {activeSection.notifications} updates
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* User Menu */}
        <div className="p-4 border-t border-gray-200/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start p-2 h-auto"
                data-testid="user-menu-trigger"
              >
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src="/avatars/user.jpg" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">John Doe</div>
                  <div className="text-xs text-gray-500">Creative Director</div>
                </div>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" data-testid="user-menu">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/notifications')}>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                  {notificationState.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {notificationState.unreadCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}