import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Security: Block dangerous file types
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jse',
  '.jar', '.msi', '.dll', '.sys', '.drv', '.bin', '.run', '.app', '.deb',
  '.rpm', '.dmg', '.pkg', '.sh', '.bash', '.csh', '.ps1', '.psm1'
]

// Allowed file types for upload
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Documents
  'application/pdf', 'text/plain', 'text/csv',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Audio
  'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/aac',
  // Video
  'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
  // Archives
  'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed',
  'application/x-7z-compressed', 'application/gzip'
]

// Maximum file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024

function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts and sanitize filename
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_')
}

function isFileTypeAllowed(filename: string, mimeType: string): boolean {
  const extension = path.extname(filename).toLowerCase()
  
  // Block dangerous extensions
  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return false
  }
  
  // Check if MIME type is allowed
  return ALLOWED_MIME_TYPES.includes(mimeType)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const overwrite = formData.get('overwrite') === 'true'

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowed size of 100MB' },
        { status: 400 }
      )
    }

    // Validate file type for security
    if (!isFileTypeAllowed(file.name, file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed for security reasons' },
        { status: 400 }
      )
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.name)
    const filePath = `${projectId}/${sanitizedFilename}`

    // Check if file already exists
    let fileExists = false
    try {
      const { data: existingFile } = await supabase.storage
        .from('project-files')
        .list(projectId, {
          search: sanitizedFilename
        })
      
      fileExists = existingFile && existingFile.length > 0
    } catch (error) {
      // If error checking existence, proceed with upload
      console.log('Error checking file existence:', error)
    }

    // Convert File to buffer for upload
    const fileBuffer = await file.arrayBuffer()

    let uploadResult
    if (fileExists && overwrite) {
      // Update existing file
      uploadResult = await supabase.storage
        .from('project-files')
        .update(filePath, fileBuffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        })
    } else {
      // Upload new file
      uploadResult = await supabase.storage
        .from('project-files')
        .upload(filePath, fileBuffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })
    }

    if (uploadResult.error) {
      console.error('Upload error:', uploadResult.error)
      return NextResponse.json(
        { success: false, error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Generate signed URL for the uploaded file
    const { data: signedUrlData } = await supabase.storage
      .from('project-files')
      .createSignedUrl(filePath, 3600)

    const responseData = {
      id: uploadResult.data.path,
      filename: sanitizedFilename,
      size: file.size,
      mimeType: file.type,
      url: signedUrlData?.signedUrl || `/api/storage/download/${sanitizedFilename}?projectId=${projectId}`,
      projectId: projectId,
      uploadedAt: new Date().toISOString()
    }

    if (fileExists && overwrite) {
      responseData.overwritten = true
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: responseData
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
    maxSize: '100MB',
    allowedTypes: ALLOWED_MIME_TYPES,
    blockedExtensions: BLOCKED_EXTENSIONS
  })
}
