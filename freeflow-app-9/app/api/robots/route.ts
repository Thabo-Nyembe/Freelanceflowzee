import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeflow-app-9-6egesbwif-thabo-5265s-projects.vercel.app'
  
  const robots = `User-agent: *
Allow: /

# Important pages for crawling
Allow: /features
Allow: /pricing
Allow: /how-it-works
Allow: /contact
Allow: /blog
Allow: /community
Allow: /docs
Allow: /tutorials
Allow: /demo
Allow: /tools

# Block private areas
Disallow: /dashboard/
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

# Block auth pages from indexing
Disallow: /login
Disallow: /signup
Disallow: /reset-password

# Block test and development pages
Disallow: /test/
Disallow: /dev/
Disallow: /.well-known/

# Allow specific file types
Allow: *.css
Allow: *.js
Allow: *.png
Allow: *.jpg
Allow: *.jpeg
Allow: *.gif
Allow: *.svg
Allow: *.webp
Allow: *.pdf

# Crawl delay (be respectful)
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Special instructions for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2

# Block bad bots
User-agent: MJ12bot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
    },
  })
} 