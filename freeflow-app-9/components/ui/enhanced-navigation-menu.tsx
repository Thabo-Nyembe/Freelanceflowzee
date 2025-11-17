'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Home,
  Brain,
  BarChart3,
  Palette,
  Video,
  DollarSign,
  Users,
  Camera,
  Calendar,
  Clock,
  Settings,
  HelpCircle,
  Zap,
  Star,
  Sparkles,
  Target,
  Briefcase,
  FileText,
  Globe,
  Lightbulb,
  TrendingUp,
  Activity,
  Award,
  BookOpen,
  Code,
  Database,
  Shield,
  Workflow
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  description: string
  icon: React.ElementType
  badge?: string
  isNew?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const mainNavigation: NavGroup[] = [
  {
    title: 'Core Features',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        description: 'Overview of your projects and activities',
        icon: Home,
      },
      {
        title: 'AI Create Studio',
        href: '/dashboard/ai-create',
        description: 'Generate content with advanced AI tools',
        icon: Brain,
        badge: 'AI',
        isNew: true,
      },
      {
        title: 'Analytics',
        href: '/dashboard/analytics',
        description: 'Insights and performance metrics',
        icon: BarChart3,
      },
      {
        title: 'Canvas Studio',
        href: '/dashboard/canvas',
        description: 'Design and collaborative workspace',
        icon: Palette,
      },
    ],
  },
  {
    title: 'Production Tools',
    items: [
      {
        title: 'Video Studio',
        href: '/dashboard/video-studio',
        description: 'Professional video editing and production',
        icon: Video,
        badge: 'Pro',
      },
      {
        title: 'Gallery Studio',
        href: '/dashboard/gallery',
        description: 'Media management and portfolio',
        icon: Camera,
      },
      {
        title: 'Time Tracking',
        href: '/dashboard/time-tracking',
        description: 'Track productivity and project time',
        icon: Clock,
      },
    ],
  },
  {
    title: 'Business Management',
    items: [
      {
        title: 'Financial Hub',
        href: '/dashboard/financial-hub',
        description: 'Payments, invoicing, and financial tracking',
        icon: DollarSign,
      },
      {
        title: 'Booking System',
        href: '/dashboard/booking',
        description: 'Appointment scheduling and calendar management',
        icon: Calendar,
      },
      {
        title: 'Community Hub',
        href: '/dashboard/community-hub',
        description: 'Social networking and collaboration',
        icon: Users,
      },
    ],
  },
]

const toolsAndResources: NavItem[] = [
  {
    title: 'API Documentation',
    href: '/docs/api',
    description: 'Complete API reference and guides',
    icon: Code,
  },
  {
    title: 'Templates Library',
    href: '/templates',
    description: 'Pre-built templates and components',
    icon: FileText,
  },
  {
    title: 'Learning Center',
    href: '/learn',
    description: 'Tutorials, guides, and best practices',
    icon: BookOpen,
  },
  {
    title: 'Community Forum',
    href: '/community',
    description: 'Connect with other creators and developers',
    icon: Globe,
  },
]

const quickActions: NavItem[] = [
  {
    title: 'New Project',
    href: '/dashboard/projects/new',
    description: 'Start a new project from scratch',
    icon: Sparkles,
  },
  {
    title: 'Import Assets',
    href: '/dashboard/import',
    description: 'Upload and organize your media files',
    icon: Database,
  },
  {
    title: 'Team Settings',
    href: '/dashboard/team',
    description: 'Manage team members and permissions',
    icon: Shield,
  },
  {
    title: 'Workflows',
    href: '/dashboard/workflows',
    description: 'Automate repetitive tasks',
    icon: Workflow,
    isNew: true,
  },
]

interface EnhancedNavigationMenuProps {
  className?: string
}

export function EnhancedNavigationMenu({ className }: EnhancedNavigationMenuProps) {
  const pathname = usePathname()

  return (
    <NavigationMenu className={className}>
      <NavigationMenuList>
        {/* Features Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-9">
            <Zap className="mr-2 h-4 w-4" />
            Features
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 md:w-[500px] lg:w-[700px] lg:grid-cols-[.75fr_1fr]">
              <div className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-purple-500/20 to-violet-600/20 p-6 no-underline outline-none focus:shadow-md"
                    href="/dashboard"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      KAZI Platform
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Complete creative and business management platform with AI-powered tools.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Star className="mr-1 h-3 w-3" />
                        Premium
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Activity className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    </div>
                  </Link>
                </NavigationMenuLink>
              </div>
              <div className="grid gap-1">
                {mainNavigation.map((group) => (
                  <div key={group.title}>
                    <h4 className="mb-2 text-sm font-medium leading-none text-muted-foreground">
                      {group.title}
                    </h4>
                    <div className="grid gap-1">
                      {group.items.map((item) => (
                        <ListItem
                          key={item.href}
                          href={item.href}
                          title={item.title}
                          icon={item.icon}
                          badge={item.badge}
                          isNew={item.isNew}
                          isActive={pathname === item.href}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </div>
                    <Separator className="my-2" />
                  </div>
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Tools & Resources Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-9">
            <Lightbulb className="mr-2 h-4 w-4" />
            Resources
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <div>
                <h4 className="mb-3 text-sm font-medium leading-none">
                  Tools & Resources
                </h4>
                {toolsAndResources.map((item) => (
                  <ListItem
                    key={item.href}
                    href={item.href}
                    title={item.title}
                    icon={item.icon}
                    isActive={pathname === item.href}
                  >
                    {item.description}
                  </ListItem>
                ))}
              </div>
              <div>
                <h4 className="mb-3 text-sm font-medium leading-none">
                  Quick Actions
                </h4>
                {quickActions.map((item) => (
                  <ListItem
                    key={item.href}
                    href={item.href}
                    title={item.title}
                    icon={item.icon}
                    isNew={item.isNew}
                    isActive={pathname === item.href}
                  >
                    {item.description}
                  </ListItem>
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Direct Links */}
        <NavigationMenuItem>
          <Link href="/dashboard/analytics" legacyBehavior passHref>
            <NavigationMenuLink 
              className={cn(
                navigationMenuTriggerStyle(), 
                "h-9",
                pathname === '/dashboard/analytics' && "bg-accent text-accent-foreground"
              )}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/dashboard/community-hub" legacyBehavior passHref>
            <NavigationMenuLink 
              className={cn(
                navigationMenuTriggerStyle(), 
                "h-9",
                pathname === '/dashboard/community-hub' && "bg-accent text-accent-foreground"
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              Community
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/help" legacyBehavior passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "h-9")}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & {
    title: string
    icon?: React.ElementType
    badge?: string
    isNew?: boolean
    isActive?: boolean
  }
>(({ className, title, children, icon: Icon, badge, isNew, isActive, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href || '#'}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            isActive && 'bg-accent text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            <div className="text-sm font-medium leading-none">{title}</div>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
            {isNew && (
              <Badge variant="default" className="text-xs bg-green-500">
                New
              </Badge>
            )}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'



