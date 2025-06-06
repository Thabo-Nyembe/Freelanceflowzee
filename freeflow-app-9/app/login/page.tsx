"use client"

import { useState, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { login } from './actions'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  // Get error from URL params (from server action redirects)
  const urlError = searchParams.get('error')
  const urlMessage = searchParams.get('message')

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    
    // Basic validation
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    if (!email || !password) {
      setError('Email and password are required')
      return
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    
    startTransition(async () => {
      try {
        await login(formData)
        // If we reach here, there was no redirect (which means success)
        router.push('/')
      } catch (err) {
        setError('Login failed. Please try again.')
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-lg">
        <div className="space-y-2 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer">FreeflowZee</h1>
          </Link>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {/* Display URL-based error/message */}
        {urlError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{decodeURIComponent(urlError)}</AlertDescription>
          </Alert>
        )}

        {urlMessage && (
          <Alert>
            <AlertDescription>{decodeURIComponent(urlMessage)}</AlertDescription>
          </Alert>
        )}

        {/* Display form validation error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form action={handleSubmit} className="space-y-4" suppressHydrationWarning>
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
              suppressHydrationWarning
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
              suppressHydrationWarning
            />
          </div>
          <div className="space-y-2">
            <Button 
              type="submit"
              disabled={isPending}
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Log in'
              )}
            </Button>
          </div>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="font-medium text-primary hover:underline"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Fallback component for Suspense boundary
function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome to FreeflowZee</h1>
          <p className="text-muted-foreground">
            Loading login form...
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-10 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-10 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="h-10 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader variant="minimal" />
      <div className="pt-16">
        <Suspense fallback={<LoginFallback />}>
          <LoginForm />
        </Suspense>
      </div>
      <SiteFooter variant="minimal" />
    </div>
  )
} 