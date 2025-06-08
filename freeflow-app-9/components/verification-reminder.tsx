"use client"

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Mail, X, CheckCircle } from 'lucide-react'
import { resendVerification } from '@/app/login/actions'

export function VerificationReminder() {
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(searchParams.get('verification_reminder') === 'true')
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle')

  if (!isVisible) return null

  const handleResendVerification = async () => {
    setIsResending(true)
    setResendStatus('idle')
    
    try {
      // Get user email from session or form
      const email = 'user@example.com' // This would come from the user session
      await resendVerification(email)
      setResendStatus('success')
    } catch (error) {
      setResendStatus('error')
    } finally {
      setIsResending(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // Remove the query parameter from URL
    const url = new URL(window.location.href)
    url.searchParams.delete('verification_reminder')
    window.history.replaceState({}, '', url.toString())
  }

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
      <Mail className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium">Email verification recommended</p>
          <p className="text-sm mt-1">
            For enhanced security, please verify your email address. You can continue using the platform without verification.
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {resendStatus === 'success' && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Sent!
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending || resendStatus === 'success'}
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
          >
            {isResending ? 'Sending...' : 'Resend Email'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-amber-700 hover:bg-amber-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
} 