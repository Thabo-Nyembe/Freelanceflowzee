'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MobileNav } from '@/components/mobile-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button, buttonVariants } from '@/components/ui/button'
import UserButton from '@/components/user-button'
import GlobalSearch from '@/components/global-search'
import { cn } from '@/lib/utils'

const mainNav = [
  {
    title: 'Features',
    href: '/features',
  },
  {
    title: 'Pricing',
    href: '/pricing',
  },
  {
    title: 'Blog',
    href: '/blog',
  },
  {
    title: 'Documentation',
    href: '/docs',
  },
]

interface SiteHeaderProps {
  user?: {
    name?: string | null
    image?: string | null
    email?: string | null
  }
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <MobileNav items={mainNav}>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'justify-start'
                )}
              >
                Pricing
              </Link>
              <Link
                href="/blog"
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'justify-start'
                )}
              >
                Blog
              </Link>
              <Link
                href="/docs"
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'justify-start'
                )}
              >
                Documentation
              </Link>
            </div>
          </div>
        </MobileNav>
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/kazi-brand/logo.svg" 
              alt="KAZI" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-purple-600">KAZI</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-all duration-200 ease-in-out hover:text-foreground/80 hover:scale-105',
                  pathname === item.href
                    ? 'text-foreground font-semibold'
                    : 'text-foreground/60'
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <GlobalSearch />
          </div>
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            {user ? (
              <UserButton user={user} />
            ) : (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'sm' })
                )}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
} 