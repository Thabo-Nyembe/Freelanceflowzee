import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// Context7 enhanced upload endpoint with multi-cloud support
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const authorization = headersList.get('authorization')

    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize Supabase client
    const supabase = await createClient()

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const category = formData.get('category') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // File validation using Context7 patterns
    const maxSize = 100 * 1024 * 1024 // 100MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'audio/mp3', 'audio/wav', 'audio/ogg', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large', 
        maxSize: maxSize,
        receivedSize: file.size 
      }, { status: 400 })
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not allowed', 
        allowedTypes,
        receivedType: file.type 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()'
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`
    const storagePath = `uploads/${category}/${uniqueFileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-attachments')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ 
        error: 'Upload failed', 
        details: uploadError.message 
      }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('project-attachments')
      .getPublicUrl(storagePath)

    // Save file metadata to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('file_storage')
      .insert({
        name: file.name,
        original_name: file.name,
        size: file.size,
        type: file.type,
        category,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        project_id: projectId,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
        provider: 'supabase',
        metadata: {
          uploadTimestamp: timestamp,
          originalExtension: fileExtension,
          uploadSource: 'web-app'
        }
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to clean up uploaded file
      await supabase.storage
        .from('project-attachments')
        .remove([storagePath])
      
      return NextResponse.json({ 
        error: 'Database save failed', 
        details: dbError.message 
      }, { status: 500 })
    }

    // Update storage analytics
    await supabase
      .from('storage_analytics')
      .insert({
        operation_type: 'upload',
        file_size: file.size,
        file_type: file.type,
        provider: 'supabase',
        cost_estimate: calculateStorageCost(file.size, 'supabase'),
        user_id: (await supabase.auth.getUser()).data.user?.id
      })

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        name: fileRecord.name,
        size: fileRecord.size,
        type: fileRecord.type,
        url: fileRecord.public_url,
        category: fileRecord.category,
        uploadedAt: fileRecord.created_at
      },
      upload: {
        path: storagePath,
        provider: 'supabase',
        publicUrl: urlData.publicUrl
      }
    })

  } catch (error) {
    console.error('Upload endpoint error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to calculate storage cost
function calculateStorageCost(fileSize: number, provider: string): number {
  const sizeInGB = fileSize / (1024 * 1024 * 1024)
  
  switch (provider) {
    case 'supabase':
      return sizeInGB * 0.021 // $0.021 per GB/month
    case 'wasabi':
      return sizeInGB * 0.0059 // $0.0059 per GB/month
    default:
      return sizeInGB * 0.023 // AWS S3 standard pricing
  }
}

// GET method for upload status or file listing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = await createClient()

    let query = supabase
      .from('file_storage')
      .select('*')'
      .order('created_at', { ascending: false })
      .limit(limit)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: files, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      files,
      total: files?.length || 0
    })

  } catch (error) {
    console.error('File listing error:', error)
    return NextResponse.json({ 
      error: 'Failed to list files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
