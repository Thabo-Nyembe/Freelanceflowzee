import { Metadata } from 'next'

// Context7 Pattern: Centralized SEO Configuration
const SEO_CONFIG = {
  site: {
    name: 'KAZI',
    tagline: 'Enterprise Freelance Management Platform',
    description: 'AI-powered creative platform with multi-model studio, universal feedback, real-time collaboration, and secure payments for modern professionals.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kazi-platform.vercel.app',
    logo: '/kazi-brand/logo-transparent.png',
    favicon: '/kazi-brand/favicon.ico'
  },
  keywords: {
    primary: 'KAZI, AI creative platform, freelance management, universal feedback, real-time collaboration',
    secondary: 'multi-model AI, secure payments, enterprise features, creative professionals, project management'
  },
  social: {
    twitter: '@kaziplatform',
    linkedin: 'kazi-platform',
    github: 'kazi-platform'
  }
}

// Context7 Pattern: Page-specific SEO Templates
export const SEO_TEMPLATES = {
  homepage: {
    title: `${SEO_CONFIG.site.name} - ${SEO_CONFIG.site.tagline}`,
    description: SEO_CONFIG.site.description,
    keywords: `${SEO_CONFIG.keywords.primary}, ${SEO_CONFIG.keywords.secondary}`,
    schema: 'Organization'
  },
  features: {
    title: `Features - ${SEO_CONFIG.site.name}`,
    description: 'Discover powerful enterprise features that make KAZI the best creative platform. Multi-model AI studio, universal feedback, real-time collaboration, and secure payments.',
    keywords: `${SEO_CONFIG.keywords.primary}, feature list, platform capabilities, AI tools`,
    schema: 'Product'
  },
  pricing: {
    title: `Pricing Plans - ${SEO_CONFIG.site.name}`,
    description: 'Choose the perfect plan for your creative business. Transparent pricing, no hidden fees. Start free and scale with KAZI\'s enterprise features.',
    keywords: 'KAZI pricing, creative software pricing, subscription plans, free trial',
    schema: 'Offer'
  },
  blog: {
    title: `Blog - ${SEO_CONFIG.site.name}`,
    description: 'Expert insights on freelance management, client relationships, and business growth. Stay updated with the latest trends and best practices.',
    keywords: 'freelance tips, business growth, client management, productivity',
    schema: 'Blog'
  },
  contact: {
    title: `Contact Us - ${SEO_CONFIG.site.name}`,
    description: 'Get in touch with our team. We\'re here to help you succeed with your freelance business. Multiple ways to reach us.',
    keywords: 'contact freeflowzee, customer support, sales inquiry',
    schema: 'ContactPage'
  },
  demo: {
    title: `Live Demo - ${SEO_CONFIG.site.name}`,
    description: 'Experience FreeflowZee in action. See how our platform can transform your freelance workflow with this interactive demo.',
    keywords: 'product demo, live preview, interactive tour',
    schema: 'SoftwareApplication'
  }
}

// Context7 Pattern: Blog Post SEO Generator
export interface BlogPostSEO {
  title: string
  description: string
  author: string
  publishedAt: string
  modifiedAt?: string
  tags: string[]
  category: string
  readingTime: number
  featured: boolean
}

export function generateBlogPostSEO(post: BlogPostSEO): Metadata {
  const title = `${post.title} | ${SEO_CONFIG.site.name} Blog`
  const description = post.description.length > 160 
    ? post.description.substring(0, 157) + '...' 
    : post.description

  return {
    title,
    description,
    keywords: post.tags.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
      authors: [post.author],
      tags: post.tags,
      section: post.category,
      url: `${SEO_CONFIG.site.url}/blog/${slugify(post.title)}`,
      siteName: SEO_CONFIG.site.name,
      images: [
        {
          url: `${SEO_CONFIG.site.url}/images/blog/${slugify(post.title)}-og.jpg`,
          width: 1200,
          height: 630,
          alt: post.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: SEO_CONFIG.site.creator,
      creator: `@${post.author.toLowerCase().replace(' ', '')}`,
      title,
      description,
      images: [`${SEO_CONFIG.site.url}/images/blog/${slugify(post.title)}-twitter.jpg`]
    },
    alternates: {
      canonical: `${SEO_CONFIG.site.url}/blog/${slugify(post.title)}`,
    }
  }
}

// Context7 Pattern: Sales Page SEO Generator
export interface SalesPageSEO {
  product: string
  price: number
  currency: string
  availability: 'InStock' | 'PreOrder' | 'OutOfStock'
  features: string[]
  benefits: string[]
  testimonials?: number
  rating?: number
  reviews?: number
}

export function generateSalesPageSEO(sales: SalesPageSEO): Metadata {
  const title = `${sales.product} - Professional ${SEO_CONFIG.site.tagline}`
  const description = `Get ${sales.product} for ${sales.currency}${sales.price}. ${sales.benefits.slice(0, 2).join('. ')}. Trusted by thousands of freelancers worldwide.`

  return {
    title,
    description,
    keywords: `${sales.product.toLowerCase()}, ${SEO_CONFIG.keywords.primary}, buy ${sales.product.toLowerCase()}`,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SEO_CONFIG.site.url}/pricing`,
      siteName: SEO_CONFIG.site.name,
      images: [
        {
          url: `${SEO_CONFIG.site.url}/images/products/${slugify(sales.product)}-og.jpg`,
          width: 1200,
          height: 630,
          alt: sales.product
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: SEO_CONFIG.site.creator,
      title,
      description,
      images: [`${SEO_CONFIG.site.url}/images/products/${slugify(sales.product)}-twitter.jpg`]
    }
  }
}

// Context7 Pattern: Dynamic SEO Metadata Generator
export function generatePageSEO(page: keyof typeof SEO_TEMPLATES, customData?: Partial<Metadata>): Metadata {
  const template = SEO_TEMPLATES[page]
  const baseMetadata: Metadata = {
    title: template.title,
    description: template.description,
    keywords: template.keywords,
    authors: [{ name: SEO_CONFIG.site.publisher }],
    creator: SEO_CONFIG.site.creator,
    publisher: SEO_CONFIG.site.publisher,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1
      }
    },
    openGraph: {
      title: template.title,
      description: template.description,
      type: SEO_CONFIG.site.type as any,
      url: `${SEO_CONFIG.site.url}/${page === 'homepage' ? '' : page}`,
      siteName: SEO_CONFIG.site.name,
      locale: SEO_CONFIG.site.locale,
      images: [
        {
          url: SEO_CONFIG.site.image,
          width: 1200,
          height: 630,
          alt: `${SEO_CONFIG.site.name} - ${template.title}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: SEO_CONFIG.site.creator,
      creator: SEO_CONFIG.site.creator,
      title: template.title,
      description: template.description,
      images: [SEO_CONFIG.site.image]
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
      other: {
        'facebook-domain-verification': 'your-facebook-verification-code'
      }
    }
  }

  // Merge with custom data
  return { ...baseMetadata, ...customData }
}

// Context7 Pattern: Structured Data Generator
export function generateStructuredData(type: 'Organization' | 'Product' | 'Article' | 'Blog' | 'ContactPage' | 'Offer' | 'SoftwareApplication', data?: Record<string, unknown>: unknown) {
  const baseOrganization = {
    "@context": "https://schema.org", "@type": "Organization", "name": SEO_CONFIG.site.name, "description": SEO_CONFIG.site.description, "url": SEO_CONFIG.site.url, "logo": `${SEO_CONFIG.site.url}/images/logo.png`, "contactPoint": {
      "@type": "ContactPoint", "telephone": SEO_CONFIG.contact.phone, "contactType": "customer service", "email": SEO_CONFIG.contact.email
    }, "address": {
      "@type": "PostalAddress", "streetAddress": "123 Creative Street", "addressLocality": "San Francisco", "addressRegion": "CA", "postalCode": "94103", "addressCountry": 'US'
    }, "sameAs": Object.values(SEO_CONFIG.contact.social)
  }

  switch (type) {
    case 'Organization':
      return baseOrganization

    case 'Product':
      return {
        "@context": "https://schema.org", "@type": "SoftwareApplication", "name": SEO_CONFIG.site.name, "description": SEO_CONFIG.site.description, "url": SEO_CONFIG.site.url, "applicationCategory": "BusinessApplication", "operatingSystem": "Web Browser", "offers": {
          "@type": "Offer", "price": "0",
          "priceCurrency": "USD", "availability": 'https://schema.org/InStock'
        }, "provider": baseOrganization, "screenshot": `${SEO_CONFIG.site.url}/images/app-screenshot.jpg`, "featureList": SEO_CONFIG.features.primary
      }

    case 'Article':
      return {
        "@context": "https://schema.org", "@type": "Article", "headline": data?.title, "description": data?.description, "author": {
          "@type": "Person", "name": data?.author
        }, "publisher": baseOrganization, "datePublished": data?.publishedAt, "dateModified": data?.modifiedAt || data?.publishedAt, "image": data?.image, "url": data?.url
      }

    case 'Blog':
      return {
        "@context": "https://schema.org", "@type": "Blog", "name": `${SEO_CONFIG.site.name} Blog`, "description": "Expert insights on freelance management and business growth", "url": `${SEO_CONFIG.site.url}/blog`, "publisher": baseOrganization
      }

    case 'ContactPage':
      return {
        "@context": "https://schema.org", "@type": "ContactPage", "name": `Contact ${SEO_CONFIG.site.name}`, "description": "Get in touch with our team", "url": `${SEO_CONFIG.site.url}/contact`, "mainEntity": baseOrganization
      }

    case 'Offer':
      return {
        "@context": "https://schema.org", "@type": "Offer", "name": data?.product || SEO_CONFIG.site.name, "description": data?.description, "price": data?.price || "0",
        "priceCurrency": data?.currency || "USD", "availability": "https://schema.org/InStock", "seller": baseOrganization, "url": data?.url || `${SEO_CONFIG.site.url}/pricing`
      }

    case 'SoftwareApplication':
      return {
        "@context": "https://schema.org", "@type": "SoftwareApplication", "name": SEO_CONFIG.site.name, "description": SEO_CONFIG.site.description, "url": SEO_CONFIG.site.url, "applicationCategory": "BusinessApplication", "operatingSystem": "Web Browser", "offers": {
          "@type": "Offer", "price": "0",
          "priceCurrency": 'USD'
        }, "provider": baseOrganization
      }

    default:
      return baseOrganization
  }
}

// Context7 Pattern: SEO Analysis and Recommendations
export function analyzeSEO(content: string, metadata: Metadata) {
  const analysis = {
    score: 0,
    issues: [] as string[],
    recommendations: [] as string[],
    strengths: [] as string[]
  }

  // Title analysis
  const titleLength = (typeof metadata.title === 'string' ? metadata.title : metadata.title?.toString() || '').length
  if (titleLength < 30) {
    analysis.issues.push('Title is too short (< 30 characters)')
  } else if (titleLength > 60) {
    analysis.issues.push('Title is too long (> 60 characters)')
  } else {
    analysis.strengths.push('Title length is optimal')
    analysis.score += 20
  }

  // Description analysis
  const descLength = metadata.description?.length || 0
  if (descLength < 120) {
    analysis.issues.push('Meta description is too short (< 120 characters)')
  } else if (descLength > 160) {
    analysis.issues.push('Meta description is too long (> 160 characters)')
  } else {
    analysis.strengths.push('Meta description length is optimal')
    analysis.score += 20
  }

  // Content analysis
  const wordCount = content.split(' ').length
  if (wordCount < 300) {
    analysis.issues.push('Content is too short (< 300 words)')
  } else {
    analysis.strengths.push('Content length is sufficient')
    analysis.score += 20
  }

  // Keyword analysis
  if (metadata.keywords) {
    analysis.strengths.push('Keywords are defined')
    analysis.score += 15
  } else {
    analysis.issues.push('No keywords defined')
  }

  // Open Graph analysis
  if (metadata.openGraph) {
    analysis.strengths.push('Open Graph tags are present')
    analysis.score += 15
  } else {
    analysis.issues.push('Missing Open Graph tags')
  }

  // Twitter Cards analysis
  if (metadata.twitter) {
    analysis.strengths.push('Twitter Card tags are present')
    analysis.score += 10
  } else {
    analysis.issues.push('Missing Twitter Card tags')
  }

  // Generate recommendations
  if (analysis.score < 70) {
    analysis.recommendations.push('Improve content length and quality')
    analysis.recommendations.push('Add relevant keywords throughout content')
    analysis.recommendations.push('Optimize title and meta description')
  }

  if (analysis.score >= 70 && analysis.score < 90) {
    analysis.recommendations.push('Fine-tune keyword placement')
    analysis.recommendations.push('Add more internal links')
    analysis.recommendations.push('Consider adding FAQ section')
  }

  if (analysis.score >= 90) {
    analysis.recommendations.push('Excellent SEO optimization!')
    analysis.recommendations.push('Monitor performance and update regularly')
  }

  return analysis
}

// Utility functions
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function generateSitemap(pages: string[]): string {
  const urls = pages.map(page => {
    const url = page === '/' ? SEO_CONFIG.site.url : `${SEO_CONFIG.site.url}${page}`
    return `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>
`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

export function generateRobotsTxt(): string {
  const disallowRules = SEO_CONFIG.site.disallowedPaths.map(path => `Disallow: ${path}`).join('\n')
  return `User-agent: *
Allow: /

Sitemap: ${SEO_CONFIG.site.url}/sitemap.xml

# Disallow admin areas
${disallowRules}

# Allow important pages
Allow: /
Allow: /features
Allow: /pricing
Allow: /blog
Allow: /contact
Allow: /demo
`
} 