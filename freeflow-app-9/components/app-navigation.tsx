"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AppNavigationProps {
  user?: {
    name?: string
    email?: string
    avatar?: string
  } | null
  variant?: 'default' | 'minimal' | 'transparent'
  showAuthButtons?: boolean
}

export function AppNavigation({ 
  user = null, 
  variant = 'default',
  showAuthButtons = true 
}: AppNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      // Implement logout logic
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getNavClassName = () => {
    const baseClasses = "fixed top-0 w-full z-50 transition-all duration-300"
    
    switch (variant) {
      case 'transparent':
        return `${baseClasses} ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'}`
      case 'minimal':
        return `${baseClasses} bg-white border-b border-gray-200`
      default:
        return `${baseClasses} ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-white border-b border-gray-200'}`
    }
  }

  const getLogoClassName = () => {
    if (variant === 'transparent' && !isScrolled) {
      return "text-2xl font-bold text-white hover:text-gray-200 transition-colors cursor-pointer"
    }
    return "text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
  }

  const getLinkClassName = () => {
    if (variant === 'transparent' && !isScrolled) {
      return "text-white hover:text-gray-200 transition-colors"
    }
    return "text-gray-700 hover:text-indigo-600 transition-colors"
  }

  return (
    <nav data-testid="app-navigation" className={getNavClassName()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className={getLogoClassName()}>
                <span data-testid="nav-logo">FreeflowZee</span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {!user && (
                <>
                  <a 
                    href="/#features" 
                    className={`${getLinkClassName()} transition-colors`}
                  >
                    Features
                  </a>
                  <a 
                    href="/#how-it-works" 
                    className={`${getLinkClassName()} transition-colors`}
                  >
                    How it works
                  </a>
                  <a 
                    href="/#pricing" 
                    className={`${getLinkClassName()} transition-colors`}
                  >
                    Pricing
                  </a>
                  <a 
                    href="/#testimonials" 
                    className={`${getLinkClassName()} transition-colors`}
                  >
                    Reviews
                  </a>
                </>
              )}
              
              {user && (
                <>
                  <Link href="/dashboard" className={`${getLinkClassName()} transition-colors`}>
                    Dashboard
                  </Link>
                  <Link href="/projects" className={`${getLinkClassName()} transition-colors`}>
                    Projects
                  </Link>
                  <Link href="/analytics" className={`${getLinkClassName()} transition-colors`}>
                    Analytics
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right side - Auth buttons or user menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={variant === 'transparent' && !isScrolled ? 'text-white hover:bg-white/20' : ''}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
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
                        className={variant === 'transparent' && !isScrolled ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:text-indigo-600'}
                      >
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Sign up free
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
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
                      <span className={getLinkClassName()}>{user.name || user.email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className={variant === 'transparent' && !isScrolled ? 'text-white hover:bg-white/20' : ''}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {!user ? (
                <>
                  <a
                    href="/#features"
                    className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </a>
                  <a
                    href="/#how-it-works"
                    className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    How it works
                  </a>
                  <a
                    href="/#pricing"
                    className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Pricing
                  </a>
                  <a
                    href="/#testimonials"
                    className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Reviews
                  </a>
                  <div className="border-t border-gray-200 pt-4">
                    <Link href="/login">
                      <Button 
                        variant="ghost" 
                        className="w-full text-left justify-start mb-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign up free
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/dashboard">
                    <Button 
                      variant="ghost" 
                      className="w-full text-left justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button 
                      variant="ghost" 
                      className="w-full text-left justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Projects
                    </Button>
                  </Link>
                  <Link href="/analytics">
                    <Button 
                      variant="ghost" 
                      className="w-full text-left justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Analytics
                    </Button>
                  </Link>
                  <div className="border-t border-gray-200 pt-4">
                    <Button
                      variant="ghost"
                      className="w-full text-left justify-start text-red-600 hover:text-red-700"
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 