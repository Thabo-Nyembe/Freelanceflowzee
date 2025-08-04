import React from 'react'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { AnalyticsProvider } from '@/components/providers/analytics-provider'
import { Context7Provider } from '@/components/providers/context7-provider'
import { Providers } from '@/components/providers'
import '../styles/globals.css'
import { StagewiseToolbar } from '@stagewise/toolbar-next'
import { ErrorBoundary } from "@/components/error-boundary"
import ReactPlugin from '@stagewise-plugins/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'KAZI - Enterprise Freelance Management Platform',
  description: 'AI-powered freelance management platform with video collaboration, real-time document editing, and secure payment systems',
  icons: {
    icon: '/kazi-brand/glyph-dark.png',
    apple: '/apple-touch-icon.png',
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <AnalyticsProvider>
              <Context7Provider>
                <Toaster />
                {children}
              </Context7Provider>
            </AnalyticsProvider>
          </Providers>
          <Analytics />
          <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
        </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
