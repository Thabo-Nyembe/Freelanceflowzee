/**
 * SEO Metadata Utility
 *
 * Provides consistent metadata generation across all pages
 */

import { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kazi.app'

interface PageMetadataOptions {
  title: string
  description: string
  keywords?: string[]
  image?: string
  noIndex?: boolean
  canonical?: string
}

/**
 * Generate page metadata with KAZI defaults
 */
export function generatePageMetadata(options: PageMetadataOptions): Metadata {
  const { title, description, keywords, image, noIndex, canonical } = options

  const ogImage = image || '/og-default.png'
  const fullTitle = `${title} | KAZI`

  return {
    title,
    description,
    keywords: keywords?.join(', '),
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: canonical || undefined,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical ? `${BASE_URL}${canonical}` : BASE_URL,
      siteName: 'KAZI',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@kaziapp',
    },
  }
}

// Pre-defined metadata for common pages
export const PageMetadata = {
  login: generatePageMetadata({
    title: 'Sign In',
    description: 'Sign in to your KAZI account. Access your projects, clients, invoices, and AI-powered creative tools.',
    keywords: ['login', 'sign in', 'freelance platform', 'agency management'],
    canonical: '/login',
  }),

  signup: generatePageMetadata({
    title: 'Create Account',
    description: 'Join KAZI and transform your freelance business. Get AI-powered tools, secure payments, and professional collaboration features.',
    keywords: ['sign up', 'create account', 'freelance tools', 'agency platform'],
    canonical: '/signup',
  }),

  pricing: generatePageMetadata({
    title: 'Pricing Plans',
    description: 'Choose the KAZI plan that fits your needs. From solo freelancers to growing agencies, we have flexible pricing for every stage.',
    keywords: ['pricing', 'plans', 'freelance software pricing', 'agency management cost'],
    canonical: '/pricing',
  }),

  features: generatePageMetadata({
    title: 'Features',
    description: 'Discover KAZI features: AI content creation, video studio, universal pinpoint feedback, escrow payments, and team collaboration.',
    keywords: ['features', 'AI tools', 'video collaboration', 'project management', 'invoicing'],
    canonical: '/features',
  }),

  dashboard: generatePageMetadata({
    title: 'Dashboard',
    description: 'Your KAZI command center. Manage projects, track time, send invoices, and collaborate with your team.',
    noIndex: true, // Dashboard pages shouldn't be indexed
    canonical: '/dashboard',
  }),

  v1Dashboard: generatePageMetadata({
    title: 'Dashboard',
    description: 'KAZI V1 Dashboard - Manage your freelance business with powerful tools.',
    noIndex: true,
    canonical: '/v1/dashboard',
  }),

  v2Dashboard: generatePageMetadata({
    title: 'Dashboard',
    description: 'KAZI V2 Dashboard - Next generation freelance and agency management.',
    noIndex: true,
    canonical: '/v2/dashboard',
  }),

  contact: generatePageMetadata({
    title: 'Contact Us',
    description: 'Get in touch with KAZI. We\'re here to help with questions, support, or partnership inquiries.',
    keywords: ['contact', 'support', 'help', 'partnership'],
    canonical: '/contact',
  }),

  about: generatePageMetadata({
    title: 'About KAZI',
    description: 'Learn about KAZI - built in Africa, engineered for the world. Our mission is to empower freelancers and agencies globally.',
    keywords: ['about', 'company', 'mission', 'African tech', 'startup'],
    canonical: '/about',
  }),

  blog: generatePageMetadata({
    title: 'Blog',
    description: 'Tips, insights, and resources for freelancers and agencies. Learn how to grow your business with KAZI.',
    keywords: ['blog', 'freelance tips', 'agency insights', 'business growth'],
    canonical: '/blog',
  }),

  videoStudio: generatePageMetadata({
    title: 'Video Studio',
    description: 'Professional video editing with AI transcription, screen recording, and client collaboration. All in your browser.',
    keywords: ['video editing', 'screen recording', 'AI transcription', 'video collaboration'],
    canonical: '/video-studio',
  }),

  aiCreate: generatePageMetadata({
    title: 'AI Create',
    description: 'Generate content with multiple AI models. GPT-4o, Claude, DALL-E, and more - all in one powerful interface.',
    keywords: ['AI content', 'GPT-4', 'Claude', 'DALL-E', 'AI generation'],
    canonical: '/ai-create',
  }),
}

/**
 * Generate dynamic metadata for project pages
 */
export function generateProjectMetadata(project: {
  name: string
  description?: string
  thumbnail?: string
}): Metadata {
  return generatePageMetadata({
    title: project.name,
    description: project.description || `View project: ${project.name} on KAZI`,
    image: project.thumbnail,
    noIndex: true, // Projects are private
  })
}

/**
 * Generate dynamic metadata for public portfolio pages
 */
export function generatePortfolioMetadata(user: {
  name: string
  bio?: string
  avatar?: string
  username: string
}): Metadata {
  return generatePageMetadata({
    title: `${user.name} - Portfolio`,
    description: user.bio || `View ${user.name}'s portfolio and creative work on KAZI`,
    image: user.avatar,
    canonical: `/p/${user.username}`,
    keywords: ['portfolio', 'freelancer', 'creative work', user.name],
  })
}

/**
 * Generate structured data for organization
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KAZI',
    url: BASE_URL,
    logo: `${BASE_URL}/kazi-brand/full-logo-dark.png`,
    sameAs: [
      'https://twitter.com/kaziapp',
      'https://linkedin.com/company/kazi',
      'https://github.com/kazi',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-xxx-xxx-xxxx',
      contactType: 'customer service',
      email: 'support@kazi.app',
    },
  }
}

/**
 * Generate structured data for software application
 */
export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'KAZI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '500',
    },
  }
}
