'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen relative bg-slate-950">
      {/* Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-slate-900 to-slate-950 -z-10" aria-hidden="true" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" aria-hidden="true"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" aria-hidden="true"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" aria-hidden="true" />

      <main className="max-w-4xl mx-auto p-6 relative" role="main">
        <nav className="mb-6" aria-label="Breadcrumb">
          <Link href="/">
            <Button variant="outline" className="gap-2 border-slate-700 text-white hover:bg-slate-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2" aria-label="Back to home">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Button>
          </Link>
        </nav>

        <article className="relative" aria-labelledby="privacy-heading">
          <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl blur opacity-40" aria-hidden="true" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" size={80} duration={8} />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="relative" aria-hidden="true">
                  <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-green-500/50 to-emerald-500/50 rounded-lg blur opacity-75" />
                  <div className="relative p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                    <Shield className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <h1 id="privacy-heading">
                  <TextShimmer className="text-3xl font-bold text-white" duration={2}>
                    Privacy Policy
                  </TextShimmer>
                </h1>
              </div>
              <p className="text-gray-400 mt-2"><time dateTime="2025-01">Last updated: January 2025</time></p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <section className="space-y-4" aria-labelledby="section-1">
                <h2 id="section-1" className="text-2xl font-bold text-white">1. Information We Collect</h2>
                <p className="text-gray-300">
                  We collect information that you provide directly to us when you create an account, use our services, or communicate with us. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Account information (name, email address, password)</li>
                  <li>Profile information (bio, profile picture, professional details)</li>
                  <li>Project and content data you create or upload</li>
                  <li>Payment and billing information</li>
                  <li>Communications with us and other users</li>
                  <li>Usage data and analytics</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
                <p className="text-gray-300">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
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
                <h2 className="text-2xl font-bold text-white">3. Information Sharing</h2>
                <p className="text-gray-300">
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">With your consent:</strong> We may share your information when you give us explicit consent to do so</li>
                  <li><strong className="text-white">Service providers:</strong> We may share information with third-party vendors who perform services on our behalf</li>
                  <li><strong className="text-white">Legal compliance:</strong> We may disclose information if required by law or in response to valid legal requests</li>
                  <li><strong className="text-white">Business transfers:</strong> In connection with any merger, sale, or acquisition of our business</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">4. Data Security</h2>
                <p className="text-gray-300">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Monitoring and logging of system activities</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">5. Your Rights and Choices</h2>
                <p className="text-gray-300">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Access:</strong> Request access to your personal information</li>
                  <li><strong className="text-white">Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong className="text-white">Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong className="text-white">Data portability:</strong> Request a copy of your data in a portable format</li>
                  <li><strong className="text-white">Opt-out:</strong> Unsubscribe from marketing communications</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">6. Cookies and Tracking</h2>
                <p className="text-gray-300">
                  We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings and other tools. Note that disabling cookies may affect the functionality of our services.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">7. Children's Privacy</h2>
                <p className="text-gray-300">
                  Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">8. International Data Transfers</h2>
                <p className="text-gray-300">
                  Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">9. Changes to This Policy</h2>
                <p className="text-gray-300">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">10. Contact Us</h2>
                <p className="text-gray-300">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <ul className="list-none space-y-1 text-gray-300" role="list">
                  <li role="listitem">Email: <a href="mailto:privacy@kazi.com" className="text-green-400 hover:underline focus:outline-none focus:underline">privacy@kazi.com</a></li>
                  <li role="listitem">Website: <Link href="/contact" className="text-green-400 hover:underline focus:outline-none focus:underline">Contact Form</Link></li>
                </ul>
              </section>
            </CardContent>
          </LiquidGlassCard>
        </article>
      </main>
    </div>
  )
}
