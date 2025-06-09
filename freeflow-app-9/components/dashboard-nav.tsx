'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Calendar,
  FolderOpen,
  Users,
  CreditCard,
  FileText,
  Globe,
  User,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Search
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Day', href: '/dashboard/my-day', icon: Calendar },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Financial', href: '/dashboard/financial', icon: CreditCard },
  { name: 'Files', href: '/dashboard/files', icon: FileText },
  { name: 'Community', href: '/dashboard/community', icon: Globe },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, notificationCount: 3 },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-50 w-full bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <h1 className="ml-3 text-xl font-bold text-blue-600">FreeflowZee</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-white lg:shadow-lg">
        <div className="flex h-16 shrink-0 items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600">FreeflowZee</h1>
          </Link>
        </div>
        
        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium transition-colors relative
                      ${isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon
                      className={`h-5 w-5 shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                      }`}
                    />
                    {item.name}
                    {item.notificationCount && item.notificationCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="ml-auto h-5 w-5 p-0 text-xs flex items-center justify-center"
                      >
                        {item.notificationCount}
                      </Badge>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="ml-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
            <div className="flex h-16 shrink-0 items-center px-6 border-b">
              <h1 className="text-xl font-bold text-blue-600">FreeflowZee</h1>
            </div>
            
            <nav className="mt-6 px-3">
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-medium transition-colors relative
                          ${isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        <item.icon
                          className={`h-5 w-5 shrink-0 ${
                            isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                          }`}
                        />
                        {item.name}
                        {item.notificationCount && item.notificationCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="ml-auto h-5 w-5 p-0 text-xs flex items-center justify-center"
                          >
                            {item.notificationCount}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Mobile user section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="ml-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 