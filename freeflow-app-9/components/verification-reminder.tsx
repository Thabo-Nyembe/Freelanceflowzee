"use client"

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Mail, X, CheckCircle } from 'lucide-react'
import { resendVerification } from '@/app/(auth)/login/actions'

export function VerificationReminder() {
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(searchParams?.get('verification_reminder') === 'true')
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle')

  if (!isVisible) return null

  const handleResendVerification = async () => {
    setIsResending(true)
    setResendStatus('idle')
    
    try {
      // Get user email from URL params or localStorage
      const userEmail = searchParams?.get('email') || localStorage.getItem('userEmail')
      if (!userEmail) {
        setResendStatus('error')
        return
      }
      
      await resendVerification(userEmail)
      setResendStatus('success')
    } catch (error) {
      setResendStatus('error')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-blue-200 bg-blue-50">
        <Mail className="h-4 w-4 text-blue-600" />
        <AlertDescription className="pr-8">
          <div className="space-y-2">
            <p className="text-sm text-blue-800">
              <strong>Email verification recommended</strong>
            </p>
            <p className="text-xs text-blue-700">
              Verify your email for enhanced security and to receive important updates.
            </p>
            {resendStatus === 'success' && (
              <p className="text-xs text-green-700 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Verification email sent!
              </p>
            )}
            {resendStatus === 'error' && (
              <p className="text-xs text-red-700">
                Failed to send verification email. Please try again.
              </p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleResendVerification}
                disabled={isResending}
                className="text-xs h-7"
              >
                {isResending ? 'Sending...' : 'Send verification email'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
                className="text-xs h-7"
              >
                Later
              </Button>
            </div>
          </div>
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </Alert>
    </div>
  )
} 