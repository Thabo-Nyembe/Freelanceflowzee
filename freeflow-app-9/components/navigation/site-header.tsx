'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Rocket, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FreeflowZee
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/features" className="text-foreground/60 transition-colors hover:text-foreground/80">
              Features
            </Link>
            <Link href="/how-it-works" className="text-foreground/60 transition-colors hover:text-foreground/80">
              How it Works
            </Link>
            <Link href="/docs" className="text-foreground/60 transition-colors hover:text-foreground/80">
              Docs
            </Link>
            <Link href="/support" className="text-foreground/60 transition-colors hover:text-foreground/80">
              Support
            </Link>
          </nav>
        </div>
        
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Link href="/" className="mr-6 flex items-center space-x-2 md:hidden">
            <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FreeflowZee
            </span>
          </Link>
          
          <nav className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="border-t md:hidden">
          <nav className="flex flex-col space-y-2 p-4">
            <Link href="/features" className="text-sm font-medium text-foreground/60 hover:text-foreground/80">
              Features
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-foreground/60 hover:text-foreground/80">
              How it Works
            </Link>
            <Link href="/docs" className="text-sm font-medium text-foreground/60 hover:text-foreground/80">
              Docs
            </Link>
            <Link href="/support" className="text-sm font-medium text-foreground/60 hover:text-foreground/80">
              Support
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
} 