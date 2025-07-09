import React from 'react'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AnalyticsProvider } from '@/components/providers/analytics-provider'
import { Context7Provider } from '@/components/providers/context7-provider'
import { Providers } from '@/components/providers'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'KAZI - Enterprise Freelance Management Platform',
  description: 'AI-powered freelance management platform with video collaboration, real-time document editing, and secure payment systems',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/kazi-brand/glyph-dark.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <AnalyticsProvider>
              <Context7Provider>
                {children}
                <Toaster />
              </Context7Provider>
            </AnalyticsProvider>
          </Providers>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
