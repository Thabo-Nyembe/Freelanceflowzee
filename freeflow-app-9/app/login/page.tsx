"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogIn,
  Zap,
  Star,
  Users,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { GlowEffect } from '@/components/ui/glow-effect'
import { BorderTrail } from '@/components/ui/border-trail'
import { NumberFlow } from '@/components/ui/number-flow'
import { OAuthProviders } from '@/components/auth/OAuthProviders'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        throw error
      }

      // Success feedback
      toast.success('Login successful!')

      setTimeout(() => {
        toast.success('✨ Welcome Back to KAZI! Redirecting to dashboard...')
      }, 500)

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Invalid email or password')
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Enhanced Pattern Craft Background - Radial Gradient with Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding and Features */}
        <div className="hidden lg:block space-y-8">
          <div>
            <TextShimmer className="text-5xl font-bold mb-4" duration={2}>
              Welcome to KAZI
            </TextShimmer>
            <p className="text-xl text-gray-300 leading-relaxed">
              Your complete creative business platform with <NumberFlow value={25} /> integrated tools for freelancers and agencies.
            </p>
          </div>

          <div className="space-y-4">
            <LiquidGlassCard className="flex items-center gap-3 p-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI-Powered Tools</h3>
                <p className="text-gray-400 text-sm">Generate content, designs, and automate workflows</p>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="flex items-center gap-3 p-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Team Collaboration</h3>
                <p className="text-gray-400 text-sm">Real-time collaboration with clients and teams</p>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="flex items-center gap-3 p-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Star className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Premium Features</h3>
                <p className="text-gray-400 text-sm">Advanced analytics, project management, and more</p>
              </div>
            </LiquidGlassCard>
          </div>

          <div className="text-center text-gray-400">
            <p>Trusted by <NumberFlow value={2800} /> creative professionals worldwide</p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto relative">
          <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30" />
          <LiquidGlassCard className="relative">
            <BorderTrail
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              size={100}
              duration={8}
            />
            <CardHeader className="text-center pb-6">
              <TextShimmer className="text-2xl font-bold mb-2" duration={2}>
                Sign In to KAZI
              </TextShimmer>
              <p className="text-gray-400 mt-2">
                Access your creative workspace
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="thabo@kaleidocraft.co.za"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="password1234"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => handleInputChange('rememberMe', !!checked)}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-400">
                      Remember me
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </div>
                  )}
                </Button>
              </form>

              {/* OAuth Providers */}
              <div className="mt-6">
                <OAuthProviders />
              </div>

              {/* Demo Credentials */}
              {process.env.NODE_ENV === 'development' && (
                <LiquidGlassCard className="p-3 mt-4">
                  <p className="text-xs font-medium text-blue-400 mb-1">Test Account:</p>
                  <p className="text-xs text-gray-400">Email: test@kazi.dev</p>
                  <p className="text-xs text-gray-400">Password: Trapster103</p>
                </LiquidGlassCard>
              )}

              {/* Sign Up Link */}
              <div className="text-center pt-4 border-t border-slate-700">
                <p className="text-sm text-gray-400">
                  Don't have an account?{' '}
                  <Link href="/signup" className="font-medium text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
                    Sign up for free
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </p>
              </div>
            </CardContent>
          </LiquidGlassCard>

          {/* Additional Links */}
          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-300">Privacy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-gray-300">Terms</Link>
              <span>•</span>
              <Link href="/support" className="hover:text-gray-300">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}