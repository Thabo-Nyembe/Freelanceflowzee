'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  FolderClosed,
  Video,
  Users,
  Brain,
  Sparkles,
  Calendar,
  Shield,
  FileText,
  MessageSquare,
  TrendingUp,
  UserCircle,
  Wallet,
  Bell,
  Palette,
  Layers
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: unknown
  badge?: string
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: BarChart3
  },
  {
    name: 'Projects Hub',
    href: '/dashboard/projects-hub',
    icon: FolderClosed,
    badge: 'A+++'
  },
  {
    name: 'Video Studio',
    href: '/dashboard/video-studio',
    icon: Video,
    badge: 'A+++'
  },
  {
    name: 'Canvas Collaboration',
    href: '/dashboard/canvas',
    icon: Palette,
    badge: 'A+++'
  },
  {
    name: 'Community',
    href: '/dashboard/community',
    icon: Users,
    badge: 'A+++'
  },
  {
    name: 'AI Assistant',
    href: '/dashboard/ai-assistant',
    icon: Brain,
    badge: 'A+++'
  },
  {
    name: 'AI Create',
    href: '/dashboard/ai-create',
    icon: Sparkles,
    badge: 'A+++'
  },
  {
    name: 'My Day',
    href: '/dashboard/my-day',
    icon: Calendar,
    badge: 'A+++'
  },
  {
    name: 'Escrow',
    href: '/dashboard/escrow',
    icon: Shield,
    badge: 'A+++'
  },
  {
    name: 'Files Hub',
    href: '/dashboard/files-hub',
    icon: FileText,
    badge: 'A+++'
  },
  {
    name: 'Collaboration',
    href: '/dashboard/collaboration',
    icon: MessageSquare
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: TrendingUp
  },
  {
    name: 'Client Zone',
    href: '/dashboard/client-zone',
    icon: UserCircle
  },
  {
    name: 'Financial Hub',
    href: '/dashboard/financial-hub',
    icon: Wallet
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell
  }
]

export function UnifiedSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
            <img 
              src="/kazi-brand/logo.svg" 
              alt="KAZI" 
              className="h-8 w-auto"
            />
            <h1 className="text-2xl font-bold">KAZI</h1>
          </div>
        <h2 className="text-lg text-muted-foreground">Enterprise Dashboard</h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg group hover:bg-accent',
                isActive && 'bg-accent'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="px-2 py-1 text-sm rounded-full bg-purple-100 text-purple-900">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 