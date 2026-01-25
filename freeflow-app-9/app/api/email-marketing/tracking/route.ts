/**
 * KAZI Email Tracking API
 *
 * Handles tracking pixel (opens) and link click tracking.
 */

import { NextRequest, NextResponse } from 'next/server'
import { eventTrackingService } from '@/lib/email/event-tracking-service'

// Allowed domains for redirect URLs (prevent open redirect vulnerability)
const ALLOWED_REDIRECT_DOMAINS = [
  'freeflowzee.com',
  'kazi-platform.vercel.app',
  'localhost:3000',
  // Add your production domains here
]

// Validate redirect URL to prevent open redirect attacks
function isValidRedirectUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    // Only allow http/https schemes
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false
    }
    // Check if domain is in allowlist
    const domain = url.hostname + (url.port ? `:${url.port}` : '')
    return ALLOWED_REDIRECT_DOMAINS.some(allowed =>
      domain === allowed || domain.endsWith(`.${allowed}`)
    )
  } catch {
    return false
  }
}

// 1x1 transparent GIF for tracking pixel
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('t') // 'o' for open, 'c' for click
    const data = searchParams.get('d') // Base64 encoded tracking data
    const url = searchParams.get('u') // Original URL for click tracking

    if (!data) {
      // Return pixel anyway to not break email rendering
      return new NextResponse(TRACKING_PIXEL, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

    // Get request metadata
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || undefined

    if (type === 'o') {
      // Open tracking
      const trackingData = eventTrackingService.parseTrackingPixelData(data)

      if (trackingData) {
        await eventTrackingService.recordOpen({
          messageId: trackingData.messageId,
          subscriberId: trackingData.subscriberId,
          emailId: trackingData.emailId,
          campaignId: trackingData.campaignId,
          automationId: trackingData.automationId,
          userId: trackingData.userId,
          ipAddress,
          userAgent
        })
      }

      // Return tracking pixel
      return new NextResponse(TRACKING_PIXEL, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

    if (type === 'c' && url) {
      // Click tracking
      const trackingData = eventTrackingService.parseTrackedLinkData(data)

      if (trackingData) {
        await eventTrackingService.recordClick({
          messageId: trackingData.messageId,
          subscriberId: trackingData.subscriberId,
          emailId: trackingData.emailId,
          campaignId: trackingData.campaignId,
          automationId: trackingData.automationId,
          userId: trackingData.userId,
          linkUrl: url,
          linkId: trackingData.linkId,
          linkPosition: trackingData.linkPosition,
          linkText: trackingData.linkText,
          ipAddress,
          userAgent
        })
      }

      // Redirect to original URL with validation
      const decodedUrl = decodeURIComponent(url)
      if (!isValidRedirectUrl(decodedUrl)) {
        console.warn('Blocked redirect to untrusted URL:', decodedUrl)
        return new NextResponse(TRACKING_PIXEL, {
          headers: { 'Content-Type': 'image/gif' }
        })
      }
      return NextResponse.redirect(decodedUrl, { status: 302 })
    }

    // Invalid request - return pixel to not break email
    return new NextResponse(TRACKING_PIXEL, {
      headers: {
        'Content-Type': 'image/gif'
      }
    })
  } catch (error) {
    console.error('Tracking error:', error)

    // Always return pixel/redirect to not break user experience
    const url = new URL(request.url).searchParams.get('u')
    if (url) {
      const decodedUrl = decodeURIComponent(url)
      if (isValidRedirectUrl(decodedUrl)) {
        return NextResponse.redirect(decodedUrl, { status: 302 })
      }
    }

    return new NextResponse(TRACKING_PIXEL, {
      headers: {
        'Content-Type': 'image/gif'
      }
    })
  }
}
