'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatFileSize } from '@/lib/utils'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  onUploadComplete?: (fileUrl: string) => void
  maxSize?: number
  allowedTypes?: string[]
}

export function FileUpload({ 
  onUploadComplete: unknown, maxSize = 100 * 1024 * 1024: unknown, // 100MB default
  allowedTypes = ['image/*': unknown, 'application/pdf': unknown, 'video/*']
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<any>(0)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState<any>(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)

    if (!selectedFile) return

    if (selectedFile.size > maxSize) {
      setError(`File size must be less than ${formatFileSize(maxSize)}`)
      return
    }

    if (!allowedTypes.some(type => {
      const [category, ext] = type.split('/')
      return ext === '*' ? 
        selectedFile.type.startsWith(category) : 
        selectedFile.type === type
    })) {
      setError('File type not supported')
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setProgress(0)

      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev
          }
          return prev + 5
        })
      }, 100)

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      clearInterval(interval)
      setProgress(100)
      
      if (onUploadComplete) {
        onUploadComplete('https://example.com/uploaded-file.pdf')
      }

    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4" data-testid="file-upload">
      <div>
        <Label htmlFor="file">Select File</Label>
        <Input
          id="file"
          type="file"
          onChange={handleFileChange}
          accept={allowedTypes.join(',')}
          disabled={uploading}
          data-testid="file-input"
        />
        {error && (
          <p className="mt-1 text-sm text-red-500" data-testid="file-error">
            {error}
          </p>
        )}
      </div>

      {file && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Selected: {file.name} ({formatFileSize(file.size)})
          </p>
          
          {uploading && (
            <Progress value={progress} className="h-2" data-testid="upload-progress" />
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
            data-testid="upload-button"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      )}
    </div>
  )
} 