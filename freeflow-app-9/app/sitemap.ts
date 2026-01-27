import { alternatives } from '@/data/alternatives'
import { useCases } from '@/data/use-cases'
import { blogPosts } from '@/data/blog-posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://kazi.app'
  const now = new Date()

  // Marketing Pages (High Priority)
  const marketingPages = [
    { url: baseUrl, priority: 1, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/pricing`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/features`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/signup`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/contact`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/guest-upload`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/demo-features`, priority: 0.7, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/login`, priority: 0.7, changeFrequency: 'monthly' as const },
  ]

  // Content & Resources Pages
  const contentPages = [
    { url: `${baseUrl}/blog`, priority: 0.7, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/docs`, priority: 0.6, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/tutorials`, priority: 0.6, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/community`, priority: 0.6, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/support`, priority: 0.6, changeFrequency: 'monthly' as const },
  ]

  // Legal Pages (Low Priority)
  const legalPages = [
    { url: `${baseUrl}/terms`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/privacy`, priority: 0.5, changeFrequency: 'monthly' as const },
  ]

  // Alternative Pages (SEO Strategy)
  const alternativePages = Object.keys(alternatives).map(slug => ({
    url: `${baseUrl}/alternatives/${slug}`,
    priority: 0.8,
    changeFrequency: 'weekly' as const
  }))

  // Use Case Pages (Targeted Competitor Traffic)
  const useCasePages = Object.keys(useCases).map(slug => ({
    url: `${baseUrl}/for/${slug}`,
    priority: 0.8,
    changeFrequency: 'weekly' as const
  }))

  // Blog Posts (Dynamic Content)
  const blogPages = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    priority: 0.7,
    changeFrequency: 'monthly' as const
  }))

  // Comparison Pages (Head-to-Head)
  const comparisonPages = [
    'kazi-vs-upwork',
    'kazi-vs-fiverr',
    'kazi-vs-monday',
    'kazi-vs-clickup',
    'kazi-vs-jasper'
  ].map(slug => ({
    url: `${baseUrl}/compare/${slug}`,
    priority: 0.8,
    changeFrequency: 'weekly' as const
  }))

  // Combine all pages
  const allPages = [...marketingPages, ...contentPages, ...legalPages, ...alternativePages, ...useCasePages, ...blogPages, ...comparisonPages]

  return allPages.map(page => ({
    url: page.url,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}
