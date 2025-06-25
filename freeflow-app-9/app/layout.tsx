import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Analytics } from '@vercel/analytics/react'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FreeflowZee',
  description: 'Professional freelance project management platform',
  metadataBase: new URL('http://localhost:3001'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
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
          suppressHydrationWarning
        />
      </head>
      <body 
        className={cn(
          inter.className,
          'min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50'
        )}
      >
        <Providers>
          <main className="relative min-h-screen">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            <div className="relative">
              <div className="relative flex min-h-screen flex-col">
                <div className="flex-1">
                  <div className="glass-card mx-auto max-w-screen-2xl p-6">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
