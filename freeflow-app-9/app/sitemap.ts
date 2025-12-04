import { MetadataRoute } from 'next'

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

  // Combine all pages
  const allPages = [...marketingPages, ...contentPages, ...legalPages]

  return allPages.map(page => ({
    url: page.url,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}
