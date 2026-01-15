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
      {/* Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-slate-900 to-slate-950 -z-10" aria-hidden="true" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" aria-hidden="true"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" aria-hidden="true"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" aria-hidden="true" />

      <main className="max-w-4xl mx-auto p-6 relative" role="main">
        <nav className="mb-6" aria-label="Breadcrumb">
          <Link href="/">
            <Button variant="outline" className="gap-2 border-slate-700 text-white hover:bg-slate-800 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2" aria-label="Back to home">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Button>
          </Link>
        </nav>

        <article className="relative" aria-labelledby="cookie-heading">
          <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 to-amber-500/30 rounded-2xl blur opacity-40" aria-hidden="true" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" size={80} duration={8} />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="relative" aria-hidden="true">
                  <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-orange-500/50 to-amber-500/50 rounded-lg blur opacity-75" />
                  <div className="relative p-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg">
                    <Cookie className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <h1 id="cookie-heading">
                  <TextShimmer className="text-3xl font-bold text-white" duration={2}>
                    Cookie Policy
                  </TextShimmer>
                </h1>
              </div>
              <p className="text-gray-400 mt-2"><time dateTime="2026-01">Last updated: January 2026</time></p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">1. What Are Cookies?</h2>
                <p className="text-gray-300">
                  Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
                </p>
                <p className="text-gray-300">
                  KAZI uses cookies and similar tracking technologies to enhance your experience, analyze usage, and provide personalized content.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">2. Types of Cookies We Use</h2>

                <h3 className="text-xl font-semibold text-white mt-4">Essential Cookies (Strictly Necessary)</h3>
                <p className="text-gray-300">
                  These cookies are required for the Platform to function and cannot be disabled in our systems. They are usually set in response to actions you take, such as logging in or filling in forms.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-300 border border-gray-700 rounded-lg mt-4">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-white">Cookie Name</th>
                        <th className="px-4 py-2 text-left text-white">Purpose</th>
                        <th className="px-4 py-2 text-left text-white">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-700">
                        <td className="px-4 py-2">supabase-auth-token</td>
                        <td className="px-4 py-2">Authentication and session management</td>
                        <td className="px-4 py-2">7 days</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-4 py-2">csrf_token</td>
                        <td className="px-4 py-2">Security - prevent cross-site request forgery</td>
                        <td className="px-4 py-2">Session</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-4 py-2">cookie-consent</td>
                        <td className="px-4 py-2">Remember your cookie preferences</td>
                        <td className="px-4 py-2">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-white mt-6">Functional Cookies</h3>
                <p className="text-gray-300">
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-300 border border-gray-700 rounded-lg mt-4">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-white">Cookie Name</th>
                        <th className="px-4 py-2 text-left text-white">Purpose</th>
                        <th className="px-4 py-2 text-left text-white">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-700">
                        <td className="px-4 py-2">theme-preference</td>
                        <td className="px-4 py-2">Remember dark/light mode preference</td>
                        <td className="px-4 py-2">1 year</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-4 py-2">language-preference</td>
                        <td className="px-4 py-2">Remember your language selection</td>
                        <td className="px-4 py-2">1 year</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-4 py-2">sidebar-state</td>
                        <td className="px-4 py-2">Remember sidebar collapsed/expanded state</td>
                        <td className="px-4 py-2">30 days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-white mt-6">Analytics Cookies</h3>
                <p className="text-gray-300">
                  These cookies help us understand how visitors interact with our Platform by collecting and reporting information anonymously.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-300 border border-gray-700 rounded-lg mt-4">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-white">Cookie Name</th>
                        <th className="px-4 py-2 text-left text-white">Purpose</th>
                        <th className="px-4 py-2 text-left text-white">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-700">
                        <td className="px-4 py-2">_ga</td>
                        <td className="px-4 py-2">Google Analytics - distinguish users</td>
                        <td className="px-4 py-2">2 years</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-4 py-2">_ga_*</td>
                        <td className="px-4 py-2">Google Analytics - persist session state</td>
                        <td className="px-4 py-2">2 years</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-4 py-2">analytics_session</td>
                        <td className="px-4 py-2">Track session duration and page views</td>
                        <td className="px-4 py-2">Session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-white mt-6">Marketing Cookies</h3>
                <p className="text-gray-300">
                  These cookies track your online activity to help us deliver more relevant advertising and limit the number of times you see an advertisement.
                </p>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mt-4">
                  <p className="text-white font-semibold">We Currently Do Not Use Marketing Cookies</p>
                  <p className="text-gray-300">
                    KAZI does not currently use third-party marketing or advertising cookies. If this changes, we will update this policy and request your consent.
                  </p>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">3. Third-Party Cookies</h2>
                <p className="text-gray-300">
                  Some cookies are placed by third-party services that appear on our pages. We have no control over these cookies. These third parties include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Supabase:</strong> Authentication and database services</li>
                  <li><strong className="text-white">Stripe:</strong> Payment processing (cookies set on Stripe checkout pages)</li>
                  <li><strong className="text-white">Vercel:</strong> Hosting and performance analytics</li>
                </ul>
                <p className="text-gray-300 mt-4">
                  These third parties have their own privacy policies and cookie policies:
                </p>
                <ul className="list-none space-y-1 text-gray-300">
                  <li>• <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Supabase Privacy Policy</a></li>
                  <li>• <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Stripe Privacy Policy</a></li>
                  <li>• <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Vercel Privacy Policy</a></li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">4. How to Manage Cookies</h2>
                <p className="text-gray-300">
                  You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences through:
                </p>

                <h3 className="text-xl font-semibold text-white mt-4">Browser Settings</h3>
                <p className="text-gray-300">
                  Most web browsers allow you to control cookies through their settings. Here's how to manage cookies in popular browsers:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong className="text-white">Mozilla Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                  <li><strong className="text-white">Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                  <li><strong className="text-white">Microsoft Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>
                <p className="text-gray-300 mt-4">
                  For more information, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">AboutCookies.org</a> or <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">AllAboutCookies.org</a>.
                </p>

                <h3 className="text-xl font-semibold text-white mt-6">Opt-Out of Analytics</h3>
                <p className="text-gray-300">
                  To opt out of Google Analytics, install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Google Analytics Opt-out Browser Add-on</a>.
                </p>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
                  <p className="text-white font-semibold">⚠️ Impact of Disabling Cookies</p>
                  <p className="text-gray-300">
                    Disabling cookies may affect your ability to use certain features of the Platform. Essential cookies are required for basic functionality and cannot be disabled without affecting your user experience.
                  </p>
                </div>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">5. Do Not Track Signals</h2>
                <p className="text-gray-300">
                  Some browsers have a "Do Not Track" (DNT) feature that signals websites you visit that you do not want to have your online activity tracked. We currently do not respond to DNT signals, but we respect your privacy choices made through browser and platform settings.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">6. Mobile Device Identifiers</h2>
                <p className="text-gray-300">
                  When you use our mobile applications, we may collect mobile device identifiers and use mobile analytics software to understand usage patterns. You can manage these through your device settings:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong className="text-white">iOS:</strong> Settings → Privacy → Tracking → Allow Apps to Request to Track (toggle off)</li>
                  <li><strong className="text-white">Android:</strong> Settings → Google → Ads → Opt out of Ads Personalization (toggle on)</li>
                </ul>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">7. Updates to This Cookie Policy</h2>
                <p className="text-gray-300">
                  We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business practices. We will notify you of any material changes by posting the updated policy on this page with a new "Last updated" date.
                </p>
                <p className="text-gray-300">
                  We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold text-white">8. Contact Us</h2>
                <p className="text-gray-300">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
                </p>
                <ul className="list-none space-y-1 text-gray-300" role="list">
                  <li role="listitem">Email: <a href="mailto:privacy@kazi.com" className="text-orange-400 hover:underline focus:outline-none focus:underline">privacy@kazi.com</a></li>
                  <li role="listitem">Subject: "Cookie Policy Inquiry"</li>
                  <li role="listitem">Website: <Link href="/contact" className="text-orange-400 hover:underline focus:outline-none focus:underline">Contact Form</Link></li>
                </ul>
              </section>

              <section className="space-y-4 mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white">Related Policies</h2>
                <p className="text-gray-300">
                  For more information about how we protect your privacy, please review:
                </p>
                <ul className="list-none space-y-2 text-gray-300">
                  <li>• <Link href="/privacy" className="text-orange-400 hover:underline">Privacy Policy</Link> - How we collect and use your personal data</li>
                  <li>• <Link href="/terms" className="text-orange-400 hover:underline">Terms of Service</Link> - Your rights and obligations when using KAZI</li>
                </ul>
              </section>
            </CardContent>
          </LiquidGlassCard>
        </article>
      </main>
    </div>
  )
}
