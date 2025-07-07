import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { cn } from '@/lib/utils'
import { Providers } from '@/components/providers'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FreeflowZee - Create, Share & Get Paid Like a Pro',
  description: 'Generate creative assets with AI, share files like WeTransfer, manage projects with escrow payments, and build your creative business - all in one revolutionary platform.',
  keywords: 'AI creative assets, file sharing, escrow payments, creative business, digital collaboration, freelance platform',
  openGraph: {
    title: 'FreeflowZee - Create, Share & Get Paid Like a Pro',
    description: 'Generate creative assets with AI, share files like WeTransfer, manage projects with escrow payments, and build your creative business - all in one revolutionary platform.',
    type: 'website',
    url: 'https://freeflowzee.com',
    images: [
      {
        url: 'https://freeflowzee.com/images/hero-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'FreeflowZee Platform Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreeflowZee - Create, Share & Get Paid Like a Pro',
    description: 'Generate creative assets with AI, share files like WeTransfer, manage projects with escrow payments, and build your creative business - all in one revolutionary platform.',
    images: ['https://freeflowzee.com/images/hero-banner.jpg']
  },
  other: {
    'application-name': 'FreeflowZee',
    'theme-color': '#4F46E5'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
