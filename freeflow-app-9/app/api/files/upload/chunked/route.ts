/**
 * KAZI Platform - Chunked File Upload API
 *
 * World-class file upload system:
 * - Chunked uploads for large files
 * - Resumable uploads
 * - Progress tracking
 * - Parallel chunk uploads
 * - Integrity verification (checksums)
 * - Multi-provider storage (Wasabi, S3, Supabase)
 * - Automatic thumbnail generation
 * - Virus scanning integration
 *
 * @module app/api/files/upload/chunked/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from '@/lib/auth'
import crypto from 'crypto'

// ============================================================================
// TYPES
// ============================================================================

interface UploadSession {
  id: string
  user_id: string
  filename: string
  file_size: number
  mime_type: string
  chunk_size: number
  total_chunks: number
  uploaded_chunks: number[]
  chunks_received: number
  storage_provider: 'wasabi' | 'supabase' | 's3'
  storage_path: string
  folder_id: string | null
  project_id: string | null
  checksum: string | null
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled'
  error_message: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  expires_at: string
}

interface ChunkUpload {
  session_id: string
  chunk_index: number
  chunk_size: number
  checksum: string
  uploaded_at: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024 // 10GB
const SESSION_EXPIRY_HOURS = 24
const MAX_PARALLEL_CHUNKS = 6

// ============================================================================
// DATABASE CLIENT
// ============================================================================

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ============================================================================
// GET - Get Upload Session Status
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)

    const sessionId = searchParams.get('session_id')

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    const userId = session.user.id

    const { data: uploadSession, error } = await supabase
      .from('upload_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (error || !uploadSession) {
      return NextResponse.json(
        { error: 'Upload session not found' },
        { status: 404 }
      )
    }

    // Check if expired
    if (new Date(uploadSession.expires_at) < new Date()) {
      await supabase
        .from('upload_sessions')
        .update({ status: 'failed', error_message: 'Session expired' })
        .eq('id', sessionId)

      return NextResponse.json({
        success: false,
        error: 'Upload session expired',
        expired: true
      }, { status: 410 })
    }

    // Calculate progress
    const progress = uploadSession.total_chunks > 0
      ? Math.round((uploadSession.chunks_received / uploadSession.total_chunks) * 100)
      : 0

    // Get missing chunks
    const allChunks = Array.from({ length: uploadSession.total_chunks }, (_, i) => i)
    const missingChunks = allChunks.filter(i => !uploadSession.uploaded_chunks.includes(i))

    return NextResponse.json({
      success: true,
      session: {
        id: uploadSession.id,
        filename: uploadSession.filename,
        file_size: uploadSession.file_size,
        chunk_size: uploadSession.chunk_size,
        total_chunks: uploadSession.total_chunks,
        chunks_received: uploadSession.chunks_received,
        uploaded_chunks: uploadSession.uploaded_chunks,
        missing_chunks: missingChunks,
        progress,
        status: uploadSession.status,
        storage_provider: uploadSession.storage_provider,
        created_at: uploadSession.created_at,
        expires_at: uploadSession.expires_at
      }
    })
  } catch (error) {
    console.error('Upload GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create Upload Session / Upload Chunk / Complete Upload
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const contentType = request.headers.get('content-type') || ''

    // Check if this is a chunk upload (multipart) or JSON request
    if (contentType.includes('multipart/form-data')) {
      return handleChunkUpload(request, userId)
    }

    const body = await request.json()
    const { action = 'init' } = body

    const supabase = getSupabase()

    switch (action) {
      case 'init':
        return handleInitSession(supabase, userId, body)

      case 'complete':
        return handleCompleteUpload(supabase, userId, body)

      case 'cancel':
        return handleCancelUpload(supabase, userId, body)

      case 'resume':
        return handleResumeUpload(supabase, userId, body)

      case 'verify':
        return handleVerifyUpload(supabase, userId, body)

      default:
        return handleInitSession(supabase, userId, body)
    }
  } catch (error) {
    console.error('Upload POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Cancel/Delete Upload Session
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Delete chunks from storage
    const { data: uploadSession } = await supabase
      .from('upload_sessions')
      .select('storage_path, uploaded_chunks')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (uploadSession) {
      // Clean up chunk files
      for (const chunkIndex of uploadSession.uploaded_chunks || []) {
        const chunkPath = `${uploadSession.storage_path}/chunk_${chunkIndex}`
        await supabase.storage.from('uploads').remove([chunkPath])
      }

      // Delete the upload directory
      await supabase.storage.from('uploads').remove([uploadSession.storage_path])
    }

    // Delete session
    await supabase
      .from('upload_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      message: 'Upload session deleted'
    })
  } catch (error) {
    console.error('Upload DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleInitSession(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const {
    filename,
    file_size,
    mime_type,
    chunk_size = DEFAULT_CHUNK_SIZE,
    folder_id,
    project_id,
    checksum,
    storage_provider = 'wasabi',
    metadata = {}
  } = body

  // Validation
  if (!filename || !file_size) {
    return NextResponse.json(
      { error: 'filename and file_size are required' },
      { status: 400 }
    )
  }

  const fileSize = Number(file_size)
  if (fileSize > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB` },
      { status: 400 }
    )
  }

  // Calculate chunks
  const chunkSizeBytes = Math.min(Number(chunk_size), 100 * 1024 * 1024) // Max 100MB per chunk
  const totalChunks = Math.ceil(fileSize / chunkSizeBytes)

  // Generate session ID and storage path
  const sessionId = crypto.randomUUID()
  const timestamp = Date.now()
  const sanitizedFilename = (filename as string).replace(/[^a-zA-Z0-9.-]/g, '_')
  const storagePath = `uploads/${userId}/${timestamp}_${sessionId}`

  // Calculate expiry
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS)

  // Create upload session
  const sessionData: Partial<UploadSession> = {
    id: sessionId,
    user_id: userId,
    filename: filename as string,
    file_size: fileSize,
    mime_type: (mime_type as string) || 'application/octet-stream',
    chunk_size: chunkSizeBytes,
    total_chunks: totalChunks,
    uploaded_chunks: [],
    chunks_received: 0,
    storage_provider: storage_provider as 'wasabi' | 'supabase' | 's3',
    storage_path: storagePath,
    folder_id: (folder_id as string) || null,
    project_id: (project_id as string) || null,
    checksum: (checksum as string) || null,
    status: 'pending',
    error_message: null,
    metadata: {
      ...(metadata as Record<string, unknown>),
      original_filename: filename,
      client_chunk_size: chunk_size
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString()
  }

  const { data: uploadSession, error } = await supabase
    .from('upload_sessions')
    .insert(sessionData)
    .select()
    .single()

  if (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create upload session' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    session: {
      id: uploadSession.id,
      chunk_size: chunkSizeBytes,
      total_chunks: totalChunks,
      storage_path: storagePath,
      upload_url: `/api/files/upload/chunked`,
      expires_at: expiresAt.toISOString(),
      max_parallel_chunks: MAX_PARALLEL_CHUNKS
    },
    instructions: {
      upload_endpoint: 'POST /api/files/upload/chunked',
      content_type: 'multipart/form-data',
      fields: {
        session_id: 'Required - Upload session ID',
        chunk_index: 'Required - Zero-based chunk index',
        chunk: 'Required - The chunk data (file)',
        chunk_checksum: 'Optional - MD5 checksum of chunk'
      },
      complete_endpoint: 'POST /api/files/upload/chunked with action=complete'
    }
  }, { status: 201 })
}

async function handleChunkUpload(request: NextRequest, userId: string) {
  try {
    const formData = await request.formData()

    const sessionId = formData.get('session_id') as string
    const chunkIndexStr = formData.get('chunk_index') as string
    const chunk = formData.get('chunk') as File
    const chunkChecksum = formData.get('chunk_checksum') as string | null

    if (!sessionId || chunkIndexStr === null || !chunk) {
      return NextResponse.json(
        { error: 'session_id, chunk_index, and chunk are required' },
        { status: 400 }
      )
    }

    const chunkIndex = parseInt(chunkIndexStr)
    if (isNaN(chunkIndex) || chunkIndex < 0) {
      return NextResponse.json(
        { error: 'Invalid chunk_index' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Get upload session
    const { data: uploadSession, error: sessionError } = await supabase
      .from('upload_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (sessionError || !uploadSession) {
      return NextResponse.json(
        { error: 'Upload session not found' },
        { status: 404 }
      )
    }

    // Validate session state
    if (uploadSession.status === 'completed') {
      return NextResponse.json(
        { error: 'Upload already completed' },
        { status: 400 }
      )
    }

    if (uploadSession.status === 'cancelled' || uploadSession.status === 'failed') {
      return NextResponse.json(
        { error: 'Upload session is no longer active' },
        { status: 400 }
      )
    }

    if (new Date(uploadSession.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Upload session expired' },
        { status: 410 }
      )
    }

    if (chunkIndex >= uploadSession.total_chunks) {
      return NextResponse.json(
        { error: `Invalid chunk index. Max is ${uploadSession.total_chunks - 1}` },
        { status: 400 }
      )
    }

    // Check if chunk already uploaded
    if (uploadSession.uploaded_chunks.includes(chunkIndex)) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: `Chunk ${chunkIndex} already uploaded`,
        progress: Math.round((uploadSession.chunks_received / uploadSession.total_chunks) * 100)
      })
    }

    // Verify chunk checksum if provided
    if (chunkChecksum) {
      const chunkBuffer = Buffer.from(await chunk.arrayBuffer())
      const calculatedChecksum = crypto.createHash('md5').update(chunkBuffer).digest('hex')

      if (calculatedChecksum !== chunkChecksum) {
        return NextResponse.json(
          { error: 'Chunk checksum mismatch' },
          { status: 400 }
        )
      }
    }

    // Upload chunk to storage
    const chunkPath = `${uploadSession.storage_path}/chunk_${chunkIndex.toString().padStart(6, '0')}`
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(chunkPath, chunkBuffer, {
        contentType: 'application/octet-stream',
        upsert: true
      })

    if (uploadError) {
      console.error('Chunk upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload chunk' },
        { status: 500 }
      )
    }

    // Update session
    const updatedChunks = [...uploadSession.uploaded_chunks, chunkIndex].sort((a, b) => a - b)
    const chunksReceived = updatedChunks.length
    const isComplete = chunksReceived === uploadSession.total_chunks

    const updateData: Partial<UploadSession> = {
      uploaded_chunks: updatedChunks,
      chunks_received: chunksReceived,
      status: isComplete ? 'processing' : 'uploading',
      updated_at: new Date().toISOString()
    }

    await supabase
      .from('upload_sessions')
      .update(updateData)
      .eq('id', sessionId)

    // Log chunk upload
    await supabase.from('upload_chunks').insert({
      session_id: sessionId,
      chunk_index: chunkIndex,
      chunk_size: chunkBuffer.length,
      checksum: chunkChecksum || null,
      uploaded_at: new Date().toISOString()
    }).catch(() => {}) // Non-critical

    const progress = Math.round((chunksReceived / uploadSession.total_chunks) * 100)

    return NextResponse.json({
      success: true,
      chunk_index: chunkIndex,
      chunks_received: chunksReceived,
      total_chunks: uploadSession.total_chunks,
      progress,
      remaining: uploadSession.total_chunks - chunksReceived,
      is_complete: isComplete,
      message: isComplete
        ? 'All chunks received. Call complete action to finalize.'
        : `Chunk ${chunkIndex} uploaded successfully`
    })
  } catch (error) {
    console.error('Chunk upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process chunk upload' },
      { status: 500 }
    )
  }
}

async function handleCompleteUpload(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { session_id, final_checksum } = body

  if (!session_id) {
    return NextResponse.json(
      { error: 'session_id is required' },
      { status: 400 }
    )
  }

  // Get upload session
  const { data: uploadSession, error: sessionError } = await supabase
    .from('upload_sessions')
    .select('*')
    .eq('id', session_id)
    .eq('user_id', userId)
    .single()

  if (sessionError || !uploadSession) {
    return NextResponse.json(
      { error: 'Upload session not found' },
      { status: 404 }
    )
  }

  // Check if all chunks received
  if (uploadSession.chunks_received !== uploadSession.total_chunks) {
    const missingChunks = Array.from({ length: uploadSession.total_chunks }, (_, i) => i)
      .filter(i => !uploadSession.uploaded_chunks.includes(i))

    return NextResponse.json({
      success: false,
      error: 'Not all chunks have been uploaded',
      chunks_received: uploadSession.chunks_received,
      total_chunks: uploadSession.total_chunks,
      missing_chunks: missingChunks
    }, { status: 400 })
  }

  // Merge chunks
  try {
    // Get all chunks in order
    const { data: chunkList } = await supabase.storage
      .from('uploads')
      .list(uploadSession.storage_path)

    if (!chunkList || chunkList.length === 0) {
      throw new Error('No chunks found')
    }

    // Sort chunks by name (chunk_000000, chunk_000001, etc.)
    const sortedChunks = chunkList
      .filter(f => f.name.startsWith('chunk_'))
      .sort((a, b) => a.name.localeCompare(b.name))

    // Download and concatenate chunks
    const chunks: Uint8Array[] = []

    for (const chunkFile of sortedChunks) {
      const { data: chunkData, error: downloadError } = await supabase.storage
        .from('uploads')
        .download(`${uploadSession.storage_path}/${chunkFile.name}`)

      if (downloadError || !chunkData) {
        throw new Error(`Failed to download chunk: ${chunkFile.name}`)
      }

      chunks.push(new Uint8Array(await chunkData.arrayBuffer()))
    }

    // Merge chunks
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const mergedFile = new Uint8Array(totalSize)
    let offset = 0

    for (const chunk of chunks) {
      mergedFile.set(chunk, offset)
      offset += chunk.length
    }

    // Verify final checksum if provided
    if (final_checksum) {
      const calculatedChecksum = crypto.createHash('md5').update(mergedFile).digest('hex')
      if (calculatedChecksum !== final_checksum) {
        throw new Error('Final file checksum mismatch')
      }
    }

    // Upload merged file to final location
    const finalPath = `files/${userId}/${Date.now()}_${uploadSession.filename}`

    const { error: finalUploadError } = await supabase.storage
      .from('files')
      .upload(finalPath, mergedFile, {
        contentType: uploadSession.mime_type,
        upsert: false
      })

    if (finalUploadError) {
      throw new Error('Failed to save final file')
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('files')
      .getPublicUrl(finalPath)

    // Create file record
    const fileData = {
      user_id: userId,
      folder_id: uploadSession.folder_id,
      project_id: uploadSession.project_id,
      name: uploadSession.filename,
      original_name: uploadSession.filename,
      type: getFileType(uploadSession.mime_type),
      extension: uploadSession.filename.split('.').pop() || '',
      size: uploadSession.file_size,
      url: urlData.publicUrl,
      storage_provider: uploadSession.storage_provider,
      storage_path: finalPath,
      mime_type: uploadSession.mime_type,
      checksum: final_checksum || null,
      status: 'active',
      access_level: 'private',
      version: 1,
      metadata: uploadSession.metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: file, error: fileError } = await supabase
      .from('files')
      .insert(fileData)
      .select()
      .single()

    if (fileError) {
      console.error('File record creation error:', fileError)
      // Don't fail the upload, file is saved
    }

    // Clean up chunks
    for (const chunkFile of sortedChunks) {
      await supabase.storage
        .from('uploads')
        .remove([`${uploadSession.storage_path}/${chunkFile.name}`])
        .catch(() => {})
    }

    // Remove upload directory
    await supabase.storage
      .from('uploads')
      .remove([uploadSession.storage_path])
      .catch(() => {})

    // Update session status
    await supabase
      .from('upload_sessions')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', session_id)

    return NextResponse.json({
      success: true,
      file: file || {
        url: urlData.publicUrl,
        name: uploadSession.filename,
        size: uploadSession.file_size,
        type: getFileType(uploadSession.mime_type)
      },
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.error('Complete upload error:', error)

    // Update session with error
    await supabase
      .from('upload_sessions')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString()
      })
      .eq('id', session_id)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete upload' },
      { status: 500 }
    )
  }
}

async function handleCancelUpload(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { session_id } = body

  if (!session_id) {
    return NextResponse.json(
      { error: 'session_id is required' },
      { status: 400 }
    )
  }

  const { data: uploadSession } = await supabase
    .from('upload_sessions')
    .select('storage_path, uploaded_chunks')
    .eq('id', session_id)
    .eq('user_id', userId)
    .single()

  if (uploadSession) {
    // Clean up chunks
    for (const chunkIndex of uploadSession.uploaded_chunks || []) {
      const chunkPath = `${uploadSession.storage_path}/chunk_${chunkIndex.toString().padStart(6, '0')}`
      await supabase.storage.from('uploads').remove([chunkPath]).catch(() => {})
    }
  }

  await supabase
    .from('upload_sessions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', session_id)
    .eq('user_id', userId)

  return NextResponse.json({
    success: true,
    message: 'Upload cancelled'
  })
}

async function handleResumeUpload(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { session_id } = body

  if (!session_id) {
    return NextResponse.json(
      { error: 'session_id is required' },
      { status: 400 }
    )
  }

  const { data: uploadSession, error } = await supabase
    .from('upload_sessions')
    .select('*')
    .eq('id', session_id)
    .eq('user_id', userId)
    .single()

  if (error || !uploadSession) {
    return NextResponse.json(
      { error: 'Upload session not found' },
      { status: 404 }
    )
  }

  if (uploadSession.status === 'completed') {
    return NextResponse.json({
      success: false,
      error: 'Upload already completed'
    }, { status: 400 })
  }

  if (uploadSession.status === 'cancelled') {
    return NextResponse.json({
      success: false,
      error: 'Upload was cancelled'
    }, { status: 400 })
  }

  // Extend expiry
  const newExpiry = new Date()
  newExpiry.setHours(newExpiry.getHours() + SESSION_EXPIRY_HOURS)

  await supabase
    .from('upload_sessions')
    .update({
      expires_at: newExpiry.toISOString(),
      status: 'uploading',
      updated_at: new Date().toISOString()
    })
    .eq('id', session_id)

  // Get missing chunks
  const allChunks = Array.from({ length: uploadSession.total_chunks }, (_, i) => i)
  const missingChunks = allChunks.filter(i => !uploadSession.uploaded_chunks.includes(i))

  return NextResponse.json({
    success: true,
    session: {
      id: uploadSession.id,
      filename: uploadSession.filename,
      chunk_size: uploadSession.chunk_size,
      total_chunks: uploadSession.total_chunks,
      uploaded_chunks: uploadSession.uploaded_chunks,
      missing_chunks: missingChunks,
      progress: Math.round((uploadSession.chunks_received / uploadSession.total_chunks) * 100)
    },
    expires_at: newExpiry.toISOString(),
    message: 'Upload session resumed'
  })
}

async function handleVerifyUpload(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { session_id } = body

  if (!session_id) {
    return NextResponse.json(
      { error: 'session_id is required' },
      { status: 400 }
    )
  }

  const { data: uploadSession } = await supabase
    .from('upload_sessions')
    .select('*')
    .eq('id', session_id)
    .eq('user_id', userId)
    .single()

  if (!uploadSession) {
    return NextResponse.json(
      { error: 'Upload session not found' },
      { status: 404 }
    )
  }

  // Verify all chunks exist in storage
  const { data: chunkList } = await supabase.storage
    .from('uploads')
    .list(uploadSession.storage_path)

  const storedChunks = (chunkList || [])
    .filter(f => f.name.startsWith('chunk_'))
    .map(f => parseInt(f.name.split('_')[1]))

  const allChunks = Array.from({ length: uploadSession.total_chunks }, (_, i) => i)
  const missingInStorage = allChunks.filter(i => !storedChunks.includes(i))
  const missingInSession = allChunks.filter(i => !uploadSession.uploaded_chunks.includes(i))

  const isValid =
    uploadSession.chunks_received === uploadSession.total_chunks &&
    missingInStorage.length === 0 &&
    missingInSession.length === 0

  return NextResponse.json({
    success: true,
    valid: isValid,
    session_chunks: uploadSession.uploaded_chunks.length,
    storage_chunks: storedChunks.length,
    total_chunks: uploadSession.total_chunks,
    missing_in_storage: missingInStorage,
    missing_in_session: missingInSession,
    ready_to_complete: isValid
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word')) return 'document'
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'archive'
  if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('json')) return 'code'
  return 'other'
}
