"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import {
  Video,
  FileText,
  Users,
  Brain,
  Calendar,
  BarChart3,
  FileBox,
  MessageSquare,
  Settings,
  LogOut,
  Briefcase,
} from 'lucide-react'

const features = [
  {
    title: 'Video Studio',
    description: 'Create and edit videos with AI assistance',
    href: '/video-studio',
    icon: Video
  },
  {
    title: 'Documents',
    description: 'Collaborative document editing',
    href: '/documents',
    icon: FileText
  },
  {
    title: 'Community',
    description: 'Connect with other freelancers',
    href: '/community',
    icon: Users
  },
  {
    title: 'AI Assistant',
    description: 'Get AI-powered help',
    href: '/ai-assistant',
    icon: Brain
  },
  {
    title: 'Calendar',
    description: 'Smart scheduling',
    href: '/calendar',
    icon: Calendar
  },
  {
    title: 'Analytics',
    description: 'Business insights',
    href: '/analytics',
    icon: BarChart3
  },
  {
    title: 'Files',
    description: 'File management',
    href: '/files',
    icon: FileBox
  },
  {
    title: 'Client Portal',
    description: 'Client collaboration',
    href: '/client-portal',
    icon: MessageSquare
  },
  {
    title: 'Freelancer',
    href: '/freelancer',
    icon: Briefcase,
    description: 'Manage your freelance business with AI-powered tools',
  },
]

export function MainNavigation() {
  const pathname = usePathname()

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Features</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
              {features.map((feature) => (
                <li key={feature.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={feature.href}
                      className={cn(
                        'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                        pathname === feature.href && 'bg-accent'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <feature.icon className="h-4 w-4" />
                        <div className="text-sm font-medium leading-none">
                          {feature.title}
                        </div>
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {feature.description}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/settings" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Button variant="ghost" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
