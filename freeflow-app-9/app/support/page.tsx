'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'
import { ArrowLeft, Mail, MessageCircle, Book, HelpCircle, Video, Users } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="min-h-screen relative bg-slate-950">
      {/* Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10" aria-hidden="true" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" aria-hidden="true"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" aria-hidden="true"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" aria-hidden="true" />

      <main className="max-w-6xl mx-auto p-6 relative" role="main">
        <nav className="mb-6" aria-label="Breadcrumb">
          <Link href="/">
            <Button variant="outline" className="gap-2 border-slate-700 text-white hover:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" aria-label="Back to home">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Button>
          </Link>
        </nav>

        <header className="text-center mb-12" aria-labelledby="support-heading">
          <h1 id="support-heading">
            <TextShimmer className="text-4xl font-bold mb-4" duration={2}>
              How Can We <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Help You</span>?
            </TextShimmer>
          </h1>
          <p className="text-xl text-gray-300">
            Get the support you need to succeed with KAZI
          </p>
        </header>

        <section aria-labelledby="support-options-heading">
          <h2 id="support-options-heading" className="sr-only">Support options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" role="list">
            {/* Contact Support */}
            <article className="relative group" role="listitem">
              <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" aria-hidden="true" />
              <LiquidGlassCard className="relative h-full">
                <BorderTrail className="bg-gradient-to-r from-blue-500 to-blue-700" size={60} duration={6} />
                <CardHeader>
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg w-fit mb-2" aria-hidden="true">
                    <Mail className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3><CardTitle className="text-white">Contact Support</CardTitle></h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Get personalized help from our support team. We typically respond within 24 hours.
                  </p>
                  <Link href="/contact">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" aria-label="Send message to support">
                      Send Message
                    </Button>
                  </Link>
                </CardContent>
              </LiquidGlassCard>
            </article>

          {/* Live Chat */}
          <div className="relative group">
            <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <LiquidGlassCard className="relative h-full">
              <BorderTrail className="bg-gradient-to-r from-green-500 to-green-700" size={60} duration={6} />
              <CardHeader>
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg w-fit mb-2">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Chat with our support team in real-time. Available Monday-Friday, 9AM-5PM EST.
                </p>
                <Link href="/contact">
                  <Button
                    className="w-full border-slate-600 text-white hover:bg-slate-800"
                    variant="outline"
                    aria-label="Contact support team"
                  >
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </LiquidGlassCard>
          </div>

          {/* Documentation */}
          <div className="relative group">
            <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <LiquidGlassCard className="relative h-full">
              <BorderTrail className="bg-gradient-to-r from-purple-500 to-purple-700" size={60} duration={6} />
              <CardHeader>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg w-fit mb-2">
                  <Book className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Browse our comprehensive guides and tutorials to learn how to use KAZI effectively.
                </p>
                <Link href="/docs">
                  <Button className="w-full border-slate-600 text-white hover:bg-slate-800" variant="outline">
                    View Docs
                  </Button>
                </Link>
              </CardContent>
            </LiquidGlassCard>
          </div>

          {/* FAQs */}
          <div className="relative group">
            <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <LiquidGlassCard className="relative h-full">
              <BorderTrail className="bg-gradient-to-r from-orange-500 to-orange-700" size={60} duration={6} />
              <CardHeader>
                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg w-fit mb-2">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">FAQs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Find answers to frequently asked questions about features, billing, and more.
                </p>
                <Link href="/contact">
                  <Button
                    className="w-full border-slate-600 text-white hover:bg-slate-800"
                    variant="outline"
                    aria-label="Get help from support"
                  >
                    Get Help
                  </Button>
                </Link>
              </CardContent>
            </LiquidGlassCard>
          </div>

          {/* Video Tutorials */}
          <div className="relative group">
            <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <LiquidGlassCard className="relative h-full">
              <BorderTrail className="bg-gradient-to-r from-red-500 to-red-700" size={60} duration={6} />
              <CardHeader>
                <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg w-fit mb-2">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Video Tutorials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Watch step-by-step video guides to master KAZI's features and workflows.
                </p>
                <Link href="/tutorials">
                  <Button className="w-full border-slate-600 text-white hover:bg-slate-800" variant="outline">
                    Watch Tutorials
                  </Button>
                </Link>
              </CardContent>
            </LiquidGlassCard>
          </div>

          {/* Community */}
          <div className="relative group">
            <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <LiquidGlassCard className="relative h-full">
              <BorderTrail className="bg-gradient-to-r from-indigo-500 to-indigo-700" size={60} duration={6} />
              <CardHeader>
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg w-fit mb-2">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Join our community of 2,800+ creatives to share tips, get advice, and network.
                </p>
                <Link href="/community">
                  <Button className="w-full border-slate-600 text-white hover:bg-slate-800" variant="outline">
                    Join Community
                  </Button>
                </Link>
              </CardContent>
            </LiquidGlassCard>
          </div>
        </div>
        </section>

        {/* Popular Questions */}
        <section className="relative" aria-labelledby="faq-heading">
          <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur opacity-40" aria-hidden="true" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" size={80} duration={8} />
            <CardHeader>
              <h2 id="faq-heading"><CardTitle className="text-2xl text-white">Popular Questions</CardTitle></h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" role="list">
                <div className="p-4 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500" role="listitem" tabIndex={0}>
                  <h4 className="font-semibold mb-1 text-white">How do I get started with KAZI?</h4>
                  <p className="text-sm text-gray-400">Sign up for a free account, complete the onboarding tutorial, and start creating your first project.</p>
                </div>
                <div className="p-4 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500" role="listitem" tabIndex={0}>
                  <h4 className="font-semibold mb-1 text-white">What payment methods do you accept?</h4>
                  <p className="text-sm text-gray-400">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
                </div>
                <div className="p-4 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500" role="listitem" tabIndex={0}>
                  <h4 className="font-semibold mb-1 text-white">Can I cancel my subscription anytime?</h4>
                  <p className="text-sm text-gray-400">Yes, you can cancel your subscription at any time from your account settings. No questions asked.</p>
                </div>
                <div className="p-4 border border-slate-700 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500" role="listitem" tabIndex={0}>
                  <h4 className="font-semibold mb-1 text-white">How do I invite team members?</h4>
                  <p className="text-sm text-gray-400">Go to Team Hub in your dashboard and click "Invite Members" to add team members to your workspace.</p>
                </div>
              </div>
            </CardContent>
          </LiquidGlassCard>
        </section>

        {/* Contact Info */}
        <section className="mt-12 text-center relative" aria-labelledby="contact-cta-heading">
          <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-60" aria-hidden="true" />
          <LiquidGlassCard className="relative bg-gradient-to-r from-blue-600 to-purple-600">
            <BorderTrail className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" size={100} duration={10} />
            <CardContent className="p-8">
              <h2 id="contact-cta-heading">
                <TextShimmer className="text-2xl font-bold mb-2 text-white" duration={2}>
                  Still Need Help?
                </TextShimmer>
              </h2>
              <p className="mb-6 text-blue-100">
                Our support team is here to help you succeed
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center" role="group" aria-label="Contact support options">
                <Link href="/contact">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-white focus:ring-offset-2" aria-label="Contact support via form">
                    Contact Support
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 focus:ring-2 focus:ring-white focus:ring-offset-2"
                  onClick={() => window.location.href = 'mailto:support@kazi.com'}
                  aria-label="Email support at support@kazi.com"
                >
                  Email: support@kazi.com
                </Button>
              </div>
            </CardContent>
          </LiquidGlassCard>
        </section>
      </main>
    </div>
  )
}
