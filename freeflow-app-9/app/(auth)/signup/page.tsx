'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation
import { createClient } from '@/lib/supabase/client
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, UserPlus, User, Mail, Lock, ArrowLeft } from 'lucide-react
import Link from 'next/link

interface SignUpProps {}

export default function SignUp({}: SignUpProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Get URL parameters
  const redirectTo = searchParams?.get('redirect') || '/dashboard

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        
        if (!supabase) {
          setError('Service temporarily unavailable.')
          setIsCheckingAuth(false)
          return
        }

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          
          // Clear potentially corrupted cookies
          document.cookie.split(";").forEach(cookie => {
            const [name] = cookie.split("=")
            if (name.trim().startsWith('sb-')) {
              document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;
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
          document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;
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
        <SiteHeader />
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
      <SiteHeader />
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
                  id="fullName
                  name="fullName
                  type="text
                  placeholder="Enter your full name
                  required
                  className="pl-10 bg-white/50 border-gray-200 focus:bg-white transition-colors
                  suppressHydrationWarning
                />
              </div>
            </div>
            "
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email
                  name="email
                  type="email
                  placeholder="Enter your email
                  required
                  className="pl-10 bg-white/50 border-gray-200 focus:bg-white transition-colors
                  suppressHydrationWarning
                />
              </div>
            </div>
            "
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password
                  name="password
                  type="password
                  placeholder="Enter your password
                  required
                  className="pl-10 bg-white/50 border-gray-200 focus:bg-white transition-colors
                  suppressHydrationWarning
                />
              </div>
            </div>
            "
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword
                  name="confirmPassword
                  type="password
                  placeholder="Confirm your password
                  required
                  className="pl-10 bg-white/50 border-gray-200 focus:bg-white transition-colors
                  suppressHydrationWarning
                />
              </div>
            </div>

            {error && (
              <Alert>"
                <AlertDescription className="text-red-600 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription className="text-green-600 text-sm">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white
              disabled={isLoading}
            >
              {isLoading ? (
                <>"
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Sign in
              </Link>
            </p>
            
            {redirectTo !== '/dashboard' && (
              <div className="mt-4">
                <Link href="/" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700">
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Back to home
                </Link>
              </div>
            )}
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
} 