/**
 * SEO & Meta Tag Utilities
 * Helpers for generating optimal SEO metadata
 */

import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
}

// Default SEO configuration
export const DEFAULT_SEO: SEOConfig = {
  title: 'KAZI Platform - All-in-One Creative Collaboration',
  description: 'Professional platform for creative collaboration, project management, and client communication. Build, collaborate, and deliver amazing projects.',
  keywords: [
    'creative platform',
    'project management',
    'collaboration',
    'freelance',
    'client portal',
    'video editing',
    'design collaboration'
  ],
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image'
}

// Generate Next.js Metadata object
export function generateMetadata(config: Partial<SEOConfig> = {}): Metadata {
  const seo = { ...DEFAULT_SEO, ...config }

  const metadata: Metadata = {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
      type: 'website'
    },
    twitter: {
      card: seo.twitterCard,
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined
    },
    robots: {
      index: !seo.noindex,
      follow: !seo.nofollow
    }
  }

  if (seo.canonical) {
    metadata.alternates = {
      canonical: seo.canonical
    }
  }

  return metadata
}

// Generate page-specific metadata
export const PageMetadata = {
  dashboard: generateMetadata({
    title: 'Dashboard - KAZI Platform',
    description: 'Your creative workspace dashboard. Manage projects, track progress, and collaborate with your team.'
  }),

  projects: generateMetadata({
    title: 'Projects - KAZI Platform',
    description: 'Manage all your creative projects in one place. Track progress, collaborate with clients, and deliver exceptional results.'
  }),

  videoStudio: generateMetadata({
    title: 'Video Studio - KAZI Platform',
    description: 'Professional video editing studio with AI-powered tools. Create, edit, and export stunning videos.'
  }),

  aiDesign: generateMetadata({
    title: 'AI Design - KAZI Platform',
    description: 'AI-powered design tools for creating stunning visuals. Generate images, designs, and creative assets.'
  }),

  collaboration: generateMetadata({
    title: 'Collaboration - KAZI Platform',
    description: 'Real-time collaboration tools for creative teams. Share feedback, annotate designs, and work together seamlessly.'
  }),

  pricing: generateMetadata({
    title: 'Pricing - KAZI Platform',
    description: 'Flexible pricing plans for freelancers, teams, and agencies. Start free, scale as you grow.'
  }),

  features: generateMetadata({
    title: 'Features - KAZI Platform',
    description: 'Explore powerful features for creative collaboration, project management, and client communication.'
  })
}

// Generate JSON-LD structured data
export function generateJSONLD(type: 'Organization' | 'WebSite' | 'Product', data: any) {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'https://kazi.platform'

  const schemas = {
    Organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'KAZI Platform',
      url: baseURL,
      logo: `${baseURL}/logo.png`,
      description: DEFAULT_SEO.description,
      ...data
    },
    WebSite: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      url: baseURL,
      name: 'KAZI Platform',
      description: DEFAULT_SEO.description,
      ...data
    },
    Product: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'KAZI Platform',
      description: DEFAULT_SEO.description,
      ...data
    }
  }

  return JSON.stringify(schemas[type])
}

// Generate breadcrumb schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  })
}

// SEO-friendly URL slug generator
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Meta description helper (truncate to optimal length)
export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text

  const truncated = text.substring(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(' ')

  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...'
}

// Generate Open Graph image URL
export function generateOGImageURL(params: {
  title: string
  description?: string
  theme?: 'light' | 'dark'
}): string {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'https://kazi.platform'
  const searchParams = new URLSearchParams({
    title: params.title,
    ...(params.description && { description: params.description }),
    ...(params.theme && { theme: params.theme })
  })

  return `${baseURL}/api/og?${searchParams.toString()}`
}

// Canonical URL helper
export function getCanonicalURL(path: string): string {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'https://kazi.platform'
  return `${baseURL}${path}`
}

// Social media sharing URLs
export const SocialShare = {
  twitter: (url: string, text: string) =>
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,

  facebook: (url: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,

  linkedin: (url: string, title: string, summary: string) =>
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,

  email: (subject: string, body: string) =>
    `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,

  whatsapp: (url: string, text: string) =>
    `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
}
