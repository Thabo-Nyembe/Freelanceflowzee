"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Home,
  FolderOpen,
  MessageSquare,
  DollarSign,
  Users,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Activity,
  Calendar,
  BarChart3,
  Globe,
  Star
} from 'lucide-react'

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

interface MainNavigationProps {
  user: User
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const navigationItems = [
  { name: 'Dashboard', value: 'dashboard', icon: Home },
  { name: 'Projects', value: 'projects', icon: FolderOpen },
  { name: 'Feedback', value: 'feedback', icon: MessageSquare },
  { name: 'Financial', value: 'financial', icon: DollarSign },
  { name: 'Team', value: 'team', icon: Users },
  { name: 'Files', value: 'files', icon: FileText },
  { name: 'Community', value: 'community', icon: Globe },
]

export function MainNavigation({ user, activeTab = 'dashboard', onTabChange }: MainNavigationProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const userInitials = user.user_metadata?.full_name
    ?.split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'

  const handleTabClick = (tabValue: string) => {
    if (onTabChange) {
      onTabChange(tabValue)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Star className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-xl">FreeflowZee</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.value
              
              return (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuLink
                    className={`group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 cursor-pointer ${
                      isActive ? 'bg-accent text-accent-foreground' : ''
                    }`}
                    onClick={() => handleTabClick(item.value)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Search - Future Enhancement */}
        <div className="flex-1 mx-8 hidden lg:block">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search projects, clients, files..."
              className="w-full pl-8 pr-4 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-4 py-2 border-b">
                <h4 className="font-semibold">Notifications</h4>
              </div>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">New feedback received</p>
                  <p className="text-xs text-muted-foreground">E-commerce project - 2 hours ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-muted-foreground">Invoice #INV-001 - 4 hours ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Project milestone completed</p>
                  <p className="text-xs text-muted-foreground">Mobile App Design - 1 day ago</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user.user_metadata?.avatar_url} 
                    alt={user.user_metadata?.full_name || 'User'} 
                  />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">
                    {user.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="w-[200px] truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Activity className="mr-2 h-4 w-4" />
                Activity
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="px-7">
                <Link
                  href="/"
                  className="flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mr-2">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-bold">FreeflowZee</span>
                </Link>
                <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                  <div className="flex flex-col space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const isActive = activeTab === item.value
                      
                      return (
                        <Button
                          key={item.name}
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            handleTabClick(item.value)
                            setMobileMenuOpen(false)
                          }}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {item.name}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
} 