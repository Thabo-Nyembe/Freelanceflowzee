'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MobileMenu } from '@/components/mobile-menu'
import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
  { name: 'Features', href: '/features', testId: 'nav-features' },
  { name: 'How it Works', href: '/how-it-works', testId: 'nav-how-it-works' },
  { name: 'Pricing', href: '/pricing', testId: 'nav-pricing' },
  { name: 'Community', href: '/community', testId: 'nav-community' },
  { name: 'Blog', href: '/blog', testId: 'nav-blog' },
  { name: 'Contact', href: '/contact', testId: 'nav-contact' }
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="site-header">
      <nav className="container flex h-14 items-center justify-between" data-testid="navigation">
        <div className="flex items-center gap-6">
          <MobileMenu />
          <Link href="/" data-testid="nav-logo">
            <span className="text-xl font-bold">FreeflowZee</span>
          </Link>
          
          {/* Desktop Navigation - Hidden on mobile (< 768px), visible on medium screens and up (>= 768px) */}
          <div className="hidden md:flex md:gap-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
                data-testid={item.testId}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Actions - Hidden on mobile, visible on medium screens and up */}
        <div className="hidden md:flex md:items-center md:gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" data-testid="nav-login">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm" data-testid="nav-signup">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
} 