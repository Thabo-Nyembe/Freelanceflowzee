'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutGrid,
  Library,
  Video,
  Users,
  Bot,
  Wand2,
  Calendar,
  Lock,
  FolderOpen,
  Users2,
  BarChart,
  UserCircle,
  Wallet,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Star
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayoutClient({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const routes = [
    {
      label: 'Overview',
      icon: LayoutGrid,
      href: '/dashboard',
      color: 'text-sky-500'
    },
    {
      label: 'Projects Hub (A+++)',
      icon: Library,
      href: '/projects',
      color: 'text-violet-500'
    },
    {
      label: 'Video Studio (A+++)',
      icon: Video,
      href: '/video',
      color: 'text-pink-700'
    },
    {
      label: 'Canvas Collaboration (A+++)',
      icon: Users,
      href: '/canvas',
      color: 'text-orange-700'
    },
    {
      label: 'Community (A+++)',
      icon: Users2,
      href: '/community',
      color: 'text-green-700'
    },
    {
      label: 'AI Assistant (A+++)',
      icon: Bot,
      href: '/ai-assistant',
      color: 'text-blue-700'
    },
    {
      label: 'AI Create (A+++)',
      icon: Wand2,
      href: '/ai-create',
      color: 'text-purple-700'
    },
    {
      label: 'My Day (A+++)',
      icon: Calendar,
      href: '/my-day',
      color: 'text-yellow-700'
    },
    {
      label: 'Escrow (A+++)',
      icon: Lock,
      href: '/escrow',
      color: 'text-red-700'
    },
    {
      label: 'Files Hub (A+++)',
      icon: FolderOpen,
      href: '/files',
      color: 'text-teal-700'
    },
    {
      label: 'Collaboration',
      icon: Users,
      href: '/collaboration',
      color: 'text-indigo-500'
    },
    {
      label: 'Analytics',
      icon: BarChart,
      href: '/analytics',
      color: 'text-rose-500'
    },
    {
      label: 'Client Zone',
      icon: UserCircle,
      href: '/client-zone',
      color: 'text-emerald-500'
    },
    {
      label: 'Financial Hub',
      icon: Wallet,
      href: '/financial',
      color: 'text-amber-500'
    },
    {
      label: 'Notifications',
      icon: Bell,
      href: '/notifications',
      color: 'text-cyan-500'
    }
  ]

  return (
    <div className="flex min-h-screen">
      <div 
        className={cn(
          'glass-card relative flex flex-col gap-4 p-4 pt-8 border-r transition-all duration-300',
          isCollapsed ? 'w-[80px]' : 'w-[250px]'
        )}
      >
        <div className="absolute right-[-12px] top-6">
          <Button
            variant="ghost"
            size="icon"
            className="glass-button rounded-full w-6 h-6"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 px-2">
          {!isCollapsed && (
            <>
              <Star className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="font-semibold">FreeFlow</h1>
                <p className="text-xs text-muted-foreground">Professional Platform</p>
              </div>
            </>
          )}
          {isCollapsed && (
            <Star className="h-8 w-8 text-purple-600 mx-auto" />
          )}
        </div>

        <ScrollArea className="flex-1 pt-4">
          <div className="space-y-2 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex items-center gap-x-2 text-slate-500 text-sm font-medium px-3 py-2 hover:text-slate-600 hover:bg-slate-300/20 rounded-lg transition-all',
                  pathname === route.href && 'glass-button text-slate-700 hover:bg-white/80',
                  isCollapsed && 'justify-center'
                )}
              >
                <route.icon className={cn('h-5 w-5', route.color)} />
                {!isCollapsed && (
                  <span>{route.label}</span>
                )}
              </Link>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-auto px-2 space-y-2">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-x-2 text-slate-500 text-sm font-medium px-3 py-2 hover:text-slate-600 hover:bg-slate-300/20 rounded-lg transition-all',
              pathname === '/settings' && 'glass-button text-slate-700 hover:bg-white/80',
              isCollapsed && 'justify-center'
            )}
          >
            <Settings className="h-5 w-5" />
            {!isCollapsed && (
              <span>Settings</span>
            )}
          </Link>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start text-slate-500 text-sm font-medium hover:text-slate-600 hover:bg-slate-300/20',
              isCollapsed && 'justify-center'
            )}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && (
              <span className="ml-2">Logout</span>
            )}
          </Button>
        </div>
      </div>

      <main className="flex-1 h-full p-6">
        {children}
      </main>
    </div>
  )
} 