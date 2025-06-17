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
    <header className="sticky top-0 z-50 w-full theme-header">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-8 flex items-center space-x-2">
            <div className="p-1 rounded-lg theme-gradient-primary">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block theme-gradient-text text-lg">
              FreeflowZee
            </span>
          </Link>
          
          <nav className="flex items-center space-x-1 text-sm font-medium">
            {/* Product Dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-1 px-3 py-2 text-foreground/60 transition-colors hover:text-foreground/80 rounded-md hover:bg-purple-50"
                onMouseEnter={() => setIsProductDropdownOpen(true)}
                onMouseLeave={() => setIsProductDropdownOpen(false)}
                onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
              >
                <span>Product</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isProductDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isProductDropdownOpen && (
                <>
                  {/* Backdrop for mobile */}
                  <div 
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                    onClick={() => setIsProductDropdownOpen(false)}
                  />
                  
                  <div 
                    className="site-header-dropdown absolute top-full left-0 mt-2 w-72 z-dropdown"
                    onMouseEnter={() => setIsProductDropdownOpen(true)}
                    onMouseLeave={() => setIsProductDropdownOpen(false)}
                  >
                    <div className="space-y-1 p-2">
                      <Link 
                        href="/features" 
                        className="site-nav-dropdown-item"
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        <div className="w-8 h-8 theme-bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <Rocket className="h-4 w-4 theme-text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium theme-text-gray-900">Features</div>
                          <div className="text-xs theme-text-gray-600">All platform capabilities</div>
                        </div>
                      </Link>
                      <Link 
                        href="/demo" 
                        className="site-nav-dropdown-item"
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        <div className="w-8 h-8 theme-bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <Play className="h-4 w-4 theme-text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium theme-text-gray-900">Live Demo</div>
                          <div className="text-xs theme-text-gray-600">Try before you buy</div>
                        </div>
                      </Link>
                      <Link 
                        href="/pricing" 
                        className="site-nav-dropdown-item"
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        <div className="w-8 h-8 theme-bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="theme-text-primary font-bold text-sm">$</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium theme-text-gray-900">Pricing</div>
                          <div className="text-xs theme-text-gray-600">Plans for every team</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link href="/how-it-works" className="px-3 py-2 text-foreground/60 transition-colors hover:text-foreground/80 rounded-md hover:bg-purple-50">
              How it Works
            </Link>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-1 px-3 py-2 text-foreground/60 transition-colors hover:text-foreground/80 rounded-md hover:bg-purple-50"
                onMouseEnter={() => setIsResourcesDropdownOpen(true)}
                onMouseLeave={() => setIsResourcesDropdownOpen(false)}
                onClick={() => setIsResourcesDropdownOpen(!isResourcesDropdownOpen)}
              >
                <span>Resources</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isResourcesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isResourcesDropdownOpen && (
                <>
                  {/* Backdrop for mobile */}
                  <div 
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                    onClick={() => setIsResourcesDropdownOpen(false)}
                  />
                  
                  <div 
                    className="site-header-dropdown resources-dropdown absolute top-full left-0 mt-2 w-72 z-dropdown"
                    onMouseEnter={() => setIsResourcesDropdownOpen(true)}
                    onMouseLeave={() => setIsResourcesDropdownOpen(false)}
                  >
                    <div className="space-y-1 p-2">
                      <div className="resources-dropdown-section">
                        <div className="resources-dropdown-title">Learn</div>
                        <Link 
                          href="/docs" 
                          className="site-nav-dropdown-item"
                          onClick={() => setIsResourcesDropdownOpen(false)}
                        >
                          <div className="w-8 h-8 theme-bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <span className="theme-text-primary font-bold text-sm">📖</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium theme-text-gray-900">Documentation</div>
                            <div className="text-xs theme-text-gray-600">Complete guides & tutorials</div>
                          </div>
                        </Link>
                        <Link 
                          href="/api-docs" 
                          className="site-nav-dropdown-item"
                          onClick={() => setIsResourcesDropdownOpen(false)}
                        >
                          <div className="w-8 h-8 theme-bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <span className="theme-text-primary font-bold text-sm">⚡</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium theme-text-gray-900">API Reference</div>
                            <div className="text-xs theme-text-gray-600">Integrate with your tools</div>
                          </div>
                        </Link>
                      </div>
                      
                      <div className="resources-dropdown-section">
                        <div className="resources-dropdown-title">Connect</div>
                        <Link 
                          href="/blog" 
                          className="site-nav-dropdown-item"
                          onClick={() => setIsResourcesDropdownOpen(false)}
                        >
                          <div className="w-8 h-8 theme-bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <span className="theme-text-primary font-bold text-sm">✍️</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium theme-text-gray-900">Blog</div>
                            <div className="text-xs theme-text-gray-600">Tips, updates & insights</div>
                          </div>
                        </Link>
                        <Link 
                          href="/community" 
                          className="site-nav-dropdown-item"
                          onClick={() => setIsResourcesDropdownOpen(false)}
                        >
                          <div className="w-8 h-8 theme-bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <span className="theme-text-primary font-bold text-sm">👥</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium theme-text-gray-900">Community</div>
                            <div className="text-xs theme-text-gray-600">Connect with creators</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link href="/support" className="px-3 py-2 text-foreground/60 transition-colors hover:text-foreground/80 rounded-md hover:bg-purple-50">
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
            <div className="p-1 rounded-lg theme-gradient-primary">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold theme-gradient-text">
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
              <Button size="sm" className="theme-button-primary">
                Get Started Free
              </Button>
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Mobile menu backdrop */}
          <div 
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          
          <div className="border-t md:hidden bg-white relative z-40 shadow-lg">
            <nav className="flex flex-col space-y-1 p-4 max-h-96 overflow-y-auto">
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold theme-text-gray-600 uppercase tracking-wider">Product</div>
                <Link 
                  href="/features" 
                  className="block px-3 py-2 text-sm font-medium theme-text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  href="/demo" 
                  className="block px-3 py-2 text-sm font-medium theme-text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Live Demo
                </Link>
                <Link 
                  href="/pricing" 
                  className="block px-3 py-2 text-sm font-medium theme-text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  href="/how-it-works" 
                  className="block px-3 py-2 text-sm font-medium theme-text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How it Works
                </Link>
              </div>
            
              <div className="border-t pt-4 space-y-1">
                <div className="px-3 py-2 text-xs font-semibold theme-text-gray-600 uppercase tracking-wider">Resources</div>
                <Link 
                  href="/docs" 
                  className="block px-3 py-2 text-sm font-medium theme-text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Documentation
                </Link>
                <Link 
                  href="/api-docs" 
                  className="block px-3 py-2 text-sm font-medium theme-text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  API Reference
                </Link>
                <Link 
                  href="/blog" 
                  className="block px-3 py-2 text-sm font-medium theme-text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  href="/community" 
                  className="block px-3 py-2 text-sm font-medium theme-text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Community
                </Link>
                <Link 
                  href="/support" 
                  className="block px-3 py-2 text-sm font-medium theme-text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Support
                </Link>
              </div>
              
              <div className="border-t pt-4">
                <Link href="/contact" className="block w-full mb-2" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  )
} 