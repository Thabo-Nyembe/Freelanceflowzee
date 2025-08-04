'use client'

import { useState } from 'react'
import { AlertCircle, X, Mail, UserCheck } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface VerificationReminderProps {
  type?: 'email' | 'profile'
  userEmail?: string
  profileCompletion?: number
  onDismiss?: () => void
  onVerify?: () => void
  onCompleteProfile?: () => void
}

export default function VerificationReminder({
  type = 'email', userEmail, profileCompletion = 0, onDismiss, onVerify, onCompleteProfile, }: VerificationReminderProps) {
  const [isVisible, setIsVisible] = useState<any>(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <Alert className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>

      {type === 'email' ? (
        <>
          <Mail className="h-5 w-5" />
          <AlertTitle>Verify your email</AlertTitle>
          <AlertDescription>
            <div className="mt-2 text-sm">
              Please verify your email address ({userEmail}) to access all features.
            </div>
            <div className="mt-4 flex space-x-4">
              <Button onClick={onVerify} size="sm">
                Resend verification email
              </Button>
            </div>
          </AlertDescription>
        </>
      ) : (
        <>
          <UserCheck className="h-5 w-5" />
          <AlertTitle>Complete your profile</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <div className="text-sm">
                Your profile is {profileCompletion}% complete. Complete your profile to
                unlock all features.
              </div>
              <div className="mt-2">
                <Progress value={profileCompletion} className="h-2" />
              </div>
            </div>
            <div className="mt-4 flex space-x-4">
              <Button onClick={onCompleteProfile} size="sm">
                Complete profile
              </Button>
            </div>
          </AlertDescription>
        </>
      )}
    </Alert>
  )
} 