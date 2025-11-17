'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPage() {
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            </div>
            <p className="text-gray-600 mt-2">Last updated: January 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">1. Information We Collect</h2>
              <p className="text-gray-700">
                We collect information that you provide directly to us when you create an account, use our services, or communicate with us. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Account information (name, email address, password)</li>
                <li>Profile information (bio, profile picture, professional details)</li>
                <li>Project and content data you create or upload</li>
                <li>Payment and billing information</li>
                <li>Communications with us and other users</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
              <p className="text-gray-700">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Personalize and improve your experience</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, prevent, and address technical issues and fraud</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">3. Information Sharing</h2>
              <p className="text-gray-700">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>With your consent:</strong> We may share your information when you give us explicit consent to do so</li>
                <li><strong>Service providers:</strong> We may share information with third-party vendors who perform services on our behalf</li>
                <li><strong>Legal compliance:</strong> We may disclose information if required by law or in response to valid legal requests</li>
                <li><strong>Business transfers:</strong> In connection with any merger, sale, or acquisition of our business</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">4. Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication</li>
                <li>Monitoring and logging of system activities</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">5. Your Rights and Choices</h2>
              <p className="text-gray-700">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Data portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">6. Cookies and Tracking</h2>
              <p className="text-gray-700">
                We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings and other tools. Note that disabling cookies may affect the functionality of our services.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">7. Children's Privacy</h2>
              <p className="text-gray-700">
                Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">8. International Data Transfers</h2>
              <p className="text-gray-700">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">9. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">10. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <ul className="list-none space-y-1 text-gray-700">
                <li>Email: privacy@kazi.com</li>
                <li>Website: <Link href="/contact" className="text-blue-600 hover:underline">Contact Form</Link></li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
