'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BarChart,
  Calendar,
  Clock,
  FileText,
  Folder,
  Home,
  Settings,
  Users,
  Video,
} from 'lucide-react'

const routes = [
  {
    label: 'Overview',
    icon: Home,
    href: '/dashboard',
    color: 'text-sky-500',
  },
  {
    label: 'Projects',
    icon: Folder,
    href: '/dashboard/projects',
    color: 'text-violet-500',
  },
  {
    label: 'Time Tracking',
    icon: Clock,
    href: '/dashboard/time-tracking',
    color: 'text-pink-700',
  },
  {
    label: 'Calendar',
    icon: Calendar,
    href: '/dashboard/calendar',
    color: 'text-orange-700',
  },
  {
    label: 'Analytics',
    icon: BarChart,
    href: '/dashboard/analytics',
    color: 'text-green-700',
  },
  {
    label: 'Team',
    icon: Users,
    href: '/dashboard/team',
    color: 'text-blue-700',
  },
  {
    label: 'Documents',
    icon: FileText,
    href: '/dashboard/documents',
    color: 'text-yellow-700',
  },
  {
    label: 'Videos',
    icon: Video,
    href: '/dashboard/videos',
    color: 'text-purple-700',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
    color: 'text-gray-700',
  },
]

interface DashboardNavProps {
  className?: string
}

export function DashboardNav({ className }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn('flex flex-col space-y-1', className)}>
      {routes.map((route) => {
        const Icon = route.icon
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors',
              pathname === route.href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-primary',
              'group'
            )}
          >
            <Icon className={cn('h-5 w-5 mr-3 shrink-0', route.color)} />
            {route.label}
          </Link>
        )
      })}
    </nav>
  )
} 