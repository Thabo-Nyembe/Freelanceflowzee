'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Calendar,
  FolderOpen,
  Users,
  Shield,
  FileText,
  Globe,
  Cpu,
  Sparkles,
  Video,
  MessageSquare,
  BarChart3,
  Menu,
  X,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

// Enhanced navigation structure with feature categorization
const NAVIGATION_ITEMS = [
  {
    category: 'Core',
    items: [
      {
        href: '/dashboard',
        title: 'Overview',
        icon: LayoutDashboard,
        description: 'Main dashboard overview',
        testId: 'nav-dashboard'
      },
      {
        href: '/dashboard/projects-hub',
        title: 'Projects Hub',
        icon: FolderOpen,
        description: 'Universal project management',
        testId: 'nav-projects-hub'
      },
      {
        href: '/dashboard/my-day',
        title: 'My Day Today',
        icon: Calendar,
        description: 'AI-powered daily planning',
        testId: 'nav-my-day'
      }
    ]
  },
  {
    category: 'AI Features',
    items: [
      {
        href: '/dashboard/ai-assistant',
        title: 'AI Assistant',
        icon: Cpu,
        description: 'Intelligent AI assistance',
        testId: 'nav-ai-assistant'
      },
      {
        href: '/dashboard/ai-create',
        title: 'AI Create',
        icon: Sparkles,
        description: 'AI-powered content creation',
        testId: 'nav-ai-create'
      }
    ]
  },
  {
    category: 'Content',
    items: [
      {
        href: '/dashboard/files-hub',
        title: 'Files Hub',
        icon: FileText,
        description: 'Advanced file management',
        testId: 'nav-files-hub'
      },
      {
        href: '/dashboard/video-studio',
        title: 'Video Studio',
        icon: Video,
        description: 'Professional video tools',
        testId: 'nav-video-studio'
      }
    ]
  },
  {
    category: 'Business',
    items: [
      {
        href: '/dashboard/escrow',
        title: 'Escrow System',
        icon: Shield,
        description: 'Secure payment system',
        testId: 'nav-escrow'
      },
      {
        href: '/dashboard/collaboration',
        title: 'Collaboration',
        icon: MessageSquare,
        description: 'Client collaboration tools',
        testId: 'nav-collaboration'
      },
      {
        href: '/dashboard/analytics',
        title: 'Analytics',
        icon: BarChart3,
        description: 'Business insights',
        testId: 'nav-analytics'
      }
    ]
  },
  {
    category: 'Community',
    items: [
      {
        href: '/dashboard/community',
        title: 'Community Hub',
        icon: Globe,
        description: 'Connect with creators',
        testId: 'nav-community'
      },
      {
        href: '/dashboard/client-portal',
        title: 'Client Portal',
        icon: Users,
        description: 'Client management',
        testId: 'nav-client-portal'
      }
    ]
  }
]

interface EnhancedNavigationProps {
  variant?: 'sidebar' | 'mobile' | 'dropdown'
  className?: string
}

export function EnhancedNavigation({ variant = 'sidebar', className = '' }: EnhancedNavigationProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('Core')

  const isActive = (href: string) => pathname === href

  const renderNavigationItem = (item: any) => {
    const Icon = item.icon
    const active = isActive(item.href)

    return (
      <Link 
        key={item.href} 
        href={item.href}
        className="w-full"
        data-testid={item.testId}
      >
        <Button
          variant={active ? 'secondary' : 'ghost'}
          className={`w-full justify-start gap-3 ${
            active ? 'bg-accent border-r-2 border-primary' : ''
          }`}
        >
          <Icon className="h-4 w-4" />
          <span className={variant === 'mobile' ? 'sr-only' : ''}>
            {item.title}
          </span>
          {active && variant === 'sidebar' && (
            <ChevronRight className="ml-auto h-4 w-4" />
          )}
        </Button>
      </Link>
    )
  }

  if (variant === 'mobile') {
    return (
      <div className={`md:hidden ${className}`}>
        <Button
          variant="ghost"
          className="h-10 w-10 p-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>

        {isOpen && (
          <div className="absolute left-0 top-14 z-50 w-full bg-background border-b">
            <div className="container py-4">
              {NAVIGATION_ITEMS.map((category) => (
                <div key={category.category} className="mb-4">
                  <h3 className="font-semibold mb-2">{category.category}</h3>
                  <div className="space-y-1">
                    {category.items.map(renderNavigationItem)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 w-10 p-0">
            <Menu className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {NAVIGATION_ITEMS.map((category) => (
            <React.Fragment key={category.category}>
              <DropdownMenuLabel>{category.category}</DropdownMenuLabel>
              <DropdownMenuGroup>
                {category.items.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="w-full" data-testid={item.testId}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <nav className={`space-y-6 ${className}`}>
      {NAVIGATION_ITEMS.map((category) => (
        <div key={category.category}>
          <h3 className="font-semibold mb-2 px-2">{category.category}</h3>
          <div className="space-y-1">
            {category.items.map(renderNavigationItem)}
          </div>
        </div>
      ))}
    </nav>
  )
} 