'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  FolderOpen,
  Video,
  Users,
  Sparkles,
  Calendar,
  FileText,
  TrendingUp,
  Settings,
  LogOut,
  Palette,
  MessageSquare,
  Bell,
  DollarSign,
  Zap,
  Plug,
  Key
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: unknown
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
    href: '/dashboard/projects-hub-v2',
    icon: FolderOpen,
    description: 'Manage and track all your projects'
  },
  {
    name: 'Video Studio',
    href: '/dashboard/video-studio-v2',
    icon: Video,
    description: 'Professional video editing suite'
  },
  {
    name: 'Collaboration',
    href: '/dashboard/collaboration-v2',
    icon: Palette,
    description: 'Real-time design collaboration'
  },
  {
    name: 'Community Hub',
    href: '/dashboard/community-hub',
    icon: Users,
    description: 'Connect with creators worldwide'
  },
  {
    name: 'AI Design',
    href: '/dashboard/ai-design-v2',
    icon: Zap,
    description: 'AI-powered design tools'
  },
  {
    name: 'AI Create',
    href: '/dashboard/ai-create-v2',
    icon: Sparkles,
    description: 'Generate creative assets with AI'
  },
  {
    name: 'Growth Hub',
    href: '/dashboard/growth-hub-v2',
    icon: TrendingUp,
    description: 'AI-powered business growth & monetization',
    badge: 'New'
  },
  {
    name: 'My Day',
    href: '/dashboard/my-day-v2',
    icon: Calendar,
    description: 'Daily tasks and schedule management'
  },
  {
    name: 'Financial Hub',
    href: '/dashboard/financial-v2',
    icon: DollarSign,
    description: 'Secure payment protection'
  },
  {
    name: 'Files Hub',
    href: '/dashboard/files-hub-v2',
    icon: FileText,
    description: 'Professional file management'
  },
  {
    name: 'Messages',
    href: '/dashboard/messages-v2',
    icon: MessageSquare,
    description: 'Team communication tools'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics-v2',
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
    name: 'Calendar',
    href: '/dashboard/calendar-v2',
    icon: Calendar,
    description: 'Schedule and appointments'
  },
  {
    name: 'CV Portfolio',
    href: '/dashboard/cv-portfolio',
    icon: FileText,
    description: 'Professional portfolio showcase'
  },
  {
    name: 'Integrations',
    href: '/dashboard/integrations/setup',
    icon: Plug,
    description: 'Connect third-party services',
    badge: 'New'
  },
  {
    name: 'API Keys',
    href: '/dashboard/api-keys-v2',
    icon: Key,
    description: 'Manage your own API keys',
    badge: 'BYOK'
  },
  {
    name: 'Settings',
    href: '/dashboard/settings-v2',
    icon: Settings,
    description: 'Account and system settings'
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications-v2',
    icon: Bell,
    description: 'Updates and alerts'
  }
]

export function Sidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    console.log('Logout function called');
    // Clear authentication token from localStorage
    localStorage.removeItem('kazi-auth')
    localStorage.removeItem('kazi-user')
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user-data')
    localStorage.removeItem('session-data')
    console.log('LocalStorage cleared, redirecting...');
    // Redirect to homepage
    window.location.href = '/'
  }

  // Add vanilla JavaScript event handler to ensure it works
  useEffect(() => {
    const logoutBtn = document.querySelector('[data-testid="logout"]');
    if (logoutBtn) {
      console.log('Adding logout event listener');
      const handleClick = () => {
        console.log('Logout clicked via event listener');
        localStorage.removeItem('kazi-auth');
        localStorage.removeItem('kazi-user');
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-data');
        localStorage.removeItem('session-data');
        window.location.href = '/';
      };
      
      logoutBtn.addEventListener('click', handleClick);
      return () => logoutBtn.removeEventListener('click', handleClick);
    }
  }, []);

  return (
    <div className="flex flex-col h-full kazi-bg-light dark:kazi-bg-dark border-r border-gray-200 dark:border-gray-700">
      <div className="p-6 kazi-bg-light dark:kazi-bg-dark border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-8">
            <img 
              src="/kazi-brand/logo.svg" 
              alt="KAZI" 
              className="h-8 w-auto"
            />
            <h1 className="text-2xl font-bold kazi-text-dark dark:kazi-text-light kazi-headline">KAZI</h1>
          </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg group hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all duration-200 kazi-hover-scale',
                isActive && 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700'
              )}
            >
              <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div className="flex-1">
                <span className="block kazi-text-dark dark:kazi-text-light font-medium kazi-body-medium">{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-3 py-1 text-xs font-medium rounded-full kazi-gradient-primary text-white shadow-sm kazi-body">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          data-testid="logout"
          className="flex items-center gap-3 px-3 py-2 rounded-lg w-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors text-left kazi-focus"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
} 