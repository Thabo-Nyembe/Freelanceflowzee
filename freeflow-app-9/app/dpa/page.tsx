'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'
import { ArrowLeft, FileCheck } from 'lucide-react'

export default function DPAPage() {
  return (
    <div className="min-h-screen relative bg-slate-950">
      {/* Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-slate-950 -z-10" aria-hidden="true" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" aria-hidden="true"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" aria-hidden="true"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" aria-hidden="true" />

      <main className="max-w-4xl mx-auto p-6 relative" role="main">
        <nav className="mb-6" aria-label="Breadcrumb">
          <Link href="/">
            <Button variant="outline" className="gap-2 border-slate-700 text-white hover:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2" aria-label="Back to home">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Button>
          </Link>
        </nav>

        <article className="relative" aria-labelledby="dpa-heading">
          <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-violet-500/30 rounded-2xl blur opacity-40" aria-hidden="true" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500" size={80} duration={8} />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="relative" aria-hidden="true">
                  <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-purple-500/50 to-violet-500/50 rounded-lg blur opacity-75" />
                  <div className="relative p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                    <FileCheck className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <h1 id="dpa-heading">
                  <TextShimmer className="text-3xl font-bold text-white" duration={2}>
                    Data Processing Agreement
                  </TextShimmer>
                </h1>
              </div>
              <p className="text-gray-400 mt-2"><time dateTime="2026-01">Effective: January 2026</time></p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Introduction</h2>
                <p className="text-gray-300">
                  This Data Processing Agreement ("DPA") forms part of the agreement between you ("Customer", "Controller") and KAZI ("Processor") for the provision of services. This DPA reflects the parties' agreement regarding the processing of Personal Data in accordance with GDPR requirements.
                </p>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mt-4">
                  <p className="text-white font-semibold">📋 For Business Customers</p>
                  <p className="text-gray-300">
                    This DPA is intended for business customers who process personal data using the KAZI platform. If you are an individual user, please refer to our <Link href="/privacy" className="text-purple-400 hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">1. Definitions</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Personal Data:</strong> Any information relating to an identified or identifiable natural person as defined in GDPR Article 4(1)</li>
                  <li><strong className="text-white">Processing:</strong> Any operation performed on Personal Data as defined in GDPR Article 4(2)</li>
                  <li><strong className="text-white">Controller:</strong> The entity that determines the purposes and means of processing Personal Data</li>
                  <li><strong className="text-white">Processor:</strong> The entity that processes Personal Data on behalf of the Controller</li>
                  <li><strong className="text-white">Sub-processor:</strong> Any third party engaged by the Processor to process Personal Data</li>
                  <li><strong className="text-white">Data Subject:</strong> An identified or identifiable natural person</li>
                  <li><strong className="text-white">GDPR:</strong> Regulation (EU) 2016/679 - General Data Protection Regulation</li>
                  <li><strong className="text-white">Supervisory Authority:</strong> An independent public authority established by an EU Member State</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">2. Scope and Roles</h2>
                <p className="text-gray-300">
                  Under this DPA:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>The <strong className="text-white">Customer acts as the Controller</strong> and determines the purposes and means of processing Personal Data</li>
                  <li><strong className="text-white">KAZI acts as the Processor</strong> and processes Personal Data on behalf of the Customer according to documented instructions</li>
                  <li>Processing is limited to the <strong className="text-white">provision of services</strong> as described in the Terms of Service</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">3. Details of Processing</h2>

                <h3 className="text-xl font-semibold text-white mt-4">Subject Matter and Duration</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Subject Matter:</strong> Provision of project management, collaboration, and freelance workflow services</li>
                  <li><strong className="text-white">Duration:</strong> For the term of the subscription or service agreement</li>
                  <li><strong className="text-white">Nature and Purpose:</strong> To provide the Platform's features including project management, client collaboration, file storage, and communication tools</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6">Types of Personal Data</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Contact information (names, email addresses, phone numbers)</li>
                  <li>Account credentials and authentication data</li>
                  <li>Professional information (company name, role, work details)</li>
                  <li>Project and task data created by users</li>
                  <li>Communication content (messages, comments, files)</li>
                  <li>Payment information (processed through third-party payment processors)</li>
                  <li>Usage data and analytics</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6">Categories of Data Subjects</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Customer's employees and contractors</li>
                  <li>Customer's clients and end users</li>
                  <li>Third parties communicating with Customer through the Platform</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">4. Processor's Obligations</h2>
                <p className="text-gray-300">
                  KAZI, as Processor, shall:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Process Only on Instructions:</strong> Process Personal Data only on documented instructions from the Customer, unless required by law</li>
                  <li><strong className="text-white">Ensure Confidentiality:</strong> Ensure that persons authorized to process Personal Data have committed to confidentiality</li>
                  <li><strong className="text-white">Implement Security Measures:</strong> Implement appropriate technical and organizational measures (as detailed in Section 6)</li>
                  <li><strong className="text-white">Respect Sub-processor Requirements:</strong> Engage Sub-processors only with prior written consent (general or specific)</li>
                  <li><strong className="text-white">Assist with Data Subject Rights:</strong> Assist the Customer in responding to Data Subject requests</li>
                  <li><strong className="text-white">Assist with Compliance:</strong> Assist the Customer in ensuring compliance with GDPR obligations</li>
                  <li><strong className="text-white">Delete or Return Data:</strong> At Customer's choice, delete or return all Personal Data after termination</li>
                  <li><strong className="text-white">Demonstrate Compliance:</strong> Make available information necessary to demonstrate compliance</li>
                  <li><strong className="text-white">Notify of Breaches:</strong> Notify the Customer without undue delay upon becoming aware of a Personal Data breach</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">5. Sub-processors</h2>
                <p className="text-gray-300">
                  The Customer provides general authorization for KAZI to engage the following Sub-processors:
                </p>
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm text-gray-300 border border-gray-700 rounded-lg">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-white">Sub-processor</th>
                        <th className="px-4 py-2 text-left text-white">Service</th>
                        <th className="px-4 py-2 text-left text-white">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-700">
                        <td className="px-4 py-2">Supabase Inc.</td>
                        <td className="px-4 py-2">Database and authentication services</td>
                        <td className="px-4 py-2">USA (AWS infrastructure)</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-4 py-2">Vercel Inc.</td>
                        <td className="px-4 py-2">Hosting and CDN services</td>
                        <td className="px-4 py-2">USA (Global CDN)</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-4 py-2">Stripe Inc.</td>
                        <td className="px-4 py-2">Payment processing</td>
                        <td className="px-4 py-2">USA (Certified PCI DSS)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-gray-300 mt-4">
                  <strong className="text-white">Sub-processor Changes:</strong> KAZI will inform the Customer of any intended changes concerning the addition or replacement of Sub-processors at least 30 days in advance. The Customer may object to such changes on reasonable grounds relating to data protection.
                </p>
                <p className="text-gray-300">
                  <strong className="text-white">Sub-processor Obligations:</strong> KAZI will impose the same data protection obligations on Sub-processors as set out in this DPA through a contract or other legal act.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">6. Technical and Organizational Measures</h2>
                <p className="text-gray-300">
                  KAZI implements the following security measures to protect Personal Data:
                </p>

                <h3 className="text-xl font-semibold text-white mt-4">Access Control</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Multi-factor authentication (MFA) for user accounts</li>
                  <li>Role-based access control (RBAC) for administrative functions</li>
                  <li>Regular access reviews and revocation of unnecessary permissions</li>
                  <li>Unique user credentials and audit logging of access</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-4">Data Encryption</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>TLS 1.3 encryption for data in transit</li>
                  <li>AES-256 encryption for data at rest</li>
                  <li>Encrypted backups with secure key management</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-4">Infrastructure Security</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Firewalls and intrusion detection/prevention systems</li>
                  <li>Regular security updates and patch management</li>
                  <li>Network segmentation and isolation</li>
                  <li>DDoS protection and traffic monitoring</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-4">Organizational Measures</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Background checks for employees with data access</li>
                  <li>Mandatory data protection training for all staff</li>
                  <li>Confidentiality agreements with employees and contractors</li>
                  <li>Incident response plan and security incident management</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Business continuity and disaster recovery plans</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-4">Data Integrity and Availability</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Daily automated backups with 30-day retention</li>
                  <li>Redundant infrastructure and failover capabilities</li>
                  <li>99.9% uptime SLA commitment</li>
                  <li>Regular backup testing and restoration procedures</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">7. Data Subject Rights</h2>
                <p className="text-gray-300">
                  KAZI will assist the Customer in fulfilling Data Subject rights requests, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Right of access to Personal Data</li>
                  <li>Right to rectification of inaccurate data</li>
                  <li>Right to erasure ("right to be forgotten")</li>
                  <li>Right to restriction of processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                </ul>
                <p className="text-gray-300 mt-4">
                  Upon receiving a Data Subject request, KAZI will:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Forward the request to the Customer within 48 hours</li>
                  <li>Provide reasonable assistance in responding to the request</li>
                  <li>Comply with Customer's instructions regarding the request</li>
                  <li>Not respond directly to the Data Subject unless authorized by the Customer</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">8. Data Breach Notification</h2>
                <p className="text-gray-300">
                  In the event of a Personal Data breach, KAZI will:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Notify Promptly:</strong> Notify the Customer without undue delay and no later than 48 hours after becoming aware</li>
                  <li><strong className="text-white">Provide Details:</strong> Provide available information about the breach, including:
                    <ul className="list-circle pl-6 mt-2 space-y-1">
                      <li>Nature of the breach and categories of data affected</li>
                      <li>Approximate number of Data Subjects and records affected</li>
                      <li>Likely consequences of the breach</li>
                      <li>Measures taken or proposed to address the breach</li>
                    </ul>
                  </li>
                  <li><strong className="text-white">Cooperate:</strong> Cooperate with the Customer in investigating and remedying the breach</li>
                  <li><strong className="text-white">Assist with Notifications:</strong> Assist the Customer in complying with notification obligations to supervisory authorities and Data Subjects</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">9. International Data Transfers</h2>
                <p className="text-gray-300">
                  Personal Data may be transferred to and processed in countries outside the European Economic Area (EEA). KAZI ensures appropriate safeguards for such transfers:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Standard Contractual Clauses (SCCs):</strong> KAZI has implemented the European Commission's Standard Contractual Clauses with Sub-processors located outside the EEA</li>
                  <li><strong className="text-white">Adequacy Decisions:</strong> Where possible, data is transferred to countries deemed by the European Commission to provide adequate protection</li>
                  <li><strong className="text-white">Supplementary Measures:</strong> Additional technical and organizational measures are implemented to ensure data protection equivalent to GDPR standards</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">10. Audits and Compliance</h2>
                <p className="text-gray-300">
                  The Customer has the right to audit KAZI's compliance with this DPA:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Information Requests:</strong> KAZI will provide reasonable information about its data protection practices upon request</li>
                  <li><strong className="text-white">Audit Rights:</strong> The Customer may conduct audits or appoint an independent auditor, subject to:
                    <ul className="list-circle pl-6 mt-2 space-y-1">
                      <li>Reasonable advance notice (at least 30 days)</li>
                      <li>No more than once per year unless required by supervisory authority</li>
                      <li>Execution of a confidentiality agreement</li>
                      <li>No disruption to KAZI's business operations</li>
                      <li>Customer bears the cost of the audit</li>
                    </ul>
                  </li>
                  <li><strong className="text-white">Security Certifications:</strong> KAZI will maintain relevant security certifications (SOC 2, ISO 27001) and provide certificates upon request</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">11. Data Deletion and Return</h2>
                <p className="text-gray-300">
                  Upon termination of services or at Customer's request, KAZI will:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Customer Choice:</strong> At the Customer's option, delete or return all Personal Data</li>
                  <li><strong className="text-white">Deletion Timeline:</strong> Complete deletion within 30 days of termination or request</li>
                  <li><strong className="text-white">Export Capability:</strong> Provide data export functionality for Customer to retrieve data</li>
                  <li><strong className="text-white">Secure Deletion:</strong> Ensure secure deletion methods that prevent data recovery</li>
                  <li><strong className="text-white">Exceptions:</strong> Retain data only where required by law, with notification to Customer</li>
                  <li><strong className="text-white">Certification:</strong> Provide written certification of deletion upon request</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">12. Limitation of Liability</h2>
                <p className="text-gray-300">
                  Each party's liability under this DPA is subject to the limitations of liability set forth in the Terms of Service. For GDPR purposes, each party shall be liable for damages caused by processing where:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>It has not complied with GDPR obligations specifically directed to processors/controllers, or</li>
                  <li>It has acted outside or contrary to lawful instructions from the Controller</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">13. Term and Termination</h2>
                <p className="text-gray-300">
                  This DPA:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Comes into effect on the date of the Customer's acceptance of the Terms of Service</li>
                  <li>Remains in effect for the duration of the service agreement</li>
                  <li>Survives termination to the extent necessary to allow the parties to comply with their obligations under the GDPR</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">14. Governing Law</h2>
                <p className="text-gray-300">
                  This DPA shall be governed by and construed in accordance with the laws applicable to the Terms of Service. For matters not addressed in this DPA, the GDPR and applicable data protection laws shall apply.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">15. Contact Information</h2>
                <p className="text-gray-300">
                  For questions or concerns regarding this DPA or data processing practices:
                </p>
                <ul className="list-none space-y-1 text-gray-300" role="list">
                  <li role="listitem">Email: <a href="mailto:dpo@kazi.com" className="text-purple-400 hover:underline focus:outline-none focus:underline">dpo@kazi.com</a></li>
                  <li role="listitem">Subject: "Data Processing Agreement Inquiry"</li>
                  <li role="listitem">For urgent matters: <a href="mailto:security@kazi.com" className="text-purple-400 hover:underline">security@kazi.com</a></li>
                </ul>
              </section>

              <section className="space-y-4 mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white">Acceptance</h2>
                <p className="text-gray-300">
                  By using KAZI's services, the Customer acknowledges that it has read and understood this DPA and agrees to be bound by its terms. This DPA forms an integral part of the Terms of Service.
                </p>
                <p className="text-gray-300 mt-4">
                  <strong className="text-white">Last Updated:</strong> January 2026
                </p>
                <p className="text-gray-300">
                  <strong className="text-white">Version:</strong> 1.0
                </p>
              </section>
            </CardContent>
          </LiquidGlassCard>
        </article>
      </main>
    </div>
  )
}
