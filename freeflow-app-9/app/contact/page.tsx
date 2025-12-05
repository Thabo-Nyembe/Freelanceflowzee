'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import { EnhancedNavigation } from '@/components/marketing/enhanced-navigation'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { GlowEffect } from '@/components/ui/glow-effect'
import { BorderTrail } from '@/components/ui/border-trail'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { createFeatureLogger } from '@/lib/logger'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

const logger = createFeatureLogger('Contact')

export default function ContactPage() {
  // A+++ STATE MANAGEMENT
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // Analytics tracking helper
  const trackEvent = async (event: string, label: string, properties?: any) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          properties: {
            label,
            pathname,
            ...properties,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }

  const [isSending, setIsSending] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  })

  // A+++ LOAD CONTACT PAGE DATA
  useEffect(() => {
    const loadContactPageData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load contact page'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Contact page loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contact page')
        setIsLoading(false)
        announce('Error loading contact page', 'assertive')
      }
    }

    loadContactPageData()
  }, [announce])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)

    // Track contact form submission
    await trackEvent('button_click', 'Contact Form Submit', {
      subject: formData.subject,
      hasCompany: !!formData.company
    })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        // Track successful submission
        await trackEvent('contact_form_complete', 'Contact Form Success', {
          caseId: result.caseId
        })

        toast.success('Message sent successfully!', {
          description: `Case ID: ${result.caseId}`
        })

        // Show next steps alert
        setTimeout(() => {
          alert(`✅ Message Sent Successfully\n\nCase ID: ${result.caseId}\n\nNext Steps:\n${result.nextSteps.map(step => `• ${step}`).join('\n')}`)
        }, 500)

        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          company: '',
          subject: '',
          message: ''
        })
      } else {
        logger.warn('Contact form submission failed', {
          error: result.error,
          formData: { ...formData, message: formData.message.substring(0, 50) + '...' }
        })

        toast.error('Failed to send message', {
          description: result.error || 'Please try again later'
        })
      }
    } catch (error: any) {
      logger.error('Contact form error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        formData: {
          email: formData.email,
          subject: formData.subject,
          hasMessage: formData.message.length > 0
        }
      })

      toast.error('Failed to send message', {
        description: 'Please check your connection and try again'
      })
    } finally {
      setIsSending(false)
    }
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Enhanced Pattern Craft Background */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950" aria-hidden="true" />

        {/* Animated Gradient Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        </div>

        <main
          className="container mx-auto px-4 py-16 relative z-10"
          role="main"
          aria-live="polite"
          aria-busy="true"
        >
          <div role="status" aria-label="Loading contact page">
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Enhanced Pattern Craft Background */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950" aria-hidden="true" />

        <main
          className="container mx-auto px-4 py-16 relative z-10"
          role="main"
          aria-live="assertive"
        >
          <div className="max-w-2xl mx-auto mt-20" role="alert">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Navigation with Analytics */}
      <EnhancedNavigation />
      {/* Premium Scroll Progress */}
      <ScrollProgress position="top" height={3} showPercentage={false} />
      {/* Enhanced Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950" aria-hidden="true" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" aria-hidden="true" />

      <main className="container mx-auto px-4 py-16 relative z-10" role="main">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-16" aria-labelledby="contact-heading">
            <h1 id="contact-heading">
              <TextShimmer className="text-4xl md:text-5xl font-bold mb-6" duration={2}>
                Let's Talk About Your Success
              </TextShimmer>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Questions? Demo requests? Enterprise inquiries? Our team responds within 24 hours to help you transform your workflow.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <section aria-labelledby="form-heading">
              <div className="relative">
                <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30" aria-hidden="true" />
                <LiquidGlassCard className="relative p-8">
                  <BorderTrail
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    size={100}
                    duration={8}
                  />
                <CardHeader>
                  <h2 id="form-heading">
                    <TextShimmer className="text-2xl mb-2" duration={2}>
                      Get in Touch
                    </TextShimmer>
                  </h2>
                  <CardDescription className="text-gray-400">
                    Tell us how we can help. Our team responds within 24 hours—often much faster.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6" aria-label="Contact form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="company" className="text-gray-300">Company (Optional)</Label>
                    <Input
                      id="company"
                      placeholder="Your Company Name"
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help you?"
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-gray-300">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your question or feedback..."
                      rows={6}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={isSending}
                    aria-label={isSending ? 'Sending message...' : 'Send message'}
                    aria-busy={isSending}
                  >
                    <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                    {isSending ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </LiquidGlassCard>
              </div>
            </section>

            {/* Contact Information */}
            <div className="space-y-8">
              <section aria-labelledby="contact-info-heading">
                <LiquidGlassCard className="p-6">
                  <CardHeader>
                    <h2 id="contact-info-heading">
                      <TextShimmer className="text-xl mb-2" duration={2}>
                        Get in touch
                      </TextShimmer>
                    </h2>
                    <CardDescription className="text-gray-400">
                      Multiple ways to reach our team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6" role="list">
                    <div className="flex items-center gap-4" role="listitem">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center" aria-hidden="true">
                        <Mail className="w-6 h-6 text-blue-400" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Email</p>
                        <a href="mailto:hello@kazi.app" className="text-gray-400 hover:text-gray-300 focus:underline focus:outline-none" aria-label="Email us at hello@kazi.app">hello@kazi.app</a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4" role="listitem">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center" aria-hidden="true">
                        <Phone className="w-6 h-6 text-green-400" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Phone</p>
                        <a href="tel:+15551234567" className="text-gray-400 hover:text-gray-300 focus:underline focus:outline-none" aria-label="Call us at +1 (555) 123-4567">+1 (555) 123-4567</a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4" role="listitem">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center" aria-hidden="true">
                        <MapPin className="w-6 h-6 text-purple-400" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Office</p>
                        <address className="text-gray-400 not-italic">123 Tech Street<br />San Francisco, CA 94105</address>
                      </div>
                    </div>

                    <div className="flex items-center gap-4" role="listitem">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center" aria-hidden="true">
                        <Clock className="w-6 h-6 text-orange-400" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Business Hours</p>
                        <p className="text-gray-400">Mon-Fri: 9:00 AM - 6:00 PM PST</p>
                      </div>
                    </div>
                  </CardContent>
                </LiquidGlassCard>
              </section>

              {/* FAQ Quick Links */}
              <section aria-labelledby="quick-help-heading">
                <LiquidGlassCard className="p-6">
                  <CardHeader>
                    <h2 id="quick-help-heading">
                      <TextShimmer className="text-xl mb-2" duration={2}>
                        Quick Help
                      </TextShimmer>
                    </h2>
                    <CardDescription className="text-gray-400">
                      Common questions and resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <nav aria-label="Quick help links">
                      <div className="space-y-3" role="list">
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" role="listitem" aria-label="Getting Started Guide">
                          Getting Started Guide
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" role="listitem" aria-label="Payment & Billing">
                          Payment & Billing
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" role="listitem" aria-label="Technical Support">
                          Technical Support
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" role="listitem" aria-label="Feature Requests">
                          Feature Requests
                        </Button>
                      </div>
                    </nav>
                  </CardContent>
                </LiquidGlassCard>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}