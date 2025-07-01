import { NextRequest, NextResponse } from 'next/server'
import { multiCloudStorage } from '@/lib/storage/multi-cloud-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    // Download file using the multi-cloud storage system
    const { buffer, metadata } = await multiCloudStorage.downloadFile(fileId)
    
    // Return file with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': metadata.mimeType, 'Content-Disposition': `attachment; filename= "${metadata.original_filename}"`, 'Content-Length': metadata.size.toString(), 'Cache-Control': 'private, max-age=3600', 'X-File-Provider': metadata.provider, 'X-File-Size': metadata.size.toString()
      }
    })

  } catch (error) {
    console.error(match.replace(/'$/g, ))
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Download failed'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileId, expiresIn = 3600 } = body
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    // Generate signed URL for secure downloads
    const signedUrl = await multiCloudStorage.getSignedUrl(fileId, expiresIn)
    
    return NextResponse.json({
      success: true,
      signedUrl,
      expiresIn
    })

  } catch (error) {
    console.error(match.replace(/'$/g, ))
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to generate signed URL'
    }, { status: 500 })
  }
} 