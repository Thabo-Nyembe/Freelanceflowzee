'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Target, Zap, Globe, Award, Heart, Shield } from 'lucide-react'
import { EnhancedNavigation } from '@/components/marketing/enhanced-navigation'
import { Button } from '@/components/ui/button'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollProgress } from '@/components/ui/scroll-progress'

export default function AboutPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const stats = [
    { label: 'Active Users', value: '25,000+', icon: Users },
    { label: 'Countries', value: '120+', icon: Globe },
    { label: 'Uptime', value: '99.9%', icon: Zap },
    { label: 'Customer Satisfaction', value: '98%', icon: Heart },
  ]

  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description: 'Empowering freelancers and agencies to run their entire business from one platform.'
    },
    {
      icon: Zap,
      title: 'Innovation First',
      description: 'Leveraging cutting-edge AI and technology to automate and streamline workflows.'
    },
    {
      icon: Shield,
      title: 'Security & Trust',
      description: 'Enterprise-grade security with SOC 2 compliance and end-to-end encryption.'
    },
    {
      icon: Heart,
      title: 'Customer Success',
      description: 'Dedicated support team committed to helping you achieve your business goals.'
    },
  ]

  const team = [
    { name: 'Alexandra Chen', role: 'CEO & Founder', image: '/avatars/alex.jpg' },
    { name: 'Marcus Johnson', role: 'CTO', image: '/avatars/marcus.jpg' },
    { name: 'Sarah Williams', role: 'Head of Product', image: '/avatars/sarah.jpg' },
    { name: 'David Kim', role: 'Head of Design', image: '/avatars/david.jpg' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <ScrollProgress />
      <EnhancedNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            About KAZI
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <TextShimmer>Building the Future of Work</TextShimmer>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            KAZI is the all-in-one platform that helps freelancers, agencies, and creative professionals
            manage projects, clients, invoices, and collaboration - all in one beautiful workspace.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started Free
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <LiquidGlassCard key={index} className="p-6 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
              KAZI was born from a simple frustration: freelancers and agencies were juggling 6+ different
              apps just to run their business. Project management here, invoicing there, file storage
              somewhere else, and communication scattered across multiple platforms.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
              Founded in 2023, we set out to build the platform we wished existed - one that combines
              project management, invoicing, file storage, client communication, and AI-powered tools
              into a single, beautiful workspace.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Today, KAZI serves over 25,000 professionals in 120+ countries, helping them save time,
              get paid faster, and focus on what they do best - creating amazing work for their clients.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <LiquidGlassCard key={index} className="p-6">
                <value.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Leadership Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <LiquidGlassCard key={index} className="p-6 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{member.role}</p>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join 25,000+ professionals who trust KAZI to run their business.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Talk to Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2024 KAZI. Built in South Africa. Serving 120+ Countries Worldwide.</p>
        </div>
      </footer>
    </div>
  )
}
