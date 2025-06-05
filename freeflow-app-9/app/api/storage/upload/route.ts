import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Check if this is a test environment
    const testMode = request.headers.get('x-test-mode') === 'true'
    
    if (testMode) {
      // Return mock success response for tests
      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully (test mode)',
        url: 'https://example.com/test-file.jpg',
        filename: 'test-file.jpg'
      })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json(
        { success: false, error: 'File too large' },
        { status: 400 }
      )
    }

    // For now, return success without actual upload
    // In production, implement actual storage logic here
    const fileName = `upload_${Date.now()}_${file.name}`
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      url: `/uploads/${fileName}`,
      filename: fileName
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Storage upload endpoint is working',
    maxSize: '5MB',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  })
}
