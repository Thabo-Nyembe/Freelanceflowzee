'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MobileNav } from '@/components/mobile-menu'
import { PremiumThemeToggle } from '@/components/ui/premium-theme-toggle'
import { buttonVariants } from '@/components/ui/button'
import UserButton from '@/components/user-button'
import GlobalSearch from '@/components/global-search'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { GlowEffect } from '@/components/ui/glow-effect'
import { BorderTrail } from '@/components/ui/border-trail'
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-700/50 relative group">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-xl opacity-95" />
      <GlowEffect className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <BorderTrail className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" size={40} duration={8} />

      <div className="container flex h-16 items-center relative z-10">
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
          <Link href="/" className="flex items-center gap-2 relative group/logo">
            <div className="relative">
              <GlowEffect className="absolute -inset-2 bg-gradient-to-r from-purple-500/50 to-blue-500/50 rounded-lg blur opacity-0 group-hover/logo:opacity-75 transition-opacity duration-300" />
              <img
                src="/kazi-brand/logo.svg"
                alt="KAZI"
                className="h-8 w-auto relative z-10 transition-transform duration-300 group-hover/logo:scale-110"
              />
            </div>
            <TextShimmer className="text-xl font-bold" duration={2}>
              KAZI
            </TextShimmer>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-3 py-2 transition-all duration-300 ease-out group/nav',
                  pathname === item.href
                    ? 'text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {pathname === item.href && (
                  <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-lg blur" />
                )}
                <span className="relative z-10 inline-block transition-transform duration-300 group-hover/nav:scale-105">
                  {item.title}
                </span>
                <span className={cn(
                  "absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 group-hover/nav:w-full",
                  pathname === item.href && "w-full"
                )} />
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <GlobalSearch />
          </div>
          <nav className="flex items-center space-x-2">
            <PremiumThemeToggle />
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