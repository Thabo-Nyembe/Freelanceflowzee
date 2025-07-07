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
  PaintBucket,
  Clock,
  Cloud,
  Briefcase,
  FileImage,
  BookOpen,
  FileCheck,
  Building2,
  Receipt,
  Palette,
  CalendarDays,
  UserPlus,
  LayoutDashboard,
  Workflow,
  GalleryVertical,
  Code,
  Brush,
  Wand2,
  Lightbulb,
  Pencil,
  Share2,
  Zap,
  Bot,
  Laptop,
  Megaphone,
  Settings,
  History,
  Library,
  Presentation,
  Rocket,
  Target
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: any
  badge?: string
  description?: string
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Dashboard overview and key metrics'
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
    description: 'Create and edit professional videos'
  },
  {
    name: 'Canvas Collaboration',
    href: '/dashboard/canvas',
    icon: PaintBucket,
    badge: 'A+++',
    description: 'Real-time collaborative design workspace'
  },
  {
    name: 'Community',
    href: '/dashboard/community',
    icon: Users,
    badge: 'A+++',
    description: 'Connect with other freelancers'
  },
  {
    name: 'AI Assistant',
    href: '/dashboard/ai-assistant',
    icon: Brain,
    badge: 'A+++',
    description: 'Get intelligent help and suggestions'
  },
  {
    name: 'AI Create',
    href: '/dashboard/ai-create',
    icon: Sparkles,
    badge: 'A+++',
    description: 'Generate content with AI'
  },
  {
    name: 'My Day',
    href: '/dashboard/my-day',
    icon: Calendar,
    badge: 'A+++',
    description: 'Daily tasks and schedule'
  },
  {
    name: 'Escrow',
    href: '/dashboard/escrow',
    icon: Shield,
    badge: 'A+++',
    description: 'Secure payment management'
  },
  {
    name: 'Files Hub',
    href: '/dashboard/files-hub',
    icon: FileText,
    badge: 'A+++',
    description: 'Centralized file management'
  },
  {
    name: 'Team Hub',
    href: '/dashboard/team-hub',
    icon: Users,
    badge: 'A+++',
    description: 'Team collaboration and management'
  },
  {
    name: 'Cloud Storage',
    href: '/dashboard/cloud-storage',
    icon: Cloud,
    badge: 'A+++',
    description: 'Secure cloud file storage'
  },
  {
    name: 'Time Tracking',
    href: '/dashboard/time-tracking',
    icon: Clock,
    badge: 'A+++',
    description: 'Track time and productivity'
  },
  {
    name: 'CV Portfolio',
    href: '/dashboard/cv-portfolio',
    icon: FileImage,
    badge: 'A+++',
    description: 'Professional portfolio builder'
  },
  {
    name: 'Bookings',
    href: '/dashboard/bookings',
    icon: CalendarDays,
    badge: 'A+++',
    description: 'Manage client appointments'
  },
  {
    name: 'Invoices',
    href: '/dashboard/invoices',
    icon: Receipt,
    badge: 'A+++',
    description: 'Create and manage invoices'
  },
  {
    name: 'Workflow Builder',
    href: '/dashboard/workflow-builder',
    icon: Workflow,
    badge: 'A+++',
    description: 'Create custom work processes'
  },
  {
    name: 'Gallery',
    href: '/dashboard/gallery',
    icon: GalleryVertical,
    badge: 'A+++',
    description: 'Showcase your work'
  },
  {
    name: 'Collaboration',
    href: '/dashboard/collaboration',
    icon: MessageSquare,
    description: 'Work together in real-time'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: TrendingUp,
    description: 'Track performance metrics'
  },
  {
    name: 'Client Zone',
    href: '/dashboard/client-zone',
    icon: UserCircle,
    description: 'Client management portal'
  },
  {
    name: 'Financial Hub',
    href: '/dashboard/financial-hub',
    icon: Wallet,
    description: 'Financial management and tracking'
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
    description: 'System notifications and alerts'
  },
  {
    name: 'AI Design Studio',
    href: '/dashboard/ai-design',
    icon: Brush,
    badge: 'A+++',
    description: 'AI-powered design tools and assistance'
  },
  {
    name: 'AI Code Assistant',
    href: '/dashboard/ai-code',
    icon: Code,
    badge: 'A+++',
    description: 'Intelligent code suggestions and automation'
  },
  {
    name: 'Smart Canvas',
    href: '/dashboard/smart-canvas',
    icon: Wand2,
    badge: 'A+++',
    description: 'AI-enhanced collaborative canvas'
  },
  {
    name: 'Idea Generator',
    href: '/dashboard/idea-generator',
    icon: Lightbulb,
    badge: 'A+++',
    description: 'AI-powered brainstorming and ideation'
  },
  {
    name: 'Content Editor',
    href: '/dashboard/content-editor',
    icon: Pencil,
    badge: 'A+++',
    description: 'Advanced block-based content editing'
  },
  {
    name: 'Media Hub',
    href: '/dashboard/media-hub',
    icon: Share2,
    badge: 'A+++',
    description: 'Universal media management and sharing'
  },
  {
    name: 'AI Analytics',
    href: '/dashboard/ai-analytics',
    icon: Zap,
    badge: 'A+++',
    description: 'Intelligent performance insights'
  },
  {
    name: 'Client Portal Pro',
    href: '/dashboard/client-portal-pro',
    icon: Building2,
    badge: 'A+++',
    description: 'Enhanced client collaboration space'
  },
  {
    name: 'Project Templates',
    href: '/dashboard/project-templates',
    icon: Laptop,
    badge: 'A+++',
    description: 'Ready-to-use project frameworks'
  },
  {
    name: 'Marketing Hub',
    href: '/dashboard/marketing',
    icon: Megaphone,
    badge: 'A+++',
    description: 'Promote your services and portfolio'
  },
  {
    name: 'Asset Library',
    href: '/dashboard/asset-library',
    icon: Library,
    badge: 'A+++',
    description: 'Manage design assets and resources'
  },
  {
    name: 'Presentations',
    href: '/dashboard/presentations',
    icon: Presentation,
    badge: 'A+++',
    description: 'Create and manage presentations'
  },
  {
    name: 'Quick Actions',
    href: '/dashboard/quick-actions',
    icon: Rocket,
    badge: 'A+++',
    description: 'Frequently used tools and shortcuts'
  },
  {
    name: 'Goals & Milestones',
    href: '/dashboard/goals',
    icon: Target,
    badge: 'A+++',
    description: 'Track project goals and milestones'
  },
  {
    name: 'Activity History',
    href: '/dashboard/history',
    icon: History,
    description: 'View past activities and changes'
  },
  {
    name: 'Settings & Preferences',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Customize your workspace'
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-6">
        <h1 className="text-2xl font-bold">FreeflowZee</h1>
        <h2 className="text-lg text-muted-foreground">Enterprise Dashboard</h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg group hover:bg-accent transition-colors',
                isActive && 'bg-accent'
              )}
            >
              <item.icon className={cn(
                'w-5 h-5 transition-colors',
                item.badge && 'text-purple-500'
              )} />
              <div className="flex-1">
                <span className="block">{item.name}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground hidden group-hover:block">
                    {item.description}
                  </span>
                )}
              </div>
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