import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Supported file types and their MIME types
const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  
  // Audio
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
  
  // Video
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/ogg': ['.ogv'],
  
  // Code files
  'text/javascript': ['.js'],
  'text/typescript': ['.ts'],
  'text/css': ['.css'],
  'text/html': ['.html'],
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.jar']

interface UploadResponse {
  success: boolean
  data?: {
    id: string
    filename: string
    size: number
    mimeType: string
    url: string
    overwritten?: boolean
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({
        success: false,
        error: 'Content-Type must be multipart/form-data'
      }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const overwrite = formData.get('overwrite') === 'true'

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'Project ID is required'
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      }, { status: 400 })
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const mimeType = file.type

    // Check for blocked extensions
    if (BLOCKED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json({
        success: false,
        error: 'File type not allowed for security reasons'
      }, { status: 400 })
    }

    // Check if mime type is allowed
    if (mimeType && !Object.keys(ALLOWED_FILE_TYPES).includes(mimeType)) {
      return NextResponse.json({
        success: false,
        error: `File type ${mimeType} is not supported`
      }, { status: 400 })
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const fileName = `${projectId}/${timestamp}-${file.name}`
    
    let wasOverwritten = false

    // Check if file already exists (same name, same project)
    if (overwrite) {
      const existingFileName = `${projectId}/${file.name}`
      const { data: existingFiles } = await supabase.storage
        .from('project-files')
        .list(projectId, {
          search: file.name
        })

      if (existingFiles && existingFiles.length > 0) {
        // Remove existing file
        const { error: deleteError } = await supabase.storage
          .from('project-files')
          .remove([existingFileName])
        
        if (deleteError) {
          console.warn('Failed to delete existing file:', deleteError)
        } else {
          wasOverwritten = true
        }
      }
    }

    // Upload file to Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: overwrite,
        contentType: mimeType
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({
        success: false,
        error: `Upload failed: ${uploadError.message}`
      }, { status: 500 })
    }

    // Get signed URL for the uploaded file
    const { data: signedUrlData } = await supabase.storage
      .from('project-files')
      .createSignedUrl(fileName, 3600) // 1 hour expiry

    const response: UploadResponse = {
      success: true,
      data: {
        id: uploadData.id || fileName,
        filename: file.name,
        size: file.size,
        mimeType: mimeType,
        url: signedUrlData?.signedUrl || '',
        overwritten: wasOverwritten
      }
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Storage upload error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET endpoint to list files
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'Project ID is required'
      }, { status: 400 })
    }

    const { data: files, error } = await supabase.storage
      .from('project-files')
      .list(projectId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to list files: ${error.message}`
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: files
    })

  } catch (error) {
    console.error('Storage list error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 