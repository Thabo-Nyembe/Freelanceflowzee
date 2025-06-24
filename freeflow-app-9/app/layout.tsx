import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/providers/providers'
import { AnalyticsProvider } from '@/components/providers/analytics-provider'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

// Enhanced metadata for production
export const metadata: Metadata = {
  title: {
    default: 'FreeflowZee - AI-Powered Creative Platform | Generate Assets with Premium AI Models',
    template: '%s | FreeflowZee'
  },
  description: 'Revolutionary AI-powered creative platform with premium model access (GPT-4o, Claude, DALL-E). Generate professional assets, share files like WeTransfer with escrow payments, and manage creative projects seamlessly.',
  keywords: [
    'AI creative platform',
    'AI asset generation',
    'GPT-4o creative tools',
    'Claude AI for creatives',
    'DALL-E integration',
    'premium AI model trials',
    'WeTransfer alternative',
    'escrow payment system',
    'file sharing with payments',
    'creative project management',
    'AI-powered design tools',
    'video studio platform',
    'freelance management',
    'creative workflow automation',
    'professional creative tools'
  ],
  authors: [{ name: 'FreeflowZee Team' }],
  creator: 'FreeflowZee',
  publisher: 'FreeflowZee',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://freeflowzee.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'FreeflowZee - AI-Powered Creative Platform | Generate Assets with Premium AI Models',
    description: 'Revolutionary AI-powered creative platform with premium model access (GPT-4o, Claude, DALL-E). Generate professional assets, share files like WeTransfer with escrow payments.',
    siteName: 'FreeflowZee',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FreeflowZee - AI-Powered Creative Platform with Asset Generation and File Sharing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreeflowZee - AI-Powered Creative Platform | Generate Assets with Premium AI Models',
    description: 'Revolutionary AI-powered creative platform with premium model access (GPT-4o, Claude, DALL-E). Generate professional assets, share files like WeTransfer with escrow payments.',
    images: ['/images/twitter-image.jpg'],
    creator: '@freeflowzee',
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
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
  category: 'technology',
  classification: 'Business',
  referrer: 'origin-when-cross-origin',
  generator: 'Next.js',
  applicationName: 'FreeflowZee',
  appleWebApp: {
    capable: true,
    title: 'FreeflowZee',
    statusBarStyle: 'default',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#3b82f6',
      },
    ],
  },
}

// Enhanced viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://js.stripe.com" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//js.stripe.com" />
        
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Microsoft specific meta tags */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Additional SEO meta tags */}
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="ICBM" content="37.7749, -122.4194" />
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "FreeflowZee",
              "description": "AI-powered creative platform with premium model access (GPT-4o, Claude, DALL-E) for asset generation, WeTransfer-style file sharing, and escrow payments",
              "url": "https://freeflowzee.com",
              "applicationCategory": "CreativeApplication",
              "applicationSubCategory": "AI-Powered Creative Tools",
              "operatingSystem": "Web",
              "featureList": [
                "AI Asset Generation with Premium Models (GPT-4o, Claude 3.5, DALL-E 3)",
                "Free Trials of Expensive Premium AI Models",
                "6+ Creative Fields: Photography, Video, Design, Music, Writing, Web Dev",
                "WeTransfer-Style Professional File Sharing",
                "Secure Escrow Payment System",
                "Professional Video Studio with AI Enhancement",
                "Community Hub for Creative Collaboration"
              ],
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "2547"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster />
          <AnalyticsProvider />
        </Providers>
        
        {/* Performance monitoring script */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Add performance monitoring here if needed
              `
            }}
          />
        )}
      </body>
    </html>
  )
}
