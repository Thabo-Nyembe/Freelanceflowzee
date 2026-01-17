'use client'

import * as React from 'react'
import { useFormContext, FieldPath, FieldValues } from 'react-hook-form'
import { useDropzone, type FileRejection, type Accept } from 'react-dropzone'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertCircle,
  CheckCircle2,
  File,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Info,
  Loader2,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// ============================================================================
// TYPES
// ============================================================================

export interface UploadedFileInfo {
  /** Unique identifier */
  id: string
  /** File name */
  name: string
  /** File size in bytes */
  size: number
  /** MIME type */
  type: string
  /** Preview URL (for images) */
  preview?: string
  /** Upload progress (0-100) */
  progress: number
  /** Upload status */
  status: 'pending' | 'uploading' | 'success' | 'error'
  /** Error message if failed */
  error?: string
  /** Remote URL after upload */
  url?: string
}

export interface FormFileUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  /** Field name for react-hook-form */
  name: TName
  /** Label text */
  label?: string
  /** Description text shown below the upload area */
  description?: string
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the upload is in a loading state */
  loading?: boolean
  /** Tooltip text for additional information */
  tooltip?: string
  /** Maximum number of files */
  maxFiles?: number
  /** Maximum file size in MB */
  maxSizeMB?: number
  /** Accepted file types */
  accept?: Accept
  /** Whether to allow multiple files */
  multiple?: boolean
  /** Whether to show file preview */
  showPreview?: boolean
  /** Custom upload handler */
  onUpload?: (files: File[]) => Promise<UploadedFileInfo[]>
  /** Callback when files change */
  onFilesChange?: (files: UploadedFileInfo[]) => void
  /** Custom className */
  className?: string
  /** Dropzone className */
  dropzoneClassName?: string
  /** Variant */
  variant?: 'default' | 'compact' | 'inline'
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const fileUploadValidationSchemas = {
  required: z.array(z.any()).min(1, 'Please upload at least one file'),
  optional: z.array(z.any()).optional(),
  single: z.any().refine(
    (file) => file !== undefined,
    'Please upload a file'
  ),
  image: z.array(z.any()).refine(
    (files) => files.every((f: File) => f.type.startsWith('image/')),
    'Only image files are allowed'
  ),
  document: z.array(z.any()).refine(
    (files) => files.every((f: File) =>
      ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(f.type)
    ),
    'Only PDF and Word documents are allowed'
  ),
  maxSize: (maxMB: number) => z.array(z.any()).refine(
    (files) => files.every((f: File) => f.size <= maxMB * 1024 * 1024),
    `Files must be smaller than ${maxMB}MB`
  ),
  maxFiles: (max: number) => z.array(z.any()).max(max, `Maximum ${max} files allowed`),
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileIcon(type: string): React.ReactNode {
  if (type.startsWith('image/')) return <FileImage className="h-8 w-8 text-blue-500" />
  if (type.startsWith('video/')) return <FileVideo className="h-8 w-8 text-purple-500" />
  if (type.startsWith('audio/')) return <FileAudio className="h-8 w-8 text-orange-500" />
  if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />
  if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="h-8 w-8 text-green-500" />
  if (type.includes('document') || type.includes('word')) return <FileText className="h-8 w-8 text-blue-600" />
  if (type.includes('javascript') || type.includes('json') || type.includes('typescript')) return <FileCode className="h-8 w-8 text-yellow-500" />
  return <File className="h-8 w-8 text-gray-500" />
}

function generateId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).substring(7)}`
}

// ============================================================================
// FILE PREVIEW COMPONENT
// ============================================================================

interface FilePreviewProps {
  file: UploadedFileInfo
  onRemove: () => void
  showPreview?: boolean
  disabled?: boolean
}

function FilePreview({ file, onRemove, showPreview = true, disabled }: FilePreviewProps) {
  const isImage = file.type.startsWith('image/')

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        {/* Preview or Icon */}
        <div className="flex-shrink-0">
          {showPreview && isImage && file.preview ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-md border">
              <img
                src={file.preview}
                alt={file.name}
                className="h-full w-full object-cover"
                onLoad={() => {
                  // Revoke the object URL after loading to free memory
                  if (file.preview && file.preview.startsWith('blob:')) {
                    URL.revokeObjectURL(file.preview)
                  }
                }}
              />
            </div>
          ) : (
            getFileIcon(file.type)
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium truncate text-sm">{file.name}</p>
            <div className="flex items-center gap-2 ml-2">
              {file.status === 'success' && (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
              {file.status === 'error' && (
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              )}
              {file.status === 'uploading' && (
                <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                disabled={disabled || file.status === 'uploading'}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            {formatFileSize(file.size)}
          </p>

          {/* Progress Bar */}
          {file.status === 'uploading' && (
            <Progress value={file.progress} className="h-2" />
          )}

          {/* Error Message */}
          {file.status === 'error' && file.error && (
            <p className="text-xs text-destructive">{file.error}</p>
          )}
        </div>
      </div>
    </Card>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FormFileUpload<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  description,
  required = false,
  disabled = false,
  loading = false,
  tooltip,
  maxFiles = 10,
  maxSizeMB = 10,
  accept,
  multiple = true,
  showPreview = true,
  onUpload,
  onFilesChange,
  className,
  dropzoneClassName,
  variant = 'default',
}: FormFileUploadProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>()
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFileInfo[]>([])
  const [isUploading, setIsUploading] = React.useState(false)

  const processFiles = React.useCallback(async (acceptedFiles: File[]) => {
    // Create file info objects with previews
    const newFiles: UploadedFileInfo[] = acceptedFiles.map((file) => ({
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined,
      progress: 0,
      status: 'pending' as const,
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])

    // If custom upload handler provided, use it
    if (onUpload) {
      setIsUploading(true)

      try {
        // Update status to uploading
        setUploadedFiles((prev) =>
          prev.map((f) =>
            newFiles.some((nf) => nf.id === f.id)
              ? { ...f, status: 'uploading' as const }
              : f
          )
        )

        const results = await onUpload(acceptedFiles)

        // Update with results
        setUploadedFiles((prev) =>
          prev.map((f) => {
            const result = results.find((r) => r.name === f.name)
            if (result) {
              return {
                ...f,
                ...result,
                status: result.error ? 'error' : 'success',
                progress: 100,
              }
            }
            return f
          })
        )
      } catch (error) {
        // Mark all as error
        setUploadedFiles((prev) =>
          prev.map((f) =>
            newFiles.some((nf) => nf.id === f.id)
              ? {
                  ...f,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Upload failed',
                }
              : f
          )
        )
      } finally {
        setIsUploading(false)
      }
    } else {
      // No upload handler, just mark as success
      setUploadedFiles((prev) =>
        prev.map((f) =>
          newFiles.some((nf) => nf.id === f.id)
            ? { ...f, status: 'success' as const, progress: 100 }
            : f
        )
      )
    }
  }, [onUpload])

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          const errorFile: UploadedFileInfo = {
            id: generateId(),
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            status: 'error',
            error: errors.map((e) => e.message).join(', '),
          }
          setUploadedFiles((prev) => [...prev, errorFile])
        })
      }

      if (acceptedFiles.length === 0) return

      // Check max files
      if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
        const overflow = uploadedFiles.length + acceptedFiles.length - maxFiles
        acceptedFiles = acceptedFiles.slice(0, acceptedFiles.length - overflow)
      }

      await processFiles(acceptedFiles)
    },
    [uploadedFiles.length, maxFiles, processFiles]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxFiles: maxFiles - uploadedFiles.length,
    maxSize: maxSizeMB * 1024 * 1024,
    accept,
    multiple,
    disabled: disabled || loading || isUploading,
    noClick: variant === 'inline',
    noKeyboard: variant === 'inline',
  })

  const removeFile = React.useCallback((id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  // Update form value when files change
  React.useEffect(() => {
    const successfulFiles = uploadedFiles.filter((f) => f.status === 'success')
    onFilesChange?.(successfulFiles)
  }, [uploadedFiles, onFilesChange])

  // Cleanup previews on unmount
  React.useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [])

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        // Sync uploaded files with form
        React.useEffect(() => {
          const successfulFiles = uploadedFiles.filter((f) => f.status === 'success')
          field.onChange(successfulFiles)
        }, [uploadedFiles])

        return (
          <FormItem className={cn('space-y-4', className)}>
            {label && (
              <div className="flex items-center gap-2">
                <FormLabel
                  className={cn(
                    required && "after:content-['*'] after:ml-0.5 after:text-destructive"
                  )}
                >
                  {label}
                </FormLabel>
                {tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {(loading || isUploading) && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            )}

            <FormControl>
              <div>
                {/* Dropzone */}
                {variant === 'inline' ? (
                  <div className="flex items-center gap-2">
                    <input {...getInputProps()} />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={open}
                      disabled={disabled || loading || isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File{multiple ? 's' : ''}
                    </Button>
                    {uploadedFiles.length > 0 && (
                      <Badge variant="secondary">
                        {uploadedFiles.filter((f) => f.status === 'success').length} file(s)
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={cn(
                      'border-2 border-dashed rounded-lg transition-colors cursor-pointer',
                      variant === 'compact' ? 'p-4' : 'p-8',
                      isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50',
                      (disabled || loading || isUploading) && 'opacity-50 cursor-not-allowed',
                      dropzoneClassName
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className="text-center">
                      <Upload
                        className={cn(
                          'mx-auto mb-4 text-muted-foreground',
                          variant === 'compact' ? 'h-8 w-8 mb-2' : 'h-12 w-12'
                        )}
                      />
                      {isDragActive ? (
                        <p className="font-medium text-primary">Drop files here...</p>
                      ) : (
                        <div>
                          <p className={cn(
                            'font-medium mb-1',
                            variant === 'compact' ? 'text-sm' : 'text-lg'
                          )}>
                            Drag & drop files here, or click to select
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {multiple
                              ? `Up to ${maxFiles} files, ${maxSizeMB}MB each`
                              : `Max ${maxSizeMB}MB`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* File List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        Files ({uploadedFiles.filter((f) => f.status === 'success').length}/{maxFiles})
                      </h4>
                      {uploadedFiles.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadedFiles([])}
                          className="h-8 text-xs"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <FilePreview
                          key={file.id}
                          file={file}
                          onRemove={() => removeFile(file.id)}
                          showPreview={showPreview}
                          disabled={disabled || loading}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FormControl>

            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

// ============================================================================
// STANDALONE FILE UPLOAD (without react-hook-form)
// ============================================================================

export interface StandaloneFileUploadProps {
  /** Label text */
  label?: string
  /** Description text */
  description?: string
  /** Error message */
  error?: string
  /** Current files */
  value?: UploadedFileInfo[]
  /** Callback when files change */
  onValueChange?: (files: UploadedFileInfo[]) => void
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether loading */
  loading?: boolean
  /** Maximum files */
  maxFiles?: number
  /** Maximum size in MB */
  maxSizeMB?: number
  /** Accepted file types */
  accept?: Accept
  /** Multiple files */
  multiple?: boolean
  /** Show preview */
  showPreview?: boolean
  /** Custom upload handler */
  onUpload?: (files: File[]) => Promise<UploadedFileInfo[]>
  /** Tooltip text */
  tooltip?: string
  /** Custom className */
  className?: string
  /** Variant */
  variant?: 'default' | 'compact' | 'inline'
}

export function StandaloneFileUpload({
  label,
  description,
  error,
  value = [],
  onValueChange,
  required = false,
  disabled = false,
  loading = false,
  maxFiles = 10,
  maxSizeMB = 10,
  accept,
  multiple = true,
  showPreview = true,
  onUpload,
  tooltip,
  className,
  variant = 'default',
}: StandaloneFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFileInfo[]>(value)
  const [isUploading, setIsUploading] = React.useState(false)
  const id = React.useId()

  const processFiles = React.useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFileInfo[] = acceptedFiles.map((file) => ({
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined,
      progress: 0,
      status: 'pending' as const,
    }))

    const updatedFiles = [...uploadedFiles, ...newFiles]
    setUploadedFiles(updatedFiles)

    if (onUpload) {
      setIsUploading(true)
      try {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            newFiles.some((nf) => nf.id === f.id)
              ? { ...f, status: 'uploading' as const }
              : f
          )
        )

        const results = await onUpload(acceptedFiles)

        setUploadedFiles((prev) =>
          prev.map((f) => {
            const result = results.find((r) => r.name === f.name)
            if (result) {
              return {
                ...f,
                ...result,
                status: result.error ? 'error' : 'success',
                progress: 100,
              }
            }
            return f
          })
        )
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            newFiles.some((nf) => nf.id === f.id)
              ? {
                  ...f,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Upload failed',
                }
              : f
          )
        )
      } finally {
        setIsUploading(false)
      }
    } else {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          newFiles.some((nf) => nf.id === f.id)
            ? { ...f, status: 'success' as const, progress: 100 }
            : f
        )
      )
    }
  }, [uploadedFiles, onUpload])

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          const errorFile: UploadedFileInfo = {
            id: generateId(),
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            status: 'error',
            error: errors.map((e) => e.message).join(', '),
          }
          setUploadedFiles((prev) => [...prev, errorFile])
        })
      }

      if (acceptedFiles.length === 0) return

      if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
        const overflow = uploadedFiles.length + acceptedFiles.length - maxFiles
        acceptedFiles = acceptedFiles.slice(0, acceptedFiles.length - overflow)
      }

      await processFiles(acceptedFiles)
    },
    [uploadedFiles.length, maxFiles, processFiles]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxFiles: maxFiles - uploadedFiles.length,
    maxSize: maxSizeMB * 1024 * 1024,
    accept,
    multiple,
    disabled: disabled || loading || isUploading,
    noClick: variant === 'inline',
    noKeyboard: variant === 'inline',
  })

  const removeFile = React.useCallback((fileId: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== fileId)
    })
  }, [])

  React.useEffect(() => {
    const successfulFiles = uploadedFiles.filter((f) => f.status === 'success')
    onValueChange?.(successfulFiles)
  }, [uploadedFiles, onValueChange])

  React.useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <div className="flex items-center gap-2">
          <Label
            htmlFor={id}
            className={cn(
              required && "after:content-['*'] after:ml-0.5 after:text-destructive"
            )}
          >
            {label}
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {(loading || isUploading) && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {variant === 'inline' ? (
        <div className="flex items-center gap-2">
          <input {...getInputProps()} id={id} />
          <Button
            type="button"
            variant="outline"
            onClick={open}
            disabled={disabled || loading || isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose File{multiple ? 's' : ''}
          </Button>
          {uploadedFiles.length > 0 && (
            <Badge variant="secondary">
              {uploadedFiles.filter((f) => f.status === 'success').length} file(s)
            </Badge>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg transition-colors cursor-pointer',
            variant === 'compact' ? 'p-4' : 'p-8',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            error && 'border-destructive',
            (disabled || loading || isUploading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} id={id} />
          <div className="text-center">
            <Upload
              className={cn(
                'mx-auto mb-4 text-muted-foreground',
                variant === 'compact' ? 'h-8 w-8 mb-2' : 'h-12 w-12'
              )}
            />
            {isDragActive ? (
              <p className="font-medium text-primary">Drop files here...</p>
            ) : (
              <div>
                <p className={cn(
                  'font-medium mb-1',
                  variant === 'compact' ? 'text-sm' : 'text-lg'
                )}>
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  {multiple
                    ? `Up to ${maxFiles} files, ${maxSizeMB}MB each`
                    : `Max ${maxSizeMB}MB`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Files ({uploadedFiles.filter((f) => f.status === 'success').length}/{maxFiles})
            </h4>
            {uploadedFiles.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUploadedFiles([])}
                className="h-8 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <FilePreview
                key={file.id}
                file={file}
                onRemove={() => removeFile(file.id)}
                showPreview={showPreview}
                disabled={disabled || loading}
              />
            ))}
          </div>
        </div>
      )}

      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}

// ============================================================================
// AVATAR UPLOAD (common pattern)
// ============================================================================

export interface AvatarUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  /** Field name */
  name: TName
  /** Label */
  label?: string
  /** Current avatar URL */
  currentAvatarUrl?: string
  /** Size of the avatar */
  size?: 'sm' | 'md' | 'lg'
  /** Max size in MB */
  maxSizeMB?: number
  /** Upload handler */
  onUpload?: (file: File) => Promise<string>
  /** Custom className */
  className?: string
}

export function AvatarUpload<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label = 'Profile Photo',
  currentAvatarUrl,
  size = 'md',
  maxSizeMB = 5,
  onUpload,
  className,
}: AvatarUploadProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>()
  const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(currentAvatarUrl)
  const [isUploading, setIsUploading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)

    if (onUpload) {
      setIsUploading(true)
      try {
        const url = await onUpload(file)
        form.setValue(name, url as any)
        setPreviewUrl(url)
      } catch (error) {
        console.error('Upload failed:', error)
        setPreviewUrl(currentAvatarUrl)
      } finally {
        setIsUploading(false)
      }
    } else {
      form.setValue(name, file as any)
    }
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem className={cn('flex flex-col items-center gap-4', className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <div className="relative">
            <div
              className={cn(
                'rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted',
                sizeClasses[size],
                isUploading && 'opacity-50'
              )}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          <FormControl>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </FormControl>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {previewUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Max {maxSizeMB}MB. JPG, PNG, or GIF.
          </p>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default FormFileUpload
