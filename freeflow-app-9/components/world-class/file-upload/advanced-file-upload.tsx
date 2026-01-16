'use client'

/**
 * Advanced File Upload Component
 *
 * Features:
 * - Drag & drop support
 * - Multiple file upload
 * - File type validation
 * - Size limits
 * - Progress tracking
 * - Preview support
 * - Supabase Storage integration
 *
 * Based on react-dropzone (MIT License)
 * Inspired by: https://github.com/react-dropzone/react-dropzone
 */

import { useCallback, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, X, File, Image, Video, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: Date
}

export interface AdvancedFileUploadProps {
  bucket: string
  path?: string
  maxFiles?: number
  maxSizeMB?: number
  acceptedFileTypes?: string[]
  onUploadComplete?: (files: UploadedFile[]) => void
  onUploadError?: (error: Error) => void
  showPreview?: boolean
  className?: string
}

interface FileWithProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  url?: string
  error?: string
}

export function AdvancedFileUpload({
  bucket,
  path = '',
  maxFiles = 10,
  maxSizeMB = 50,
  acceptedFileTypes,
  onUploadComplete,
  onUploadError,
  showPreview = true,
  className
}: AdvancedFileUploadProps) {
  const [filesWithProgress, setFilesWithProgress] = useState<FileWithProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const uploadToSupabase = useCallback(async (file: File, index: number) => {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    try {
      // Update status to uploading
      setFilesWithProgress(prev => prev.map((f, i) =>
        i === index ? { ...f, status: 'uploading' as const } : f
      ))

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      // Update to success
      setFilesWithProgress(prev => prev.map((f, i) =>
        i === index ? {
          ...f,
          status: 'success' as const,
          progress: 100,
          url: publicUrl
        } : f
      ))

      return {
        id: data.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrl,
        uploadedAt: new Date()
      }
    } catch (error) {
      console.error('Upload error:', error)
      setFilesWithProgress(prev => prev.map((f, i) =>
        i === index ? {
          ...f,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f
      ))
      throw error
    }
  }, [bucket, path])

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error(`${file.name} is too large (max ${maxSizeMB}MB)`)
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${file.name} has invalid file type`)
          } else {
            toast.error(`${file.name}: ${error.message}`)
          }
        })
      })
    }

    if (acceptedFiles.length === 0) return

    // Check max files
    if (acceptedFiles.length + filesWithProgress.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Initialize files with progress
    const newFiles: FileWithProgress[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }))

    setFilesWithProgress(prev => [...prev, ...newFiles])
    setIsUploading(true)

    try {
      // Upload all files
      const uploadPromises = acceptedFiles.map((file, index) =>
        uploadToSupabase(file, filesWithProgress.length + index)
      )

      const uploadedFiles = await Promise.all(uploadPromises)

      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`)
      onUploadComplete?.(uploadedFiles.filter(Boolean) as UploadedFile[])
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Upload failed')
      toast.error(err.message)
      onUploadError?.(err)
    } finally {
      setIsUploading(false)
    }
  }, [filesWithProgress, maxFiles, maxSizeMB, uploadToSupabase, onUploadComplete, onUploadError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: maxSizeMB * 1024 * 1024,
    accept: acceptedFileTypes ? {
      'image/*': acceptedFileTypes.filter(t => t.startsWith('image/')),
      'video/*': acceptedFileTypes.filter(t => t.startsWith('video/')),
      'application/*': acceptedFileTypes.filter(t => t.startsWith('application/'))
    } : undefined
  })

  const removeFile = (index: number) => {
    setFilesWithProgress(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />
    if (type.startsWith('video/')) return <Video className="h-8 w-8 text-purple-500" />
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />
    return <File className="h-8 w-8 text-gray-500" />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 dark:border-gray-700 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Max {maxFiles} files, up to {maxSizeMB}MB each
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {filesWithProgress.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Files ({filesWithProgress.length})</h3>
          {filesWithProgress.map((item, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {getFileIcon(item.file.type)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium truncate">{item.file.name}</p>
                    <div className="flex items-center gap-2">
                      {item.status === 'success' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {item.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      {item.status === 'uploading' && (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isUploading && item.status === 'uploading'}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {/* Progress Bar */}
                  {item.status === 'uploading' && (
                    <Progress value={item.progress} className="h-2" />
                  )}

                  {/* Error Message */}
                  {item.status === 'error' && item.error && (
                    <p className="text-sm text-red-500">{item.error}</p>
                  )}

                  {/* Preview */}
                  {showPreview && item.url && item.file.type.startsWith('image/') && (
                    <img
                      src={item.url}
                      alt={item.file.name}
                      className="mt-2 h-20 w-auto rounded border"
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
