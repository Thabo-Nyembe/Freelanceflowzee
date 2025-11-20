'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
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

export default function ContactPage() {
  const [isSending, setIsSending] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
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
        toast.error('Failed to send message', {
          description: result.error || 'Please try again later'
        })
      }
    } catch (error: any) {
      console.error('Contact form error:', error)
      toast.error('Failed to send message', {
        description: 'Please check your connection and try again'
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950" />

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
          {/* Header */}
          <div className="text-center mb-16">
            <TextShimmer className="text-4xl md:text-5xl font-bold mb-6" duration={2}>
              Contact Us
            </TextShimmer>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Have questions about KAZI? Need support? We&apos;re here to help you succeed in your freelance journey.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="relative">
              <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30" />
              <LiquidGlassCard className="relative p-8">
                <BorderTrail
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                  size={100}
                  duration={8}
                />
              <CardHeader>
                <TextShimmer className="text-2xl mb-2" duration={2}>
                  Send us a message
                </TextShimmer>
                <CardDescription className="text-gray-400">
                  Fill out the form below and we&apos;ll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                    disabled={isSending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSending ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </LiquidGlassCard>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <LiquidGlassCard className="p-6">
                <CardHeader>
                  <TextShimmer className="text-xl mb-2" duration={2}>
                    Get in touch
                  </TextShimmer>
                  <CardDescription className="text-gray-400">
                    Multiple ways to reach our team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Email</p>
                      <p className="text-gray-400">hello@kazi.app</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Phone</p>
                      <p className="text-gray-400">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Office</p>
                      <p className="text-gray-400">123 Tech Street<br />San Francisco, CA 94105</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Business Hours</p>
                      <p className="text-gray-400">Mon-Fri: 9:00 AM - 6:00 PM PST</p>
                    </div>
                  </div>
                </CardContent>
              </LiquidGlassCard>

              {/* FAQ Quick Links */}
              <LiquidGlassCard className="p-6">
                <CardHeader>
                  <TextShimmer className="text-xl mb-2" duration={2}>
                    Quick Help
                  </TextShimmer>
                  <CardDescription className="text-gray-400">
                    Common questions and resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                      Getting Started Guide
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                      Payment & Billing
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                      Technical Support
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10">
                      Feature Requests
                    </Button>
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