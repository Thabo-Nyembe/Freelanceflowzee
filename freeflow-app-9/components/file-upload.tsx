'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  onUpload: (file: File) => void
  accept?: string
  maxSize?: number
}

export function FileUpload({ 
  onUpload, 
  accept = '*/*', 
  maxSize = 10 * 1024 * 1024 // 10MB default
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / 1024 / 1024}MB limit`)
      return false
    }
    setError(null)
    return true
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && validateFile(file)) {
      onUpload(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      onUpload(file)
    }
  }

  return (
    <div
      data-testid="file-upload
      className={`p-6 border-2 border-dashed rounded-lg ${
        isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="region
      aria-label="File upload area
    >
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Drop a file here, or{' '}
              <span className="text-indigo-600 hover:text-indigo-500">browse</span>
            </span>
            <Input
              id="file-upload
              name="file-upload
              type="file
              className="sr-only
              accept={accept}
              onChange={handleFileInput}"
              data-testid="file-input
              aria-label="File input
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {`Max file size: ${maxSize / 1024 / 1024}MB`}
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert" data-testid="file-error">
            {error}
          </p>
        )}
      </div>
    </div>
  )
} 