'use client'

import { Inter } from 'next/font/google
import { ThemeProvider } from '@/components/theme-provider'
import { ErrorBoundary } from '@/components/error-handling/error-boundary'
import { NetworkErrorHandler } from '@/components/error-handling/network-error'
import { JavaScriptDisabledFallback } from '@/components/error-handling/js-disabled-fallback'
import { SiteHeader } from '@/components/site-header'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils
import '@/styles/globals.css

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>FreeflowZee - Create, Share & Get Paid Like a Pro</title>
        <meta name="description" content="Generate creative assets with AI, share files like WeTransfer, manage projects with escrow payments, and build your creative business - all in one revolutionary platform." />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ErrorBoundary>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <div className="flex-1">{children}</div>
              <NetworkErrorHandler />
              <JavaScriptDisabledFallback />
              <TailwindIndicator />
            </div>
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
