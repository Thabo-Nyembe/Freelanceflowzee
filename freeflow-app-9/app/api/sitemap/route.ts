import { NextResponse } from 'next/server'

// Define all static routes for the sitemap
const staticRoutes = [
  ,
  '/features', '/how-it-works', '/pricing', '/contact', '/blog', '/community', '/docs', '/tutorials', '/api-docs', '/newsletter', '/privacy', '/terms', '/support', '/careers', '/press', '/demo', '/book-appointment', '/enhanced-collaboration-demo', '/media-preview-demo', '/tools/rate-calculator', '/tools/scope-generator', '/login', '/signup,
]

// Dynamic routes that require database queries
const dynamicRoutes: Array<{ path: string; lastmod: string }> = [
  // Add blog posts, projects, etc. when you have them
]

export async function GET() {'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeflow-app-9-6egesbwif-thabo-5265s-projects.vercel.app
  const currentDate = new Date().toISOString()

  // Generate sitemap XML
  const sitemap = `<?xml version= "1.0" encoding= "UTF-8"?>
<urlset xmlns= "http://www.sitemaps.org/schemas/sitemap/0.9
        xmlns:news= "http://www.google.com/schemas/sitemap-news/0.9
        xmlns:xhtml= "http://www.w3.org/1999/xhtml
        xmlns:mobile= "http://www.google.com/schemas/sitemap-mobile/1.0
        xmlns:image= "http://www.google.com/schemas/sitemap-image/1.1
        xmlns:video= "http://www.google.com/schemas/sitemap-video/1.1">
${staticRoutes
  .map((route) => {
    const priority = getPriority(route)
    const changefreq = getChangeFreq(route)
    
    return `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
  })'
  .join('\n')}
${dynamicRoutes
  .map((route) => {
    return `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  })'
  .join('\n')}
</urlset>

  return new NextResponse(sitemap, {
    headers: {'
      'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
    },
  })
}

function getPriority(route: string): string {
  // Homepage gets highest priority'
  if (route === ') return '1.0'
  
  // Important pages'
  if (['/features', '/pricing', '/contact', '/demo'].includes(route)) {'
    return '0.9'
  }
  
  // Secondary pages'
  if (['/how-it-works', '/blog', '/community', '/docs'].includes(route)) {'
    return '0.8'
  }
  
  // Tool pages'
  if (route.startsWith('/tools/')) {'
    return '0.7'
  }
  
  // Auth pages'
  if (['/login', '/signup'].includes(route)) {'
    return '0.6'
  }
  
  // Legal pages'
  if (['/privacy', '/terms', '/support'].includes(route)) {'
    return '0.5'
  }
  '
  return '0.6'
}

function getChangeFreq(route: string): string {
  // Homepage and blog change frequently'
  if (route === ' || route === '/blog') return 'daily'
  
  // Feature and pricing pages change weekly'
  if (['/features', '/pricing', '/community'].includes(route)) {'
    return 'weekly'
  }
  
  // Documentation changes monthly'
  if (['/docs', '/tutorials', '/api-docs'].includes(route)) {'
    return 'monthly'
  }
  
  // Legal pages change yearly'
  if (['/privacy', '/terms'].includes(route)) {'
    return 'yearly'
  }
  '
  return 'monthly'
} '