'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen relative bg-slate-950">
      {/* Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10" aria-hidden="true" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" aria-hidden="true"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" aria-hidden="true"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" aria-hidden="true" />

      <main className="max-w-4xl mx-auto p-6 relative" role="main">
        <nav className="mb-6" aria-label="Breadcrumb">
          <Link href="/">
            <Button variant="outline" className="gap-2 border-slate-700 text-white hover:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" aria-label="Back to home">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Button>
          </Link>
        </nav>

        <article className="relative" aria-labelledby="terms-heading">
          <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-2xl blur opacity-40" aria-hidden="true" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" size={80} duration={8} />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="relative" aria-hidden="true">
                  <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-blue-500/50 to-indigo-500/50 rounded-lg blur opacity-75" />
                  <div className="relative p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <FileText className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <h1 id="terms-heading">
                  <TextShimmer className="text-3xl font-bold text-white" duration={2}>
                    Terms of Service
                  </TextShimmer>
                </h1>
              </div>
              <p className="text-gray-400 mt-2"><time dateTime="2025-01">Last updated: January 2025</time></p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
                <p className="text-gray-300">
                  By accessing and using KAZI ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these Terms of Service, please do not use this platform.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">2. Use License</h2>
                <p className="text-gray-300">
                  KAZI grants you a personal, non-transferable, non-exclusive license to use the Platform on your devices in accordance with the terms of this agreement.
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>You may not modify, copy, or reverse engineer any portion of the Platform</li>
                  <li>You may not remove any copyright or proprietary notations from the Platform</li>
                  <li>You may not transfer the Platform to another person or entity</li>
                  <li>You agree to use the Platform only for lawful purposes</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">3. User Accounts</h2>
                <p className="text-gray-300">
                  When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                </p>
                <p className="text-gray-300">
                  You are responsible for safeguarding the password that you use to access the Platform and for any activities or actions under your password. You agree not to disclose your password to any third party.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">4. Payment Terms</h2>
                <p className="text-gray-300">
                  KAZI offers both free and paid subscription plans. Paid plans will be charged on a recurring basis according to the billing cycle you selected. All fees are non-refundable unless otherwise stated.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">5. Intellectual Property</h2>
                <p className="text-gray-300">
                  The Platform and its original content (excluding user-generated content), features, and functionality are and will remain the exclusive property of KAZI and its licensors. The Platform is protected by copyright, trademark, and other laws.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">6. User Content</h2>
                <p className="text-gray-300">
                  You retain all rights to content you upload, post, or display on or through the Platform. By uploading content, you grant KAZI a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content solely for the purpose of operating and improving the Platform.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">7. Limitation of Liability</h2>
                <p className="text-gray-300">
                  In no event shall KAZI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">8. Termination</h2>
                <p className="text-gray-300">
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Platform will immediately cease.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">9. Governing Law and Jurisdiction</h2>
                <p className="text-gray-300">
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where KAZI is registered, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the courts located in that jurisdiction, and you hereby consent to personal jurisdiction and venue therein.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">10. Dispute Resolution</h2>
                <p className="text-gray-300">
                  In the event of any dispute arising from or relating to these Terms or your use of the Platform, the parties agree to the following resolution process:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Informal Negotiation:</strong> First, attempt to resolve the dispute through good faith negotiation for 30 days</li>
                  <li><strong className="text-white">Mediation:</strong> If negotiation fails, submit the dispute to mediation with a mutually agreed mediator</li>
                  <li><strong className="text-white">Arbitration:</strong> If mediation is unsuccessful, the dispute shall be resolved by binding arbitration</li>
                </ul>
                <p className="text-gray-300 mt-4">
                  You agree to waive your right to a jury trial and to participate in class action lawsuits.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">11. DMCA Copyright Policy</h2>
                <p className="text-gray-300">
                  KAZI respects the intellectual property rights of others. If you believe that content on the Platform infringes your copyright, please send a written DMCA takedown notice to <a href="mailto:legal@kazi.com" className="text-blue-400 hover:underline">legal@kazi.com</a> with the following information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Identification of the copyrighted work claimed to be infringed</li>
                  <li>Identification of the material claimed to be infringing and its location on the Platform</li>
                  <li>Your contact information (name, address, telephone number, email)</li>
                  <li>A statement that you have a good faith belief that the use is not authorized</li>
                  <li>A statement under penalty of perjury that the information is accurate and you are authorized to act</li>
                  <li>Your physical or electronic signature</li>
                </ul>
                <p className="text-gray-300 mt-4">
                  We will respond to valid DMCA notices in accordance with the Digital Millennium Copyright Act. Repeat infringers will have their accounts terminated.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">12. Export Controls</h2>
                <p className="text-gray-300">
                  You agree not to export, re-export, or transfer the Platform or any technical data derived from the Platform to any country, entity, or person prohibited by applicable export control laws and regulations, including those of the United States and the European Union.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">13. Force Majeure</h2>
                <p className="text-gray-300">
                  KAZI shall not be liable for any failure or delay in performance due to circumstances beyond its reasonable control, including but not limited to acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemics, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">14. Severability</h2>
                <p className="text-gray-300">
                  If any provision of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect and enforceable.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">15. Entire Agreement</h2>
                <p className="text-gray-300">
                  These Terms, together with our Privacy Policy and any other legal notices published on the Platform, constitute the entire agreement between you and KAZI regarding the Platform and supersede all prior agreements, understandings, and communications, whether written or oral.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">16. Changes to Terms</h2>
                <p className="text-gray-300">
                  We reserve the right to modify or replace these Terms at any time. We will provide notice of any material changes by posting the new Terms on the Platform and updating the "Last updated" date. Your continued use of the Platform after any such changes constitutes your acceptance of the new Terms. We encourage you to review these Terms periodically.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">17. Contact Us</h2>
                <p className="text-gray-300">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <ul className="list-none space-y-1 text-gray-300" role="list">
                  <li role="listitem">Email: <a href="mailto:legal@kazi.com" className="text-blue-400 hover:underline focus:outline-none focus:underline">legal@kazi.com</a></li>
                  <li role="listitem">Website: <Link href="/contact" className="text-blue-400 hover:underline focus:outline-none focus:underline">Contact Form</Link></li>
                </ul>
              </section>
            </CardContent>
          </LiquidGlassCard>
        </article>
      </main>
    </div>
  )
}
