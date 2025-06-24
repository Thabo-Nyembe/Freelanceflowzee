import { Suspense } from 'react'
import { Metadata } from 'next'
import PaymentClient from './payment-client'

// Ensure this page is dynamically rendered
export const dynamic = 'force-dynamic'

// Enhanced SEO metadata for payment page
export const metadata: Metadata = {
  title: 'Secure Payment & Pricing Plans | FreeflowZee AI-Powered Creative Platform',
  description: 'Choose from Creator Free, Pro Creator, or Agency Enterprise plans. Access premium AI models (GPT-4o, Claude, DALL-E) with secure escrow payment protection. Start your free trial today.',
  keywords: [
    'AI creative platform pricing',
    'premium AI model access',
    'secure payment processing',
    'escrow payment protection',
    'GPT-4o subscription',
    'Claude AI pricing',
    'DALL-E access plans',
    'creative asset generation',
    'AI studio subscription',
    'professional creative tools'
  ],
  openGraph: {
    title: 'Secure Payment & Pricing Plans | FreeflowZee AI-Powered Creative Platform',
    description: 'Choose from Creator Free, Pro Creator, or Agency Enterprise plans. Access premium AI models (GPT-4o, Claude, DALL-E) with secure escrow payment protection.',
    url: 'https://freeflowzee.com/payment',
    siteName: 'FreeflowZee',
    images: [
      {
        url: 'https://freeflowzee.com/images/payment-plans-og.jpg',
        width: 1200,
        height: 630,
        alt: 'FreeflowZee Payment Plans & Pricing',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secure Payment & Pricing Plans | FreeflowZee AI-Powered Creative Platform',
    description: 'Choose from Creator Free, Pro Creator, or Agency Enterprise plans. Access premium AI models with secure escrow payment protection.',
    images: ['https://freeflowzee.com/images/payment-plans-twitter.jpg'],
    creator: '@FreeflowZee',
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
  alternates: {
    canonical: 'https://freeflowzee.com/payment',
  },
  other: {
    'stripe:publishable_key': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },
}

// Fallback component for Suspense boundary
function PaymentFallback() {
  return (
    <div className="container mx-auto p-6 max-w-md" data-testid="payment-container">
      <div className="border rounded-lg shadow-sm bg-white">
        <div className="p-6 pb-0">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Structured data for payment page
const paymentStructuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "FreeflowZee AI-Powered Creative Platform",
  "description": "Revolutionary AI-powered creative platform with premium model access and secure payment processing",
  "category": "SoftwareApplication",
  "applicationCategory": "CreativeApplication",
  "offers": [
    {
      "@type": "Offer",
      "name": "Creator Free",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "/payment?plan=free",
      "description": "AI Create Studio with free models, basic file sharing, and community access"
    },
    {
      "@type": "Offer", 
      "name": "Pro Creator",
      "price": "29",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "/payment?plan=pro",
      "description": "Premium AI models (GPT-4o, Claude, DALL-E), escrow payments, and professional features"
    },
    {
      "@type": "Offer",
      "name": "Agency Enterprise", 
      "price": "79",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "/payment?plan=enterprise",
      "description": "White-label solution with custom AI training and enterprise features"
    }
  ],
  "provider": {
    "@type": "Organization",
    "name": "FreeflowZee",
    "url": "https://freeflowzee.com"
  },
  "paymentAccepted": ["Visa", "MasterCard", "American Express", "Apple Pay", "Google Pay"],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "2547",
    "bestRating": "5"
  }
}

export default function PaymentPage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(paymentStructuredData)
        }}
      />
      
      <Suspense fallback={<PaymentFallback />}>
        <PaymentClient />
      </Suspense>
    </>
  )
}
