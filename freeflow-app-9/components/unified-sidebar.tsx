'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { GlowEffect } from '@/components/ui/glow-effect'
import { BorderTrail } from '@/components/ui/border-trail'
import { motion } from 'framer-motion'
import { prefetchOnHover } from '@/lib/route-utils'
import {
  BarChart3,
  FolderOpen,
  Video,
  Users,
  Sparkles,
  Calendar,
  Shield,
  FileText,
  MessageSquare,
  TrendingUp,
  UserCircle,
  Bell,
  Palette,
  Layers,
  Zap,
  Monitor,
  DollarSign
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
    icon: FolderOpen
  },
  {
    name: 'Video Studio',
    href: '/dashboard/video-studio',
    icon: Video
  },
  {
    name: 'Canvas Collaboration',
    href: '/dashboard/canvas',
    icon: Monitor
  },
  {
    name: 'Community',
    href: '/dashboard/community-hub',
    icon: Users
  },
  {
    name: 'AI Assistant',
    href: '/dashboard/ai-assistant',
    icon: Zap
  },
  {
    name: 'AI Create',
    href: '/dashboard/ai-create',
    icon: Sparkles
  },
  {
    name: 'My Day',
    href: '/dashboard/my-day',
    icon: Calendar
  },
  {
    name: 'Escrow',
    href: '/dashboard/escrow',
    icon: Shield
  },
  {
    name: 'Files Hub',
    href: '/dashboard/files-hub',
    icon: FileText
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
    icon: DollarSign
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
    <div className="flex flex-col h-full relative group/sidebar">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent opacity-50" />
      <BorderTrail className="bg-gradient-to-b from-purple-500 via-blue-500 to-purple-500" size={30} duration={10} />

      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-8 group/logo">
          <div className="relative">
            <GlowEffect className="absolute -inset-2 bg-gradient-to-r from-purple-500/50 to-blue-500/50 rounded-lg blur opacity-0 group-hover/logo:opacity-75 transition-opacity duration-300" />
            <img
              src="/kazi-brand/logo.svg"
              alt="KAZI"
              className="h-8 w-auto relative z-10 transition-transform duration-300 group-hover/logo:scale-110"
            />
          </div>
          <TextShimmer className="text-2xl font-bold" duration={2}>
            KAZI
          </TextShimmer>
        </div>
        <h2 className="text-lg text-gray-400">Enterprise Dashboard</h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 relative z-10">
        {sidebarItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                onMouseEnter={() => prefetchOnHover(item.href)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg relative group/item transition-all duration-300',
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                )}
              >
              {isActive && (
                <>
                  <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg blur" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg" />
                </>
              )}
              <div className={cn(
                "relative p-1.5 rounded-lg transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-blue-600"
                  : "bg-slate-800 group-hover/item:bg-gradient-to-r group-hover/item:from-purple-500/50 group-hover/item:to-blue-600/50"
              )}>
                <item.icon className={cn(
                  "w-4 h-4 transition-transform duration-300 group-hover/item:scale-110",
                  isActive ? "text-white" : "text-gray-400 group-hover/item:text-white"
                )} />
              </div>
              <span className={cn(
                "flex-1 relative z-10 transition-all duration-300",
                isActive && "font-semibold"
              )}>
                {item.name}
              </span>
              {item.badge && (
                <span className={cn(
                  "px-2 py-1 text-xs rounded-full relative z-10 transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white"
                    : "bg-slate-800 text-gray-400 group-hover/item:bg-gradient-to-r group-hover/item:from-purple-500/50 group-hover/item:to-blue-600/50 group-hover/item:text-white"
                )}>
                  {item.badge}
                </span>
              )}
              {/* Hover border effect */}
              <div className={cn(
                "absolute left-0 top-0 w-1 h-0 bg-gradient-to-b from-purple-500 to-blue-600 rounded-r-full transition-all duration-300 group-hover/item:h-full",
                isActive && "h-full"
              )} />
              </Link>
            </motion.div>
          )
        })}
      </nav>
    </div>
  )
} 