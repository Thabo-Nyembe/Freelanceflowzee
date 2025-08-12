"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

export default function LoginPage() {
  const router = useRouter()
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

    // Simulate login delay
    setTimeout(() => {
      if (formData.email.includes('@') && formData.password.length > 0) {
        // Store auth state
        localStorage.setItem('kazi-auth', 'true')
        localStorage.setItem('kazi-user', JSON.stringify({ 
          email: formData.email, 
          name: 'Professional User' 
        }))
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        alert('Please enter valid credentials')
        setIsLoading(false)
      }
    }, 1000)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding and Features */}
        <div className="hidden lg:block space-y-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
              Welcome to KAZI
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Your complete creative business platform with 25+ integrated tools for freelancers and agencies.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI-Powered Tools</h3>
                <p className="text-gray-600 text-sm">Generate content, designs, and automate workflows</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Team Collaboration</h3>
                <p className="text-gray-600 text-sm">Real-time collaboration with clients and teams</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Premium Features</h3>
                <p className="text-gray-600 text-sm">Advanced analytics, project management, and more</p>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-500">
            <p>Trusted by 2,800+ creative professionals worldwide</p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Sign In to KAZI
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Access your creative workspace
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="thabo@kaleidocraft.co.za"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="password1234"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5"
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

                {/* Demo Credentials */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-medium text-blue-800 mb-1">Demo Credentials:</p>
                  <p className="text-xs text-blue-600">Email: thabo@kaleidocraft.co.za</p>
                  <p className="text-xs text-blue-600">Password: password1234</p>
                </div>

                {/* Sign Up Link */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                      Sign up for free
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Links */}
          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-gray-700">Terms</Link>
              <span>•</span>
              <Link href="/support" className="hover:text-gray-700">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}