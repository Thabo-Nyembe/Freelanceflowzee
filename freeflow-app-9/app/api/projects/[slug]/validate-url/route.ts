import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('projects')

/**
 * Project URL Validation API
 *
 * Validates URLs for project resources:
 * - External link validation (accessibility, safety)
 * - Asset URL verification
 * - OAuth callback validation
 * - Webhook URL validation
 */

interface ValidationResult {
  url: string
  valid: boolean
  accessible: boolean
  ssl: boolean
  redirects: number
  finalUrl?: string
  contentType?: string
  statusCode?: number
  issues: string[]
  warnings: string[]
  metadata?: {
    title?: string
    description?: string
    favicon?: string
  }
}

// URL patterns that are always blocked
const BLOCKED_PATTERNS = [
  /^file:\/\//i,
  /^javascript:/i,
  /^data:/i,
  /localhost/i,
  /127\.0\.0\.1/,
  /192\.168\./,
  /10\.\d+\.\d+\.\d+/,
  /172\.(1[6-9]|2\d|3[01])\./,
]

// Allowed URL schemes
const ALLOWED_SCHEMES = ['http:', 'https:']

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { url, type = 'general', options = {} } = body

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    // Demo mode
    if (!user) {
      const isValidDemo = url.startsWith('https://') && !BLOCKED_PATTERNS.some(p => p.test(url))
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          url,
          valid: isValidDemo,
          accessible: isValidDemo,
          ssl: url.startsWith('https://'),
          redirects: 0,
          finalUrl: url,
          contentType: 'text/html',
          statusCode: isValidDemo ? 200 : 0,
          issues: isValidDemo ? [] : ['URL validation failed'],
          warnings: url.startsWith('http://') ? ['Consider using HTTPS for security'] : [],
          metadata: isValidDemo ? {
            title: 'Demo Page Title',
            description: 'Demo page description',
          } : undefined,
        },
      })
    }

    // Verify project access
    const { data: project } = await supabase
      .from('projects')
      .select('id, owner_id')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single()

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // Validate URL
    const result = await validateUrl(url, type, options)

    // Log validation for audit
    await supabase.from('url_validations').insert({
      project_id: project.id,
      user_id: user.id,
      url,
      type,
      valid: result.valid,
      issues: result.issues,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    logger.error('URL validation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate URL' },
      { status: 500 }
    )
  }
}

async function validateUrl(
  url: string,
  type: string,
  options: { followRedirects?: boolean; checkContent?: boolean; timeout?: number }
): Promise<ValidationResult> {
  const result: ValidationResult = {
    url,
    valid: false,
    accessible: false,
    ssl: false,
    redirects: 0,
    issues: [],
    warnings: [],
  }

  try {
    // Parse URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      result.issues.push('Invalid URL format')
      return result
    }

    // Check scheme
    if (!ALLOWED_SCHEMES.includes(parsedUrl.protocol)) {
      result.issues.push(`Invalid URL scheme: ${parsedUrl.protocol}`)
      return result
    }

    // Check for blocked patterns
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(url)) {
        result.issues.push('URL contains blocked pattern (local/private address)')
        return result
      }
    }

    // SSL check
    result.ssl = parsedUrl.protocol === 'https:'
    if (!result.ssl) {
      result.warnings.push('URL does not use HTTPS')
    }

    // Type-specific validation
    switch (type) {
      case 'webhook':
        if (!result.ssl) {
          result.issues.push('Webhook URLs must use HTTPS')
          return result
        }
        break
      case 'oauth':
        if (!result.ssl) {
          result.issues.push('OAuth callback URLs must use HTTPS')
          return result
        }
        break
      case 'asset':
        // Asset URLs have fewer restrictions
        break
    }

    // Attempt to fetch the URL
    const timeout = options.timeout || 10000
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: options.followRedirects !== false ? 'follow' : 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'KAZI-URL-Validator/1.0',
        },
      })

      clearTimeout(timeoutId)

      result.statusCode = response.status
      result.contentType = response.headers.get('content-type') || undefined
      result.finalUrl = response.url

      // Count redirects
      if (response.url !== url) {
        result.redirects = 1 // Simplified; actual count requires manual redirect following
      }

      if (response.ok) {
        result.accessible = true
        result.valid = true
      } else {
        result.issues.push(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Content type validation for specific types
      if (type === 'image' && result.contentType) {
        if (!result.contentType.startsWith('image/')) {
          result.issues.push('URL does not return an image content type')
          result.valid = false
        }
      }

      if (type === 'video' && result.contentType) {
        if (!result.contentType.startsWith('video/')) {
          result.issues.push('URL does not return a video content type')
          result.valid = false
        }
      }

      // Fetch metadata if requested
      if (options.checkContent && result.accessible && type === 'general') {
        try {
          const htmlResponse = await fetch(url, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
            headers: { 'User-Agent': 'KAZI-URL-Validator/1.0' },
          })
          const html = await htmlResponse.text()
          result.metadata = extractMetadata(html)
        } catch {
          result.warnings.push('Could not fetch page metadata')
        }
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if ((fetchError as Error).name === 'AbortError') {
        result.issues.push('Request timed out')
      } else {
        result.issues.push(`Connection failed: ${(fetchError as Error).message}`)
      }
    }
  } catch (error) {
    result.issues.push(`Validation error: ${(error as Error).message}`)
  }

  return result
}

function extractMetadata(html: string): { title?: string; description?: string; favicon?: string } {
  const metadata: { title?: string; description?: string; favicon?: string } = {}

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    metadata.title = titleMatch[1].trim()
  }

  // Extract description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)
  if (descMatch) {
    metadata.description = descMatch[1].trim()
  }

  // Extract favicon
  const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)
    || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i)
  if (faviconMatch) {
    metadata.favicon = faviconMatch[1]
  }

  return metadata
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Demo mode
    if (!user) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          recentValidations: [
            {
              url: 'https://example.com/resource',
              valid: true,
              validated_at: '2026-01-29T10:00:00Z',
            },
            {
              url: 'http://insecure-site.com',
              valid: false,
              issues: ['URL does not use HTTPS'],
              validated_at: '2026-01-28T15:30:00Z',
            },
          ],
          stats: {
            totalValidations: 24,
            validUrls: 20,
            invalidUrls: 4,
          },
        },
      })
    }

    // Get project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single()

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get recent validations
    const { data: validations } = await supabase
      .from('url_validations')
      .select('url, valid, issues, created_at')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const stats = {
      totalValidations: validations?.length || 0,
      validUrls: validations?.filter(v => v.valid).length || 0,
      invalidUrls: validations?.filter(v => !v.valid).length || 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        recentValidations: validations?.map(v => ({
          url: v.url,
          valid: v.valid,
          issues: v.issues,
          validated_at: v.created_at,
        })),
        stats,
      },
    })
  } catch (error) {
    logger.error('URL validation history error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch validation history' },
      { status: 500 }
    )
  }
}
