'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'
import { ArrowLeft, Cookie } from 'lucide-react'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen relative bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-slate-900 to-slate-950 -z-10" aria-hidden="true" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" aria-hidden="true"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" aria-hidden="true"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" aria-hidden="true" />

      <main className="max-w-4xl mx-auto p-6 relative" role="main">
        <nav className="mb-6" aria-label="Breadcrumb">
          <Link href="/">
            <Button variant="outline" className="gap-2 border-slate-700 text-white hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </nav>

        <article className="relative">
          <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 to-amber-500/30 rounded-2xl blur opacity-40" aria-hidden="true" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" size={80} duration={8} />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-orange-500/50 to-amber-500/50 rounded-lg blur opacity-75" />
                  <div className="relative p-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg">
                    <Cookie className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h1>
                  <TextShimmer className="text-3xl font-bold text-white" duration={2}>
                    Cookie Policy
                  </TextShimmer>
                </h1>
              </div>
              <p className="text-gray-400 mt-2">Last updated: January 2025</p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">1. What Are Cookies?</h2>
                <p className="text-gray-300">
                  Cookies are small text files that are placed on your device when you visit our website. They are widely used to make websites work more efficiently, provide a better user experience, and provide information to website owners.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">2. How We Use Cookies</h2>
                <p className="text-gray-300">
                  We use cookies to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Keep you signed in to your account</li>
                  <li>Remember your preferences and settings</li>
                  <li>Understand how you use our platform</li>
                  <li>Improve our services and user experience</li>
                  <li>Deliver relevant content and advertisements</li>
                  <li>Protect against fraud and improve security</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">3. Types of Cookies We Use</h2>

                <div className="space-y-6 mt-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Necessary Cookies
                    </h3>
                    <p className="text-gray-300 mb-2">
                      <span className="text-orange-400 font-medium">Required</span> - These cookies are essential for the website to function properly.
                    </p>
                    <table className="w-full text-sm text-gray-300 mt-3">
                      <thead className="text-gray-400 border-b border-slate-700">
                        <tr>
                          <th className="text-left pb-2">Cookie Name</th>
                          <th className="text-left pb-2">Purpose</th>
                          <th className="text-left pb-2">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        <tr>
                          <td className="py-2"><code>next-auth.session-token</code></td>
                          <td className="py-2">User authentication</td>
                          <td className="py-2">30 days</td>
                        </tr>
                        <tr>
                          <td className="py-2"><code>XSRF-TOKEN</code></td>
                          <td className="py-2">Security/CSRF protection</td>
                          <td className="py-2">Session</td>
                        </tr>
                        <tr>
                          <td className="py-2"><code>cookie-preferences</code></td>
                          <td className="py-2">Cookie consent choices</td>
                          <td className="py-2">1 year</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Functional Cookies
                    </h3>
                    <p className="text-gray-300 mb-2">
                      <span className="text-blue-400 font-medium">Optional</span> - These cookies enable enhanced functionality and personalization.
                    </p>
                    <table className="w-full text-sm text-gray-300 mt-3">
                      <thead className="text-gray-400 border-b border-slate-700">
                        <tr>
                          <th className="text-left pb-2">Cookie Name</th>
                          <th className="text-left pb-2">Purpose</th>
                          <th className="text-left pb-2">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        <tr>
                          <td className="py-2"><code>user-preferences</code></td>
                          <td className="py-2">Theme, language settings</td>
                          <td className="py-2">1 year</td>
                        </tr>
                        <tr>
                          <td className="py-2"><code>dashboard-layout</code></td>
                          <td className="py-2">Saved dashboard configuration</td>
                          <td className="py-2">1 year</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Analytics Cookies
                    </h3>
                    <p className="text-gray-300 mb-2">
                      <span className="text-blue-400 font-medium">Optional</span> - These cookies help us understand how visitors interact with our website.
                    </p>
                    <table className="w-full text-sm text-gray-300 mt-3">
                      <thead className="text-gray-400 border-b border-slate-700">
                        <tr>
                          <th className="text-left pb-2">Cookie Name</th>
                          <th className="text-left pb-2">Purpose</th>
                          <th className="text-left pb-2">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        <tr>
                          <td className="py-2"><code>_ga</code></td>
                          <td className="py-2">Google Analytics - unique user ID</td>
                          <td className="py-2">2 years</td>
                        </tr>
                        <tr>
                          <td className="py-2"><code>_ga_*</code></td>
                          <td className="py-2">Google Analytics - session state</td>
                          <td className="py-2">2 years</td>
                        </tr>
                        <tr>
                          <td className="py-2"><code>__vercel_analytics</code></td>
                          <td className="py-2">Vercel Analytics - usage tracking</td>
                          <td className="py-2">Session</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Marketing Cookies
                    </h3>
                    <p className="text-gray-300 mb-2">
                      <span className="text-blue-400 font-medium">Optional</span> - These cookies are used to deliver relevant advertisements.
                    </p>
                    <table className="w-full text-sm text-gray-300 mt-3">
                      <thead className="text-gray-400 border-b border-slate-700">
                        <tr>
                          <th className="text-left pb-2">Cookie Name</th>
                          <th className="text-left pb-2">Purpose</th>
                          <th className="text-left pb-2">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        <tr>
                          <td className="py-2"><code>_fbp</code></td>
                          <td className="py-2">Facebook Pixel - ad targeting</td>
                          <td className="py-2">3 months</td>
                        </tr>
                        <tr>
                          <td className="py-2"><code>IDE</code></td>
                          <td className="py-2">Google DoubleClick - ad serving</td>
                          <td className="py-2">1 year</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">4. Third-Party Cookies</h2>
                <p className="text-gray-300">
                  We use services from third-party companies that may set cookies on your device. These include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Google Analytics</strong> - for website analytics</li>
                  <li><strong className="text-white">Stripe</strong> - for payment processing</li>
                  <li><strong className="text-white">Vercel</strong> - for hosting and analytics</li>
                  <li><strong className="text-white">Supabase</strong> - for authentication and data storage</li>
                </ul>
                <p className="text-gray-300 mt-4">
                  These companies have their own privacy policies that explain how they use cookies. We recommend reviewing:
                </p>
                <ul className="list-none space-y-2 text-gray-300 mt-2">
                  <li><a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Google's Cookie Policy</a></li>
                  <li><a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Stripe's Cookie Policy</a></li>
                  <li><a href="https://vercel.com/legal/cookie-policy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Vercel's Cookie Policy</a></li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">5. Managing Your Cookie Preferences</h2>
                <p className="text-gray-300">
                  You have several options to manage cookies:
                </p>

                <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded-lg mt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Cookie Consent Banner</h3>
                  <p className="text-gray-300">
                    When you first visit our website, you'll see a cookie consent banner where you can:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-300 mt-2">
                    <li>Accept all cookies</li>
                    <li>Accept only necessary cookies</li>
                    <li>Customize your preferences</li>
                  </ul>
                </div>

                <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded-lg mt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Dashboard Settings</h3>
                  <p className="text-gray-300">
                    Change your cookie preferences anytime in your{' '}
                    <Link href="/dashboard/settings/privacy" className="text-orange-400 hover:underline">
                      Privacy Settings
                    </Link>.
                  </p>
                </div>

                <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded-lg mt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Browser Settings</h3>
                  <p className="text-gray-300">
                    Most browsers allow you to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-300 mt-2">
                    <li>View cookies stored on your device</li>
                    <li>Delete cookies</li>
                    <li>Block cookies from specific websites</li>
                    <li>Block all cookies</li>
                  </ul>
                  <p className="text-gray-400 text-sm mt-2">
                    Note: Blocking all cookies may affect website functionality.
                  </p>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">6. Browser-Specific Instructions</h2>
                <p className="text-gray-300">
                  To manage cookies in your browser:
                </p>
                <ul className="list-none space-y-2 text-gray-300">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Safari</a></li>
                  <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Microsoft Edge</a></li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">7. Do Not Track Signals</h2>
                <p className="text-gray-300">
                  Some browsers have a "Do Not Track" (DNT) feature that signals websites you visit that you do not want your online activity tracked. Currently, there is no uniform standard for how DNT signals should be interpreted. We do not currently respond to DNT signals, but we respect your cookie preferences set through our cookie consent mechanism.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">8. Updates to This Policy</h2>
                <p className="text-gray-300">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Cookie Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">9. Contact Us</h2>
                <p className="text-gray-300">
                  If you have questions about our use of cookies, please contact us:
                </p>
                <ul className="list-none space-y-1 text-gray-300">
                  <li>Email: <a href="mailto:privacy@kazi.com" className="text-orange-400 hover:underline">privacy@kazi.com</a></li>
                  <li>Website: <Link href="/contact" className="text-orange-400 hover:underline">Contact Form</Link></li>
                </ul>
              </section>

              <div className="bg-orange-900/20 border border-orange-700/50 p-4 rounded-lg mt-8">
                <h3 className="text-lg font-semibold text-white mb-2">Related Policies</h3>
                <ul className="list-none space-y-2 text-gray-300">
                  <li>
                    <Link href="/privacy" className="text-orange-400 hover:underline">
                      Privacy Policy
                    </Link> - How we collect and use your personal information
                  </li>
                  <li>
                    <Link href="/terms" className="text-orange-400 hover:underline">
                      Terms of Service
                    </Link> - Rules and regulations for using KAZI
                  </li>
                </ul>
              </div>
            </CardContent>
          </LiquidGlassCard>
        </article>
      </main>
    </div>
  )
}
