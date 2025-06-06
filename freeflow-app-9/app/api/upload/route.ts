import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, getUploadPresignedUrl, testConnection } from '@/lib/s3-client'

export async function POST(request: NextRequest) {
  try {
    // Test S3 connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      return NextResponse.json(
        { error: 'S3 storage is not available' },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 413 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 415 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${sanitizedName}`
    
    // Determine folder based on file type
    let folder = 'general'
    if (file.type.startsWith('image/')) {
      folder = 'images'
    } else if (file.type === 'application/pdf') {
      folder = 'documents'
    }

    // Upload file to S3
    const result = await uploadFile(buffer, {
      folder,
      filename,
      contentType: file.type,
      metadata: {
        'original-name': file.name,
        'upload-timestamp': timestamp.toString(),
        'content-length': file.size.toString()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        key: result.key,
        url: result.url,
        bucket: result.bucket,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Health check endpoint
    const isConnected = await testConnection()
    
    return NextResponse.json({
      status: 'ok',
      s3Connected: isConnected,
      timestamp: new Date().toISOString(),
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION,
      bucket: process.env.S3_BUCKET_NAME
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed', details: error.message },
      { status: 500 }
    )
  }
}

// Generate presigned URL for direct uploads
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    const contentType = searchParams.get('contentType') || 'application/octet-stream'
    const folder = searchParams.get('folder') || 'uploads'
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      )
    }

    // Generate unique key
    const timestamp = Date.now()
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = `${folder}/${timestamp}-${sanitizedName}`
    
    // Generate presigned URL (valid for 1 hour)
    const presignedUrl = await getUploadPresignedUrl(key, contentType, 3600)
    
    return NextResponse.json({
      success: true,
      presignedUrl,
      key,
      expiresIn: 3600
    })
    
  } catch (error) {
    console.error('Presigned URL generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate presigned URL', details: error.message },
      { status: 500 }
    )
  }
} 