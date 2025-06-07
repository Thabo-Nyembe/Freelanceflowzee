'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Github, 
  Facebook,
  Instagram,
  Home,
  FolderOpen,
  CreditCard,
  Shield,
  HelpCircle,
  FileText,
  ExternalLink
} from 'lucide-react'

interface SiteFooterProps {
  variant?: 'default' | 'minimal'
}

export function SiteFooter({ variant = 'default' }: SiteFooterProps) {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const handleEmailClick = () => {
    window.location.href = 'mailto:hello@freelanceflowzee.com?subject=Contact from FreeflowZee Website'
  }

  const handlePhoneClick = () => {
    window.location.href = 'tel:+15551234567'
  }

  const handleAddressClick = () => {
    // Open in Google Maps with the address
    const address = encodeURIComponent('San Francisco, CA')
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`
    window.open(mapsUrl, '_blank', 'noopener,noreferrer')
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setIsSubscribed(true)
      console.log('Newsletter signup:', email)
      setEmail('')
    }
  }

  // Social media links with real URLs
  const socialLinks = [
    { 
      icon: Twitter, 
      href: 'https://twitter.com/freelanceflowzee', 
      label: 'Twitter',
      handle: '@freelanceflowzee' 
    },
    { 
      icon: Linkedin, 
      href: 'https://linkedin.com/company/freelanceflowzee', 
      label: 'LinkedIn',
      handle: 'freelanceflowzee' 
    },
    { 
      icon: Github, 
      href: 'https://github.com/freelanceflowzee', 
      label: 'GitHub',
      handle: 'freelanceflowzee' 
    },
    { 
      icon: Facebook, 
      href: 'https://facebook.com/freelanceflowzee', 
      label: 'Facebook',
      handle: 'freelanceflowzee' 
    },
    { 
      icon: Instagram, 
      href: 'https://instagram.com/freelanceflowzee', 
      label: 'Instagram',
      handle: '@freelanceflowzee' 
    },
  ]

  if (variant === 'minimal') {
    return (
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700">
                FreeflowZee
              </Link>
              <span className="text-gray-500">© 2024 All rights reserved</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleEmailClick}>
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="space-y-6">
              <div>
                <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300 transition-colors">
                  FreeflowZee
                </Link>
                <p className="mt-4 text-gray-400 text-sm leading-6">
                  Empowering creators to share their work, get paid instantly, and build lasting client relationships.
                </p>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Contact Us
                </h4>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-0 text-gray-400 hover:text-white hover:bg-transparent"
                  onClick={handleEmailClick}
                >
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">hello@freelanceflowzee.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-0 text-gray-400 hover:text-white hover:bg-transparent"
                  onClick={handlePhoneClick}
                >
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">+1 (555) 123-4567</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-0 text-gray-400 hover:text-white hover:bg-transparent"
                  onClick={handleAddressClick}
                  title="Open in Google Maps"
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">San Francisco, CA</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </Button>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                Product
              </h4>
              <ul className="space-y-4">
                {[
                  { href: '/features', label: 'Features' },
                  { href: '/how-it-works', label: 'How it Works' },
                  { href: '/payment', label: 'Pricing' },
                  { href: '/demo', label: 'Demo Project', icon: ExternalLink },
                  { href: '/dashboard', label: 'Dashboard', icon: Home },
                ].map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center"
                    >
                      {item.label}
                      {item.icon && <item.icon className="w-3 h-3 ml-1" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                Resources
              </h4>
              <ul className="space-y-4">
                {[
                  { href: '/docs', label: 'Documentation' },
                  { href: '/tutorials', label: 'Video Tutorials' },
                  { href: '/api-docs', label: 'API Reference' },
                  { href: '/community', label: 'Community' },
                  { href: '/blog', label: 'Blog' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                Company
              </h4>
              <ul className="space-y-4">
                {[
                  { href: '/contact', label: 'Contact', icon: Mail },
                  { href: '/support', label: 'Support', icon: HelpCircle },
                  { href: '/privacy', label: 'Privacy Policy', icon: Shield },
                  { href: '/terms', label: 'Terms of Service', icon: FileText },
                ].map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center"
                    >
                      {item.icon && <item.icon className="w-3 h-3 mr-2" />}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter & Social */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                Stay Updated
              </h4>
              <div className="space-y-6">
                <p className="text-gray-400 text-sm">
                  Get the latest updates and tips for maximizing your creative workflow.
                </p>
                
                {/* Newsletter Signup */}
                {isSubscribed ? (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <p className="font-medium">🎉 Thanks for subscribing!</p>
                    <p className="text-sm">You'll receive our latest content in your inbox.</p>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-indigo-500"
                      required
                      suppressHydrationWarning
                    />
                    <Button 
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Subscribe
                    </Button>
                  </form>
                )}

                {/* Social Links */}
                <div>
                  <h5 className="text-sm font-medium text-white mb-3">Follow Us</h5>
                  <div className="flex space-x-3">
                    {socialLinks.map((social) => (
                      <Link
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                        title={`Follow us on ${social.label} (${social.handle})`}
                      >
                        <social.icon className="w-5 h-5" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>© 2024 FreeflowZee. All rights reserved.</span>
              <span className="hidden md:block">•</span>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="hidden md:block">•</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-4">
              <Link href="/signup">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Get Started
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 