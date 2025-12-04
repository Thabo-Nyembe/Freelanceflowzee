/**
 * Structured Data (Schema.org) Generator
 *
 * Generates JSON-LD structured data for SEO optimization
 * Improves search engine understanding and rich snippet display
 */

export interface OrganizationSchema {
  '@context': string
  '@type': string
  name: string
  description: string
  url: string
  logo: string
  sameAs: string[]
  contactPoint: {
    '@type': string
    telephone?: string
    email: string
    contactType: string
    availableLanguage: string[]
  }
  founder: {
    '@type': string
    name: string
  }
  foundingDate: string
  address: {
    '@type': string
    addressCountry: string
  }
}

export interface SoftwareApplicationSchema {
  '@context': string
  '@type': string
  name: string
  description: string
  applicationCategory: string
  operatingSystem: string
  offers: {
    '@type': string
    price: string
    priceCurrency: string
  }
  aggregateRating: {
    '@type': string
    ratingValue: string
    ratingCount: string
    bestRating: string
    worstRating: string
  }
  featureList: string[]
}

export interface WebPageSchema {
  '@context': string
  '@type': string
  name: string
  description: string
  url: string
  breadcrumb?: {
    '@type': string
    itemListElement: Array<{
      '@type': string
      position: number
      name: string
      item: string
    }>
  }
}

export interface ProductSchema {
  '@context': string
  '@type': string
  name: string
  description: string
  brand: {
    '@type': string
    name: string
  }
  offers: {
    '@type': string
    price: string
    priceCurrency: string
    availability: string
    url: string
  }
  aggregateRating?: {
    '@type': string
    ratingValue: string
    reviewCount: string
  }
}

export interface FAQSchema {
  '@context': string
  '@type': string
  mainEntity: Array<{
    '@type': string
    name: string
    acceptedAnswer: {
      '@type': string
      text: string
    }
  }>
}

/**
 * Organization Schema - KAZI Platform
 */
export const organizationSchema: OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'KAZI',
  description: 'All-in-One Freelance & Agency Management Platform with AI-powered content creation, video collaboration, secure escrow payments, and project management.',
  url: 'https://kazi.app',
  logo: 'https://kazi.app/kazi-brand/glyph-dark.png',
  sameAs: [
    'https://twitter.com/kaziapp',
    'https://linkedin.com/company/kazi',
    'https://facebook.com/kaziapp',
    'https://instagram.com/kaziapp'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@kazi.app',
    contactType: 'Customer Support',
    availableLanguage: ['English']
  },
  founder: {
    '@type': 'Person',
    name: 'KAZI Team'
  },
  foundingDate: '2024',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'ZA'
  }
}

/**
 * Software Application Schema - KAZI Platform
 */
export const softwareApplicationSchema: SoftwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KAZI Platform',
  description: 'Complete freelance and agency management solution with AI content creation, video studio, universal feedback, escrow payments, and team collaboration tools.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '2500',
    bestRating: '5',
    worstRating: '1'
  },
  featureList: [
    'Multi-Model AI Studio (GPT-4o, Claude, DALL-E, Google AI)',
    'Professional Video Studio with AI Transcription',
    'Universal Pinpoint Feedback System',
    'Secure Milestone-Based Escrow Payments',
    'Real-Time Team Collaboration',
    'AI Daily Planning and Task Management',
    'Multi-Cloud Storage (70% Cost Savings)',
    'Automated Invoicing and Financial Tracking',
    'Client Zone with Branded Portals',
    'Creator Community Hub (2,800+ Members)'
  ]
}

/**
 * Pricing Page Schema
 */
export const pricingProductSchema = (planName: string, price: string, description: string): ProductSchema => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: `KAZI ${planName} Plan`,
  description: description,
  brand: {
    '@type': 'Brand',
    name: 'KAZI'
  },
  offers: {
    '@type': 'Offer',
    price: price,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: 'https://kazi.app/pricing'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '2500'
  }
})

/**
 * FAQ Schema Generator
 */
export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>): FAQSchema => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
})

/**
 * Breadcrumb Schema Generator
 */
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
})

/**
 * Local Business Schema - For SEO
 */
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'KAZI',
  image: 'https://kazi.app/kazi-brand/glyph-dark.png',
  '@id': 'https://kazi.app',
  url: 'https://kazi.app',
  telephone: '',
  priceRange: '$0 - $99',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'ZA'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 0,
    longitude: 0
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ],
    opens: '00:00',
    closes: '23:59'
  },
  sameAs: [
    'https://twitter.com/kaziapp',
    'https://linkedin.com/company/kazi'
  ]
}

/**
 * Helper to inject structured data into pages
 */
export const injectStructuredData = (schema: any) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
