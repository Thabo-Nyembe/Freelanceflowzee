'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase, CreditCard, Video, MessageSquare, Bot, FileText,
  Shield, Users, BarChart, Palette, Clock, Cloud
} from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Briefcase,
    title: 'Project Management',
    description: 'Complete project lifecycle management with milestones, tasks, and team collaboration.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: CreditCard,
    title: 'Secure Escrow Payments',
    description: 'Milestone-based escrow system protects both freelancers and clients.',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Video,
    title: 'Video Studio',
    description: 'Professional video editing with AI enhancement, transcription, and auto-chapters.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Collaboration',
    description: 'Live cursors, instant feedback, and threaded conversations for seamless teamwork.',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    icon: Bot,
    title: 'AI-Powered Tools',
    description: 'Multi-model AI integration for content creation, analysis, and automation.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: FileText,
    title: 'Professional Invoicing',
    description: 'Beautiful invoice templates with tax calculations and automated reminders.',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption, SOC2 compliance, and secure data handling.',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: Users,
    title: 'Client Portal',
    description: 'Dedicated client access with project visibility and approval workflows.',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: BarChart,
    title: 'Analytics & Insights',
    description: 'Comprehensive dashboards with revenue tracking and performance metrics.',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: Palette,
    title: 'Design Tools',
    description: 'Color analysis, layout review, and accessibility auditing built-in.',
    color: 'text-fuchsia-500',
    bgColor: 'bg-fuchsia-500/10',
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Integrated time tracking with automatic invoicing and detailed reports.',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
  },
  {
    icon: Cloud,
    title: 'Cloud Storage',
    description: 'Multi-cloud storage with version control and intelligent cost optimization.',
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
  },
]

export function FeaturesShowcase() {
  return (
    <section className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline">Features</Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            KAZI combines 25+ enterprise features into one intuitive platform,
            giving you the tools to manage, create, and grow your freelance business.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-0 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
