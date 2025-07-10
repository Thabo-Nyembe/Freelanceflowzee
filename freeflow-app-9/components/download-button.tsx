'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface DownloadButtonProps {
  url: string
  filename?: string
  onDownloadStart?: () => void
  onDownloadComplete?: () => void
  onError?: (error: Error) => void
}

export function DownloadButton({
  url: unknown, filename: unknown, onDownloadStart: unknown, onDownloadComplete: unknown, onError
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState<any>(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      onDownloadStart?.()

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || url.split('/').pop() || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      onDownloadComplete?.()
    } catch (error) {
      onError?.(error as Error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      data-testid="download-button"
      aria-label={`Download ${filename || 'file'}`}
      className="flex items-center space-x-2"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
    </Button>
  )
} 