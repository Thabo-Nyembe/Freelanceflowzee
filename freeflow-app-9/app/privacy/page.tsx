'use client'

import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, Eye, Settings, Mail, Calendar } from 'lucide-react'

const sections = [
  {
    id: 'information-collection',
    title: 'Information We Collect',
    icon: Eye,
    content: [
      {
        subtitle: 'Personal Information',
        text: 'We collect information you provide directly to us, such as when you create an account, use our services, contact us, or participate in surveys. This may include your name, email address, phone number, billing information, and profile information.'
      },
      {
        subtitle: 'Usage Information',
        text: 'We automatically collect information about your use of our services, including your IP address, browser type, operating system, referring URLs, access times, and pages viewed.'
      },
      {
        subtitle: 'File and Project Data',
        text: 'We store files and project information you upload to our platform to provide our services. This includes documents, images, videos, and other content you share through FreeflowZee.'
      }
    ]
  },
  {
    id: 'information-use',
    title: 'How We Use Your Information',
    icon: Settings,
    content: [
      {
        subtitle: 'Service Provision',
        text: 'We use your information to provide, maintain, and improve our services, process transactions, and communicate with you about your account and our services.'
      },
      {
        subtitle: 'Communication',
        text: 'We may send you technical notices, updates, security alerts, and support and administrative messages. We may also send promotional communications with your consent.'
      },
      {
        subtitle: 'Analytics and Improvement',
        text: 'We use analytics to understand how our services are used and to improve user experience, develop new features, and enhance security.'
      }
    ]
  },
  {
    id: 'information-sharing',
    title: 'Information Sharing and Disclosure',
    icon: Shield,
    content: [
      {
        subtitle: 'Service Providers',
        text: 'We may share your information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, and customer service.'
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., court orders or government agencies).'
      },
      {
        subtitle: 'Business Transfers',
        text: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.'
      }
    ]
  },
  {
    id: 'data-security',
    title: 'Data Security',
    icon: Lock,
    content: [
      {
        subtitle: 'Encryption',
        text: 'We use industry-standard encryption to protect your data both in transit and at rest. All data transmission is secured using SSL/TLS protocols.'
      },
      {
        subtitle: 'Access Controls',
        text: 'We implement strict access controls and regularly review who has access to your information. Our employees undergo background checks and security training.'
      },
      {
        subtitle: 'Regular Audits',
        text: 'We conduct regular security audits and assessments to identify and address potential vulnerabilities in our systems.'
      }
    ]
  }
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Shield className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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
                FreeflowZee ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (collectively, the "Service").
              </p>
              <p className="text-gray-600 mb-6">
                By using our Service, you agree to the collection and use of information in accordance with this policy. This Privacy Policy applies to all users of our Service, including both free and paid accounts.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Your Rights:</strong> You have the right to access, update, or delete your personal information at any time. Contact us at{' '}
                      <Link href="mailto:privacy@freelanceflowzee.com" className="underline">
                        privacy@freelanceflowzee.com
                      </Link>{' '}
                      with any questions about your data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Sections */}
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

        {/* Your Rights Section */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Settings className="w-8 h-8 text-indigo-600 mr-3" />
                  Your Rights and Choices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Access and Update</h4>
                  <p className="text-gray-600 leading-relaxed">
                    You can access and update your personal information through your account settings. If you need assistance, contact our support team.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Data Portability</h4>
                  <p className="text-gray-600 leading-relaxed">
                    You have the right to request a copy of your data in a portable format. We will provide your data in a commonly used, machine-readable format.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Deletion</h4>
                  <p className="text-gray-600 leading-relaxed">
                    You can delete your account and associated data at any time. Some information may be retained for legal or operational purposes as outlined in this policy.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Marketing Communications</h4>
                  <p className="text-gray-600 leading-relaxed">
                    You can opt out of marketing communications at any time by clicking the unsubscribe link in our emails or updating your communication preferences in your account settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Compliance Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Shield className="w-8 h-8 text-indigo-600 mr-3" />
                  Compliance and Regulations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">GDPR Compliance</h4>
                  <p className="text-gray-600 leading-relaxed">
                    For users in the European Union, we comply with the General Data Protection Regulation (GDPR). This includes providing clear consent mechanisms, data portability rights, and the right to be forgotten.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">CCPA Compliance</h4>
                  <p className="text-gray-600 leading-relaxed">
                    For California residents, we comply with the California Consumer Privacy Act (CCPA). You have the right to know what personal information we collect, sell, or disclose about you.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">International Transfers</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Mail className="w-8 h-8 text-indigo-600 mr-3" />
                  Contact Us About Privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-6">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>Email:</strong>{' '}
                    <Link href="mailto:privacy@freelanceflowzee.com" className="text-indigo-600 hover:text-indigo-700">
                      privacy@freelanceflowzee.com
                    </Link>
                  </p>
                  <p className="text-gray-700">
                    <strong>Address:</strong> 123 Privacy Lane, San Francisco, CA 94105
                  </p>
                  <p className="text-gray-700">
                    <strong>Response Time:</strong> We will respond to privacy inquiries within 30 days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Updates Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Policy Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                  <li>Posting the updated policy on our website</li>
                  <li>Sending an email notification to registered users</li>
                  <li>Displaying a prominent notice on our platform</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  Your continued use of our services after the effective date of the updated Privacy Policy constitutes acceptance of the changes.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 