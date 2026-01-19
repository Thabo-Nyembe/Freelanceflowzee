"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  Loader2,
} from 'lucide-react'

const features = [
  {
    title: 'Video Studio',
    description: 'Create and edit videos with AI assistance',
    href: '/dashboard/video-studio-v2',
    icon: Video
  },
  {
    title: 'Documents',
    description: 'Collaborative document editing',
    href: '/dashboard/docs-v2',
    icon: FileText
  },
  {
    title: 'Community',
    description: 'Connect with other freelancers',
    href: '/dashboard/community-v2',
    icon: Users
  },
  {
    title: 'AI Assistant',
    description: 'Get AI-powered help',
    href: '/dashboard/ai-assistant-v2',
    icon: Brain
  },
  {
    title: 'Calendar',
    description: 'Smart scheduling',
    href: '/dashboard/calendar-v2',
    icon: Calendar
  },
  {
    title: 'Analytics',
    description: 'Business insights',
    href: '/dashboard/analytics-v2',
    icon: BarChart3
  },
  {
    title: 'Files',
    description: 'File management',
    href: '/dashboard/files-hub-v2',
    icon: FileBox
  },
  {
    title: 'Client Portal',
    description: 'Client collaboration',
    href: '/dashboard/client-portal',
    icon: MessageSquare
  },
  {
    title: 'Dashboard',
    href: '/dashboard/overview-v2',
    icon: Briefcase,
    description: 'Manage your freelance business with AI-powered tools',
  },
]

export function MainNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast.error('Failed to sign out', { description: error.message })
        return
      }

      toast.success('Signed out successfully')
      router.push('/login')
      router.refresh()
    } catch (err) {
      toast.error('An error occurred while signing out')
    } finally {
      setIsSigningOut(false)
      setShowSignOutDialog(false)
    }
  }

  return (
    <>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSignOutDialog(true)}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>

    <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out of your account?</AlertDialogTitle>
          <AlertDialogDescription>
            You will need to sign in again to access your dashboard and data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSigningOut}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSigningOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing out...
              </>
            ) : (
              'Sign Out'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
