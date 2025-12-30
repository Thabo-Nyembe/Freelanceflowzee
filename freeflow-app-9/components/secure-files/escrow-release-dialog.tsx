'use client'

/**
 * Escrow Release Dialog Component
 *
 * Features:
 * - Escrow status display
 * - Release confirmation
 * - Buyer information
 * - Amount display
 * - Release button
 * - Success/error handling
 */

import { useState, useEffect } from 'react'
import {
  Shield,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'

export interface EscrowReleaseDialogProps {
  deliveryId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onReleased?: () => void
}

interface EscrowInfo {
  escrowEnabled: boolean
  escrowStatus?: string
  escrowAmount?: number
  canRelease: boolean
  deliveryStatus: string
}

export function EscrowReleaseDialog({
  deliveryId,
  open,
  onOpenChange,
  onReleased
}: EscrowReleaseDialogProps) {
  const [escrowInfo, setEscrowInfo] = useState<EscrowInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [releasing, setReleasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      fetchEscrowInfo()
    }
  }, [open, deliveryId])

  const fetchEscrowInfo = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/files/escrow/release?deliveryId=${deliveryId}`)
      const data = await response.json()

      if (data.success) {
        setEscrowInfo(data)
      } else {
        setError(data.error || 'Failed to fetch escrow information')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRelease = async () => {
    setReleasing(true)
    setError(null)

    try {
      const response = await fetch('/api/files/escrow/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        onReleased?.()

        // Refresh escrow info
        setTimeout(() => {
          fetchEscrowInfo()
        }, 1000)
      } else {
        setError(data.error || 'Failed to release escrow')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setReleasing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deposited':
      case 'escrowed':
        return 'bg-yellow-500'
      case 'released':
        return 'bg-green-500'
      case 'disputed':
        return 'bg-red-500'
      case 'refunded':
        return 'bg-gray-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'deposited':
      case 'escrowed':
        return 'Funds Held in Escrow'
      case 'released':
        return 'Funds Released'
      case 'disputed':
        return 'Under Dispute'
      case 'refunded':
        return 'Refunded'
      default:
        return 'Pending'
    }
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

  if (!escrowInfo || !escrowInfo.escrowEnabled) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Escrow Not Enabled</AlertTitle>
            <AlertDescription>
              This delivery does not use escrow protection.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Escrow Management
          </DialogTitle>
          <DialogDescription>
            Manage escrowed payment for this file delivery
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Escrow Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(escrowInfo.escrowStatus || '')}`} />
              <div>
                <p className="font-medium">{getStatusText(escrowInfo.escrowStatus || '')}</p>
                <p className="text-sm text-muted-foreground">Delivery Status: {escrowInfo.deliveryStatus}</p>
              </div>
            </div>
            <Badge variant={escrowInfo.escrowStatus === 'released' ? 'default' : 'secondary'}>
              {escrowInfo.escrowStatus}
            </Badge>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Escrow Amount</span>
            </div>
            <span className="text-2xl font-bold">
              ${escrowInfo.escrowAmount?.toFixed(2)}
            </span>
          </div>

          {/* Information */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>About Escrow Release</AlertTitle>
            <AlertDescription>
              {escrowInfo.canRelease ? (
                <>
                  By releasing the escrow, you confirm that the buyer can access the file.
                  The payment will be processed and the buyer will receive immediate access.
                </>
              ) : (
                <>
                  Escrow has already been {escrowInfo.escrowStatus}.
                  {escrowInfo.escrowStatus === 'released' && ' The buyer now has access to the file.'}
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Success Message */}
          {success && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Escrow Released!</AlertTitle>
              <AlertDescription className="text-green-600">
                The payment has been released successfully. The buyer can now access the file.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Release Instructions */}
          {escrowInfo.canRelease && !success && (
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
              <h4 className="font-medium mb-2">Before You Release:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Ensure you've received confirmation from the buyer</li>
                <li>• Verify the file has been delivered successfully</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>

          {escrowInfo.canRelease && !success && (
            <Button
              onClick={handleRelease}
              disabled={releasing}
              className="bg-green-600 hover:bg-green-700"
            >
              {releasing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Releasing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Release Escrow
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
