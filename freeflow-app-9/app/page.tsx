import { Metadata } from 'next'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { HomePageClient } from './home-page-client'

// Next.js Metadata Export (Server-side only)
export const metadata: Metadata = {
  title: 'FreeflowZee - Professional Freelance Management Platform',
  description: 'The ultimate freelance management platform for creators, agencies, and clients. Streamline projects, collaborate seamlessly, and get paid faster.',
  keywords: 'freelance, project management, collaboration, payments, invoicing, creative workflow',
  authors: [{ name: 'FreeflowZee' }],
  creator: 'FreeflowZee',
  publisher: 'FreeflowZee',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'FreeflowZee - Professional Freelance Management Platform',
    description: 'The ultimate freelance management platform for creators, agencies, and clients.',
    url: 'https://freeflowzee.com',
    siteName: 'FreeflowZee',
    images: [
      {
        url: '/homepage-mockup.jpg',
        width: 1200,
        height: 630,
        alt: 'FreeflowZee Platform Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreeflowZee - Professional Freelance Management Platform',
    description: 'The ultimate freelance management platform for creators, agencies, and clients.',
    images: ['/homepage-mockup.jpg'],
  },
}

// Context7 Pattern: Server-side structured data for SEO
const generateStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "FreeflowZee",
  "description": "Professional freelance management platform for creators, agencies, and clients",
  "url": "https://freeflowzee.com",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "10000"
  }
})

// Server Component (Default)
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/40">
      {/* Server-side Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData())
        }}
      />
      
      <SiteHeader />
      
      {/* Client-side Interactive Components */}
      <HomePageClient />
      
      <SiteFooter />
    </div>
  )
} 