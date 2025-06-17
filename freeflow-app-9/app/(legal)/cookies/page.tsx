'use client'

import Link from 'next/link'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Cookie, Shield, Settings, Info, CheckCircle } from 'lucide-react'

const cookieTypes = [
  {
    name: 'Essential Cookies',
    purpose: 'Required for basic website functionality',
    examples: ['Authentication', 'Security', 'Site preferences'],
    canDisable: false,
    duration: 'Session'
  },
  {
    name: 'Analytics Cookies',
    purpose: 'Help us understand how visitors use our website',
    examples: ['Page views', 'User behavior', 'Performance metrics'],
    canDisable: true,
    duration: '2 years'
  },
  {
    name: 'Marketing Cookies',
    purpose: 'Used to deliver relevant advertisements',
    examples: ['Ad personalization', 'Campaign tracking', 'Retargeting'],
    canDisable: true,
    duration: '1 year'
  },
  {
    name: 'Functional Cookies',
    purpose: 'Enable enhanced functionality and personalization',
    examples: ['Language preferences', 'Theme settings', 'Chat support'],
    canDisable: true,
    duration: '1 year'
  }
]

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-6 bg-indigo-100 text-indigo-800 px-4 py-2">
              <Cookie className="w-4 h-4 mr-2" />
              Transparency & Control
            </Badge>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Cookie
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Policy</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Learn about how we use cookies and similar technologies to improve your experience on FreeflowZee.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-left max-w-3xl mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Last updated:</strong> December 15, 2024. We may update this policy from time to time. 
                    We'll notify you of any significant changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Are Cookies */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Cookie className="w-8 h-8 text-indigo-600 mr-3" />
                  What Are Cookies?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 leading-relaxed">
                  Cookies are small text files that are stored on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences, 
                  keeping you signed in, and helping us understand how you use our platform.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">First-Party Cookies</h4>
                    <p className="text-gray-600">
                      Set directly by FreeflowZee when you visit our website. We use these to provide 
                      core functionality and improve your experience.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Third-Party Cookies</h4>
                    <p className="text-gray-600">
                      Set by external services we use, such as analytics providers or payment processors. 
                      These help us understand usage patterns and process payments securely.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cookie Types */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Types of Cookies We Use
              </h2>
              <p className="text-lg text-gray-600">
                We use different types of cookies for various purposes
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {cookieTypes.map((type) => (
                <Card key={type.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{type.name}</CardTitle>
                      <Badge 
                        className={type.canDisable 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      >
                        {type.canDisable ? 'Optional' : 'Required'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">
                      {type.purpose}
                    </p>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Examples:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {type.examples.map((example, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Duration:</span>
                        <span className="text-gray-900">{type.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Managing Cookies */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Settings className="w-8 h-8 text-indigo-600 mr-3" />
                  Managing Your Cookie Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 leading-relaxed">
                  You have control over which cookies we use. You can manage your preferences through 
                  our cookie banner when you first visit our site, or change them at any time using 
                  the options below.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Browser Settings</h4>
                    <p className="text-gray-600 text-sm">
                      Most web browsers allow you to control cookies through their settings. 
                      You can block all cookies, allow only first-party cookies, or delete existing cookies.
                    </p>
                    <div className="space-y-2 text-sm">
                      <Link href="https://support.google.com/chrome/answer/95647" className="block text-indigo-600 hover:text-indigo-700">
                        Chrome Cookie Settings →
                      </Link>
                      <Link href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" className="block text-indigo-600 hover:text-indigo-700">
                        Firefox Cookie Settings →
                      </Link>
                      <Link href="https://support.apple.com/en-us/HT201265" className="block text-indigo-600 hover:text-indigo-700">
                        Safari Cookie Settings →
                      </Link>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Account Settings</h4>
                    <p className="text-gray-600 text-sm">
                      When you're signed in to FreeflowZee, you can manage your privacy preferences 
                      directly from your account settings.
                    </p>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Preferences
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Shield className="w-8 h-8 text-indigo-600 mr-3" />
                  Questions About Cookies?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-6">
                  If you have any questions about our use of cookies or this Cookie Policy, 
                  please don't hesitate to contact us.
                </p>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>Email:</strong>{' '}
                    <Link href="mailto:privacy@freeflowzee.com" className="text-indigo-600 hover:text-indigo-700">
                      privacy@freeflowzee.com
                    </Link>
                  </p>
                  <p className="text-gray-700">
                    <strong>Privacy Officer:</strong> Available Monday-Friday, 9 AM - 5 PM PST
                  </p>
                  <p className="text-gray-700">
                    <strong>Response Time:</strong> We aim to respond to all privacy inquiries within 3 business days
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Related Policies
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/privacy">
                <Button variant="outline" size="lg">
                  Privacy Policy
                </Button>
              </Link>
              <Link href="/terms">
                <Button variant="outline" size="lg">
                  Terms of Service
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 