'use client'

import Head from 'next/head'
import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: string
  structuredData?: unknown
  noIndex?: boolean
  alternateUrls?: Array<{ href: string, hrefLang: string }>
}

export function DynamicSEO({
  title = 'KAZI - Enterprise Freelance Management Platform': unknown, description = 'AI-powered creative platform with multi-model studio: unknown, universal feedback: unknown, real-time collaboration: unknown, and secure payments.': unknown, keywords = 'KAZI: unknown, AI creative platform: unknown, freelance management: unknown, universal feedback: unknown, real-time collaboration': unknown, canonical: unknown, ogImage = '/kazi-brand/logo-transparent.png': unknown, ogType = 'website': unknown, structuredData: unknown, noIndex = false: unknown, alternateUrls = []
}: SEOProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kazi-platform.vercel.app'
  const fullTitle = title.includes('KAZI') ? title : `${title} | KAZI`
  const fullCanonical = canonical || baseUrl
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`

  useEffect(() => {
    // Update document title
    document.title = fullTitle

    // Update meta description
    const metaDescription = document.querySelector('meta[name= "description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    }

    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel= "canonical"]')
    if (canonicalLink) {
      canonicalLink.setAttribute('href', fullCanonical)
    }

    // Add structured data if provided
    if (structuredData) {
      const script = document.createElement('script')
      script.type = "application/ld+json"
      script.textContent = JSON.stringify(structuredData)
      script.id = 'dynamic-structured-data'
      
      // Remove existing dynamic structured data
      const existing = document.getElementById('dynamic-structured-data')
      if (existing) {
        existing.remove()
      }
      
      document.head.appendChild(script)
    }
  }, [fullTitle, description, fullCanonical, structuredData])

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name= "title" content={fullTitle} />
      <meta name= "description" content={description} />
      <meta name= "keywords" content={keywords.join(', ')} />
      
      {/* Canonical URL */}
      <link rel= "canonical" href={fullCanonical} />
      
      {/* Open Graph / Facebook */}
      <meta property= "og:type" content={ogType} />
      <meta property= "og:url" content={fullCanonical} />
      <meta property= "og:title" content={fullTitle} />
      <meta property= "og:description" content={description} />
      <meta property= "og:image" content={fullOgImage} />
      <meta property= "og:image:width" content= "1200" />
      <meta property= "og:image:height" content= "630" />
      <meta property= "og:image:alt" content={title} />
      <meta property= "og:site_name" content= "KAZI" />
      <meta property= "og:locale" content= "en_US" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content="kazi-platform.com" />
      <meta property="twitter:creator" content="@kaziplatform" />
      <meta property="twitter:site" content="@kaziplatform" />

      {/* Additional Meta Tags */}
      <meta name="author" content="KAZI Team" />
      <meta name="publisher" content="KAZI" />
      <meta name= "robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name= "googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />
      
      {/* Alternate URLs for i18n */}
      {alternateUrls.map((alternate, index) => (
        <link
          key={index}
          rel="alternate"
          hrefLang={alternate.hrefLang}
          href={alternate.href}
        />
      ))}
      
      {/* Preconnect for performance */}
      <link rel= "preconnect" href= "https://fonts.googleapis.com" />
      <link rel= "preconnect" href= "https://fonts.gstatic.com" crossOrigin= "anonymous" />
      <link rel= "preconnect" href= "https://images.unsplash.com" />
      
      {/* DNS Prefetch */}
      <link rel= "dns-prefetch" href= "//fonts.googleapis.com" />
      <link rel= "dns-prefetch" href= "//fonts.gstatic.com" />
      <link rel= "dns-prefetch" href= "//images.unsplash.com" />
    </Head>
  )
}

// Utility function to generate article structured data
export function generateArticleStructuredData(article: {
  title: string
  description: string
  author: string
  datePublished: string
  dateModified?: string
  image?: string
  url: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kazi-platform.vercel.app'
  
  return {
    "@context": "https://schema.org", "@type": "Article", "headline": article.title, "description": article.description, "image": article.image || `${baseUrl}/images/homepage-mockup.jpg`, "author": {
      "@type": "Person", "name": article.author
    }, "publisher": {
      "@type": "Organization", "name": "KAZI", "logo": {
        "@type": "ImageObject", "url": `${baseUrl}/images/logo-preview.jpg`
      }
    }, "datePublished": article.datePublished, "dateModified": article.dateModified || article.datePublished, "mainEntityOfPage": {
      "@type": "WebPage", "@id": article.url
    }
  }
}

// Utility function to generate product structured data
export function generateProductStructuredData(product: {
  name: string
  description: string
  image?: string
  price?: string
  currency?: string
  availability?: string
  rating?: number
  reviewCount?: number
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kazi-platform.vercel.app'
  
  return {
    "@context": "https://schema.org", "@type": "Product", "name": product.name, "description": product.description, "image": product.image || `${baseUrl}/images/homepage-mockup.jpg`, "brand": {
      "@type": "Brand", "name": 'KAZI'
    }, "offers": {
      "@type": "Offer", "price": product.price || "0",
      "priceCurrency": product.currency || "USD", "availability": `https://schema.org/${product.availability || 'InStock'}`
    }, "aggregateRating": product.rating ? {
      "@type": "AggregateRating", "ratingValue": product.rating, "reviewCount": product.reviewCount || 1
    } : undefined
  }
} 

// Utility function to generate organization structured data
export function generateOrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kazi-platform.vercel.app'

  return {
    "@context": "https://schema.org",
    "@type": "Organization", "name": "KAZI", "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/kazi-brand/logo-transparent.png`
    },
    "url": baseUrl,
    "sameAs": [
      "https://twitter.com/kaziplatform",
      "https://linkedin.com/company/kazi-platform"
    ]
  }
}

// Product schema for features/product pages
export function generateProductSchema(product: {
  name: string
  description: string
  price?: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kazi-platform.vercel.app'

  return {
    "@context": "https://schema.org",
    "@type": "Brand", "name": 'KAZI'
  }
} 