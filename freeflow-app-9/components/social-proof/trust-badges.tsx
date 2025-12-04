'use client'

import { Badge } from '@/components/ui/badge'
import { Shield, Lock, Award, CheckCircle, Star, Users, Globe, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function TrustBadges() {
  return (
    <div className="py-12 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            TRUSTED BY LEADING COMPANIES
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Shield, label: 'Bank-Level Security', desc: 'SSL Encrypted' },
            { icon: Lock, label: 'Privacy Protected', desc: 'GDPR Compliant' },
            { icon: Award, label: '99.9% Uptime', desc: 'SLA Guarantee' },
            { icon: CheckCircle, label: 'Money-Back', desc: '30-Day Guarantee' },
          ].map((badge, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <badge.icon className="w-10 h-10 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                <p className="font-semibold mb-1">{badge.label}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{badge.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '25,000+', label: 'Active Users', icon: Users },
            { value: '40+', label: 'Countries', icon: Globe },
            { value: '4.9/5', label: 'User Rating', icon: Star },
            { value: '2,500+', label: 'Reviews', icon: CheckCircle },
          ].map((stat, index) => (
            <div key={index}>
              <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SecurityBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-6">
      {[
        { label: 'SSL Secured', icon: Lock },
        { label: 'GDPR Compliant', icon: Shield },
        { label: 'SOC 2 Type II', icon: Award },
        { label: 'ISO 27001', icon: CheckCircle },
      ].map((badge, index) => (
        <Badge key={index} variant="outline" className="px-4 py-2">
          <badge.icon className="w-4 h-4 mr-2" />
          {badge.label}
        </Badge>
      ))}
    </div>
  )
}

export function ClientLogos() {
  // Placeholder - replace with actual client logos
  const clients = [
    'TechCrunch', 'Product Hunt', 'Forbes', 'Wired',
    'Business Insider', 'VentureBeat', 'TechRadar', 'Mashable'
  ]

  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8">
          AS FEATURED IN
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
          {clients.map((client, index) => (
            <div key={index} className="text-center">
              <p className="font-semibold text-lg text-gray-700 dark:text-gray-300">
                {client}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TrustBadges
