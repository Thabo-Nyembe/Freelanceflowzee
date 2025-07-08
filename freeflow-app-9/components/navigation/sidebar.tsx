'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  FolderClosed,
  Video,
  Users,
  Sparkles,
  Calendar,
  Shield,
  FileText,
  TrendingUp,
  LayoutDashboard,
  Settings,
  LogOut,
  Palette,
  Bot,
  MessageSquare,
  Bell,
  DollarSign,
  Brain
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: any
  badge?: string
  description?: string
}

// Restored original sidebar items to match the design
const sidebarItems: SidebarItem[] = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Dashboard overview and analytics'
  },
  {
    name: 'Projects Hub',
    href: '/dashboard/projects-hub',
    icon: FolderClosed,
    badge: 'A+++',
    description: 'Manage and track all your projects'
  },
  {
    name: 'Video Studio',
    href: '/dashboard/video-studio',
    icon: Video,
    badge: 'A+++',
    description: 'Professional video editing suite'
  },
  {
    name: 'Canvas Collaboration',
    href: '/dashboard/canvas-collaboration',
    icon: Palette,
    badge: 'A+++',
    description: 'Real-time design collaboration'
  },
  {
    name: 'Community',
    href: '/dashboard/community',
    icon: Users,
    badge: 'A+++',
    description: 'Connect with creators worldwide'
  },
  {
    name: 'AI Assistant',
    href: '/dashboard/ai-assistant',
    icon: Bot,
    badge: 'A+++',
    description: 'AI-powered workflow optimization'
  },
  {
    name: 'AI Create',
    href: '/dashboard/ai-create',
    icon: Sparkles,
    badge: 'A+++',
    description: 'Generate creative assets with AI'
  },
  {
    name: 'My Day',
    href: '/dashboard/my-day',
    icon: Calendar,
    badge: 'A+++',
    description: 'Daily tasks and schedule management'
  },
  {
    name: 'Escrow',
    href: '/dashboard/escrow',
    icon: Shield,
    badge: 'A+++',
    description: 'Secure payment protection'
  },
  {
    name: 'Files Hub',
    href: '/dashboard/files-hub',
    icon: FileText,
    badge: 'A+++',
    description: 'Professional file management'
  },
  {
    name: 'Collaboration',
    href: '/dashboard/collaboration',
    icon: MessageSquare,
    description: 'Team communication tools'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: TrendingUp,
    description: 'Performance insights and metrics'
  },
  {
    name: 'Client Zone',
    href: '/dashboard/client-zone',
    icon: Users,
    description: 'Client portal and management'
  },
  {
    name: 'Financial Hub',
    href: '/dashboard/financial-hub',
    icon: DollarSign,
    description: 'Invoicing and payments'
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
    description: 'Updates and alerts'
  }
]

export function Sidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    // Clear authentication token from localStorage
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user-data')
    localStorage.removeItem('session-data')
    // Redirect to homepage
    window.location.href = '/'
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
      <div className="p-6 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">FreeflowZee</h1>
        <h2 className="text-sm text-gray-600">Enterprise Dashboard</h2>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg group hover:bg-white hover:shadow-sm transition-all duration-200',
                isActive && 'bg-white shadow-sm border border-gray-200'
              )}
            >
              <item.icon className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <span className="block text-gray-900 font-medium">{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          data-testid="logout"
          className="flex items-center gap-3 px-3 py-2 rounded-lg w-full hover:bg-red-50 hover:text-red-600 transition-colors text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
} 