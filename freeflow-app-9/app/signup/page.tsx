"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowRight, Check, Mail, User, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { GlowEffect } from '@/components/ui/glow-effect'
import { BorderTrail } from '@/components/ui/border-trail'
import { NumberFlow } from '@/components/ui/number-flow'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreedToTerms: false,
    subscribeToNewsletter: true
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreedToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)

    try {
      // Call the signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
          role: 'user',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      // Success feedback
      toast.success('Account created successfully!')
      toast.success(`🎉 Welcome to KAZI, ${formData.firstName}!`)

      // Show next steps
      setTimeout(() => {
        toast.success('Please check your email to verify your account')
      }, 1000)

      // Redirect to login after 2.5 seconds
      setTimeout(() => {
        router.push('/login?message=Account created! Please log in.')
      }, 2500)
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(error.message || 'Failed to create account')
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Benefits */}
            <div className="space-y-8">
              <div>
                <TextShimmer className="text-4xl md:text-5xl font-bold mb-6" duration={2}>
                  Start Your Freelance Success Story
                </TextShimmer>
                <p className="text-lg text-gray-300 mb-6">
                  Join thousands of freelancers who've transformed their business with KAZI's
                  AI-powered platform featuring multi-model studio, universal feedback,
                  real-time collaboration, and secure payment protection.
                </p>
              </div>

              <div className="space-y-4">
                <LiquidGlassCard className="flex items-start gap-4 p-4">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-white">AI-Powered Project Management</h3>
                    <p className="text-gray-400">Automate project workflows, generate content, and streamline client communication with intelligent AI assistance.</p>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard className="flex items-start gap-4 p-4">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-white">Secure Payment Processing</h3>
                    <p className="text-gray-400">Built-in escrow system, milestone payments, and automated invoicing to ensure you get paid on time.</p>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard className="flex items-start gap-4 p-4">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-white">Advanced Video Studio</h3>
                    <p className="text-gray-400">Create professional presentations, record client reviews, and collaborate with AI-enhanced video tools.</p>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard className="flex items-start gap-4 p-4">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-white">Community & Networking</h3>
                    <p className="text-gray-400">Connect with other freelancers, share resources, and grow your professional network.</p>
                  </div>
                </LiquidGlassCard>
              </div>

              <LiquidGlassCard className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <p className="text-sm text-blue-400 mb-2">🎉 <strong>Limited Time Offer</strong></p>
                <p className="text-lg font-semibold mb-1 text-white">Get <NumberFlow value={30} /> days free when you sign up today!</p>
                <p className="text-sm text-gray-400">No credit card required. Cancel anytime.</p>
              </LiquidGlassCard>
            </div>

            {/* Right side - Sign up form */}
            <div className="relative">
              <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30" />
              <LiquidGlassCard className="relative p-8">
                <BorderTrail
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                  size={100}
                  duration={8}
                />
              <CardHeader className="text-center">
                <TextShimmer className="text-2xl mb-2" duration={2}>
                  Create Your Account
                </TextShimmer>
                <CardDescription className="text-gray-400">
                  Start your free trial and transform your freelance business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="firstName"
                          placeholder="John"
                          className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">At least 8 characters with numbers and symbols</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreedToTerms}
                      onCheckedChange={(checked) => handleInputChange('agreedToTerms', !!checked)}
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-400">
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.subscribeToNewsletter}
                      onCheckedChange={(checked) => handleInputChange('subscribeToNewsletter', !!checked)}
                    />
                    <Label htmlFor="newsletter" className="text-sm text-gray-400">
                      Send me tips, updates, and special offers
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account...
                      </div>
                    ) : (
                      <>
                        Start Free Trial
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                      Sign in here
                    </Link>
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700 text-center">
                  <p className="text-xs text-gray-500">
                    🔒 Your data is protected with enterprise-grade security
                  </p>
                </div>
              </CardContent>
            </LiquidGlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}