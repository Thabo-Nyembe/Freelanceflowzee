'use client'

import Link from 'next/link'
import { Github, Twitter, Linkedin } from 'lucide-react'

const footerNav = {
  product: [
    { title: 'Features', href: '/features' },
    { title: 'Pricing', href: '/pricing' },
    { title: 'Changelog', href: '/changelog' },
    { title: 'Roadmap', href: '/roadmap' },
  ],
  resources: [
    { title: 'Documentation', href: '/docs' },
    { title: 'API Reference', href: '/api-docs' },
    { title: 'Blog', href: '/blog' },
    { title: 'Community', href: '/community' },
  ],
  company: [
    { title: 'About', href: '/about' },
    { title: 'Careers', href: '/careers' },
    { title: 'Contact', href: '/contact' },
    { title: 'Partners', href: '/partners' },
  ],
  legal: [
    { title: 'Privacy', href: '/privacy' },
    { title: 'Terms', href: '/terms' },
    { title: 'Security', href: '/security' },
    { title: 'Cookies', href: '/cookies' },
  ],
}

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/kazi-platform',
    icon: Github,
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/kaziplatform',
    icon: Twitter,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/kazi-platform',
    icon: Linkedin,
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12 md:px-6 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="mt-4 space-y-3">
              {footerNav.product.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerNav.resources.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerNav.company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerNav.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/kazi-brand/logo-light.png" 
                  alt="KAZI" 
                  className="h-6 w-auto"
                / loading="lazy">
                <span className="font-bold text-white">KAZI</span>
              </div>
              <span>© {new Date().getFullYear()} KAZI. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-4">
              {socialLinks.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 