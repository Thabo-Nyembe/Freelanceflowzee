import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Mail, User, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export const metadata: Metadata = {
  title: 'Sign Up | FreeFlow - Start Your Freelance Journey',
  description: 'Join FreeFlow today and transform how you manage your freelance business with AI-powered tools.',
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Benefits */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  Start Your Freelance Success Story
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Join thousands of freelancers who've transformed their business with FreeFlow's AI-powered platform.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">AI-Powered Project Management</h3>
                    <p className="text-gray-600">Automate project workflows, generate content, and streamline client communication with intelligent AI assistance.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Secure Payment Processing</h3>
                    <p className="text-gray-600">Built-in escrow system, milestone payments, and automated invoicing to ensure you get paid on time.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Advanced Video Studio</h3>
                    <p className="text-gray-600">Create professional presentations, record client reviews, and collaborate with AI-enhanced video tools.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Community & Networking</h3>
                    <p className="text-gray-600">Connect with other freelancers, share resources, and grow your professional network.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-2xl">
                <p className="text-sm text-gray-700 mb-2">🎉 <strong>Limited Time Offer</strong></p>
                <p className="text-lg font-semibold mb-1">Get 30 days free when you sign up today!</p>
                <p className="text-sm text-gray-600">No credit card required. Cancel anytime.</p>
              </div>
            </div>

            {/* Right side - Sign up form */}
            <Card className="p-8">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create Your Account</CardTitle>
                <CardDescription>
                  Start your free trial and transform your freelance business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="firstName" placeholder="John" className="pl-10" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="lastName" placeholder="Doe" className="pl-10" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="email" type="email" placeholder="john@example.com" className="pl-10" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="password" type="password" placeholder="Create a strong password" className="pl-10 pr-10" />
                      <Eye className="absolute right-3 top-3 h-4 w-4 text-gray-400 cursor-pointer" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">At least 8 characters with numbers and symbols</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="newsletter" defaultChecked />
                    <Label htmlFor="newsletter" className="text-sm">
                      Send me tips, updates, and special offers
                    </Label>
                  </div>
                  
                  <Button type="submit" className="w-full text-lg py-6">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                      Sign in here
                    </Link>
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t text-center">
                  <p className="text-xs text-gray-500">
                    🔒 Your data is protected with enterprise-grade security
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}