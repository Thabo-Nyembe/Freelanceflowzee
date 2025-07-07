'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Home,
  Calendar,
  Users,
  FileText,
  Settings,
  Video,
  MessageSquare,
  Bell,
  FolderOpen,
  BarChart2,
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: React.ReactNode
}

const mainNavItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
  { name: 'Calendar', href: '/calendar', icon: <Calendar className="w-5 h-5" /> },
  { name: 'Team', href: '/team', icon: <Users className="w-5 h-5" /> },
  { name: 'Documents', href: '/documents', icon: <FileText className="w-5 h-5" /> },
  { name: 'Videos', href: '/videos', icon: <Video className="w-5 h-5" /> },
  { name: 'Chat', href: '/chat', icon: <MessageSquare className="w-5 h-5" /> },
]

const secondaryNavItems: SidebarItem[] = [
  { name: 'Projects', href: '/projects', icon: <FolderOpen className="w-5 h-5" /> },
  { name: 'Analytics', href: '/analytics', icon: <BarChart2 className="w-5 h-5" /> },
  { name: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
  { name: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
]

export default function UnifiedSidebar() {
  const pathname = usePathname()

  const NavItem = ({ item }: { item: SidebarItem }) => (
    <Link href={item.href}>
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start gap-2 px-2',
          pathname === item.href && 'bg-muted'
        )}
      >
        {item.icon}
        <span>{item.name}</span>
      </Button>
    </Link>
  )

  return (
    <div className="flex flex-col h-screen w-64 border-r bg-background p-4 space-y-4">
      <div className="flex items-center justify-center h-16">
        <h1 className="text-2xl font-bold">FreeFlowZee</h1>
      </div>

      <nav className="space-y-1">
        <div className="py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Main Menu</h2>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>

        <div className="py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Tools</h2>
          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">john@example.com</p>
          </div>
        </div>
      </div>
    </div>
  )
} 