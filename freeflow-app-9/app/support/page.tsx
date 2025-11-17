'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, MessageCircle, Book, HelpCircle, Video, Users } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            How Can We Help You?
          </h1>
          <p className="text-xl text-gray-600">
            Get the support you need to succeed with KAZI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Contact Support */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-3 bg-blue-100 rounded-lg w-fit mb-2">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Get personalized help from our support team. We typically respond within 24 hours.
              </p>
              <Link href="/contact">
                <Button className="w-full">
                  Send Message
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Live Chat */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-3 bg-green-100 rounded-lg w-fit mb-2">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Chat with our support team in real-time. Available Monday-Friday, 9AM-5PM EST.
              </p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => alert('💬 Live Chat\n\nChat support will be available soon!\n\nFor immediate assistance, please email support@kazi.com or use the contact form.')}
              >
                Start Chat
              </Button>
            </CardContent>
          </Card>

          {/* Documentation */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-3 bg-purple-100 rounded-lg w-fit mb-2">
                <Book className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Browse our comprehensive guides and tutorials to learn how to use KAZI effectively.
              </p>
              <Link href="/docs">
                <Button className="w-full" variant="outline">
                  View Docs
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* FAQs */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-3 bg-orange-100 rounded-lg w-fit mb-2">
                <HelpCircle className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>FAQs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Find answers to frequently asked questions about features, billing, and more.
              </p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => alert('❓ FAQs\n\nFrequently Asked Questions page coming soon!\n\nIn the meantime, feel free to contact support with any questions.')}
              >
                Browse FAQs
              </Button>
            </CardContent>
          </Card>

          {/* Video Tutorials */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-3 bg-red-100 rounded-lg w-fit mb-2">
                <Video className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Video Tutorials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Watch step-by-step video guides to master KAZI's features and workflows.
              </p>
              <Link href="/tutorials">
                <Button className="w-full" variant="outline">
                  Watch Tutorials
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Community */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="p-3 bg-indigo-100 rounded-lg w-fit mb-2">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Join our community of 2,800+ creatives to share tips, get advice, and network.
              </p>
              <Link href="/community">
                <Button className="w-full" variant="outline">
                  Join Community
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Popular Questions */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Popular Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <h3 className="font-semibold mb-1">How do I get started with KAZI?</h3>
                <p className="text-sm text-gray-600">Sign up for a free account, complete the onboarding tutorial, and start creating your first project.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <h3 className="font-semibold mb-1">What payment methods do you accept?</h3>
                <p className="text-sm text-gray-600">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <h3 className="font-semibold mb-1">Can I cancel my subscription anytime?</h3>
                <p className="text-sm text-gray-600">Yes, you can cancel your subscription at any time from your account settings. No questions asked.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <h3 className="font-semibold mb-1">How do I invite team members?</h3>
                <p className="text-sm text-gray-600">Go to Team Hub in your dashboard and click "Invite Members" to add team members to your workspace.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
              <p className="mb-6 text-blue-100">
                Our support team is here to help you succeed
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                    Contact Support
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => window.location.href = 'mailto:support@kazi.com'}
                >
                  Email: support@kazi.com
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
