'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.includes('@')) {
      alert('❌ Please enter a valid email address')
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log('📧 Password reset email sent to:', email)
      setIsSubmitted(true)
      setIsLoading(false)

      alert(`✅ Password Reset Email Sent!\n\nWe've sent a password reset link to ${email}.\n\nPlease check your inbox and follow the instructions to reset your password.\n\nIf you don't see the email, check your spam folder.`)
    }, 1500)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen relative bg-slate-950 flex items-center justify-center p-4">
        {/* Pattern Craft Background */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-slate-900 to-slate-950 -z-10" />
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

        <div className="relative w-full max-w-md">
          <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl blur opacity-60" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" size={80} duration={8} />
            <CardContent className="p-8 text-center">
              <div className="relative mx-auto mb-4 w-16 h-16">
                <GlowEffect className="absolute -inset-2 bg-gradient-to-r from-green-500/50 to-emerald-500/50 rounded-full blur opacity-75" />
                <div className="relative w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <TextShimmer className="text-2xl font-bold mb-2 text-white" duration={2}>
                Check Your Email
              </TextShimmer>
              <p className="text-gray-300 mb-6">
                We've sent password reset instructions to <strong className="text-white">{email}</strong>
              </p>
              <div className="space-y-3">
                <Link href="/login">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Return to Login
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-800"
                  onClick={() => setIsSubmitted(false)}
                >
                  Send Again
                </Button>
              </div>
            </CardContent>
          </LiquidGlassCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-slate-950 flex items-center justify-center p-4">
      {/* Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="w-full max-w-md relative">
        <div className="mb-6">
          <Link href="/login">
            <Button variant="outline" className="gap-2 border-slate-700 text-white hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </div>

        <div className="relative">
          <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-2xl blur opacity-60" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" size={80} duration={8} />
            <CardHeader className="text-center">
              <TextShimmer className="text-2xl font-bold text-white" duration={2}>
                Reset Your Password
              </TextShimmer>
              <p className="text-gray-300 mt-2">
                Enter your email address and we'll send you instructions to reset your password
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="thabo@kaleidocraft.co.za"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-400">
                <p>
                  Remember your password?{' '}
                  <Link href="/login" className="text-blue-400 hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </LiquidGlassCard>
        </div>
      </div>
    </div>
  )
}
