'use client'

/**
 * Enhanced Marketing Navigation - 2026 Edition
 *
 * Features:
 * - Glassmorphism design
 * - Mobile-first responsive
 * - Guest Upload CTA
 * - Smooth animations
 * - Analytics tracking
 * - Sticky header with scroll detection
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Menu,
  X,
  Zap,
  Upload,
  Users,
  DollarSign,
  Sparkles,
  ArrowRight,
  Gift
} from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  description?: string
  badge?: string
  icon?: React.ElementType
}

const productFeatures: NavItem[] = [
  {
    title: 'AI Content Studio',
    href: '/features#ai-studio',
    description: '4 premium AI models in one platform',
    icon: Sparkles
  },
  {
    title: 'Video Studio',
    href: '/features#video-studio',
    description: 'Professional editing & collaboration',
    icon: Upload
  },
  {
    title: 'Guest File Upload',
    href: '/guest-upload',
    description: 'FREE for files up to 6GB',
    badge: 'NEW',
    icon: Gift
  },
  {
    title: 'Team Collaboration',
    href: '/features#collaboration',
    description: 'Real-time multi-user editing',
    icon: Users
  },
  {
    title: 'Secure Payments',
    href: '/features#payments',
    description: 'Escrow & automated invoicing',
    icon: DollarSign
  }
]

const resources: NavItem[] = [
  { title: 'Documentation', href: '/docs' },
  { title: 'Tutorials', href: '/tutorials' },
  { title: 'Blog', href: '/blog' },
  { title: 'Community', href: '/community' },
  { title: 'Support', href: '/support' }
]

export function EnhancedNavigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { scrollY } = useScroll()

  // Glassmorphism effect on scroll
  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)']
  )

  const navBackgroundDark = useTransform(
    scrollY,
    [0, 100],
    ['rgba(15, 23, 42, 0)', 'rgba(15, 23, 42, 0.8)']
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Track navigation clicks
  const trackNavClick = async (label: string, href: string) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'navigation_click',
          properties: {
            label,
            href,
            pathname,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      // Silent fail - analytics shouldn't break navigation
      console.error('Analytics error:', error)
    }
  }

  const NavLink = ({ href, children, className, onClick }: any) => {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        onClick={() => {
          trackNavClick(children, href)
          onClick?.()
        }}
        className={cn(
          "relative px-3 py-2 text-sm font-medium transition-all duration-200",
          "hover:text-blue-600 dark:hover:text-blue-400",
          isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300",
          className
        )}
      >
        {children}
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </Link>
    )
  }

  return (
    <motion.nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm"
          : ""
      )}
      style={{
        backgroundColor: isScrolled
          ? 'var(--tw-prose-body)'
          : 'transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            onClick={() => trackNavClick('Logo', '/')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-sm group-hover:blur-md transition-all opacity-50 group-hover:opacity-75" />
              <img src="/kazi-brand/logo.svg"
                alt="KAZI"
                className="h-8 w-auto relative z-10"
              / loading="lazy">
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              KAZI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Features Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    Features
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[600px] gap-3 p-4">
                      {productFeatures.map((feature) => {
                        const Icon = feature.icon
                        return (
                          <Link
                            key={feature.href}
                            href={feature.href}
                            onClick={() => trackNavClick(feature.title, feature.href)}
                            className="group flex items-start gap-4 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            {Icon && (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                <Icon className="h-5 w-5" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {feature.title}
                                </h3>
                                {feature.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {feature.badge}
                                  </Badge>
                                )}
                              </div>
                              {feature.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {feature.description}
                                </p>
                              )}
                            </div>
                            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </Link>
                        )
                      })}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Resources Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-2 p-4">
                      {resources.map((resource) => (
                        <Link
                          key={resource.href}
                          href={resource.href}
                          onClick={() => trackNavClick(resource.title, resource.href)}
                          className="flex items-center justify-between rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <span className="text-sm font-medium">{resource.title}</span>
                          <ArrowRight className="h-4 w-4 opacity-50" />
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <NavLink href="/pricing">Pricing</NavLink>

            {/* Guest Upload CTA */}
            <Link
              href="/guest-upload"
              onClick={() => trackNavClick('Guest Upload CTA', '/guest-upload')}
              className="ml-4"
            >
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-green-500/50 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
              >
                <Gift className="h-4 w-4" />
                Upload Files
                <Badge variant="secondary" className="ml-1 text-xs">FREE</Badge>
              </Button>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <NavLink href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </NavLink>
            <Link
              href="/signup"
              onClick={() => trackNavClick('Sign Up CTA', '/signup')}
            >
              <Button
                size="sm"
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Start Free
                <Zap className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Navigate to different sections of KAZI
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-4 mt-8">
                {/* Features Section */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3">FEATURES</h3>
                  <div className="flex flex-col gap-2">
                    {productFeatures.map((feature) => {
                      const Icon = feature.icon
                      return (
                        <Link
                          key={feature.href}
                          href={feature.href}
                          onClick={() => {
                            trackNavClick(feature.title, feature.href)
                            setMobileMenuOpen(false)
                          }}
                          className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          {Icon && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              <Icon className="h-4 w-4" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{feature.title}</span>
                              {feature.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {feature.badge}
                                </Badge>
                              )}
                            </div>
                            {feature.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {feature.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Resources Section */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3">RESOURCES</h3>
                  <div className="flex flex-col gap-1">
                    {resources.map((resource) => (
                      <Link
                        key={resource.href}
                        href={resource.href}
                        onClick={() => {
                          trackNavClick(resource.title, resource.href)
                          setMobileMenuOpen(false)
                        }}
                        className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {resource.title}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <Link
                  href="/pricing"
                  onClick={() => {
                    trackNavClick('Pricing', '/pricing')
                    setMobileMenuOpen(false)
                  }}
                  className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Pricing
                </Link>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <Link
                    href="/login"
                    onClick={() => {
                      trackNavClick('Login', '/login')
                      setMobileMenuOpen(false)
                    }}
                  >
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => {
                      trackNavClick('Sign Up', '/signup')
                      setMobileMenuOpen(false)
                    }}
                  >
                    <Button className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                      Start Free Trial
                      <Zap className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link
                    href="/guest-upload"
                    onClick={() => {
                      trackNavClick('Guest Upload', '/guest-upload')
                      setMobileMenuOpen(false)
                    }}
                  >
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-green-500/50 text-green-600 dark:text-green-400"
                    >
                      <Gift className="h-4 w-4" />
                      Upload Files FREE
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  )
}
