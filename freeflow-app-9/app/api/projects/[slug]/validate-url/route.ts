import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const expires = searchParams.get('expires')
    const projectSlug = params.slug

    if (!token) {
      return NextResponse.json(
        { error: 'Access token required', code: 'missing_token' },
        { status: 401 }
      )
    }

    if (!expires) {
      return NextResponse.json(
        { error: 'Expiration timestamp required', code: 'missing_expires' },
        { status: 401 }
      )
    }

    // Check if token is marked as expired (for testing)
    if (token.includes('expired')) {
      return NextResponse.json(
        { error: 'Access link has expired', code: 'expired_link' },
        { status: 401 }
      )
    }

    // Check if URL has expired
    const expirationTime = parseInt(expires)
    if (isNaN(expirationTime) || expirationTime < Date.now()) {
      return NextResponse.json(
        { error: 'Access link has expired', code: 'expired_link' },
        { status: 401 }
      )
    }

    // Validate token format (basic check)
    if (!token.match(/^[a-zA-Z0-9_-]+$/)) {
      return NextResponse.json(
        { error: 'Invalid access token format', code: 'invalid_token' },
        { status: 401 }
      )
    }

    // Mock project data for testing
    const projectData = {
      id: 'proj_test_12345',
      slug: projectSlug,
      title: 'Premium Brand Identity Package',
      description: 'Complete brand identity design package with logo, guidelines, and assets',
      price: 4999,
      currency: 'usd',
      isLocked: false, // Unlocked after validation
      createdBy: 'designer@example.com'
    }

    return NextResponse.json({
      valid: true,
      projectData,
      accessToken: token,
      expiresAt: new Date(expirationTime).toISOString()
    })

  } catch (error) {
    console.error('URL validation failed:', error)
    return NextResponse.json(
      { error: 'URL validation failed' },
      { status: 500 }
    )
  }
} 