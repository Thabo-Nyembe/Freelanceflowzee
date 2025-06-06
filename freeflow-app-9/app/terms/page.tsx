'use client'

import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Scale, Users, CreditCard, Shield, AlertTriangle, Calendar, Mail } from 'lucide-react'

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    icon: Scale,
    content: [
      {
        subtitle: 'Agreement to Terms',
        text: 'By accessing or using FreeflowZee ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.'
      },
      {
        subtitle: 'Eligibility',
        text: 'You must be at least 18 years old to use this Service. By using the Service, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.'
      },
      {
        subtitle: 'Entity Use',
        text: 'If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.'
      }
    ]
  },
  {
    id: 'service-description',
    title: 'Service Description',
    icon: FileText,
    content: [
      {
        subtitle: 'Platform Overview',
        text: 'FreeflowZee is a platform that enables creators, freelancers, and businesses to showcase their work, manage client relationships, and process payments for creative services.'
      },
      {
        subtitle: 'Service Features',
        text: 'Our Service includes project hosting, file sharing, client collaboration tools, payment processing, analytics, and related features as described on our website.'
      },
      {
        subtitle: 'Service Availability',
        text: 'While we strive to maintain high availability, we do not guarantee that the Service will be available 100% of the time. Scheduled maintenance and unexpected downtime may occur.'
      }
    ]
  },
  {
    id: 'user-accounts',
    title: 'User Accounts and Responsibilities',
    icon: Users,
    content: [
      {
        subtitle: 'Account Creation',
        text: 'To use certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.'
      },
      {
        subtitle: 'Account Security',
        text: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.'
      },
      {
        subtitle: 'Account Termination',
        text: 'We reserve the right to suspend or terminate your account at any time for violation of these Terms or other reasons we deem appropriate, with or without notice.'
      }
    ]
  },
  {
    id: 'payment-terms',
    title: 'Payment and Billing',
    icon: CreditCard,
    content: [
      {
        subtitle: 'Subscription Fees',
        text: 'Certain features of the Service require payment of subscription fees. All fees are non-refundable except as expressly stated in our refund policy.'
      },
      {
        subtitle: 'Payment Processing',
        text: 'Payments are processed through third-party payment processors. You agree to their terms and conditions in addition to these Terms.'
      },
      {
        subtitle: 'Transaction Fees',
        text: 'We may charge transaction fees for payments processed through the platform. All applicable fees will be clearly disclosed before you complete a transaction.'
      },
      {
        subtitle: 'Billing Disputes',
        text: 'Any billing disputes must be reported within 60 days of the charge. We will investigate and resolve disputes in good faith.'
      }
    ]
  }
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-50 to-indigo-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Scale className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Please read these terms carefully before using FreeflowZee. They govern your use of our platform and services.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last updated: December 15, 2024</span>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sections.map((section) => (
                <Link
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <section.icon className="w-4 h-4" />
                  <span>{section.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Introduction</h2>
              <p className="text-gray-600 mb-6">
                These Terms of Service ("Terms") govern your use of the FreeflowZee website and services operated by FreeflowZee, Inc. ("we," "our," or "us"). 
                These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
              <p className="text-gray-600 mb-6">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, 
                then you may not access the Service.
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-700">
                      <strong>Important:</strong> These Terms constitute a legally binding agreement between you and FreeflowZee. 
                      Please read them carefully and contact us at{' '}
                      <Link href="mailto:legal@freelanceflowzee.com" className="underline">
                        legal@freelanceflowzee.com
                      </Link>{' '}
                      if you have any questions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Sections */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {sections.map((section) => (
              <Card key={section.id} id={section.id} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <section.icon className="w-8 h-8 text-indigo-600 mr-3" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.content.map((item, index) => (
                    <div key={index}>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        {item.subtitle}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Acceptable Use Policy */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Shield className="w-8 h-8 text-indigo-600 mr-3" />
                  Acceptable Use Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Permitted Uses</h4>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    You may use the Service only for lawful purposes and in accordance with these Terms. You agree to use the Service responsibly and professionally.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Prohibited Activities</h4>
                  <p className="text-gray-600 leading-relaxed mb-4">You agree not to:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe on intellectual property rights of others</li>
                    <li>Upload malicious code, viruses, or harmful content</li>
                    <li>Engage in harassment, abuse, or hate speech</li>
                    <li>Spam or send unsolicited communications</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Use the Service for illegal or fraudulent activities</li>
                    <li>Impersonate others or provide false information</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Content Guidelines</h4>
                  <p className="text-gray-600 leading-relaxed">
                    All content uploaded to the platform must comply with our community guidelines. We reserve the right to remove content that violates these guidelines or our Terms.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <FileText className="w-8 h-8 text-indigo-600 mr-3" />
                  Intellectual Property Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Your Content</h4>
                  <p className="text-gray-600 leading-relaxed">
                    You retain ownership of all content you upload to the Service. By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to host, store, and display your content as necessary to provide the Service.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Our Platform</h4>
                  <p className="text-gray-600 leading-relaxed">
                    The Service and its original content, features, and functionality are owned by FreeflowZee and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">DMCA Compliance</h4>
                  <p className="text-gray-600 leading-relaxed">
                    We respect intellectual property rights and comply with the Digital Millennium Copyright Act (DMCA). If you believe your copyright has been infringed, please contact us with a detailed notice.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <AlertTriangle className="w-8 h-8 text-indigo-600 mr-3" />
                  Disclaimers and Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Service Disclaimer</h4>
                  <p className="text-gray-600 leading-relaxed">
                    The Service is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the Service's availability, reliability, or suitability for any purpose.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Limitation of Liability</h4>
                  <p className="text-gray-600 leading-relaxed">
                    To the maximum extent permitted by law, FreeflowZee shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Maximum Liability</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Our total liability to you for all claims arising from or relating to the Service shall not exceed the amount you paid us in the twelve months preceding the claim.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Termination */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Termination by You</h4>
                  <p className="text-gray-600 leading-relaxed">
                    You may terminate your account at any time by contacting us or using the account deletion feature in your settings. Upon termination, your right to use the Service will cease immediately.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Termination by Us</h4>
                  <p className="text-gray-600 leading-relaxed">
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including if you breach these Terms.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Effect of Termination</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Upon termination, all provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Governing Law */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Scale className="w-8 h-8 text-indigo-600 mr-3" />
                  Governing Law and Dispute Resolution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Governing Law</h4>
                  <p className="text-gray-600 leading-relaxed">
                    These Terms shall be interpreted and enforced in accordance with the laws of the State of California, United States, without regard to conflict of law provisions.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Dispute Resolution</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Any disputes arising from these Terms or your use of the Service will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Jurisdiction</h4>
                  <p className="text-gray-600 leading-relaxed">
                    You agree that any legal action or proceeding between you and FreeflowZee shall be brought exclusively in the federal or state courts located in San Francisco, California.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact and Changes */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Mail className="w-6 h-6 text-indigo-600 mr-3" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    If you have any questions about these Terms, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Email:</strong>{' '}
                      <Link href="mailto:legal@freelanceflowzee.com" className="text-indigo-600 hover:text-indigo-700">
                        legal@freelanceflowzee.com
                      </Link>
                    </p>
                    <p className="text-gray-700">
                      <strong>Address:</strong> 123 Legal Street, San Francisco, CA 94105
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Calendar className="w-6 h-6 text-indigo-600 mr-3" />
                    Changes to Terms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    We reserve the right to modify these Terms at any time. We will notify users of material changes by:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Email notification</li>
                    <li>Platform announcements</li>
                    <li>Updated effective date</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 