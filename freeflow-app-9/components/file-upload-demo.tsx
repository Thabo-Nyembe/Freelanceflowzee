'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Upload, FileIcon } from 'lucide-react'

interface UploadResult {
  key: string
  url: string
  bucket: string
  originalName: string
  size: number
  type: string
  uploadedAt: string
}

export function FileUploadDemo() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setError(null)
      setProgress(0)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setResult(data.data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          S3 File Upload Demo
        </CardTitle>
        <CardDescription>
          Test file uploads to Supabase S3-compatible storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.txt,.json"
            disabled={uploading}
          />
          {file && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <div className="flex items-center gap-2">
                <FileIcon className="h-4 w-4" />
                <span className="font-medium">{file.name}</span>
              </div>
              <div className="text-gray-600 mt-1">
                {formatFileSize(file.size)} • {file.type}
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>

        {uploading && (
          <div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600 mt-1">{progress}% uploaded</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">Upload successful!</div>
              <div className="mt-2 space-y-1 text-sm">
                <div><strong>File:</strong> {result.originalName}</div>
                <div><strong>Size:</strong> {formatFileSize(result.size)}</div>
                <div><strong>Key:</strong> {result.key}</div>
                <div><strong>Bucket:</strong> {result.bucket}</div>
                <div className="mt-2">
                  <a 
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View uploaded file →
                  </a>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
} 