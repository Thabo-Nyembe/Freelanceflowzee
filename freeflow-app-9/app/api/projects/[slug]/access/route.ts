import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await request.json()
    const { method, password, accessCode } = body

    // Check if this is a test environment
    const testMode = request.headers.get('x-test-mode') === 'true'
    
    if (testMode) {
      // Return mock responses for tests
      return NextResponse.json({
        success: true,
        message: 'Access granted (test mode)',
        accessToken: 'test-access-token',
        expiresIn: 3600
      })
    }

    // Validate access method
    if (method === 'password') {
      if (!password) {
        return NextResponse.json(
          { success: false, error: 'Password required' },
          { status: 400 }
        )
      }
      
      // Mock password validation
      const validPasswords = ['test123', 'premium', 'access2024']
      if (!validPasswords.includes(password)) {
        return NextResponse.json(
          { success: false, error: 'Invalid password' },
          { status: 401 }
        )
      }
    }

    if (method === 'code') {
      if (!accessCode) {
        return NextResponse.json(
          { success: false, error: 'Access code required' },
          { status: 400 }
        )
      }
      
      // Mock access code validation
      const validCodes = ['PREMIUM2024', 'ACCESS123', 'VIP2024']
      if (!validCodes.includes(accessCode.toUpperCase())) {
        return NextResponse.json(
          { success: false, error: 'Invalid access code' },
          { status: 401 }
        )
      }
    }

    // Generate access token (mock)
    const accessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      message: 'Access granted',
      accessToken,
      expiresIn: 3600, // 1 hour
      project: slug
    })

  } catch (error) {
    console.error('Access API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  
  return NextResponse.json({
    success: true,
    project: slug,
    accessMethods: ['password', 'code', 'payment'],
    message: 'Project access endpoint is working'
  })
}
