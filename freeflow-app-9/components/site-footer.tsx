'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Phone, MapPin, ExternalLink, HelpCircle, Shield, FileText, Home, Twitter, Github, Linkedin } from 'lucide-react'

interface SiteFooterProps {
  variant?: 'default' | 'minimal'
}

const socialLinks = [
  { name: 'Twitter', href: 'https://twitter.com/freeflowzee', icon: Twitter },
  { name: 'Github', href: 'https://github.com/freeflowzee', icon: Github },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/freeflowzee', icon: Linkedin }
]

export function SiteFooter({ variant = 'default' }: SiteFooterProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setEmail('')
  }

  const handleEmailClick = () => {
    window.location.href = 'mailto:hello@freelanceflowzee.com'
  }

  const handlePhoneClick = () => {
    window.location.href = 'tel:+15551234567'
  }

  const handleAddressClick = () => {
    window.open('https://maps.google.com/?q=San Francisco, CA', '_blank')
  }

  if (variant === 'minimal') {
    return (
      <footer className="bg-gray-50 border-t border-gray-200" data-testid="minimal-footer">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <Home className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">FreeflowZee</span>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-gray-600">
              © 2024 FreeflowZee. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="theme-footer" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4" data-testid="footer-logo">
                <Home className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">FreeflowZee</span>
              </div>
              <p className="text-gray-600 mb-6">
                Empowering creative professionals with AI-powered tools for seamless collaboration and exceptional results.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <button 
                  onClick={handleEmailClick}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                  data-testid="footer-email"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  hello@freelanceflowzee.com
                </button>
                <button 
                  onClick={handlePhoneClick}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                  data-testid="footer-phone"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  +1 (555) 123-4567
                </button>
                <button 
                  onClick={handleAddressClick}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                  data-testid="footer-address"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  San Francisco, CA
                </button>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="footer-features">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="footer-pricing">Pricing</Link></li>
                <li><Link href="/demo" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="footer-demo">Demo</Link></li>
                <li><Link href="/integrations" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="footer-integrations">Integrations</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="/blog" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="footer-blog">Blog</Link></li>
                <li><Link href="/help" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="footer-help">Help Center</Link></li>
                <li><Link href="/api-docs" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="footer-api">API Docs</Link></li>
                <li><Link href="/community" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="footer-community">Community</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stay Updated</h3>
              <p className="text-gray-600 mb-4">
                Get the latest updates and tips delivered to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3" data-testid="newsletter-form">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="newsletter-input"
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                  data-testid="newsletter-submit"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-4 md:mb-0">
              <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center" data-testid="footer-privacy">
                <Shield className="w-4 h-4 mr-1" />
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center" data-testid="footer-terms">
                <FileText className="w-4 h-4 mr-1" />
                Terms of Service
              </Link>
              <Link href="/help" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center" data-testid="footer-support">
                <HelpCircle className="w-4 h-4 mr-1" />
                Support
              </Link>
              <Link href="/cookies" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center" data-testid="footer-cookies">
                <FileText className="w-4 h-4 mr-1" />
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center" data-testid="footer-accessibility">
                <HelpCircle className="w-4 h-4 mr-1" />
                Accessibility
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label={link.name}
                  data-testid={`footer-social-${link.name.toLowerCase()}`}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              © 2024 FreeflowZee. All rights reserved. Made with ❤️ for creative professionals.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 