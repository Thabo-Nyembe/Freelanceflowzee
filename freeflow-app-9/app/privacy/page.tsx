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
                  Your information may be transferred to and processed in countries outside the European Economic Area (EEA) and other regions with comprehensive data protection laws. We ensure appropriate safeguards through:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                  <li>Adequacy decisions for certain countries deemed to provide adequate protection</li>
                  <li>Other legally approved transfer mechanisms where required</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">9. GDPR Rights (European Union)</h2>
                <p className="text-gray-300">
                  If you are a resident of the European Union, you have specific rights under the General Data Protection Regulation (GDPR):
                </p>
                <h3 className="text-xl font-semibold text-white mt-4">Legal Basis for Processing</h3>
                <p className="text-gray-300">
                  We process your personal data on the following legal bases:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Contract:</strong> To perform our services as outlined in the Terms of Service</li>
                  <li><strong className="text-white">Consent:</strong> For marketing communications and optional features (you may withdraw consent at any time)</li>
                  <li><strong className="text-white">Legitimate Interest:</strong> For fraud prevention, security, and service improvement</li>
                  <li><strong className="text-white">Legal Obligation:</strong> To comply with applicable laws and regulations</li>
                </ul>
                <h3 className="text-xl font-semibold text-white mt-4">Your GDPR Rights</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Right to Access:</strong> Request a copy of your personal data we hold</li>
                  <li><strong className="text-white">Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong className="text-white">Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your personal data</li>
                  <li><strong className="text-white">Right to Restriction:</strong> Request that we limit how we use your data</li>
                  <li><strong className="text-white">Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                  <li><strong className="text-white">Right to Object:</strong> Object to processing based on legitimate interests</li>
                  <li><strong className="text-white">Right to Withdraw Consent:</strong> Withdraw previously given consent at any time</li>
                  <li><strong className="text-white">Right to Lodge a Complaint:</strong> File a complaint with your local supervisory authority</li>
                </ul>
                <p className="text-gray-300 mt-4">
                  To exercise these rights, contact us at <a href="mailto:privacy@kazi.com" className="text-green-400 hover:underline">privacy@kazi.com</a> with "GDPR Request" in the subject line. We will respond within 30 days.
                </p>
                <h3 className="text-xl font-semibold text-white mt-4">Data Breach Notification</h3>
                <p className="text-gray-300">
                  In the event of a data breach affecting your personal information, we will:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Notify relevant supervisory authorities within 72 hours (where required by law)</li>
                  <li>Notify affected individuals without undue delay if the breach presents a high risk to your rights and freedoms</li>
                  <li>Provide information about the nature of the breach and remedial actions taken</li>
                </ul>
                <h3 className="text-xl font-semibold text-white mt-4">Data Retention</h3>
                <p className="text-gray-300">
                  We retain your personal data only as long as necessary for the purposes outlined in this policy:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Account data: Until account deletion plus 30 days for backup recovery</li>
                  <li>Transaction records: 7 years (legal and tax requirements)</li>
                  <li>Marketing data: Until consent is withdrawn</li>
                  <li>Analytics data: 26 months (anonymized after 14 months)</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">10. California Privacy Rights (CCPA/CPRA)</h2>
                <p className="text-gray-300">
                  If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
                </p>
                <h3 className="text-xl font-semibold text-white mt-4">Categories of Personal Information Collected</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Identifiers:</strong> Name, email address, IP address, unique identifiers</li>
                  <li><strong className="text-white">Commercial Information:</strong> Purchase history, payment information, subscription details</li>
                  <li><strong className="text-white">Internet Activity:</strong> Browsing behavior, interaction data, device information</li>
                  <li><strong className="text-white">Geolocation Data:</strong> Approximate location based on IP address</li>
                  <li><strong className="text-white">Professional Information:</strong> Company name, role, industry, work-related data</li>
                  <li><strong className="text-white">Inferences:</strong> Preferences, characteristics, behavior patterns derived from your activity</li>
                </ul>
                <h3 className="text-xl font-semibold text-white mt-4">Business Purposes for Collection</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Providing, maintaining, and improving our services</li>
                  <li>Processing transactions and payments</li>
                  <li>Customer support and communications</li>
                  <li>Security, fraud prevention, and system integrity</li>
                  <li>Legal compliance and regulatory requirements</li>
                  <li>Marketing communications (with consent)</li>
                </ul>
                <h3 className="text-xl font-semibold text-white mt-4">Categories of Third Parties</h3>
                <p className="text-gray-300">
                  We may share your information with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Service Providers:</strong> Payment processors (Stripe), cloud hosting (Supabase, Vercel)</li>
                  <li><strong className="text-white">Analytics Providers:</strong> Aggregate usage statistics only (no personal data sold)</li>
                  <li><strong className="text-white">Communication Tools:</strong> Email delivery and customer support systems</li>
                </ul>
                <h3 className="text-xl font-semibold text-white mt-4">Your California Privacy Rights</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Right to Know:</strong> Request disclosure of personal information collected, used, shared, or sold</li>
                  <li><strong className="text-white">Right to Delete:</strong> Request deletion of your personal information</li>
                  <li><strong className="text-white">Right to Opt-Out:</strong> Opt out of the "sale" or "sharing" of personal information</li>
                  <li><strong className="text-white">Right to Correct:</strong> Request correction of inaccurate personal information</li>
                  <li><strong className="text-white">Right to Limit:</strong> Limit use of sensitive personal information</li>
                  <li><strong className="text-white">Right to Non-Discrimination:</strong> Equal service and pricing regardless of privacy choices</li>
                </ul>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-4">
                  <p className="text-white font-semibold">We Do Not Sell Personal Information</p>
                  <p className="text-gray-300">
                    KAZI does not sell personal information to third parties for monetary consideration. We do not share personal information for cross-context behavioral advertising.
                  </p>
                </div>
                <p className="text-gray-300 mt-4">
                  To exercise your California privacy rights, contact us at <a href="mailto:privacy@kazi.com" className="text-green-400 hover:underline">privacy@kazi.com</a> with "CCPA Request" in the subject line. We will respond within 45 days and may request verification of your identity to protect your privacy.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">11. Changes to This Policy</h2>
                <p className="text-gray-300">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">12. Contact Us</h2>
                <p className="text-gray-300">
                  If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please contact us at:
                </p>
                <ul className="list-none space-y-1 text-gray-300" role="list">
                  <li role="listitem">Email: <a href="mailto:privacy@kazi.com" className="text-green-400 hover:underline focus:outline-none focus:underline">privacy@kazi.com</a></li>
                  <li role="listitem">Website: <Link href="/contact" className="text-green-400 hover:underline focus:outline-none focus:underline">Contact Form</Link></li>
                  <li role="listitem">For GDPR requests: Subject line "GDPR Request"</li>
                  <li role="listitem">For CCPA requests: Subject line "CCPA Request"</li>
                </ul>
              </section>
            </CardContent>
          </LiquidGlassCard>
        </article>
      </main>
    </div>
  )
}
