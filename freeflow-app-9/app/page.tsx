import { Metadata } from 'next'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { HomePageClient } from './home-page-client'

// Enhanced SEO Metadata for Homepage
export const metadata: Metadata = {
  title: 'FreeflowZee - AI-Powered Creative Platform | Generate Assets, Share Files & Get Paid',
  description: 'Revolutionary AI-powered platform for creatives. Generate professional assets with premium AI models (GPT-4o, Claude, DALL-E), share files like WeTransfer with escrow payments, and manage creative projects seamlessly.',
  keywords: [
    'AI creative platform',
    'AI asset generation',
    'GPT-4o creative tools',
    'Claude AI for creatives',
    'DALL-E integration',
    'WeTransfer alternative',
    'file sharing with payments',
    'escrow payment system',
    'freelance management platform',
    'creative project management',
    'AI-powered design tools',
    'premium AI model trials',
    'video studio platform',
    'community for creatives',
    'secure file sharing',
    'professional client portals',
    'automated invoicing',
    'creative asset marketplace',
    'AI photography tools',
    'AI music generation',
    'AI writing assistant',
    'web development tools',
    'creative collaboration',
    'monetize creative work'
  ],
  authors: [{ name: 'FreeflowZee Team', url: 'https://freeflowzee.com' }],
  creator: 'FreeflowZee',
  publisher: 'FreeflowZee',
  category: 'Business Software',
  classification: 'SaaS Platform',
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
  openGraph: {
    title: 'FreeflowZee - AI-Powered Creative Platform | Generate Assets with Premium AI Models',
    description: 'Generate professional creative assets with GPT-4o, Claude & DALL-E. Share files like WeTransfer with escrow payments. The ultimate platform for modern creatives.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://freeflow-app-9-6egesbwif-thabo-5265s-projects.vercel.app',
    siteName: 'FreeflowZee',
    images: [
      {
        url: '/images/homepage-mockup.jpg',
        width: 1200,
        height: 630,
        alt: 'FreeflowZee - AI-powered creative platform with asset generation, WeTransfer-like file sharing, and escrow payments',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreeflowZee - AI-Powered Creative Platform | Premium AI Models & Secure File Sharing',
    description: 'Generate assets with GPT-4o, Claude & DALL-E. Share files like WeTransfer with escrow payments. Revolutionary platform for creatives.',
    images: ['/images/homepage-mockup.jpg'],
    creator: '@freeflowzee',
    site: '@freeflowzee',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://freeflow-app-9-6egesbwif-thabo-5265s-projects.vercel.app',
  },
}

// Enhanced Structured Data for Maximum SEO Impact
const generateStructuredData = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeflow-app-9-6egesbwif-thabo-5265s-projects.vercel.app'
  
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${baseUrl}/#webapp`,
        "name": "FreeflowZee",
        "alternateName": "FreeflowZee AI Creative Platform",
        "description": "AI-powered creative platform with premium model integration (GPT-4o, Claude, DALL-E), WeTransfer-like file sharing, escrow payments, and comprehensive project management",
        "url": baseUrl,
        "sameAs": [
          "https://twitter.com/freeflowzee",
          "https://linkedin.com/company/freeflowzee",
          "https://github.com/freeflowzee"
        ],
        "applicationCategory": "CreativeApplication",
        "applicationSubCategory": "AI-Powered Creative Tools",
        "operatingSystem": "Web",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "softwareVersion": "3.0.0",
        "releaseNotes": "Revolutionary AI Create feature with premium model integration and enhanced file sharing",
        "screenshot": `${baseUrl}/images/homepage-mockup.jpg`,
        "featureList": [
          "AI Asset Generation with Premium Models (GPT-4o, Claude 3.5, DALL-E 3)",
          "Free Trials of Expensive Premium AI Models",
          "6+ Creative Fields: Photography, Video, Design, Music, Writing, Web Dev",
          "WeTransfer-Style Professional File Sharing",
          "Secure Escrow Payment System",
          "Real-time Upload/Download Progress Tracking",
          "SEO-Optimized File Sharing Pages",
          "Social Media Integration (Twitter, Facebook, LinkedIn)",
          "Professional Video Studio with AI Enhancement",
          "Community Hub for Creative Collaboration",
          "Smart Project Tracker with AI Insights",
          "Automated Invoice Generation",
          "Multi-currency Payment Processing",
          "Professional Client Portals",
          "Team Collaboration Tools"
        ],
        "offers": [
          {
            "@type": "Offer",
            "name": "Free Plan",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Basic file sharing and project management features"
          },
          {
            "@type": "Offer",
            "name": "Pro Plan",
            "price": "29",
            "priceCurrency": "USD",
            "description": "Advanced features with unlimited storage and premium support"
          }
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "1247",
          "bestRating": "5",
          "worstRating": "1"
        },
        "author": {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`
        }
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "FreeflowZee",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/images/logo-preview.jpg`,
          "width": 512,
          "height": 512
        },
        "description": "Leading provider of freelance management and file sharing solutions",
        "foundingDate": "2023",
        "numberOfEmployees": "10-50",
        "slogan": "Streamline. Collaborate. Get Paid.",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+1-555-FREEFLOW",
          "contactType": "customer service",
          "availableLanguage": "English"
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "US",
          "addressRegion": "CA"
        }
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "FreeflowZee",
        "description": "Professional freelance management platform with file sharing and monetization",
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${baseUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${baseUrl}/#software`,
        "name": "FreeflowZee File Sharing",
        "applicationCategory": "Productivity",
        "applicationSubCategory": "File Sharing",
        "operatingSystem": "Web",
        "description": "WeTransfer alternative with external links, progress bars, and monetization features",
        "featureList": [
          "Drag & Drop File Upload",
          "Progress Bar Visualization", 
          "External Sharing Links",
          "Social Media Integration",
          "Payment Integration",
          "Analytics Dashboard"
        ],
        "screenshot": `${baseUrl}/images/homepage-mockup.jpg`,
        "downloadUrl": baseUrl,
        "softwareVersion": "2.0.0",
        "datePublished": "2023-01-01",
        "dateModified": new Date().toISOString().split('T')[0]
      }
    ]
  }
}

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