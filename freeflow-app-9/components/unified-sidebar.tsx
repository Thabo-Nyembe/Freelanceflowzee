'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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
  Zap,
  Monitor,
  DollarSign,
  Target,
  Timer,
  BookOpen,
  Heart,
  Database,
  Settings,
  Gauge,
  Repeat,
  Focus,
  Inbox,
  Handshake,
  Kanban,
  Quote,
  Laptop,
  Building,
  Car,
  Truck,
  Package,
  Utensils,
  Dumbbell,
  Shirt,
  Bus,
  Baby,
  Activity,
  Music,
  Printer,
  Phone,
  Archive,
  Coffee,
  Warehouse,
  Lock,
  HandHeart,
  Leaf,
  Lightbulb,
  ShoppingCart,
  Gift,
  Award,
  AlertCircle,
  Store,
  Layout,
  Wallet,
  Receipt,
  Calculator,
  PiggyBank,
  LineChart,
  Map,
  ListChecks,
  Rocket,
  Bug,
  TestTube,
  ShieldAlert,
  FileWarning,
  ShieldCheck,
  ScanSearch,
  GraduationCap,
  Target as SkillsIcon,
  Star,
  UserMinus,
  UserPlus
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
    href: '/dashboard/projects-hub-v2',
    icon: FolderOpen
  },
  {
    name: 'Video Studio',
    href: '/dashboard/video-studio-v2',
    icon: Video
  },
  {
    name: 'Canvas Collaboration',
    href: '/dashboard/canvas-v2',
    icon: Monitor
  },
  {
    name: 'Community',
    href: '/dashboard/community-hub',
    icon: Users
  },
  {
    name: 'AI Assistant',
    href: '/dashboard/ai-assistant-v2',
    icon: Zap
  },
  {
    name: 'AI Create',
    href: '/dashboard/ai-create-v2',
    icon: Sparkles
  },
  {
    name: 'AI Agents',
    href: '/dashboard/ai-agents-v2',
    icon: Zap
  },
  {
    name: 'AI Code Builder',
    href: '/dashboard/ai-code-builder-v2',
    icon: Zap
  },
  {
    name: 'AI Design',
    href: '/dashboard/ai-design-v2',
    icon: Sparkles
  },
  {
    name: 'AI Video',
    href: '/dashboard/ai-video-v2',
    icon: Video
  },
  {
    name: 'AI Voice',
    href: '/dashboard/ai-voice-v2',
    icon: Music
  },
  {
    name: 'AI Settings',
    href: '/dashboard/ai-settings-v2',
    icon: Settings
  },
  {
    name: 'Audio Studio',
    href: '/dashboard/audio-studio-v2',
    icon: Music
  },
  {
    name: 'Content Studio',
    href: '/dashboard/content-studio-v2',
    icon: Video
  },
  {
    name: 'Media Library',
    href: '/dashboard/media-library-v2',
    icon: FolderOpen
  },
  {
    name: '3D Modeling',
    href: '/dashboard/3d-modeling-v2',
    icon: Monitor
  },
  {
    name: 'AI Image Generator',
    href: '/dashboard/ai-image-generator',
    icon: Sparkles
  },
  {
    name: 'AI Music Studio',
    href: '/dashboard/ai-music-studio',
    icon: Music
  },
  {
    name: 'Motion Graphics',
    href: '/dashboard/motion-graphics-v2',
    icon: Video
  },
  {
    name: 'Video Review',
    href: '/dashboard/video-review-v2',
    icon: Video
  },
  {
    name: 'My Day',
    href: '/dashboard/my-day-v2',
    icon: Calendar
  },
  {
    name: 'Escrow',
    href: '/dashboard/escrow-v2',
    icon: Shield
  },
  {
    name: 'Files Hub',
    href: '/dashboard/files-hub-v2',
    icon: FileText
  },
  {
    name: 'Collaboration',
    href: '/dashboard/collaboration-v2',
    icon: MessageSquare
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics-v2',
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
    href: '/dashboard/notifications-v2',
    icon: Bell
  },
  {
    name: 'Goals',
    href: '/dashboard/goals-v2',
    icon: Target
  },
  {
    name: 'KPIs',
    href: '/dashboard/kpis-v2',
    icon: Gauge
  },
  {
    name: 'Focus Mode',
    href: '/dashboard/focus-v2',
    icon: Focus
  },
  {
    name: 'Pomodoro',
    href: '/dashboard/pomodoro-v2',
    icon: Timer
  },
  {
    name: 'Journal',
    href: '/dashboard/journals-v2',
    icon: BookOpen
  },
  {
    name: 'Habits',
    href: '/dashboard/habits-v2',
    icon: Repeat
  },
  {
    name: 'Mood',
    href: '/dashboard/mood-v2',
    icon: Heart
  },
  {
    name: 'Data Studio',
    href: '/dashboard/data-studio-v2',
    icon: Database
  },
  {
    name: 'Settings',
    href: '/dashboard/notification-settings-v2',
    icon: Settings
  },
  {
    name: 'Inbox',
    href: '/dashboard/inbox-v2',
    icon: Inbox
  },
  {
    name: 'Deals',
    href: '/dashboard/deals-v2',
    icon: Handshake
  },
  {
    name: 'Contacts',
    href: '/dashboard/contacts-v2',
    icon: Users
  },
  {
    name: 'Pipeline',
    href: '/dashboard/pipeline-v2',
    icon: Kanban
  },
  {
    name: 'Quotes',
    href: '/dashboard/quotes-v2',
    icon: FileText
  },
  // CRM & Sales
  {
    name: 'CRM',
    href: '/dashboard/crm-v2',
    icon: Users
  },
  {
    name: 'Sales',
    href: '/dashboard/sales-v2',
    icon: TrendingUp
  },
  {
    name: 'Leads',
    href: '/dashboard/leads-v2',
    icon: Target
  },
  {
    name: 'Opportunities',
    href: '/dashboard/opportunities-v2',
    icon: Target
  },
  // Marketing
  {
    name: 'Marketing',
    href: '/dashboard/marketing-v2',
    icon: TrendingUp
  },
  {
    name: 'Campaigns',
    href: '/dashboard/campaigns-v2',
    icon: Zap
  },
  {
    name: 'Content Calendar',
    href: '/dashboard/content-calendar-v2',
    icon: Calendar
  },
  {
    name: 'Content Hub',
    href: '/dashboard/content-v2',
    icon: FileText
  },
  // Facilities & Operations
  {
    name: 'Equipment',
    href: '/dashboard/equipment-v2',
    icon: Laptop
  },
  {
    name: 'Visitors',
    href: '/dashboard/visitors-v2',
    icon: Users
  },
  {
    name: 'Facilities',
    href: '/dashboard/facilities-v2',
    icon: Building
  },
  {
    name: 'Parking',
    href: '/dashboard/parking-v2',
    icon: Car
  },
  {
    name: 'Fleet',
    href: '/dashboard/fleet-v2',
    icon: Truck
  },
  {
    name: 'Lockers',
    href: '/dashboard/lockers-v2',
    icon: Package
  },
  {
    name: 'Cafeteria',
    href: '/dashboard/cafeteria-v2',
    icon: Utensils
  },
  {
    name: 'Gym',
    href: '/dashboard/gym-v2',
    icon: Dumbbell
  },
  {
    name: 'Library',
    href: '/dashboard/library-v2',
    icon: BookOpen
  },
  {
    name: 'Laundry',
    href: '/dashboard/laundry-v2',
    icon: Shirt
  },
  {
    name: 'Shuttle',
    href: '/dashboard/shuttle-v2',
    icon: Bus
  },
  {
    name: 'Childcare',
    href: '/dashboard/childcare-v2',
    icon: Baby
  },
  {
    name: 'Wellness',
    href: '/dashboard/wellness-v2',
    icon: Activity
  },
  {
    name: 'Concierge',
    href: '/dashboard/concierge-v2',
    icon: Bell
  },
  {
    name: 'Auditorium',
    href: '/dashboard/auditorium-v2',
    icon: Music
  },
  {
    name: 'Printing',
    href: '/dashboard/printing-v2',
    icon: Printer
  },
  {
    name: 'Reception',
    href: '/dashboard/reception-v2',
    icon: Phone
  },
  {
    name: 'Storage',
    href: '/dashboard/storage-v2',
    icon: Archive
  },
  {
    name: 'Vending',
    href: '/dashboard/vending-v2',
    icon: Coffee
  },
  {
    name: 'Breakroom',
    href: '/dashboard/breakroom-v2',
    icon: Coffee
  },
  {
    name: 'Garage',
    href: '/dashboard/garage-v2',
    icon: Warehouse
  },
  {
    name: 'Access Control',
    href: '/dashboard/access-control-v2',
    icon: Lock
  },
  // Employee Programs
  {
    name: 'Volunteering',
    href: '/dashboard/volunteering-v2',
    icon: HandHeart
  },
  {
    name: 'Sustainability',
    href: '/dashboard/sustainability-v2',
    icon: Leaf
  },
  {
    name: 'Patents',
    href: '/dashboard/patents-v2',
    icon: Lightbulb
  },
  {
    name: 'Procurement',
    href: '/dashboard/procurement-v2',
    icon: ShoppingCart
  },
  {
    name: 'Rewards',
    href: '/dashboard/rewards-v2',
    icon: Gift
  },
  {
    name: 'Suggestions',
    href: '/dashboard/suggestions-v2',
    icon: Lightbulb
  },
  {
    name: 'Recognition',
    href: '/dashboard/recognition-v2',
    icon: Award
  },
  {
    name: 'Complaints',
    href: '/dashboard/complaints-v2',
    icon: AlertCircle
  },
  {
    name: 'Ideas',
    href: '/dashboard/ideas-v2',
    icon: Lightbulb
  },
  {
    name: 'Mentorship',
    href: '/dashboard/mentorship-v2',
    icon: Users
  },
  {
    name: 'Benefits',
    href: '/dashboard/benefits-v2',
    icon: Heart
  },
  // Platform Features
  {
    name: 'Seller Hub',
    href: '/dashboard/seller-v2',
    icon: Store
  },
  {
    name: 'Components',
    href: '/dashboard/components-showcase-v2',
    icon: Layout
  },
  {
    name: 'Features Hub',
    href: '/dashboard/features-hub-v2',
    icon: Zap
  },
  // System Monitoring
  {
    name: 'Performance',
    href: '/dashboard/performance-monitoring-v2',
    icon: Activity
  },
  {
    name: 'System Health',
    href: '/dashboard/system-health-v2',
    icon: Heart
  },
  // Finance
  {
    name: 'Budgets',
    href: '/dashboard/budgets-v2',
    icon: Wallet
  },
  {
    name: 'Financial Reports',
    href: '/dashboard/financial-reports-v2',
    icon: Receipt
  },
  {
    name: 'Taxes',
    href: '/dashboard/taxes-v2',
    icon: Calculator
  },
  {
    name: 'Revenue Tracking',
    href: '/dashboard/revenue-tracking-v2',
    icon: PiggyBank
  },
  {
    name: 'Cost Analysis',
    href: '/dashboard/cost-analysis-v2',
    icon: LineChart
  },
  // Product
  {
    name: 'Roadmap',
    href: '/dashboard/roadmap-v2',
    icon: Map
  },
  {
    name: 'Features Backlog',
    href: '/dashboard/features-backlog-v2',
    icon: ListChecks
  },
  {
    name: 'Releases',
    href: '/dashboard/releases-v2',
    icon: Rocket
  },
  {
    name: 'Bugs Tracking',
    href: '/dashboard/bugs-tracking-v2',
    icon: Bug
  },
  {
    name: 'Testing',
    href: '/dashboard/testing-v2',
    icon: TestTube
  },
  // Security
  {
    name: 'Access Logs',
    href: '/dashboard/access-logs-v2',
    icon: ShieldAlert
  },
  {
    name: 'Vulnerabilities',
    href: '/dashboard/vulnerabilities-v2',
    icon: FileWarning
  },
  {
    name: 'Security Policies',
    href: '/dashboard/security-policies-v2',
    icon: ShieldCheck
  },
  {
    name: 'Penetration Testing',
    href: '/dashboard/penetration-testing-v2',
    icon: ScanSearch
  },
  // HR
  {
    name: 'Certifications',
    href: '/dashboard/certifications-v2',
    icon: GraduationCap
  },
  {
    name: 'Skills Matrix',
    href: '/dashboard/skills-matrix-v2',
    icon: SkillsIcon
  },
  {
    name: 'Performance Reviews',
    href: '/dashboard/performance-reviews-v2',
    icon: Star
  },
  {
    name: 'Offboarding',
    href: '/dashboard/offboarding-v2',
    icon: UserMinus
  },
  {
    name: 'Recruitment',
    href: '/dashboard/recruitment-v2',
    icon: UserPlus
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
            <Image
              src="/kazi-brand/logo.svg"
              alt="KAZI"
              width={32}
              height={32}
              className="h-8 w-auto relative z-10 transition-transform duration-300 group-hover/logo:scale-110"
              priority
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
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02, duration: 0.2 }}
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