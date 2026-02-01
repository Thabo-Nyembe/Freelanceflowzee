'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type VerificationStatus = 'verifying' | 'success' | 'error' | 'waiting'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<VerificationStatus>('waiting')
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      const type = searchParams.get('type')
      const tokenHash = searchParams.get('token_hash')

      // If no verification params, show waiting state
      if (!token && !tokenHash && type !== 'signup' && type !== 'email_change') {
        setStatus('waiting')
        return
      }

      setStatus('verifying')

      try {
        const supabase = createClient()

        // Handle email verification callback
        if (tokenHash && type) {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type
          })

          if (verifyError) {
            throw verifyError
          }

          if (data.user?.email) {
            setEmail(data.user.email)
          }
          setStatus('success')

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        } else {
          // No valid token, show waiting state
          setStatus('waiting')
        }
      } catch (err: unknown) {
        console.error('Email verification error:', err)
        setError(err.message || 'Failed to verify email')
        setStatus('error')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <div className="relative mx-auto mb-4 w-16 h-16">
              <div className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            </div>
            <TextShimmer className="text-2xl font-bold mb-2 text-white" duration={2}>
              Verifying Your Email
            </TextShimmer>
            <p className="text-gray-300 mb-6">
              Please wait while we verify your email address...
            </p>
          </>
        )

      case 'success':
        return (
          <>
            <div className="relative mx-auto mb-4 w-16 h-16">
              <GlowEffect className="absolute -inset-2 bg-gradient-to-r from-green-500/50 to-emerald-500/50 rounded-full blur opacity-75" />
              <div className="relative w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <TextShimmer className="text-2xl font-bold mb-2 text-white" duration={2}>
              Email Verified!
            </TextShimmer>
            <p className="text-gray-300 mb-6">
              {email ? (
                <>Your email <strong className="text-white">{email}</strong> has been verified.</>
              ) : (
                'Your email has been verified successfully.'
              )}
              <br />
              <span className="text-sm text-gray-400">Redirecting to dashboard...</span>
            </p>
            <Link href="/dashboard">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Go to Dashboard
              </Button>
            </Link>
          </>
        )

      case 'error':
        return (
          <>
            <div className="relative mx-auto mb-4 w-16 h-16">
              <GlowEffect className="absolute -inset-2 bg-gradient-to-r from-red-500/50 to-rose-500/50 rounded-full blur opacity-75" />
              <div className="relative w-16 h-16 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <TextShimmer className="text-2xl font-bold mb-2 text-white" duration={2}>
              Verification Failed
            </TextShimmer>
            <p className="text-gray-300 mb-4">
              {error || 'We could not verify your email. The link may have expired.'}
            </p>
            <div className="space-y-3">
              <Link href="/signup">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Try Again
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-800">
                  Back to Login
                </Button>
              </Link>
            </div>
          </>
        )

      case 'waiting':
      default:
        return (
          <>
            <div className="relative mx-auto mb-4 w-16 h-16">
              <GlowEffect className="absolute -inset-2 bg-gradient-to-r from-blue-500/50 to-indigo-500/50 rounded-full blur opacity-75" />
              <div className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <TextShimmer className="text-2xl font-bold mb-2 text-white" duration={2}>
              Check Your Email
            </TextShimmer>
            <p className="text-gray-300 mb-6">
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Didn't receive the email? Check your spam folder or try signing up again.
              </p>
              <div className="flex gap-3">
                <Link href="/signup" className="flex-1">
                  <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-800">
                    Sign Up Again
                  </Button>
                </Link>
                <Link href="/login" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )
    }
  }

  const getBackgroundColors = () => {
    switch (status) {
      case 'success':
        return {
          gradient: 'from-green-900/20 via-slate-900 to-slate-950',
          orb1: 'from-green-500/20 to-emerald-500/20',
          orb2: 'from-emerald-500/20 to-teal-500/20',
          border: 'from-green-500 via-emerald-500 to-teal-500',
          glow: 'from-green-500/30 to-emerald-500/30'
        }
      case 'error':
        return {
          gradient: 'from-red-900/20 via-slate-900 to-slate-950',
          orb1: 'from-red-500/20 to-rose-500/20',
          orb2: 'from-rose-500/20 to-pink-500/20',
          border: 'from-red-500 via-rose-500 to-pink-500',
          glow: 'from-red-500/30 to-rose-500/30'
        }
      default:
        return {
          gradient: 'from-blue-900/20 via-slate-900 to-slate-950',
          orb1: 'from-blue-500/20 to-indigo-500/20',
          orb2: 'from-indigo-500/20 to-purple-500/20',
          border: 'from-blue-500 via-indigo-500 to-purple-500',
          glow: 'from-blue-500/30 to-indigo-500/30'
        }
    }
  }

  const colors = getBackgroundColors()

  return (
    <>
      {/* Pattern Craft Background */}
      <div className={`fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${colors.gradient} -z-10`} />
      <div className={`absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r ${colors.orb1} rounded-full mix-blend-multiply filter blur-3xl animate-pulse`}></div>
      <div className={`absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r ${colors.orb2} rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000`}></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="relative w-full max-w-md">
        <GlowEffect className={`absolute -inset-1 bg-gradient-to-r ${colors.glow} rounded-2xl blur opacity-60`} />
        <LiquidGlassCard className="relative">
          <BorderTrail className={`bg-gradient-to-r ${colors.border}`} size={80} duration={8} />
          <CardContent className="p-8 text-center">
            {renderContent()}
          </CardContent>
        </LiquidGlassCard>
      </div>
    </>
  )
}

function LoadingFallback() {
  return (
    <>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="relative w-full max-w-md">
        <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-2xl blur opacity-60" />
        <LiquidGlassCard className="relative">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Loading...</p>
          </CardContent>
        </LiquidGlassCard>
      </div>
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen relative bg-slate-950 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
