'use client'

import Link from 'next/link'
import { Rocket, Github, Twitter, Linkedin, Mail } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="container grid grid-cols-1 gap-8 py-16 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FreeflowZee
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Professional project management and client collaboration platform for creative agencies and freelancers.
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              <Mail className="h-5 w-5" />
            </Link>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Product</h4>
          <nav className="space-y-2 text-sm">
            <Link href="/features" className="text-muted-foreground hover:text-foreground block">
              Features
            </Link>
            <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground block">
              How it Works
            </Link>
            <Link href="/docs" className="text-muted-foreground hover:text-foreground block">
              Documentation
            </Link>
            <Link href="/api-docs" className="text-muted-foreground hover:text-foreground block">
              API Reference
            </Link>
          </nav>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Support</h4>
          <nav className="space-y-2 text-sm">
            <Link href="/support" className="text-muted-foreground hover:text-foreground block">
              Help Center
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground block">
              Contact Us
            </Link>
            <Link href="/community" className="text-muted-foreground hover:text-foreground block">
              Community
            </Link>
            <Link href="/tutorials" className="text-muted-foreground hover:text-foreground block">
              Tutorials
            </Link>
          </nav>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Company</h4>
          <nav className="space-y-2 text-sm">
            <Link href="/blog" className="text-muted-foreground hover:text-foreground block">
              Blog
            </Link>
            <Link href="/careers" className="text-muted-foreground hover:text-foreground block">
              Careers
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground block">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground block">
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
      
      <div className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 FreeflowZee. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Made with ❤️ for creatives</span>
          </div>
        </div>
      </div>
    </footer>
  )
} 