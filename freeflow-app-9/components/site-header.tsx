'use client

import Link from 'next/link
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Features', href: '/features' },
  { name: 'How it Works', href: '/how-it-works' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="site-header">
      <nav className="container flex h-14 items-center" data-testid="navigation">
        <div className="flex items-center space-x-4">
          <Link href="/" data-testid="nav-home">
            <span className="text-xl font-bold">FreeflowZee</span>
          </Link>
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.href.slice(1)}`}
              className="text-sm font-medium transition-colors hover:text-primary
            >
              {item.name}
            </Link>
          ))}
        </div>"
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Link href="/login" data-testid="nav-login" className="text-sm font-medium transition-colors hover:text-primary">
            Creator Login
          </Link>
          <Link href="/signup" data-testid="nav-signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>
    </header>
  )
} 