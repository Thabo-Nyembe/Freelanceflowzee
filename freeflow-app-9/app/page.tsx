import { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HomePageClient } from './home-page-client'
import { createClient } from '@/lib/supabase/server'

// Generate metadata for better SEO
export const metadata: Metadata = {
  title: 'FreeflowZee - AI-Powered Creative Platform',
  description: 'Generate creative assets with AI, share files like WeTransfer, manage projects with escrow payments, and build your creative business - all in one revolutionary platform.',
  keywords: 'AI, creative platform, file sharing, project management, escrow payments, freelance',
  authors: [{ name: 'FreeflowZee Team' }],
  creator: 'FreeflowZee',
  publisher: 'FreeflowZee',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'FreeflowZee - AI-Powered Creative Platform',
    description: 'Generate creative assets with AI, share files like WeTransfer, manage projects with escrow payments, and build your creative business - all in one revolutionary platform.',
    url: 'https://freeflowzee.com',
    siteName: 'FreeflowZee',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FreeflowZee Platform Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreeflowZee - AI-Powered Creative Platform',
    description: 'Generate creative assets with AI, share files like WeTransfer, manage projects with escrow payments, and build your creative business - all in one revolutionary platform.',
    images: ['/images/twitter-image.jpg']
  }
}

// Generate structured data for better SEO
function generateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'FreeflowZee',
    description: 'AI-Powered Creative Platform for Modern Professionals',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '10000'
    }
  }
}

// Server Component (Default)
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/40" suppressHydrationWarning>
      {/* Server-side Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData())
        }}
        suppressHydrationWarning
      />
      
      <SiteHeader />
      
      {/* Client-side Interactive Components */}
      <HomePageClient />
      
      <SiteFooter />
    </div>
  )
} 