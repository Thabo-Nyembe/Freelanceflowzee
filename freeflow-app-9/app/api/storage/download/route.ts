import { NextRequest, NextResponse } from 'next/server'
import { multiCloudStorage } from '@/lib/storage/multi-cloud-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const provider = searchParams.get('provider') as 'supabase' | 'wasabi'
    const key = searchParams.get('key')
    const download = searchParams.get('download') === 'true'

    if (!fileId && !key) {
      return NextResponse.json({ error: 'File ID or key is required' }, { status: 400 })
    }

    if (fileId) {
      // Download by file ID (with metadata lookup)
      const result = await multiCloudStorage.download(fileId)
      
      if (download) {
        // Direct file download
        return new NextResponse(result.buffer, {
          headers: {
            'Content-Type': result.metadata.mimeType,
            'Content-Disposition': `attachment; filename="${result.metadata.filename}"`,
            'Content-Length': result.metadata.size.toString(),
          },
        })
      } else {
        // Return file metadata and signed URL
        const signedUrl = await multiCloudStorage.getSignedUrl(
          result.metadata.provider, 
          result.metadata.key, 
          3600 // 1 hour expiry
        )
        
        return NextResponse.json({
          success: true,
          metadata: result.metadata,
          signedUrl,
          message: 'File download URL generated successfully'
        })
      }
    } else if (key && provider) {
      // Generate signed URL for direct key access
      const signedUrl = await multiCloudStorage.getSignedUrl(provider, key, 3600)
      
      return NextResponse.json({
        success: true,
        signedUrl,
        provider,
        key,
        message: 'Signed URL generated successfully'
      })
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Download failed'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileIds, provider, keys } = body

    if (!fileIds && !keys) {
      return NextResponse.json({ error: 'File IDs or keys array is required' }, { status: 400 })
    }

    const results = []

    if (fileIds) {
      // Batch download by file IDs
      for (const fileId of fileIds) {
        try {
          const result = await multiCloudStorage.download(fileId)
          const signedUrl = await multiCloudStorage.getSignedUrl(
            result.metadata.provider, 
            result.metadata.key, 
            3600
          )
          
          results.push({
            fileId,
            success: true,
            metadata: result.metadata,
            signedUrl
          })
        } catch (error) {
          results.push({
            fileId,
            success: false,
            error: error instanceof Error ? error.message : 'Download failed'
          })
        }
      }
    } else if (keys && provider) {
      // Batch signed URLs for direct keys
      for (const key of keys) {
        try {
          const signedUrl = await multiCloudStorage.getSignedUrl(provider, key, 3600)
          results.push({
            key,
            success: true,
            signedUrl,
            provider
          })
        } catch (error) {
          results.push({
            key,
            success: false,
            error: error instanceof Error ? error.message : 'URL generation failed'
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Processed ${results.length} download requests`
    })

  } catch (error) {
    console.error('Batch download error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Batch download failed'
    }, { status: 500 })
  }
} 