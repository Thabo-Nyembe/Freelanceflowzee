'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DemoModal } from '@/components/demo-modal'
import { Mail, Phone, MapPin, Send, ArrowLeft, ExternalLink } from 'lucide-react'

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isDemoOpen, setIsDemoOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    setSuccess(true)
  }

  const handleEmailClick = () => {
    window.location.href = 'mailto:hello@freelanceflowzee.com?subject=Contact from FreeflowZee Website'
  }

  const handlePhoneClick = () => {
    window.location.href = 'tel:+15551234567'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-indigo-600 hover:text-indigo-700">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              FreeflowZee
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Let's Talk About Your 
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Business Goals</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to transform your creative workflow? Our team is here to help you get started with FreeflowZee.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Get in Touch</CardTitle>
                <CardDescription>
                  We'd love to hear from you. Choose the best way to reach us.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Clickable Email */}
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 hover:bg-indigo-50 transition-colors group"
                  onClick={handleEmailClick}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors">
                      <Mail className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Email</p>
                      <p className="text-gray-600 group-hover:text-indigo-500 transition-colors">hello@freelanceflowzee.com</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 ml-auto" />
                  </div>
                </Button>
                
                {/* Clickable Phone */}
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 hover:bg-indigo-50 transition-colors group"
                  onClick={handlePhoneClick}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors">
                      <Phone className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Phone</p>
                      <p className="text-gray-600 group-hover:text-indigo-500 transition-colors">+1 (555) 123-4567</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 ml-auto" />
                  </div>
                </Button>
                
                {/* Office Location */}
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <MapPin className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Office</p>
                    <p className="text-gray-600">San Francisco, CA</p>
                  </div>
                </div>

                <div className="pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Business Hours</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                    <p>Saturday: 10:00 AM - 4:00 PM PST</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-6 space-y-3">
                  <Link href="/signup" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsDemoOpen(true)}
                  >
                    View Demo Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {success ? (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">
                      Thank you for your message! We'll get back to you within 24 hours.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          className="bg-white/50 border-gray-200 focus:bg-white transition-colors"
                          placeholder="John"
                          suppressHydrationWarning
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          className="bg-white/50 border-gray-200 focus:bg-white transition-colors"
                          placeholder="Doe"
                          suppressHydrationWarning
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="bg-white/50 border-gray-200 focus:bg-white transition-colors"
                        placeholder="john@example.com"
                        suppressHydrationWarning
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Company (Optional)
                      </label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        className="bg-white/50 border-gray-200 focus:bg-white transition-colors"
                        placeholder="Your Company"
                        suppressHydrationWarning
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        className="bg-white/50 border-gray-200 focus:bg-white transition-colors"
                        placeholder="How can we help you?"
                        suppressHydrationWarning
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        className="bg-white/50 border-gray-200 focus:bg-white transition-colors"
                        placeholder="Tell us more about your project and how we can help..."
                        suppressHydrationWarning
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                      {isLoading ? (
                        'Sending...'
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  )
} 