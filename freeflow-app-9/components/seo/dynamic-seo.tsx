'use client'

 hrefLang: string }>
}

export function DynamicSEO({
  title = 'FreeflowZee - Professional Freelance Management Platform',
  description = 'Upload, share & monetize files with external links, payment processing, and real-time analytics. The WeTransfer alternative for professionals.',
  keywords = ['freelance management', 'file sharing', 'WeTransfer alternative'],
  canonical,
  ogImage = '/images/homepage-mockup.jpg',
  ogType = 'website',
  structuredData,
  noIndex = false,
  alternateUrls = []
}: SEOProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeflow-app-9-6egesbwif-thabo-5265s-projects.vercel.app'
  const fullTitle = title.includes('FreeflowZee') ? title : `${title} | FreeflowZee`
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
      script.type = 'application/ld+json'
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
      <meta property= "og:site_name" content= "FreeflowZee" />
      <meta property= "og:locale" content= "en_US" />
      
      {/* Twitter */}
      <meta property= "twitter:card" content= "summary_large_image" />
      <meta property= "twitter:url" content={fullCanonical} />
      <meta property= "twitter:title" content={fullTitle} />
      <meta property= "twitter:description" content={description} />
      <meta property= "twitter:image" content={fullOgImage} />
      <meta property= "twitter:creator" content= "@freeflowzee" />
      <meta property= "twitter:site" content= "@freeflowzee" />
      
      {/* Additional Meta Tags */}
      <meta name= "author" content= "FreeflowZee Team" />
      <meta name= "publisher" content= "FreeflowZee" />
      <meta name= "robots" content={noIndex ? 'noindex, nofollow&apos; : &apos;index, follow&apos;} />
      <meta name= "googlebot" content={noIndex ? &apos;noindex, nofollow&apos; : &apos;index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1&apos;} />
      
      {/* Alternate URLs for i18n */}
      {alternateUrls.map((alternate, index) => (
        <link
          key={index}
          rel= "alternate"
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeflow-app-9-6egesbwif-thabo-5265s-projects.vercel.app'
  
  return {
    "@context": "https://schema.org", "@type": "Article", "headline": article.title, "description": article.description, "image": article.image || `${baseUrl}/images/homepage-mockup.jpg`, "author": {
      "@type": "Person", "name": article.author
    }, "publisher": {
      "@type": "Organization", "name": "FreeflowZee", "logo": {
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeflow-app-9-6egesbwif-thabo-5265s-projects.vercel.app'
  
  return {
    "@context": "https://schema.org", "@type": "Product", "name": product.name, "description": product.description, "image": product.image || `${baseUrl}/images/homepage-mockup.jpg`, "brand": {
      "@type": "Brand", "name": "FreeflowZee"
    }, "offers": {
      "@type": "Offer", "price": product.price || "0","
      "priceCurrency": product.currency || "USD", "availability": `https://schema.org/${product.availability || 'InStock'}`
    }, "aggregateRating": product.rating ? {
      "@type": "AggregateRating", "ratingValue": product.rating, "reviewCount": product.reviewCount || 1
    } : undefined
  }
} 