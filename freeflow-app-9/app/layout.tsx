/**
 * KAZI - Root Layout Component
 *
 * @copyright Copyright (c) 2025 KAZI. All rights reserved.
 * @license Proprietary - All Rights Reserved
 *
 * This software is proprietary to KAZI and may not be copied, modified,
 * or distributed without express written permission from KAZI.
 *
 * For licensing inquiries: legal@kazi.com
 */

import React from 'react'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'

import { Context7Provider } from '@/components/providers/context7-provider'
import { Providers } from '@/components/providers'
import { AnalyticsProvider } from '@/components/providers/analytics-provider'
import { SessionProvider } from '@/components/providers/session-provider'
import { RouteProgress } from '@/components/ui/route-progress'
import { WebVitals } from '@/components/performance/web-vitals'
import './globals.css'
import { ErrorBoundary } from "react-error-boundary"

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Critical for FCP optimization
  preload: true,
})

export const metadata = {
  metadataBase: new URL('https://kazi.app'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
  },
  applicationName: 'KAZI Platform',
  generator: 'Next.js',
  title: {
    default: 'KAZI - All-in-One Freelance & Agency Management Platform',
    template: '%s | KAZI'
  },
  description: 'Transform your freelance business with KAZI: AI-powered content creation, professional video studio, universal pinpoint feedback, secure escrow payments, and team collaboration. Built in Africa, engineered for the world.',
  keywords: [
    'freelance management',
    'agency platform',
    'AI content creation',
    'video collaboration',
    'escrow payments',
    'project management',
    'team collaboration',
    'invoice automation',
    'client management',
    'creative workflow'
  ],
  authors: [{ name: 'KAZI', url: 'https://kazi.app' }],
  creator: 'KAZI',
  publisher: 'KAZI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/kazi-brand/glyph-dark.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kazi.app',
    title: 'KAZI - All-in-One Freelance & Agency Management Platform',
    description: 'Transform your freelance business with AI-powered tools, video collaboration, secure payments, and more.',
    siteName: 'KAZI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KAZI Platform Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KAZI - All-in-One Freelance & Agency Management Platform',
    description: 'Transform your freelance business with AI-powered tools, video collaboration, secure payments, and more.',
    creator: '@kaziapp',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

import { OrganizationJsonLd } from '@/components/seo/json-ld'
import { ExitIntentPopup } from '@/components/marketing/exit-intent-popup'
import { LiveChatWidget } from '@/components/marketing/live-chat-widget'
import { NoiseTexture } from '@/components/ui/noise-texture'

export default function RootLayout({
  children, }: {
    children: React.ReactNode
  }) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={inter.className}>
        <OrganizationJsonLd />
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          {/* Skip to main content link for accessibility */}
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>

          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange={false}
          >
            {/* Premium Route Progress Bar */}
            <RouteProgress height={3} showSpinner={false} />
            <NoiseTexture />

            <SessionProvider>
              <Providers>
                <AnalyticsProvider>
                  <Context7Provider>
                    <Toaster />
                    <ExitIntentPopup />
                    <LiveChatWidget />
                    {children}
                  </Context7Provider>
                </AnalyticsProvider>
              </Providers>
            </SessionProvider>
            <Analytics />
            <WebVitals sendToAnalytics={process.env.NODE_ENV === 'production'} />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
