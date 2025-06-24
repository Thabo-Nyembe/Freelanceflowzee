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
  Activity,
  Crown,
  Gem,
  PlusCircle,
  ChevronLeft,
  BarChart3,
  Cpu,
  Video
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import type { LucideIcon } from 'lucide-react'

// ========================================
// ENHANCED CONSOLIDATED NAVIGATION STRUCTURE
// ========================================

// Main navigation hubs with consolidated features and better organization
interface NavigationItem {
  href: string
  title: string
  icon: LucideIcon
  badge?: string
  description: string
  features?: string[]
  name?: string
  notifications?: number
}

const navigationItems: NavigationItem[] = [
  {
    href: '/dashboard',
    title: 'Overview',
    icon: LayoutDashboard,
    badge: 'A+++',
    description: 'Main dashboard overview'
  },
  {
    href: '/dashboard/projects-hub',
    title: 'Projects Hub',
    icon: FolderOpen,
    badge: 'A+++',
    description: 'Universal Pinpoint Feedback System',
    features: ['Multi-media commenting', 'AI-powered analysis', 'Real-time collaboration']
  },
  {
    href: '/dashboard/my-day',
    title: 'My Day Today',
    icon: Calendar,
    badge: 'A+++',
    description: 'AI-Powered Daily Planning',
    features: ['Smart task management', 'AI insights', 'Progress tracking']
  },
  {
    href: '/dashboard/files-hub',
    title: 'Files Hub',
    icon: FileText,
    badge: 'A+++',
    description: 'Advanced File Management',
    features: ['Multi-cloud storage', 'Smart organization', 'Secure sharing']
  },
  {
    href: '/dashboard/video-studio',
    title: 'Video Studio',
    icon: Video,
    badge: 'A+++',
    description: 'Professional Video Tools',
    features: ['Screen recording', 'Video editing', 'Collaboration']
  },
  {
    href: '/dashboard/escrow',
    title: 'Escrow System',
    icon: Shield,
    badge: 'A+++',
    description: 'Secure Payment System',
    features: ['Milestone tracking', 'Secure payments', 'Project protection']
  },
  {
    href: '/dashboard/client-portal',
    title: 'Client Portal',
    icon: Users,
    badge: 'A+++',
    description: 'Enhanced Client Management',
    features: ['Project access', 'Feedback system', 'File sharing']
  },
  {
    href: '/dashboard/analytics',
    title: 'Analytics',
    icon: BarChart3,
    badge: 'A+++',
    description: 'Advanced Analytics',
    features: ['Revenue tracking', 'Project metrics', 'Performance insights']
  }
]

// For backwards compatibility with existing code
const consolidatedNavigation = navigationItems.map(item => ({
  ...item,
  name: item.title,
  notifications: 0
}));

// ========================================
// IMPROVED DROPDOWN SYSTEM
// ========================================

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'start' | 'end' | 'center'
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

function ImprovedDropdown({ trigger, children, align = 'start', side = 'bottom', className }: DropdownProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="focus:outline-none">
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        className={cn(
          'dropdown-menu',
          'min-w-[220px] max-h-[400px] overflow-y-auto',
          'bg-white/98 backdrop-blur-xl border border-gray-200',
          'rounded-xl shadow-lg z-dropdown',
          'animate-in slide-in-from-top-2 duration-200',
          className
        )}
        sideOffset={8}
        collisionPadding={16}
        avoidCollisions
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

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
      const deletedNotification = state.notifications.find(n => n.id === action.id)
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id),
        unreadCount: deletedNotification && !deletedNotification.read 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount
      }
    case 'SET_FILTER':
      return {
        ...state,
        selectedType: action.filter
      }
    case 'TOGGLE_EXPANDED':
      return {
        ...state,
        isExpanded: !state.isExpanded
      }
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
  onLogout?: () => void
  user?: any
  setOpen?: (open: boolean) => void
}

export function DashboardNav({ className, onLogout, user, setOpen }: DashboardNavProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-semibold text-gray-900">FreeflowZee</span>
        </Link>
        
        <button
          onClick={toggleMobileMenu}
          className="mobile-menu-button"
          aria-label="Toggle mobile menu"
          data-testid="mobile-menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-purple-100/80 backdrop-blur-sm" onClick={toggleMobileMenu} />
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">Menu</span>
              <button
                onClick={toggleMobileMenu}
                className="button-touch"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {consolidatedNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={toggleMobileMenu}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors button-touch",
                    pathname === item.href
                      ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile User Section */}
              <div className="pt-4 mt-4 border-t space-y-2">
                <div className="px-3 py-2">
                  <div className="text-sm font-medium text-gray-900">{user?.email}</div>
                  <div className="text-xs text-gray-500">Creator Account</div>
                </div>
                <button
                  onClick={() => {
                    onLogout?.();
                    toggleMobileMenu();
                  }}
                  className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 button-touch"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out desktop-only",
        collapsed ? "-translate-x-48" : "translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              {!collapsed && <span className="font-semibold text-gray-900">FreeflowZee</span>}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="button-touch"
              data-testid="sidebar-toggle"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {consolidatedNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors button-touch",
                  pathname === item.href
                    ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                data-testid={`nav-${item.href.split('/').pop()}`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          {!collapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </div>
                  <div className="text-xs text-gray-500">Creator Account</div>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => onLogout?.()}
                className="w-full mt-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50 button-touch"
                data-testid="logout-button"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-nav-container lg:hidden">
        <div className="flex justify-around items-center">
          {consolidatedNavigation.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mobile-nav-item",
                pathname === item.href ? "active" : ""
              )}
              data-testid={`mobile-nav-${item.href.split('/').pop()}`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}