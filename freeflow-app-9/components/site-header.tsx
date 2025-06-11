'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut, Home, FolderOpen, Mail, Phone, CreditCard, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface SiteHeaderProps {
  user?: {
    name?: string
    email?: string
    avatar?: string
  } | null
  variant?: 'default' | 'minimal' | 'transparent'
  showAuthButtons?: boolean
}

export function SiteHeader({ 
  user = null, 
  variant = 'default',
  showAuthButtons = true 
}: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleEmailClick = () => {
    window.location.href = 'mailto:hello@freelanceflowzee.com?subject=Contact from FreeflowZee Website'
  }

  const handlePhoneClick = () => {
    window.location.href = 'tel:+15551234567'
  }

  const getNavClassName = () => {
    const baseClasses = "fixed top-0 w-full z-50 transition-all duration-300"
    
    switch (variant) {
      case 'transparent':
        return `${baseClasses} ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`
      case 'minimal':
        return `${baseClasses} bg-white border-b border-gray-200`
      default:
        return `${baseClasses} ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white border-b border-gray-200'}`
    }
  }

  const getLogoClassName = () => {
    if (variant === 'transparent' && !isScrolled) {
      return "text-2xl font-bold text-white hover:text-gray-200 transition-colors cursor-pointer"
    }
    return "text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
  }

  const getLinkClassName = (href: string) => {
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
    const baseClass = "transition-colors font-medium"
    
    if (variant === 'transparent' && !isScrolled) {
      return `${baseClass} ${isActive ? 'text-white border-b-2 border-white' : 'text-white/80 hover:text-white'}`
    }
    return `${baseClass} ${isActive ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`
  }

  const getButtonClassName = () => {
    if (variant === 'transparent' && !isScrolled) {
      return "text-white hover:bg-white/20"
    }
    return ""
  }

  // Navigation items with proper Context7 structure
  const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/features', label: 'Features' },
    { href: '/how-it-works', label: 'How it Works' },
    { href: '/payment', label: 'Pricing' },
    { href: '/demo', label: 'Demo' },
    { href: '/contact', label: 'Contact', icon: Mail },
  ]

  const userNavigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/projects', label: 'Projects', icon: FolderOpen },
    { href: '/payment', label: 'Payments', icon: CreditCard },
    { href: '/contact', label: 'Support', icon: Mail },
  ]

  return (
    <nav data-testid="site-header" className={getNavClassName()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className={getLogoClassName()}>
              <span data-testid="nav-logo">FreeflowZee</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? userNavigationItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={getLinkClassName(item.href)}
              >
                {item.label}
              </Link>
            )) : (
              <>
                {navigationItems.slice(0, 4).map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className={getLinkClassName(item.href)}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Resources Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={`${getLinkClassName('/docs')} flex items-center space-x-1`}>
                      <span>Resources</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/docs" className="w-full">
                        Documentation
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/tutorials" className="w-full">
                        Video Tutorials
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/api-docs" className="w-full">
                        API Reference
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/community" className="w-full">
                        Community
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/support" className="w-full">
                        Support
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Link 
                  href="/contact" 
                  className={getLinkClassName('/contact')}
                >
                  Contact
                </Link>
              </>
            )}
          </div>

          {/* Right side - Contact, Auth buttons, or user menu */}
          <div className="flex items-center space-x-4">
            {/* Quick Contact Actions - Desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEmailClick}
                className={`${getButtonClassName()} hover:bg-indigo-50`}
                title="Send us an email"
              >
                <Mail className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePhoneClick}
                className={`${getButtonClassName()} hover:bg-indigo-50`}
                title="Call us"
              >
                <Phone className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`${getButtonClassName()} button-touch`}
                aria-label="Toggle mobile menu"
                data-testid="mobile-menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>

            {/* Auth buttons or user menu */}
            {showAuthButtons && (
              <div className="hidden md:flex items-center space-x-4">
                {!user ? (
                  <>
                    <Link href="/login">
                      <Button 
                        variant="ghost" 
                        className={getButtonClassName()}
                      >
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Get Started
                      </Button>
                    </Link>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name || 'User'} 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="hidden lg:block text-sm">{user.name || user.email}</span>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center">
                          <Home className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/projects" className="flex items-center">
                          <FolderOpen className="w-4 h-4 mr-2" />
                          Projects
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/contact" className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          Support
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex items-center text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mobile-only" data-testid="mobile-menu-content">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 shadow-lg">
              {user ? userNavigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors button-touch"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <span>{item.label}</span>
                  </div>
                </Link>
              )) : (
                <>
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors button-touch"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon && <item.icon className="w-5 h-5" />}
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  ))}
                  
                  {/* Mobile Resources Section */}
                  <div className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-500 mb-2">Resources</div>
                    <div className="space-y-1">
                      <Link
                        href="/docs"
                        className="block py-2 text-sm text-gray-700 hover:text-indigo-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Documentation
                      </Link>
                      <Link
                        href="/tutorials"
                        className="block py-2 text-sm text-gray-700 hover:text-indigo-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Video Tutorials
                      </Link>
                      <Link
                        href="/api-docs"
                        className="block py-2 text-sm text-gray-700 hover:text-indigo-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        API Reference
                      </Link>
                      <Link
                        href="/community"
                        className="block py-2 text-sm text-gray-700 hover:text-indigo-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Community
                      </Link>
                      <Link
                        href="/support"
                        className="block py-2 text-sm text-gray-700 hover:text-indigo-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Support
                      </Link>
                    </div>
                  </div>
                </>
              )}
              
              {/* Mobile Contact Actions */}
              <div className="px-3 py-2 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-500 mb-2">Contact</div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleEmailClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 button-touch"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handlePhoneClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 button-touch"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
              
              {/* Mobile Auth Buttons */}
              {showAuthButtons && !user && (
                <div className="px-3 py-2 border-t border-gray-200 space-y-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start button-touch">
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full button-touch">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 