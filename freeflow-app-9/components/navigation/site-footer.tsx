'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-indigo-400">FreeflowZee</h3>
            <p className="text-gray-300">
              The ultimate freelancer platform with escrow protection, collaboration tools, and professional portfolio management.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/features" className="block text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/how-it-works" className="block text-gray-300 hover:text-white transition-colors">
                How it Works
              </Link>
              <Link href="/payment" className="block text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/demo" className="block text-gray-300 hover:text-white transition-colors">
                Demo
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <div className="space-y-2">
              <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors">
                Contact Us
              </Link>
              <Link href="/docs" className="block text-gray-300 hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="/support" className="block text-gray-300 hover:text-white transition-colors">
                Help Center
              </Link>
              <Link href="/community" className="block text-gray-300 hover:text-white transition-colors">
                Community
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-indigo-400" />
                <span className="text-gray-300">hello@freelanceflowzee.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-indigo-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-indigo-400" />
                <span className="text-gray-300">San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 FreeflowZee. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 