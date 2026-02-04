'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Mail, Phone, MapPin, Clock, Send, BookOpen, CreditCard, Headphones, Lightbulb, ExternalLink, MessageCircle } from 'lucide-react'
import { EnhancedNavigation } from '@/components/marketing/enhanced-navigation'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { GlowEffect } from '@/components/ui/glow-effect'
import { BorderTrail } from '@/components/ui/border-trail'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { createSimpleLogger } from '@/lib/simple-logger'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

const logger = createSimpleLogger('Contact')

// Help topic types and content
type HelpTopic = 'getting-started' | 'billing' | 'technical' | 'features'

interface HelpContent {
  title: string
  description: string
  icon: React.ReactNode
  sections: {
    heading: string
    content: string
    links?: { label: string; href: string }[]
  }[]
  contactOptions: { label: string; action: string }[]
}

const helpTopicsContent: Record<HelpTopic, HelpContent> = {
  'getting-started': {
    title: 'Getting Started Guide',
    description: 'Everything you need to know to get up and running with Kazi',
    icon: <BookOpen className="w-6 h-6 text-blue-500" />,
    sections: [
      {
        heading: 'Quick Start',
        content: 'Create your account, set up your workspace, and invite your team in under 5 minutes. Our onboarding wizard will guide you through each step.',
        links: [
          { label: 'Watch Setup Tutorial', href: '/v1/help/tutorials/setup' },
          { label: 'Download Quick Start PDF', href: '/v1/help/docs/quickstart.pdf' },
        ]
      },
      {
        heading: 'Core Features Overview',
        content: 'Learn about project management, file sharing, real-time collaboration, and analytics dashboards. Each feature is designed to streamline your workflow.',
        links: [
          { label: 'Feature Documentation', href: '/v1/help/docs/features' },
          { label: 'Video Walkthroughs', href: '/v1/help/videos' },
        ]
      },
      {
        heading: 'Best Practices',
        content: 'Discover tips from power users on organizing projects, setting up automations, and maximizing team productivity with Kazi.',
        links: [
          { label: 'Best Practices Guide', href: '/v1/help/docs/best-practices' },
        ]
      }
    ],
    contactOptions: [
      { label: 'Schedule Onboarding Call', action: 'schedule' },
      { label: 'Chat with Support', action: 'chat' },
    ]
  },
  'billing': {
    title: 'Payment & Billing',
    description: 'Manage your subscription, invoices, and payment methods',
    icon: <CreditCard className="w-6 h-6 text-green-500" />,
    sections: [
      {
        heading: 'Subscription Plans',
        content: 'Choose from Free, Pro ($12/month), or Enterprise plans. All paid plans include a 14-day free trial with full feature access.',
        links: [
          { label: 'Compare Plans', href: '/v1/pricing' },
          { label: 'Enterprise Pricing', href: '/v1/enterprise' },
        ]
      },
      {
        heading: 'Payment Methods',
        content: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for Enterprise accounts. All payments are securely processed.',
        links: [
          { label: 'Update Payment Method', href: '/v1/dashboard/settings/billing' },
        ]
      },
      {
        heading: 'Invoices & Receipts',
        content: 'Access your billing history, download invoices, and manage tax information from your account settings. Invoices are generated automatically each billing cycle.',
        links: [
          { label: 'View Billing History', href: '/v1/dashboard/settings/billing/history' },
          { label: 'Tax Documentation', href: '/v1/help/docs/tax-info' },
        ]
      }
    ],
    contactOptions: [
      { label: 'Contact Billing Support', action: 'billing-support' },
      { label: 'Request Refund', action: 'refund' },
    ]
  },
  'technical': {
    title: 'Technical Support',
    description: 'Get help with technical issues, integrations, and troubleshooting',
    icon: <Headphones className="w-6 h-6 text-purple-500" />,
    sections: [
      {
        heading: 'Common Issues',
        content: 'Having trouble logging in, syncing files, or connecting integrations? Check our troubleshooting guides for quick solutions to common problems.',
        links: [
          { label: 'Troubleshooting Guide', href: '/v1/help/troubleshooting' },
          { label: 'System Status', href: 'https://status.kazi.app' },
        ]
      },
      {
        heading: 'API & Integrations',
        content: 'Connect Kazi with your favorite tools including Slack, GitHub, Jira, Figma, and more. Our API documentation covers authentication, endpoints, and webhooks.',
        links: [
          { label: 'API Documentation', href: '/v1/developers/api' },
          { label: 'Integration Guides', href: '/v1/help/integrations' },
        ]
      },
      {
        heading: 'Security & Privacy',
        content: 'Learn about our security practices, data encryption, GDPR compliance, and how to configure SSO for your organization.',
        links: [
          { label: 'Security Overview', href: '/v1/security' },
          { label: 'Privacy Policy', href: '/v1/privacy' },
        ]
      }
    ],
    contactOptions: [
      { label: 'Open Support Ticket', action: 'ticket' },
      { label: 'Live Chat (Priority)', action: 'chat' },
    ]
  },
  'features': {
    title: 'Feature Requests',
    description: 'Share your ideas and vote on features you want to see in Kazi',
    icon: <Lightbulb className="w-6 h-6 text-yellow-500" />,
    sections: [
      {
        heading: 'Submit Your Ideas',
        content: 'We love hearing from our users! Submit feature requests and our product team reviews every suggestion. Popular requests get prioritized in our roadmap.',
        links: [
          { label: 'Feature Request Portal', href: '/v1/feedback/features' },
          { label: 'Community Forum', href: '/v1/community' },
        ]
      },
      {
        heading: 'Product Roadmap',
        content: 'See what features are in development, coming soon, and under consideration. We update our public roadmap weekly.',
        links: [
          { label: 'View Roadmap', href: '/v1/roadmap' },
          { label: 'Release Notes', href: '/v1/changelog' },
        ]
      },
      {
        heading: 'Beta Program',
        content: 'Join our beta program to get early access to new features and provide direct feedback to our development team.',
        links: [
          { label: 'Join Beta Program', href: '/v1/beta' },
        ]
      }
    ],
    contactOptions: [
      { label: 'Submit Feature Request', action: 'feature-request' },
      { label: 'Schedule Product Call', action: 'product-call' },
    ]
  }
}

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
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [selectedHelpTopic, setSelectedHelpTopic] = useState<HelpTopic | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  })

  // Help dialog handlers
  const openHelpDialog = (topic: HelpTopic) => {
    setSelectedHelpTopic(topic)
    setShowHelpDialog(true)
    trackEvent('help_dialog_open', topic)
  }

  const closeHelpDialog = () => {
    setShowHelpDialog(false)
    setSelectedHelpTopic(null)
  }

  const handleContactAction = (action: string) => {
    trackEvent('help_contact_action', action)
    switch (action) {
      case 'schedule':
        toast.success('Onboarding Call', {
          description: 'Opening calendar to schedule your onboarding call...'
        })
        // In production, this would open a Calendly or similar widget
        break
      case 'chat':
        toast.success('Live Chat', {
          description: 'Connecting you with a support agent...'
        })
        // In production, this would open Intercom or similar chat widget
        break
      case 'billing-support':
        setFormData(prev => ({ ...prev, subject: 'Billing Support Request' }))
        closeHelpDialog()
        toast.info('Billing Support', {
          description: 'Please fill out the contact form with your billing inquiry.'
        })
        break
      case 'refund':
        setFormData(prev => ({ ...prev, subject: 'Refund Request' }))
        closeHelpDialog()
        toast.info('Refund Request', {
          description: 'Please fill out the contact form with your refund details.'
        })
        break
      case 'ticket':
        setFormData(prev => ({ ...prev, subject: 'Technical Support Ticket' }))
        closeHelpDialog()
        toast.info('Support Ticket', {
          description: 'Please describe your issue in the contact form below.'
        })
        break
      case 'feature-request':
        setFormData(prev => ({ ...prev, subject: 'Feature Request' }))
        closeHelpDialog()
        toast.info('Feature Request', {
          description: 'Please describe the feature you would like to see.'
        })
        break
      case 'product-call':
        toast.success('Product Call', {
          description: 'Opening calendar to schedule a product feedback session...'
        })
        break
      default:
        toast.info('Action', { description: `Processing: ${action}` })
    }
  }

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

        // Show next steps toast
        setTimeout(() => {
          toast.info('Next steps', {
            description: result.nextSteps?.slice(0, 2).join(', ') || 'We will get back to you soon'
          })
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
    } catch (error) {
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
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          role="listitem"
                          aria-label="Getting Started Guide"
                          onClick={() => openHelpDialog('getting-started')}
                        >
                          <BookOpen className="w-4 h-4 mr-2" aria-hidden="true" />
                          Getting Started Guide
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          role="listitem"
                          aria-label="Payment & Billing"
                          onClick={() => openHelpDialog('billing')}
                        >
                          <CreditCard className="w-4 h-4 mr-2" aria-hidden="true" />
                          Payment & Billing
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          role="listitem"
                          aria-label="Technical Support"
                          onClick={() => openHelpDialog('technical')}
                        >
                          <Headphones className="w-4 h-4 mr-2" aria-hidden="true" />
                          Technical Support
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          role="listitem"
                          aria-label="Feature Requests"
                          onClick={() => openHelpDialog('features')}
                        >
                          <Lightbulb className="w-4 h-4 mr-2" aria-hidden="true" />
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

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedHelpTopic && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  {helpTopicsContent[selectedHelpTopic].icon}
                  <DialogTitle className="text-xl">
                    {helpTopicsContent[selectedHelpTopic].title}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  {helpTopicsContent[selectedHelpTopic].description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {helpTopicsContent[selectedHelpTopic].sections.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-semibold text-gray-900">{section.heading}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
                    {section.links && section.links.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {section.links.map((link, linkIndex) => (
                          <a
                            key={linkIndex}
                            href={link.href}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            onClick={(e) => {
                              e.preventDefault()
                              trackEvent('help_link_click', link.label, { href: link.href })
                              toast.info('Navigation', {
                                description: `Opening ${link.label}...`
                              })
                            }}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
                <p className="text-sm text-gray-500 mr-auto">Need more help?</p>
                {helpTopicsContent[selectedHelpTopic].contactOptions.map((option, index) => (
                  <Button
                    key={index}
                    variant={index === 0 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleContactAction(option.action)}
                    className={index === 0 ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {option.label}
                  </Button>
                ))}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}