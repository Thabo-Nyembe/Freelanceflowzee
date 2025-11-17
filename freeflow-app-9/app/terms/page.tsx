'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-3xl">Terms of Service</CardTitle>
            </div>
            <p className="text-gray-600 mt-2">Last updated: January 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using KAZI ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these Terms of Service, please do not use this platform.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">2. Use License</h2>
              <p className="text-gray-700">
                KAZI grants you a personal, non-transferable, non-exclusive license to use the Platform on your devices in accordance with the terms of this agreement.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You may not modify, copy, or reverse engineer any portion of the Platform</li>
                <li>You may not remove any copyright or proprietary notations from the Platform</li>
                <li>You may not transfer the Platform to another person or entity</li>
                <li>You agree to use the Platform only for lawful purposes</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">3. User Accounts</h2>
              <p className="text-gray-700">
                When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
              </p>
              <p className="text-gray-700">
                You are responsible for safeguarding the password that you use to access the Platform and for any activities or actions under your password. You agree not to disclose your password to any third party.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">4. Payment Terms</h2>
              <p className="text-gray-700">
                KAZI offers both free and paid subscription plans. Paid plans will be charged on a recurring basis according to the billing cycle you selected. All fees are non-refundable unless otherwise stated.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">5. Intellectual Property</h2>
              <p className="text-gray-700">
                The Platform and its original content (excluding user-generated content), features, and functionality are and will remain the exclusive property of KAZI and its licensors. The Platform is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">6. User Content</h2>
              <p className="text-gray-700">
                You retain all rights to content you upload, post, or display on or through the Platform. By uploading content, you grant KAZI a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content solely for the purpose of operating and improving the Platform.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">7. Limitation of Liability</h2>
              <p className="text-gray-700">
                In no event shall KAZI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">8. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Platform will immediately cease.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">9. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify or replace these Terms at any time. We will provide notice of any material changes by posting the new Terms on the Platform. Your continued use of the Platform after any such changes constitutes your acceptance of the new Terms.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">10. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms, please contact us at:
              </p>
              <ul className="list-none space-y-1 text-gray-700">
                <li>Email: legal@kazi.com</li>
                <li>Website: <Link href="/contact" className="text-blue-600 hover:underline">Contact Form</Link></li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
