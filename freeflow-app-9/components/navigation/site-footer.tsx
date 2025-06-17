'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Rocket, Github, Twitter, Linkedin, Mail, Send, MapPin, Phone, Clock, CheckCircle } from 'lucide-react'

export function SiteFooter() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    
    try {
      // Simulate API call for newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubscribed(true)
      setEmail('')
      
      // Reset after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000)
    } catch (error) {
      console.error('Newsletter subscription failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <footer className="border-t bg-gray-50">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Stay Updated with FreeflowZee
          </h3>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            Get the latest updates, tips, and exclusive features delivered to your inbox. 
            Join thousands of creators in our community.
          </p>
          
          {isSubscribed ? (
            <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 max-w-md mx-auto">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Successfully subscribed!</p>
              <p className="text-green-100 text-sm">Check your email for confirmation.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:border-white/50"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-white text-indigo-600 hover:bg-gray-100 px-6 py-2 whitespace-nowrap"
                >
                  {isLoading ? 'Subscribing...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-indigo-200 mt-3">
                No spam, unsubscribe at any time. We respect your privacy.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Company Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-xl">
                FreeflowZee
              </span>
            </div>
            <p className="text-sm text-gray-600 max-w-sm">
              Professional project management and client collaboration platform for creative agencies and freelancers. 
              Transform your creative workflow today.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-indigo-500" />
                <span>San Francisco, CA & Remote</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-indigo-500" />
                <a href="tel:+1-555-FREEFLOW" className="hover:text-indigo-600">
                  +1 (555) FREEFLOW
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-indigo-500" />
                <a href="mailto:hello@freeflowzee.com" className="hover:text-indigo-600">
                  hello@freeflowzee.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-indigo-500" />
                <span>24/7 Support Available</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4 pt-4">
              <a href="https://github.com/freeflowzee" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-indigo-600 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/freeflowzee" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-indigo-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/company/freeflowzee" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-indigo-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:hello@freeflowzee.com" 
                 className="text-gray-400 hover:text-indigo-600 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Product</h4>
            <nav className="space-y-2 text-sm">
              <Link href="/features" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Features
              </Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                How it Works
              </Link>
              <Link href="/demo" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Live Demo
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Documentation
              </Link>
              <Link href="/api-docs" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                API Reference
              </Link>
            </nav>
          </div>
          
          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Support</h4>
            <nav className="space-y-2 text-sm">
              <Link href="/support" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Contact Us
              </Link>
              <Link href="/community" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Community
              </Link>
              <Link href="/tutorials" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Tutorials
              </Link>
              <Link href="/changelog" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Changelog
              </Link>
              <Link href="/status" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                System Status
              </Link>
            </nav>
          </div>
          
          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Company</h4>
            <nav className="space-y-2 text-sm">
              <Link href="/blog" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Blog
              </Link>
              <Link href="/careers" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Careers
              </Link>
              <Link href="/press" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Press Kit
              </Link>
              <Link href="/newsletter" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Newsletter
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-indigo-600 block transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t bg-white">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-sm text-gray-600">
            © 2024 FreeflowZee. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-600 hover:text-indigo-600">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-indigo-600">
              Terms
            </Link>
            <Link href="/cookies" className="text-gray-600 hover:text-indigo-600">
              Cookies
            </Link>
            <span className="text-gray-400">Made with ❤️ for creatives</span>
          </div>
        </div>
      </div>
    </footer>
  )
} 