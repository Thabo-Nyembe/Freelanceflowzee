'use client'

import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'
import {
  Video,
  Brain,
  MessageSquare,
  Upload,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Shield,
} from 'lucide-react'

const features = [
  {
    title: 'Multi-Model AI Studio',
    description: 'Generate stunning content in seconds with GPT-4o, Claude, DALL-E, and Google AI. Create copy, images, and designs without leaving your workspace.',
    icon: Brain,
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Professional Video Studio',
    description: 'Edit videos with AI-powered transcription, screen recording, and timestamp comments. Collaborate with clients in real-time.',
    icon: Video,
    gradient: 'from-red-500 to-red-600'
  },
  {
    title: 'Universal Pinpoint Feedback',
    description: 'Leave precise feedback on any file type—images, videos, PDFs, or code. Add voice notes and AI analysis.',
    icon: MessageSquare,
    gradient: 'from-pink-500 to-pink-600'
  },
  {
    title: 'Secure Escrow Payments',
    description: 'Protect your income with milestone-based payments. Clients fund upfront, you deliver with confidence.',
    icon: Shield,
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    title: 'AI Daily Planning',
    description: 'Let AI organize your day. Get smart time estimates, productivity insights, and automated scheduling.',
    icon: Calendar,
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    title: 'Multi-Cloud Storage',
    description: 'Store unlimited files with 70% cost savings. Intelligent routing between Supabase and Wasabi.',
    icon: Upload,
    gradient: 'from-cyan-500 to-cyan-600'
  },
  {
    title: 'Real-Time Collaboration',
    description: 'Work together like you\'re in the same room. See live cursors, instant updates, and presence indicators.',
    icon: Users,
    gradient: 'from-green-500 to-green-600'
  },
  {
    title: 'Professional Invoicing',
    description: 'Create beautiful invoices in seconds. Track payments automatically and maintain financial records.',
    icon: DollarSign,
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    title: 'Client Zone Galleries',
    description: 'Impress clients with branded portals for file delivery. Control access and collect approvals.',
    icon: FileText,
    gradient: 'from-yellow-500 to-yellow-600'
  }
]

export function FeaturesSection() {
  return (
    <BentoGrid className="max-w-4xl mx-auto">
      {features.map((feature, index) => (
        <BentoGridItem
          key={index}
          title={feature.title}
          description={feature.description}
          header={
            <div className={`flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br ${feature.gradient} opacity-10 flex items-center justify-center`}>
              <feature.icon className={`h-12 w-12 opacity-50 text-gray-500`} />
            </div>
          }
          icon={<feature.icon className="h-4 w-4 text-neutral-500" />}
          className={index === 3 || index === 6 ? "md:col-span-2" : ""}
        />
      ))}
    </BentoGrid>
  )
}
