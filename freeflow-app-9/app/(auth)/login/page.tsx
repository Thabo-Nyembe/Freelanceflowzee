"use client"

import { useState, useTransition, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const supabase = createClient()
  
  const urlError = searchParams?.get('error')
  const urlMessage = searchParams?.get('message')
  const redirectTo = searchParams?.get('redirect') || '/dashboard'

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Clear any corrupted session data first
        try {
          await supabase.auth.signOut()
        } catch (signOutError) {
          console.log('Sign out attempt (clearing session):', signOutError)
        }

        const { data: { user }, error: getUserError } = await supabase.auth.getUser()
        
        if (getUserError) {
          console.log('Auth check error:', getUserError)
          setAuthError(`Authentication system error: ${getUserError.message}`)
          
          // If there's a session parsing error, clear everything
          if (getUserError.message.includes('Failed to parse') || 
              getUserError.message.includes('Invalid') ||
              getUserError.message.includes('JWT')) {
            console.log('Clearing corrupted session...')
            
            // Clear all possible storage locations
            try {
              localStorage.clear()
              sessionStorage.clear()
              
              // Clear all cookies starting with sb-
              document.cookie.split(";").forEach(cookie => {
                const [name] = cookie.split("=")
                if (name.trim().startsWith('sb-')) {
                  document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
                  document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${location.hostname};`
                }
              })
              
              console.log('✅ Corrupted session cleared')
              setAuthError('Session cleared due to corruption. Please try logging in again.')
            } catch (clearError) {
              console.error('Error clearing session:', clearError)
            }
          }
        } else if (user) {
          console.log('User authenticated, redirecting to:', redirectTo)
          router.push(redirectTo)
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthError(`Authentication check failed: ${error}`)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router, redirectTo, supabase.auth])

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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('Invalid login credentials')
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
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

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email:
              </label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                required 
                disabled={isPending}
                className="w-full"
                placeholder="Enter your email"
                autoComplete="email"
                data-testid="email-input"
                onChange={(e) => validateEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password:
              </label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                disabled={isPending}
                className="w-full"
                placeholder="Enter your password"
                autoComplete="current-password"
                data-testid="password-input"
                onChange={(e) => validatePassword(e.target.value)}
              />
            </div>
            <Button 
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              data-testid="submit-button"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <div className="text-sm">
              <Link 
                href="/forgot-password" 
                className="text-indigo-600 hover:text-indigo-500 hover:underline"
                data-testid="forgot-password-link"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="text-indigo-600 hover:text-indigo-500 hover:underline font-medium"
                data-testid="signup-link"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
} 