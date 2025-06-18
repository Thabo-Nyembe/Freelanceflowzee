import { Metadata } from 'next'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { HomePageClient } from './home-page-client'

// Enhanced SEO Metadata for Homepage
export const metadata: Metadata = {
  title: 'FreeflowZee - Professional Freelance Management Platform | Upload, Share & Monetize Files',
  description: 'The ultimate freelance management platform with WeTransfer-like file sharing, external links, payment processing, and revenue analytics. Perfect for creators, agencies, and clients to streamline projects and get paid faster.',
  keywords: [
    'freelance management platform',
    'file sharing platform',
    'WeTransfer alternative', 
    'external file sharing',
    'project collaboration',
    'payment processing',
    'revenue analytics',
    'client portal',
    'creative workflow',
    'upload download progress',
    'monetize file sharing',
    'SEO optimized sharing',
    'social media sharing',
    'premium file downloads',
    'freelancer tools',
    'client management',
    'Dropbox alternative',
    'Pixelset alternative'
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
    title: 'FreeflowZee - Professional Freelance Management & File Sharing Platform',
    description: 'Upload, share & monetize files with external links, payment processing, and real-time analytics. The WeTransfer alternative for professionals.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://freeflow-app-9-6egesbwif-thabo-5265s-projects.vercel.app',
    siteName: 'FreeflowZee',
    images: [
      {
        url: '/images/homepage-mockup.jpg',
        width: 1200,
        height: 630,
        alt: 'FreeflowZee - Professional file sharing platform with upload progress, external links, and monetization features',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreeflowZee - Professional File Sharing & Freelance Management',
    description: 'Upload, share & monetize files with external links, payment processing, and real-time analytics. The WeTransfer alternative for professionals.',
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
        "alternateName": "FreeflowZee Platform",
        "description": "Professional freelance management platform with WeTransfer-like file sharing, external links, payment processing, and revenue analytics",
        "url": baseUrl,
        "sameAs": [
          "https://twitter.com/freeflowzee",
          "https://linkedin.com/company/freeflowzee",
          "https://github.com/freeflowzee"
        ],
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Project Management",
        "operatingSystem": "Web",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "softwareVersion": "2.0.0",
        "releaseNotes": "Enhanced file sharing with external links and monetization",
        "screenshot": `${baseUrl}/images/homepage-mockup.jpg`,
        "featureList": [
          "File Upload & Download with Progress Bars",
          "WeTransfer-like External Sharing Links",
          "SEO-Optimized File Sharing Pages",
          "Social Media Integration (Twitter, Facebook, LinkedIn)",
          "Payment Processing for Premium Downloads",
          "Real-time Revenue Analytics",
          "Multi-cloud Storage (Wasabi, AWS S3)",
          "Project Management Tools",
          "Client Collaboration Portal",
          "Invoice Generation",
          "Time Tracking",
          "Team Management"
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