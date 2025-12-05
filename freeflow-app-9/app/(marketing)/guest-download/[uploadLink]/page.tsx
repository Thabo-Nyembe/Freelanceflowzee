'use client'

/**
 * Guest Download Page
 *
 * Public page for downloading files shared via guest upload
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Download,
  Clock,
  AlertCircle,
  File,
  CheckCircle,
  Loader2,
  Shield,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface FileInfo {
  success: boolean
  downloadUrl?: string
  fileName?: string
  fileSize?: number
  remainingDownloads?: number
  expiresAt?: string
  error?: string
}

export default function GuestDownloadPage({ params }: { params: { uploadLink: string } }) {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFileInfo()
  }, [])

  const fetchFileInfo = async () => {
    try {
      const response = await fetch(`/api/guest-upload/download/${params.uploadLink}`)
      const data = await response.json()

      if (data.success) {
        setFileInfo(data)
      } else {
        setError(data.error || 'File not found')
      }
    } catch (err) {
      setError('Failed to load file information')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!fileInfo?.downloadUrl) return

    setDownloading(true)
    try {
      // Open download URL in new tab
      window.open(fileInfo.downloadUrl, '_blank')
      toast.success('Download started!')

      // Refresh file info to get updated download count
      setTimeout(() => {
        fetchFileInfo()
      }, 2000)
    } catch (err) {
      toast.error('Failed to start download')
    } finally {
      setDownloading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  const formatExpiryDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 1) return 'Less than 1 day'
    if (diffDays === 1) return '1 day'
    return `${diffDays} days`
  }

  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 p-6"
        role="main"
        aria-live="polite"
        aria-busy="true"
      >
        <Card className="max-w-md w-full" role="status" aria-label="Loading file information">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" aria-hidden="true" />
              <p className="text-lg font-medium">Loading file information...</p>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (error || !fileInfo) {
    return (
      <main
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 p-6"
        role="main"
        aria-live="assertive"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            className="max-w-md w-full border-red-200 dark:border-red-800"
            role="alert"
            aria-labelledby="error-title"
          >
            <CardHeader>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
              </div>
              <CardTitle id="error-title" className="text-center text-2xl">Unable to Load File</CardTitle>
              <CardDescription className="text-center text-base">{error}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive" role="status">
                <AlertDescription>
                  {error === 'File not found' && 'This download link may be invalid or has expired.'}
                  {error === 'Download link has expired' && 'This download link has expired. Free links are valid for 7 days, paid links for 30 days.'}
                  {error === 'Maximum downloads reached' && 'This file has reached its maximum download limit of 10.'}
                  {!['File not found', 'Download link has expired', 'Maximum downloads reached'].includes(error) && error}
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => window.location.href = '/guest-upload'}
                className="w-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                variant="outline"
                aria-label="Upload your own file"
              >
                Upload Your Own File
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 p-6"
      role="main"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-2" aria-labelledby="download-title">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center" aria-hidden="true">
                <Download className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <div>
                <CardTitle id="download-title" className="text-2xl">Download Your File</CardTitle>
                <CardDescription className="text-base">Secure file shared via KAZI</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* File Information */}
            <section aria-labelledby="file-info-heading">
              <h2 id="file-info-heading" className="sr-only">File information</h2>
              <div
                className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800"
                role="status"
                aria-label={`File: ${fileInfo.fileName}, Size: ${fileInfo.fileSize && formatFileSize(fileInfo.fileSize)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <File className="w-6 h-6 text-blue-500" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{fileInfo.fileName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {fileInfo.fileSize && formatFileSize(fileInfo.fileSize)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Download Stats */}
            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">Download statistics</h2>
              <div className="grid grid-cols-2 gap-4" role="list">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border" role="listitem">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>Remaining Downloads</span>
                  </div>
                  <p
                    className="text-2xl font-bold"
                    role="status"
                    aria-label={`${fileInfo.remainingDownloads} downloads remaining`}
                  >
                    {fileInfo.remainingDownloads}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border" role="listitem">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    <span>Expires In</span>
                  </div>
                  <p
                    className="text-2xl font-bold"
                    role="status"
                    aria-label={`Expires in ${fileInfo.expiresAt && formatExpiryDate(fileInfo.expiresAt)}`}
                  >
                    {fileInfo.expiresAt && formatExpiryDate(fileInfo.expiresAt)}
                  </p>
                </div>
              </div>
            </section>

            {/* Progress Bar */}
            {fileInfo.remainingDownloads !== undefined && (
              <div role="status" aria-label={`Download capacity: ${10 - fileInfo.remainingDownloads} of 10 downloads used`}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Download Capacity</span>
                  <span className="font-medium">{10 - fileInfo.remainingDownloads}/10 used</span>
                </div>
                <Progress
                  value={((10 - fileInfo.remainingDownloads) / 10) * 100}
                  className="h-2"
                  aria-valuenow={((10 - fileInfo.remainingDownloads) / 10) * 100}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            )}

            {/* Security Features */}
            <div
              className="flex items-center gap-4 text-sm text-muted-foreground"
              role="list"
              aria-label="Security features"
            >
              <div className="flex items-center gap-1" role="listitem">
                <Shield className="w-4 h-4 text-green-500" aria-hidden="true" />
                <span>Secure Storage</span>
              </div>
              <div className="flex items-center gap-1" role="listitem">
                <Zap className="w-4 h-4 text-yellow-500" aria-hidden="true" />
                <span>Fast Download</span>
              </div>
              <div className="flex items-center gap-1" role="listitem">
                <CheckCircle className="w-4 h-4 text-blue-500" aria-hidden="true" />
                <span>Verified Link</span>
              </div>
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              disabled={downloading || (fileInfo.remainingDownloads || 0) <= 0}
              className="w-full text-lg py-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              size="lg"
              aria-label={downloading ? "Starting download..." : `Download file: ${fileInfo.fileName}`}
              aria-busy={downloading}
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                  Starting Download...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" aria-hidden="true" />
                  Download File
                </>
              )}
            </Button>

            {fileInfo.remainingDownloads === 0 && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>
                  This file has reached its maximum download limit.
                </AlertDescription>
              </Alert>
            )}

            {/* Info */}
            <Alert role="note">
              <AlertDescription className="text-sm">
                💡 <strong>Note:</strong> Each download is tracked. Free links expire after 7 days, paid links after 30 days, or 10 downloads (whichever comes first).
              </AlertDescription>
            </Alert>

            {/* CTA */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">Need to share your own files?</p>
              <Button
                onClick={() => window.location.href = '/guest-upload'}
                variant="outline"
                className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Upload your file"
              >
                Upload Your File
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
