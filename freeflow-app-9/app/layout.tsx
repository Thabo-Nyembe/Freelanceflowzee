import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Context7Provider } from '@/components/providers/context7-provider'
import { PerformanceMonitor } from '@/components/performance-monitor'

export const metadata: Metadata = {
  title: 'FreeflowZee - Ultimate Freelance Management Platform',
  description: 'Comprehensive freelance management platform with universal feedback, project tracking, financial management, and team collaboration.',
  keywords: 'freelance, project management, feedback system, invoicing, collaboration, supabase',
  authors: [{ name: 'FreeflowZee Team' }],
  creator: 'FreeflowZee',
  publisher: 'FreeflowZee',
  applicationName: 'FreeflowZee',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FreeflowZee',
    startupImage: [
      '/icons/apple-touch-startup-image-750x1334.png',
      {
        url: '/icons/apple-touch-startup-image-1242x2208.png',
        media: '(device-width: 414px) and (device-height: 736px)',
      },
      {
        url: '/icons/apple-touch-startup-image-1125x2436.png',
        media: '(device-width: 375px) and (device-height: 812px)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'FreeflowZee',
    title: 'FreeflowZee - Ultimate Freelance Management Platform',
    description: 'Comprehensive freelance management platform with universal feedback, project tracking, financial management, and team collaboration.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FreeflowZee Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreeflowZee - Ultimate Freelance Management Platform',
    description: 'Comprehensive freelance management platform with universal feedback, project tracking, financial management, and team collaboration.',
    images: ['/twitter-image.png'],
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'apple-touch-icon-precomposed', url: '/icons/apple-touch-icon-precomposed.png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366f1' },
    { media: '(prefers-color-scheme: dark)', color: '#4f46e5' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content={viewport.toString()} />
      </head>
      <body>
        <PerformanceMonitor />
        <Context7Provider>
          {children}
        </Context7Provider>
      </body>
    </html>
  )
}
