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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
              <p className="text-lg font-medium">Loading file information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !fileInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md w-full border-red-200 dark:border-red-800">
            <CardHeader>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle className="text-center text-2xl">Unable to Load File</CardTitle>
              <CardDescription className="text-center text-base">{error}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  {error === 'File not found' && 'This download link may be invalid or has expired.'}
                  {error === 'Download link has expired' && 'This download link has expired. Free links are valid for 7 days, paid links for 30 days.'}
                  {error === 'Maximum downloads reached' && 'This file has reached its maximum download limit of 10.'}
                  {!['File not found', 'Download link has expired', 'Maximum downloads reached'].includes(error) && error}
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => window.location.href = '/guest-upload'}
                className="w-full"
                variant="outline"
              >
                Upload Your Own File
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Download className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Download Your File</CardTitle>
                <CardDescription className="text-base">Secure file shared via KAZI</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* File Information */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <File className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{fileInfo.fileName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {fileInfo.fileSize && formatFileSize(fileInfo.fileSize)}
                  </p>
                </div>
              </div>
            </div>

            {/* Download Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Download className="w-4 h-4" />
                  <span>Remaining Downloads</span>
                </div>
                <p className="text-2xl font-bold">{fileInfo.remainingDownloads}</p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Expires In</span>
                </div>
                <p className="text-2xl font-bold">
                  {fileInfo.expiresAt && formatExpiryDate(fileInfo.expiresAt)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {fileInfo.remainingDownloads !== undefined && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Download Capacity</span>
                  <span className="font-medium">{10 - fileInfo.remainingDownloads}/10 used</span>
                </div>
                <Progress value={((10 - fileInfo.remainingDownloads) / 10) * 100} className="h-2" />
              </div>
            )}

            {/* Security Features */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure Storage</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Fast Download</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Verified Link</span>
              </div>
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              disabled={downloading || (fileInfo.remainingDownloads || 0) <= 0}
              className="w-full text-lg py-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              size="lg"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Starting Download...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download File
                </>
              )}
            </Button>

            {fileInfo.remainingDownloads === 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  This file has reached its maximum download limit.
                </AlertDescription>
              </Alert>
            )}

            {/* Info */}
            <Alert>
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
              >
                Upload Your File
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
