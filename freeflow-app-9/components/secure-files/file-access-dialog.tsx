'use client'

/**
 * File Access Dialog Component
 *
 * Features:
 * - Password input for protected files
 * - Payment flow integration
 * - Escrow status display
 * - Download button
 * - Expiration countdown
 * - Download count display
 * - Rate limit warnings
 * - Error handling
 */

import { useState, useEffect } from 'react'
import {
  Lock,
  DollarSign,
  Shield,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

export interface FileAccessDialogProps {
  deliveryId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccessGranted?: (downloadUrl: string) => void
}

interface DeliveryInfo {
  fileName: string
  fileSize: number
  fileType: string
  requiresPassword: boolean
  requiresPayment: boolean
  paymentAmount: number
  escrowEnabled: boolean
  status: string
  downloadCount: number
  maxDownloads: number | null
  expiresAt: string | null
  isExpired: boolean
  limitReached: boolean
  canDownload: boolean
}

export function FileAccessDialog({
  deliveryId,
  open,
  onOpenChange,
  onAccessGranted
}: FileAccessDialogProps) {
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchDeliveryInfo()
    }
  }, [open, deliveryId])

  const fetchDeliveryInfo = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/files/delivery/${deliveryId}/download`)
      const data = await response.json()

      if (data.success && data.delivery) {
        setDeliveryInfo(data.delivery)
      } else {
        setError(data.error || 'Failed to fetch delivery information')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyPassword = async () => {
    if (!password.trim()) {
      setError('Please enter a password')
      return
    }

    setVerifying(true)
    setError(null)

    try {
      const response = await fetch(`/api/files/delivery/${deliveryId}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (data.success) {
        setAccessToken(data.accessToken)
        if (data.downloadUrl) {
          handleDownload(data.downloadUrl)
        }
      } else {
        setError(data.error || 'Incorrect password')
        setRemainingAttempts(data.remainingAttempts ?? null)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setVerifying(false)
    }
  }

  const initiateDownload = async () => {
    setDownloading(true)
    setError(null)

    try {
      const response = await fetch(`/api/files/delivery/${deliveryId}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      })

      const data = await response.json()

      if (data.success && data.downloadUrl) {
        handleDownload(data.downloadUrl)
      } else {
        setError(data.error || 'Failed to generate download link')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setDownloading(false)
    }
  }

  const handleDownload = (downloadUrl: string) => {
    // Open download in new tab
    window.open(downloadUrl, '_blank')
    onAccessGranted?.(downloadUrl)

    // Refresh delivery info to update download count
    setTimeout(fetchDeliveryInfo, 1000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getTimeUntilExpiry = () => {
    if (!deliveryInfo?.expiresAt) return null

    const now = new Date().getTime()
    const expiry = new Date(deliveryInfo.expiresAt).getTime()
    const diff = expiry - now

    if (diff <= 0) return 'Expired'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`
    return 'Less than 1 hour remaining'
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!deliveryInfo) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || 'Failed to load file information'}</AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{deliveryInfo.fileName}</DialogTitle>
          <DialogDescription>
            {formatFileSize(deliveryInfo.fileSize)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Status */}
          <div className="space-y-2">
            {deliveryInfo.isExpired && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Expired</AlertTitle>
                <AlertDescription>This file delivery has expired</AlertDescription>
              </Alert>
            )}

            {deliveryInfo.limitReached && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Download Limit Reached</AlertTitle>
                <AlertDescription>
                  Maximum downloads ({deliveryInfo.maxDownloads}) reached
                </AlertDescription>
              </Alert>
            )}

            {!deliveryInfo.isExpired && !deliveryInfo.limitReached && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {deliveryInfo.downloadCount}
                    {deliveryInfo.maxDownloads && ` / ${deliveryInfo.maxDownloads}`} downloads
                  </span>
                </div>
                {deliveryInfo.expiresAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{getTimeUntilExpiry()}</span>
                  </div>
                )}
              </div>
            )}

            {deliveryInfo.maxDownloads && deliveryInfo.downloadCount > 0 && (
              <Progress
                value={(deliveryInfo.downloadCount / deliveryInfo.maxDownloads) * 100}
                className="h-2"
              />
            )}
          </div>

          {/* Password Input */}
          {deliveryInfo.requiresPassword && !accessToken && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password Required
              </Label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !verifying) {
                    verifyPassword()
                  }
                }}
                disabled={verifying || !deliveryInfo.canDownload}
              />
              {remainingAttempts !== null && (
                <p className="text-sm text-muted-foreground">
                  {remainingAttempts === 0
                    ? 'Too many failed attempts. Please try again later.'
                    : `${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining`}
                </p>
              )}
            </div>
          )}

          {/* Payment Required */}
          {deliveryInfo.requiresPayment && (
            <div className="space-y-2">
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertTitle>Payment Required</AlertTitle>
                <AlertDescription>
                  This file requires a payment of ${deliveryInfo.paymentAmount.toFixed(2)}
                  {deliveryInfo.escrowEnabled && ' (held in escrow until released)'}
                </AlertDescription>
              </Alert>

              {deliveryInfo.status === 'escrowed' && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Escrow Active</AlertTitle>
                  <AlertDescription>
                    Payment is held in escrow. File will be available once seller releases the funds.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Password Verified Success */}
          {accessToken && deliveryInfo.requiresPassword && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Password Verified</AlertTitle>
              <AlertDescription>You can now download the file</AlertDescription>
            </Alert>
          )}

          {/* Error Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          {deliveryInfo.requiresPassword && !accessToken ? (
            <Button
              onClick={verifyPassword}
              disabled={
                verifying ||
                !deliveryInfo.canDownload ||
                !password.trim() ||
                remainingAttempts === 0
              }
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Verify Password
                </>
              )}
            </Button>
          ) : deliveryInfo.requiresPayment && deliveryInfo.status !== 'released' ? (
            <Button
              onClick={async () => {
                try {
                  // Create Stripe Checkout Session
                  const response = await fetch('/api/files/payment/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      deliveryId,
                      buyerEmail: '', // Will be collected by Stripe
                      buyerName: '',  // Will be collected by Stripe
                      successUrl: `${window.location.origin}/dashboard/client-zone/files?payment=success&deliveryId=${deliveryId}`,
                      cancelUrl: `${window.location.origin}/dashboard/client-zone/files?payment=cancelled`
                    })
                  })

                  const data = await response.json()

                  if (data.success && data.checkoutUrl) {
                    // Redirect to Stripe Checkout
                    window.location.href = data.checkoutUrl
                  } else {
                    setError(data.error || 'Failed to create payment session')
                  }
                } catch (error: any) {
                  setError(error.message)
                }
              }}
              disabled={!deliveryInfo.canDownload}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Pay ${deliveryInfo.paymentAmount.toFixed(2)}
            </Button>
          ) : (
            <Button
              onClick={initiateDownload}
              disabled={downloading || !deliveryInfo.canDownload}
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Link...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
