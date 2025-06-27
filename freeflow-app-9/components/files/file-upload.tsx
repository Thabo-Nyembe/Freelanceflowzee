'use client

import { useState, useRef, useCallback } from 'react
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react
import { cn } from '@/lib/utils

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>
  maxSize?: number
  acceptedTypes?: string[]
  multiple?: boolean
  className?: string
}

export function FileUpload({
  onUpload,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['*/*'],
  multiple = true,
  className
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    await processFiles(droppedFiles)
  }, [])

  const processFiles = useCallback(async (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          [file.name]: `File size exceeds ${maxSize / 1024 / 1024}MB limit
        }))
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setFiles(validFiles)
    setUploadStatus('uploading')
    setUploadProgress({})

    try {
      // Simulate upload progress
      validFiles.forEach(file => {
        let progress = 0
        const interval = setInterval(() => {
          progress += 10
          if (progress <= 90) {
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }))
          } else {
            clearInterval(interval)
          }
        }, 100)
      })

      await onUpload(validFiles)
      
      // Set final progress and success status
      const finalProgress = validFiles.reduce((acc, file) => ({
        ...acc,
        [file.name]: 100
      }), {})
      setUploadProgress(finalProgress)
      setUploadStatus('success')

      // Reset after success
      setTimeout(() => {
        setUploadStatus('idle')
        setUploadProgress({})
        setFiles([])
        setErrors({})
      }, 2000)
    } catch (error) {
      setUploadStatus('error')
      setErrors(prev => ({
        ...prev,
        general: 'Upload failed. Please try again.
      }))
    }
  }, [maxSize, onUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : []
    processFiles(selectedFiles)
  }, [processFiles])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={cn('relative', className)} data-testid="file-upload">
      <input
        ref={fileInputRef}
        type="file
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        data-testid="file-input
      />
      
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 transition-all duration-200',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragging && 'border-primary bg-primary/10',
          uploadStatus === 'success' && 'border-green-500 bg-green-50',
          uploadStatus === 'error' && 'border-red-500 bg-red-50
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {uploadStatus === 'uploading' && (
            <div className="w-full space-y-4">
              {files.map(file => (
                <div key={file.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {uploadProgress[file.name] || 0}%
                    </p>
                  </div>
                  <Progress value={uploadProgress[file.name] || 0} />
                </div>
              ))}
            </div>
          )}
          
          {uploadStatus === 'success' && (
            <div className="text-green-600">
              <CheckCircle className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">Upload Complete!</p>
            </div>
          )}
          
          {uploadStatus === 'error' && (
            <div className="text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">Upload Failed</p>
              {Object.entries(errors).map(([key, error]) => (
                <p key={key} className="text-sm">{error}</p>
              ))}
            </div>
          )}
          
          {uploadStatus === 'idle' && (
            <>
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Drag & drop files here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
              <Button
                onClick={handleClick}
                data-testid="upload-file-btn
                className="mt-4
              >"
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 