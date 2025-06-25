'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserPlus, Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { createClient } from '@/lib/supabase/client'

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const redirectTo = searchParams?.get('redirect') || '/'

  // Handle hydration properly
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        
        if (!supabase) {
          console.error('Failed to initialize Supabase client')
          setError('Service temporarily unavailable')
          setIsCheckingAuth(false)
          return
        }

        // First try to get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          // Clear any corrupted session data
          await supabase.auth.signOut()
          localStorage.clear()
          sessionStorage.clear()
          
          // Clear auth cookies
          document.cookie.split(";").forEach(cookie => {
            const [name] = cookie.split("=")
            if (name.trim().startsWith('sb-')) {
              document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            }
          })
          
          setError('Session error. Please try signing up again.')
          setIsCheckingAuth(false)
          return
        }

        // Then get user data
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('User data error:', userError)
          setError('Failed to get user data. Please try signing up again.')
          setIsCheckingAuth(false)
          return
        }

        if (session && user) {
          // User is authenticated, redirect
          const destination = redirectTo === '/' ? '/dashboard' : redirectTo
          router.push(destination)
          return
        }

        setIsCheckingAuth(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setError('Authentication check failed. Please try again.')
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router, redirectTo])

  const handleSubmit = async (formData: FormData) => {
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const email = formData.get('email') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createClient()
      
      if (!supabase) {
        setError('Service temporarily unavailable. Please try again later.')
        setIsLoading(false)
        return
      }

      // First try to clear any existing session
      try {
        await supabase.auth.signOut()
      } catch (signOutError) {
        console.error('Error clearing existing session:', signOutError)
      }

      // Clear any existing cookies
      document.cookie.split(";").forEach(cookie => {
        const [name] = cookie.split("=")
        if (name.trim().startsWith('sb-')) {
          document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })

      // Attempt to sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.get('fullName'),
          }
        }
      })

      if (signUpError) {
        console.error('Sign up error:', signUpError)
        if (signUpError.message.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.')
        } else if (signUpError.message.includes('valid email')) {
          setError('Please enter a valid email address')
        } else {
          setError('Failed to create account. Please try again.')
        }
        setIsLoading(false)
        return
      }

      setSuccess('Account created successfully! Please check your email to confirm your account.')
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen">
        <SiteHeader variant="minimal" />
        <div className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
          <Card className="w-full max-w-md shadow-xl border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <div className="text-3xl font-bold text-indigo-600">FreeflowZee</div>
              <CardDescription className="text-gray-600">
                Checking authentication...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SiteHeader variant="minimal" />
      <div className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="inline-block mb-4">
            <div className="text-3xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer">
              FreeflowZee
            </div>
          </Link>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Join FreeflowZee
          </CardTitle>
          <CardDescription className="text-gray-600">
            Create your account to start managing your freelance business
          </CardDescription>
          {redirectTo !== '/' && (
            <p className="text-sm text-indigo-600">
              You'll be redirected to {redirectTo} after signup
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4" suppressHydrationWarning>
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  className="pl-10 bg-white/50 border-gray-200 focus:bg-white transition-colors"
                  suppressHydrationWarning
                />
              </div>
            </div>
            
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
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  required
                  className="pl-10 pr-10 bg-white/50 border-gray-200 focus:bg-white transition-colors"
                  suppressHydrationWarning
                />
                {isHydrated && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  required
                  className="pl-10 pr-10 bg-white/50 border-gray-200 focus:bg-white transition-colors"
                  suppressHydrationWarning
                />
                {isHydrated && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700 text-sm">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href={`/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                className="font-medium text-primary hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-gray-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-gray-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardContent>
        </Card>
      </div>
      <SiteFooter variant="minimal" />
    </div>
  )
}

export default function SignUp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  )
} 