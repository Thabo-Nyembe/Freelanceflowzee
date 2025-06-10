'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Sparkles,
  Rocket
} from 'lucide-react'

// Framework7-inspired navigation structure
const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Overview & analytics'
  },
  { 
    name: 'My Day', 
    href: '/dashboard/my-day', 
    icon: Calendar, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Today\'s schedule'
  },
  { 
    name: 'Projects', 
    href: '/projects', 
    icon: FolderOpen, 
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Manage projects',
    badge: '12'
  },
  { 
    name: 'Project Tracker', 
    href: '/dashboard/project-tracker', 
    icon: Target, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Track progress'
  },
  { 
    name: 'Time Tracking', 
    href: '/dashboard/time-tracking', 
    icon: Clock, 
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Monitor hours'
  },
  { 
    name: 'Clients', 
    href: '/dashboard/clients', 
    icon: UserCheck, 
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    description: 'Client relationships'
  },
  { 
    name: 'Bookings', 
    href: '/dashboard/bookings', 
    icon: CalendarDays, 
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Manage appointments',
    badge: '5'
  },
  { 
    name: 'Team', 
    href: '/dashboard/team', 
    icon: Users, 
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    description: 'Team management'
  },
  { 
    name: 'Financial', 
    href: '/dashboard/financial', 
    icon: DollarSign, 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    description: 'Revenue & invoices'
  },
  { 
    name: 'Files', 
    href: '/dashboard/files', 
    icon: Archive, 
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    description: 'Document storage'
  },
  { 
    name: 'AI Assistant', 
    href: '/dashboard/ai-assistant', 
    icon: Sparkles, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Smart insights & automation',
    badge: 'AI'
  },
  { 
    name: 'Workflow Builder', 
    href: '/dashboard/workflow-builder', 
    icon: Zap, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Create custom automations'
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: TrendingUp, 
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Business insights'
  },
  { 
    name: 'Community', 
    href: '/dashboard/community', 
    icon: MessageSquare, 
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    description: 'Connect & collaborate'
  },
  { 
    name: 'Profile', 
    href: '/dashboard/profile', 
    icon: User, 
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    description: 'Account settings'
  },
  { 
    name: 'Notifications', 
    href: '/dashboard/notifications', 
    icon: Bell, 
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'Stay updated',
    badge: '3'
  }
]

const quickActions = [
  { name: 'New Project', icon: FolderOpen, href: '/projects/new', color: 'text-blue-600' },
  { name: 'Add Client', icon: UserCheck, href: '/dashboard/clients?action=new', color: 'text-green-600' },
  { name: 'Create Invoice', icon: Receipt, href: '/dashboard/financial?action=invoice', color: 'text-purple-600' },
  { name: 'Start Timer', icon: Clock, href: '/dashboard/time-tracking?action=start', color: 'text-orange-600' }
]

interface DashboardNavProps {
  className?: string
}

export function DashboardNav({ className }: DashboardNavProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(3)

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const filteredNavigation = navigation.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const NavItem = ({ item }: { item: any }) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
    
    return (
      <Link
        href={item.href}
        className={cn(
          'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-gray-50',
          isActive 
            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100' 
            : 'text-gray-700 hover:text-gray-900'
        )}
      >
        <div className={cn(
          'p-2 rounded-lg transition-all duration-200',
          isActive 
            ? `${item.bgColor} ${item.color}` 
            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
        )}>
          <item.icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="truncate">{item.name}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-2 px-2 py-0.5 text-xs">
                {item.badge}
              </Badge>
            )}
          </div>
          {!isMobileOpen && (
            <p className="text-xs text-gray-500 truncate">{item.description}</p>
          )}
        </div>
        {isActive && (
          <ChevronRight className="h-4 w-4 text-blue-600" />
        )}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FreeflowT
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                  {notifications}
                </Badge>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/john.jpg" alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      JD
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      john@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-40 w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        className
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FreeflowT
                </h1>
                <p className="text-xs text-gray-500">Modern Freelance Platform</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="space-y-1">
              {filteredNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <div className={cn('p-2 rounded-lg bg-white shadow-sm', action.color)}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center group-hover:text-gray-900">
                      {action.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatars/john.jpg" alt="Profile" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">Premium Account</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Privacy & Security</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Award className="mr-2 h-4 w-4" />
                    <span>Upgrade Plan</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

export default DashboardNav 