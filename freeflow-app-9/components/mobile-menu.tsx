'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navigation = [
  { name: 'Features', href: '/features', testId: 'mobile-nav-features' },
  { name: 'How it Works', href: '/how-it-works', testId: 'mobile-nav-how-it-works' },
  { name: 'Pricing', href: '/pricing', testId: 'mobile-nav-pricing' },
  { name: 'Community', href: '/community', testId: 'mobile-nav-community' },
  { name: 'Blog', href: '/blog', testId: 'mobile-nav-blog' },
  { name: 'Contact', href: '/contact', testId: 'mobile-nav-contact' }
]

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mobile-menu-toggle transition-transform duration-200 ease-in-out"
          data-testid="mobile-menu-toggle"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[300px] sm:w-[400px] transition-transform duration-300 ease-in-out"
        data-testid="mobile-menu-content"
      >
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setIsOpen(false)} data-testid="mobile-nav-logo">
              <span className="text-xl font-bold">FreeflowZee</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              data-testid="mobile-menu-close"
              className="transition-transform duration-200 ease-in-out"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <nav className="flex flex-col space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent transition-colors duration-200"
                onClick={() => setIsOpen(false)}
                data-testid={item.testId}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col space-y-2 pt-4 border-t">
            <Button asChild variant="ghost" size="sm" data-testid="mobile-nav-login">
              <Link href="/login" onClick={() => setIsOpen(false)}>Log in</Link>
            </Button>
            <Button asChild size="sm" data-testid="mobile-nav-signup">
              <Link href="/signup" onClick={() => setIsOpen(false)}>Sign up</Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 