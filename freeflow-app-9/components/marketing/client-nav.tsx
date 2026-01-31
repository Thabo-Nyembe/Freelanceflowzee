'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sparkles, Menu } from 'lucide-react'

export function ClientNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav
      className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1 min-h-[44px]"
            aria-label="KAZI Homepage"
          >
            <Sparkles className="w-6 h-6 text-blue-700" aria-hidden="true" />
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              KAZI
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8" role="menubar">
            <Link
              href="/features"
              className="text-gray-800 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg min-h-[44px] min-w-[44px] px-4 py-3 flex items-center"
              role="menuitem"
              aria-label="View all features"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-gray-800 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg min-h-[44px] min-w-[44px] px-4 py-3 flex items-center"
              role="menuitem"
              aria-label="View pricing plans"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="text-gray-800 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg min-h-[44px] min-w-[44px] px-4 py-3 flex items-center"
              role="menuitem"
              aria-label="Read our blog"
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="text-gray-800 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg min-h-[44px] min-w-[44px] px-4 py-3 flex items-center"
              role="menuitem"
              aria-label="Contact us"
            >
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block">
              <Button
                variant="ghost"
                aria-label="Log in to your account"
                className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Log In
              </Button>
            </Link>
            <Link href="/signup" className="hidden sm:block">
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start Free Trial
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-white dark:bg-gray-900">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link
                    href="/features"
                    className="text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="/pricing"
                    className="text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/blog"
                    className="text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Blog
                  </Link>
                  <Link
                    href="/contact"
                    className="text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  <Separator className="my-4" />
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      Start Free Trial
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
