import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface DownloadParams {
  filename: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: DownloadParams }
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const token = searchParams.get('token')
    const expires = searchParams.get('expires')

    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'Project ID is required'
      }, { status: 400 })
    }

    const { filename } = params
    if (!filename) {
      return NextResponse.json({
        success: false,
        error: 'Filename is required'
      }, { status: 400 })
    }

    // Validate signed URL token if provided
    if (token && expires) {
      const expiryTime = parseInt(expires, 10)
      const currentTime = Date.now()

      if (currentTime > expiryTime) {
        return NextResponse.json({
          success: false,
          error: 'Download link has expired'
        }, { status: 401 })
      }

      // Basic token validation (in production, use proper JWT verification)
      const expectedToken = Buffer.from(`${filename}-${projectId}-${expires}`).toString('base64')
      if (token !== expectedToken) {
        return NextResponse.json({
          success: false,
          error: 'Invalid download token'
        }, { status: 401 })
      }
    }

    // Construct full file path
    const filePath = `${projectId}/${filename}`

    // Get file metadata first
    const { data: fileList, error: listError } = await supabase.storage
      .from('project-files')
      .list(projectId, {
        search: filename
      })

    if (listError || !fileList || fileList.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 })
    }

    // Generate signed URL for download
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('project-files')
      .createSignedUrl(filePath, 3600, {
        download: true
      })

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL error:', signedUrlError)
      return NextResponse.json({
        success: false,
        error: 'Failed to generate download link'
      }, { status: 500 })
    }

    // For direct downloads, fetch the file and return it
    const fileResponse = await fetch(signedUrlData.signedUrl)
    
    if (!fileResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve file'
      }, { status: 500 })
    }

    const fileBuffer = await fileResponse.arrayBuffer()
    const fileInfo = fileList[0]

    // Determine content type based on file extension
    const extension = filename.toLowerCase().split('.').pop()
    let contentType = 'application/octet-stream'

    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'txt': 'text/plain',
      'css': 'text/css',
      'html': 'text/html',
      'js': 'text/javascript',
      'ts': 'text/typescript',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }

    if (extension && mimeTypes[extension]) {
      contentType = mimeTypes[extension]
    }

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.byteLength.toString(),
        'Cache-Control': 'private, max-age=3600',
        'X-File-Size': fileInfo.metadata?.size?.toString() || fileBuffer.byteLength.toString(),
        'X-File-Name': filename,
        'X-Project-ID': projectId
      }
    })

  } catch (error) {
    console.error('Storage download error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Generate signed download URL without actually downloading
export async function POST(
  request: NextRequest,
  { params }: { params: DownloadParams }
): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { projectId, expiryHours = 1 } = body

    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'Project ID is required'
      }, { status: 400 })
    }

    const { filename } = params
    if (!filename) {
      return NextResponse.json({
        success: false,
        error: 'Filename is required'
      }, { status: 400 })
    }

    const filePath = `${projectId}/${filename}`

    // Generate signed URL
    const expirySeconds = expiryHours * 3600
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('project-files')
      .createSignedUrl(filePath, expirySeconds, {
        download: true
      })

    if (signedUrlError) {
      console.error('Signed URL generation error:', signedUrlError)
      return NextResponse.json({
        success: false,
        error: 'Failed to generate signed URL'
      }, { status: 500 })
    }

    // Generate custom token for additional security
    const expires = Date.now() + (expirySeconds * 1000)
    const token = Buffer.from(`${filename}-${projectId}-${expires}`).toString('base64')

    return NextResponse.json({
      success: true,
      data: {
        signedUrl: signedUrlData.signedUrl,
        customUrl: `/api/storage/download/${filename}?projectId=${projectId}&token=${token}&expires=${expires}`,
        expiresAt: new Date(expires).toISOString(),
        filename: filename,
        projectId: projectId
      }
    })

  } catch (error) {
    console.error('Signed URL generation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 