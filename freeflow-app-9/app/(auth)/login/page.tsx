"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, Mail, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface LoginProps {}

export default function Login({}: LoginProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Get URL parameters
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const urlError = searchParams.get('error')
  const urlMessage = searchParams.get('message')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        
        if (!supabase) {
          setAuthError('Service temporarily unavailable.')
          setIsCheckingAuth(false)
          return
        }

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error: ', sessionError)
          
          // Clear potentially corrupted cookies
          document.cookie.split(";").forEach(cookie => {
            const [name] = cookie.split("=")
            if (name.trim().startsWith('sb-')) {
              document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            }
          })
          
          setAuthError('Session error. Please try logging in again.')
          setIsCheckingAuth(false)
          return
        }

        // Then get user data
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('User data error: ', userError)
          setAuthError('Failed to get user data. Please try logging in again.')
          setIsCheckingAuth(false)
          return
        }

        if (session && user) {
          // User is authenticated, redirect
          router.push(redirectTo)
          return
        }

        setIsCheckingAuth(false)
      } catch (error) {
        console.error('Auth check failed: ', error)
        setAuthError('Authentication check failed. Please try again.')
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router, redirectTo])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setError('Email is required')
      return false
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    setError(null)
    return true
  }

  const validatePassword = (password: string) => {
    if (!password) {
      setError('Password is required')
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    // Validate inputs
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    if (!isEmailValid || !isPasswordValid) {
      setIsPending(false)
      return
    }

    try {
      const supabase = createClient()
      
      if (!supabase) {
        setError('Service temporarily unavailable. Please try again later.')
        setIsPending(false)
        return
      }

      // First try to clear any existing session
      try {
        await supabase.auth.signOut()
      } catch (signOutError) {
        console.error('Error clearing existing session: ', signOutError)
      }

      // Clear any existing cookies
      document.cookie.split(";").forEach(cookie => {
        const [name] = cookie.split("=")
        if (name.trim().startsWith('sb-')) {
          document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })

      // Attempt to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('Sign in error: ', signInError)
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please verify your email address before logging in')
        } else {
          setError('Failed to sign in. Please try again.')
        }
        setIsPending(false)
        return
      }

      // Verify session after sign in
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('Session verification error: ', sessionError)
        setError('Failed to establish session. Please try again.')
        setIsPending(false)
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      console.error('Unexpected error: ', error)
      setError('An unexpected error occurred. Please try again.')
      setIsPending(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-lg">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-indigo-600">FreeflowZee</h1>
            <p className="text-muted-foreground">
              {authError ? authError : 'Checking authentication...'}
            </p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
          {authError && (
            <div className="text-center">
              <Button 
                onClick={() => {
                  setIsCheckingAuth(false)
                  setAuthError(null)
                }}
                variant="outline"
                className="mt-4"
              >
                Continue to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SiteHeader variant="minimal" />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-white/70 backdrop-blur-sm p-6 shadow-lg">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-indigo-600">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {(error || urlError || authError) && (
            <Alert variant="destructive" data-testid="error-message">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || urlError || authError}
              </AlertDescription>
            </Alert>
          )}

          {urlMessage && (
            <Alert variant="default" className="border-green-200 bg-green-50" data-testid="success-message">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {urlMessage}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="pl-10 bg-white/50 border-gray-200 focus:bg-white transition-colors"
                  suppressHydrationWarning
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="pl-10 bg-white/50 border-gray-200 focus:bg-white transition-colors"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isPending}
              data-testid="login-button"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="text-center">
              <Link 
                href="/signup" 
                className="text-sm text-indigo-600 hover:text-indigo-700 underline"
              >
                Don&apos;t have an account? Sign up
              </Link>
            </div>
            
            {redirectTo !== '/dashboard' && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  You&apos;ll be redirected to {redirectTo} after login
                </p>
                <Link href="/" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700">
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Back to home
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
