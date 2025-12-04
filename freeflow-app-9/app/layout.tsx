import React from 'react'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'

import { Context7Provider } from '@/components/providers/context7-provider'
import { Providers } from '@/components/providers'
import { RouteProgress } from '@/components/ui/route-progress'
import './globals.css'
import { ErrorBoundary } from "react-error-boundary"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://kazi.app'),
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
}

export default function RootLayout({
  children, }: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth light">
      <body className={`${inter.className} bg-white text-black`}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            forcedTheme="light"
          >
            {/* Premium Route Progress Bar */}
            <RouteProgress height={3} showSpinner={false} />

            <Providers>
              <Context7Provider>
                <Toaster />
                {children}
              </Context7Provider>
            </Providers>
            <Analytics />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
