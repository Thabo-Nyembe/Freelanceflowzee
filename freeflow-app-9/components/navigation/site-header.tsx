'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Rocket, Menu, X, ChevronDown, ExternalLink, Play } from 'lucide-react'
import { useState } from 'react'

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false)
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-8 flex items-center space-x-2">
            <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-lg">
              FreeflowZee
            </span>
          </Link>
          
          <nav className="flex items-center space-x-1 text-sm font-medium">
            {/* Product Dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-1 px-3 py-2 text-foreground/60 transition-colors hover:text-foreground/80 rounded-md hover:bg-gray-50"
                onMouseEnter={() => setIsProductDropdownOpen(true)}
                onMouseLeave={() => setIsProductDropdownOpen(false)}
              >
                <span>Product</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {isProductDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border p-2 z-50"
                  onMouseEnter={() => setIsProductDropdownOpen(true)}
                  onMouseLeave={() => setIsProductDropdownOpen(false)}
                >
                  <div className="space-y-1">
                    <Link href="/features" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                        <Rocket className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Features</div>
                        <div className="text-xs text-gray-500">All platform capabilities</div>
                      </div>
                    </Link>
                    <Link href="/demo" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                        <Play className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Live Demo</div>
                        <div className="text-xs text-gray-500">Try before you buy</div>
                      </div>
                    </Link>
                    <Link href="/pricing" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">$</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Pricing</div>
                        <div className="text-xs text-gray-500">Plans for every team</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/how-it-works" className="px-3 py-2 text-foreground/60 transition-colors hover:text-foreground/80 rounded-md hover:bg-gray-50">
              How it Works
            </Link>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-1 px-3 py-2 text-foreground/60 transition-colors hover:text-foreground/80 rounded-md hover:bg-gray-50"
                onMouseEnter={() => setIsResourcesDropdownOpen(true)}
                onMouseLeave={() => setIsResourcesDropdownOpen(false)}
              >
                <span>Resources</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {isResourcesDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border p-2 z-50"
                  onMouseEnter={() => setIsResourcesDropdownOpen(true)}
                  onMouseLeave={() => setIsResourcesDropdownOpen(false)}
                >
                  <div className="space-y-1">
                    <Link href="/docs" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-sm">📖</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Documentation</div>
                        <div className="text-xs text-gray-500">Complete guides & tutorials</div>
                      </div>
                    </Link>
                    <Link href="/api-docs" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-sm">⚡</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">API Reference</div>
                        <div className="text-xs text-gray-500">Integrate with your tools</div>
                      </div>
                    </Link>
                    <Link href="/blog" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-pink-100 rounded-md flex items-center justify-center">
                        <span className="text-pink-600 font-bold text-sm">✍️</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Blog</div>
                        <div className="text-xs text-gray-500">Tips, updates & insights</div>
                      </div>
                    </Link>
                    <Link href="/community" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                        <span className="text-yellow-600 font-bold text-sm">👥</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Community</div>
                        <div className="text-xs text-gray-500">Connect with creators</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/support" className="px-3 py-2 text-foreground/60 transition-colors hover:text-foreground/80 rounded-md hover:bg-gray-50">
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
          
          <nav className="flex items-center space-x-3">
            <Link href="/contact" className="hidden sm:block">
              <Button variant="ghost" size="sm">Contact Sales</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                Get Started Free
              </Button>
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t md:hidden bg-white">
          <nav className="flex flex-col space-y-1 p-4 max-h-96 overflow-y-auto">
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</div>
              <Link href="/features" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">
                Features
              </Link>
              <Link href="/demo" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">
                Live Demo
              </Link>
              <Link href="/pricing" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">
                Pricing
              </Link>
              <Link href="/how-it-works" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">
                How it Works
              </Link>
            </div>
            
            <div className="border-t pt-4 space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resources</div>
              <Link href="/docs" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">
                Documentation
              </Link>
              <Link href="/api-docs" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">
                API Reference
              </Link>
              <Link href="/blog" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">
                Blog
              </Link>
              <Link href="/community" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">
                Community
              </Link>
              <Link href="/support" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md">
                Support
              </Link>
            </div>
            
            <div className="border-t pt-4">
              <Link href="/contact" className="block w-full mb-2">
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
} 