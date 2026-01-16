'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Lock,
  CheckCircle,
  DollarSign,
  ArrowLeft,
  Download,
  Flag,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { formatCurrency, getStatusColor } from '@/lib/client-zone-utils'

const logger = createFeatureLogger('ClientZonePayments')

// Type Definitions
interface Milestone {
  id: number
  name: string
  description: string
  project: string
  amount: number
  releaseCondition: string
  status: 'completed' | 'in-escrow' | 'released' | 'disputed'
  completionDate?: string
  releaseDate?: string
  dueDate: string
  approvalNotes?: string
}

interface PaymentHistory {
  id: number
  date: string
  milestone: string
  amount: number
  type: 'release' | 'hold' | 'return'
  status: 'completed' | 'pending'
  transactionId: string
}

// MIGRATED: Batch #10 - Removed mock data, using database hooks

export default function PaymentsPage() {
  const router = useRouter()

  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null)

  // Release payment dialog state
  const [showReleaseDialog, setShowReleaseDialog] = useState(false)
  const [releaseMilestone, setReleaseMilestone] = useState<Milestone | null>(null)
  const [releaseConfirmation, setReleaseConfirmation] = useState('')

  // Dispute payment dialog state
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const [disputeMilestone, setDisputeMilestone] = useState<Milestone | null>(null)
  const [disputeReason, setDisputeReason] = useState('')

  // MIGRATED: Batch #10 - Removed mock data, using database hooks
  useEffect(() => {
    const loadPaymentsData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        try {
          // Fetch from database
          const response = await fetch('/api/payments')

          if (response.ok) {
            const data = await response.json()

            // Use database data with safe array handling
            setMilestones(data.milestones || [])
            setPaymentHistory(data.history || [])

            logger.info('Payments data loaded from database', {
              milestoneCount: data.milestones?.length || 0,
              historyCount: data.history?.length || 0
            })
          } else {
            throw new Error('API response not OK')
          }
        } catch (apiError) {
          // No fallback - use empty arrays
          logger.warn('Could not fetch from API, using empty arrays', { error: apiError })
          setMilestones([])
          setPaymentHistory([])
        }

        setIsLoading(false)
        toast.success('Payments loaded')
        announce('Payments loaded successfully', 'polite')
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load payments'
        setError(errorMsg)
        setIsLoading(false)
        announce('Error loading payments', 'assertive')
        logger.error('Failed to load payments', { error: err })
        toast.error('Failed to load payments', {
          description: errorMsg
        })
      }
    }

    loadPaymentsData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate totals
  const totals = {
    inEscrow: milestones
      .filter((m) => m.status === 'in-escrow')
      .reduce((sum, m) => sum + m.amount, 0),
    released: milestones
      .filter((m) => m.status === 'released')
      .reduce((sum, m) => sum + m.amount, 0),
    total: milestones.reduce((sum, m) => sum + m.amount, 0)
  }

  // Handle Release Payment
  const handleReleasePayment = (milestone: Milestone) => {
    setReleaseMilestone(milestone)
    setReleaseConfirmation('')
    setShowReleaseDialog(true)
  }

  // Confirm Release Payment
  const confirmReleasePayment = async () => {
    if (!releaseMilestone) return

    if (releaseConfirmation !== 'CONFIRM') {
      toast.error('Please type CONFIRM to proceed')
      return
    }

    try {
      const response = await fetch('/api/payments/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: releaseMilestone.id,
          milestoneName: releaseMilestone.name,
          amount: releaseMilestone.amount,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to release payment')
      }

      const data = await response.json()

      setMilestones(
        milestones.map((m) =>
          m.id === releaseMilestone.id
            ? {
              ...m,
              status: 'released',
              releaseDate: new Date().toISOString().split('T')[0]
            }
            : m
        )
      )

      toast.success('Payment released')
      announce('Payment released successfully', 'polite')
      setShowReleaseDialog(false)
      setReleaseMilestone(null)
      setReleaseConfirmation('')
    } catch (error: any) {
      logger.error('Failed to release payment', { error })
      toast.error('Failed to release payment', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Handle Dispute Payment
  const handleDisputePayment = (milestone: Milestone) => {
    setDisputeMilestone(milestone)
    setDisputeReason('')
    setShowDisputeDialog(true)
  }

  // Confirm Dispute Payment
  const confirmDisputePayment = async () => {
    if (!disputeMilestone) return

    if (!disputeReason.trim()) {
      toast.error('Please provide a reason for the dispute')
      return
    }

    try {
      const response = await fetch('/api/payments/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: disputeMilestone.id,
          milestoneName: disputeMilestone.name,
          amount: disputeMilestone.amount,
          reason: disputeReason.trim(),
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit dispute')
      }

      setMilestones(
        milestones.map((m) =>
          m.id === disputeMilestone.id ? { ...m, status: 'disputed' } : m
        )
      )

      toast.success('Dispute submitted', {
        description: 'Our mediation team will review and contact you within 24 hours'
      })
      announce('Dispute submitted successfully', 'polite')
      setShowDisputeDialog(false)
      setDisputeMilestone(null)
      setDisputeReason('')
    } catch (error: any) {
      logger.error('Failed to submit dispute', { error })
      toast.error('Failed to submit dispute', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Handle Download Receipt
  const handleDownloadReceipt = async (payment: PaymentHistory) => {
    try {
      const response = await fetch(`/api/payments/${payment.id}/receipt`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Failed to generate receipt')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Receipt-${payment.transactionId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Receipt downloaded')
    } catch (error: any) {
      logger.error('Failed to download receipt', { error })
      toast.error('Failed to download receipt', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={5} />
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Secure Payments & Escrow</h1>
              <p className="text-gray-600 mt-1">
                Manage milestone payments and track release security
              </p>
            </div>
          </div>
        </motion.div>

        {/* Payment Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">Total Escrow</p>
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {formatCurrency(totals.inEscrow)}
              </p>
              <p className="text-xs text-gray-600">
                {milestones.filter((m) => m.status === 'in-escrow').length} milestone(s)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">Released</p>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(totals.released)}
              </p>
              <p className="text-xs text-gray-600">
                {milestones.filter((m) => m.status === 'released').length} milestone(s)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {formatCurrency(totals.total)}
              </p>
              <p className="text-xs text-gray-600">
                {milestones.length} milestone(s)
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Shield className="h-6 w-6" />
                Escrow Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">100% Money-Back Guarantee</p>
                    <p className="text-sm text-gray-600">
                      If you're not satisfied, get your money back
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Milestone-Based Releases</p>
                    <p className="text-sm text-gray-600">
                      Payments released only when you approve
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Dispute Resolution</p>
                    <p className="text-sm text-gray-600">
                      Expert mediation if disagreements arise
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Milestone Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            Milestone Payments
          </h2>

          {milestones.length === 0 ? (
            <NoDataEmptyState
              title="No milestones found"
              description="Milestone payments will appear here as your projects progress."
            />
          ) : (
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 4 }}
                >
                  <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() =>
                        setExpandedMilestone(
                          expandedMilestone === milestone.id ? null : milestone.id
                        )
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {milestone.name}
                            </h3>
                            <Badge className={getStatusColor(milestone.status)}>
                              {milestone.status.replace(/-/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">
                            {milestone.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 text-xs">Project</p>
                              <p className="font-medium">{milestone.project}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 text-xs">Amount</p>
                              <p className="font-bold text-lg text-blue-600">
                                {formatCurrency(milestone.amount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 text-xs">Due Date</p>
                              <p className="font-medium">
                                {new Date(milestone.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0"
                        >
                          {expandedMilestone === milestone.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </Button>
                      </div>

                      {/* Expanded Content */}
                      {expandedMilestone === milestone.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 pt-6 border-t space-y-4"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">
                              Release Condition
                            </p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                              {milestone.releaseCondition}
                            </p>
                          </div>

                          {milestone.approvalNotes && (
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2">
                                Approval Notes
                              </p>
                              <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                                {milestone.approvalNotes}
                              </p>
                            </div>
                          )}

                          {milestone.completionDate && (
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">
                                Completed
                              </p>
                              <p className="text-sm text-gray-700">
                                {new Date(milestone.completionDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2 pt-4">
                            {milestone.status === 'in-escrow' && (
                              <>
                                <Button
                                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2"
                                  onClick={() => handleReleasePayment(milestone)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Approve & Release
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handleDisputePayment(milestone)}
                                  className="gap-2 text-red-600 hover:text-red-700"
                                >
                                  <Flag className="h-4 w-4" />
                                  Dispute
                                </Button>
                              </>
                            )}
                            {milestone.status === 'completed' && (
                              <Button
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2"
                                onClick={() => handleReleasePayment(milestone)}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Release Payment
                              </Button>
                            )}
                            {milestone.status === 'released' && (
                              <Button
                                variant="outline"
                                disabled
                                className="w-full"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Payment Released
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>

          {paymentHistory.length === 0 ? (
            <NoDataEmptyState
              title="No payment history"
              description="Payment transactions will appear here."
            />
          ) : (
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-slate-800">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Milestone
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {payment.milestone}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Badge
                              variant="outline"
                              className={
                                payment.type === 'release'
                                  ? 'bg-green-50 text-green-800 border-green-200'
                                  : payment.type === 'hold'
                                    ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                                    : 'bg-red-50 text-red-800 border-red-200'
                              }
                            >
                              {payment.type.charAt(0).toUpperCase() +
                                payment.type.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-600">
                            {payment.transactionId}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Badge
                              className={
                                payment.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {payment.status.charAt(0).toUpperCase() +
                                payment.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadReceipt(payment)}
                              className="gap-1"
                            >
                              <Download className="h-4 w-4" />
                              Receipt
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Release Payment Dialog */}
        <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Release Payment
              </DialogTitle>
              <DialogDescription>
                {releaseMilestone && (
                  <>Release {formatCurrency(releaseMilestone.amount)} for "{releaseMilestone.name}"</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <strong>Warning:</strong> This action cannot be undone. Once released, the payment will be transferred to the freelancer immediately.
              </div>
              <div className="space-y-2">
                <Label htmlFor="releaseConfirmation">Type CONFIRM to proceed</Label>
                <Input
                  id="releaseConfirmation"
                  value={releaseConfirmation}
                  onChange={(e) => setReleaseConfirmation(e.target.value.toUpperCase())}
                  placeholder="Type CONFIRM"
                  className="font-mono"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowReleaseDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmReleasePayment}
                disabled={releaseConfirmation !== 'CONFIRM'}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Release Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dispute Payment Dialog */}
        <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-500" />
                Dispute Payment
              </DialogTitle>
              <DialogDescription>
                {disputeMilestone && (
                  <>Dispute payment for "{disputeMilestone.name}" ({formatCurrency(disputeMilestone.amount)})</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="disputeReason">Reason for Dispute</Label>
                <Textarea
                  id="disputeReason"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Please explain why the deliverables do not meet requirements..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmDisputePayment}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Submit Dispute
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
