'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface FileUpload {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
}

interface FileUploadZoneProps {
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  onUpload?: (files: File[]) => Promise<void>
  onRemove?: (fileId: string) => void
  onRetry?: (fileId: string) => void
}

export default function FileUploadZone({
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  onUpload,
  onRemove,
  onRetry,
}: FileUploadZoneProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([])

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newUploads = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'pending' as const,
      }))

      setUploads((prev) => [...prev, ...newUploads])

      if (onUpload) {
        try {
          // Simulate upload progress
          for (const upload of newUploads) {
            setUploads((prev) =>
              prev.map((u) =>
                u.id === upload.id
                  ? { ...u, status: 'uploading' }
                  : u
              )
            )

            // Simulate progress updates
            for (let progress = 0; progress <= 100; progress += 10) {
              await new Promise((resolve) => setTimeout(resolve, 200))
              setUploads((prev) =>
                prev.map((u) =>
                  u.id === upload.id ? { ...u, progress } : u
                )
              )
            }

            setUploads((prev) =>
              prev.map((u) =>
                u.id === upload.id
                  ? { ...u, status: 'complete' }
                  : u
              )
            )
          }

          await onUpload(acceptedFiles)
        } catch (error) {
          setUploads((prev) =>
            prev.map((u) =>
              newUploads.find((nu) => nu.id === u.id)
                ? { ...u, status: 'error', error: 'Upload failed' }
                : u
            )
          )
        }
      }
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    maxFiles,
    maxSize,
    accept: acceptedTypes.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
  })

  const handleRemove = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id))
    onRemove?.(id)
  }

  const handleRetry = async (id: string) => {
    const upload = uploads.find((u) => u.id === id)
    if (upload) {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, status: 'pending', progress: 0, error: undefined }
            : u
        )
      )
      await handleDrop([upload.file])
    }
    onRetry?.(id)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="w-full">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="mt-4 text-sm font-medium">
          {isDragActive
            ? 'Drop files here...'
            : 'Drag & drop files here, or click to select'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Maximum file size: {formatFileSize(maxSize)}
        </p>
        <p className="text-xs text-muted-foreground">
          Accepted files: {acceptedTypes.join(', ')}
        </p>
      </div>

      {uploads.length > 0 && (
        <div className="p-4 space-y-2">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50"
            >
              <File className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {upload.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(upload.file.size)}
                </p>
                {upload.status === 'uploading' && (
                  <Progress value={upload.progress} className="h-1 mt-2" />
                )}
                {upload.error && (
                  <p className="text-xs text-red-500 mt-1">{upload.error}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {upload.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                )}
                {upload.status === 'complete' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {upload.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {upload.status === 'error' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRetry(upload.id)}
                  >
                    <Loader2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(upload.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
} 