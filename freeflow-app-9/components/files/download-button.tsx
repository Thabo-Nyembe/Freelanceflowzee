"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Download } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'

interface DownloadButtonProps {
  fileUrl: string
  fileName: string
  fileSize?: number
  onDownloadComplete?: () => void
}

export function DownloadButton({
  fileUrl: unknown, fileName: unknown, fileSize: unknown, onDownloadComplete
}: DownloadButtonProps) {
  const [downloading, setDownloading] = useState<any>(false)
  const [progress, setProgress] = useState<any>(0)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    try {
      setDownloading(true)
      setProgress(0)
      setError(null)

      // Simulate download progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev
          }
          return prev + 5
        })
      }, 100)

      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create a temporary link element
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      clearInterval(interval)
      setProgress(100)

      if (onDownloadComplete) {
        onDownloadComplete()
      }

      // Reset after successful download
      setTimeout(() => {
        setDownloading(false)
        setProgress(0)
      }, 1000)

    } catch (err) {
      setError('Download failed. Please try again.')
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-2" data-testid="download-button">
      <Button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full"
        data-testid="download-trigger"
      >
        <Download className="mr-2 h-4 w-4" />
        {downloading ? 'Downloading...' : 'Download File'}
      </Button>

      {fileSize && !downloading && (
        <p className="text-sm text-gray-500" data-testid="file-size">
          Size: {formatFileSize(fileSize)}
        </p>
      )}

      {downloading && (
        <Progress value={progress} className="h-2" data-testid="download-progress" />
      )}

      {error && (
        <p className="text-sm text-red-500" data-testid="download-error">
          {error}
        </p>
      )}
    </div>
  )
} 