'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Brain,
  Shield,
  FileText,
  Video,
  Users,
  Globe,
  Calendar,
  MessageSquare,
  DollarSign,
  Cloud,
  Zap,
} from 'lucide-react';

const features = [
  {
    title: 'Multi-Model AI Studio',
    description:
      'Access 4 premium AI models (GPT-4o, Claude, DALL-E, Google AI) for instant content generation across creative fields.',
    icon: Brain,
    href: '/dashboard/ai-create',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    title: 'Universal Pinpoint Feedback',
    description:
      'Revolutionary multi-media commenting on images, videos, PDFs, and code with AI analysis and voice notes.',
    icon: MessageSquare,
    href: '/dashboard/collaboration',
    color: 'bg-pink-500/10 text-pink-500',
  },
  {
    title: 'Professional Video Studio',
    description:
      'Complete video editing with AI transcription, screen recording, timestamp comments, and client collaboration.',
    icon: Video,
    href: '/dashboard/video-studio',
    color: 'bg-red-500/10 text-red-500',
  },
  {
    title: 'Multi-Cloud Storage System',
    description:
      'Enterprise storage with 70% cost savings through intelligent Supabase + Wasabi routing and version control.',
    icon: Cloud,
    href: '/dashboard/files-hub',
    color: 'bg-cyan-500/10 text-cyan-500',
  },
  {
    title: 'Secure Escrow Payments',
    description:
      'Milestone-based payment protection with Stripe integration, automated invoicing, and global processing.',
    icon: Shield,
    href: '/dashboard/escrow',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    title: 'Real-Time Collaboration',
    description:
      'Live multi-user editing with cursor tracking, instant messaging, presence indicators, and conflict resolution.',
    icon: Users,
    href: '/dashboard/collaboration',
    color: 'bg-green-500/10 text-green-500',
  },
  {
    title: 'Creator Community Hub',
    description:
      'Connect with 2,800+ verified creators through marketplace, social wall, and professional networking.',
    icon: Globe,
    href: '/dashboard/community',
    color: 'bg-indigo-500/10 text-indigo-500',
  },
  {
    title: 'AI Daily Planning',
    description:
      'Intelligent task management with productivity optimization, time estimates, and automated scheduling.',
    icon: Calendar,
    href: '/dashboard/my-day',
    color: 'bg-orange-500/10 text-orange-500',
  },
  {
    title: 'Professional Invoicing',
    description:
      'Automated invoice generation with multiple templates, tax calculations, and comprehensive financial tracking.',
    icon: DollarSign,
    href: '/dashboard/financial-hub',
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    title: 'Advanced Analytics Suite',
    description:
      'Real-time business intelligence with revenue tracking, cost optimization, and performance predictions.',
    icon: Zap,
    href: '/dashboard/analytics',
    color: 'bg-rose-500/10 text-rose-500',
  },
  {
    title: 'Client Zone Galleries',
    description:
      'Professional client portals with secure file access, watermarked previews, and approval workflows.',
    icon: FileText,
    href: '/dashboard/client-zone',
    color: 'bg-yellow-500/10 text-yellow-500',
  },
];

export default function FeaturesPage() {
  const router = useRouter()

  // Handler: Start Revolution (Hero Section)
  const handleStartRevolution = () => {
    toast.success('Starting your revolution!')
    setTimeout(() => {
      alert(`🚀 Join the Creative Revolution\n\nNext Steps:\n• Create your account for free\n• Access all enterprise features\n• Explore quantum AI capabilities\n• Build with world-first technologies\n• Join 12K+ revolutionary creators\n• Transform your creative workflow`)
    }, 500)
    setTimeout(() => {
      router.push('/signup')
    }, 2000)
  }

  // Handler: View Pricing (Hero Section)
  const handleViewPricing = () => {
    toast.success('Loading enterprise pricing...')
    setTimeout(() => {
      alert(`💎 Enterprise Pricing\n\nWhat You'll Find:\n• Transparent pricing tiers\n• Enterprise feature comparison\n• Custom plan options\n• Volume discounts available\n• Flexible payment terms\n• Talk to sales for custom needs`)
    }, 500)
    setTimeout(() => {
      router.push('/pricing')
    }, 2000)
  }

  // Handler: Feature Card Clicks
  const handleFeatureClick = (title: string, href: string) => {
    toast.success(`Opening ${title}...`)
    setTimeout(() => {
      alert(`✨ ${title}\n\nExplore:\n• Live demonstration\n• Interactive tools and features\n• Real-world use cases\n• Workflow examples\n• Integration capabilities\n• Try it now for free`)
    }, 500)
    setTimeout(() => {
      router.push(href)
    }, 2000)
  }

  // Handler: Schedule Demo (CTA Section)
  const handleScheduleDemo = () => {
    toast.success('Scheduling your demo...')
    setTimeout(() => {
      alert(`📅 Schedule Your Demo\n\nNext Steps:\n• Fill out the contact form\n• Choose preferred demo time\n• Meet with product specialist\n• See features in action\n• Discuss your specific needs\n• Get personalized recommendations`)
    }, 500)
    setTimeout(() => {
      router.push('/contact')
    }, 2000)
  }

  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Enterprise Features for{' '}
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Modern Creatives
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          KAZI provides a complete suite of enterprise-grade tools including multi-model AI studio, 
          universal feedback systems, real-time collaboration, and secure payment processing. 
          Built for professionals who demand the best.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={handleStartRevolution} size="lg">
            Start Revolution
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button onClick={handleViewPricing} variant="outline" size="lg">
            Enterprise Pricing
          </Button>
        </div>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            onClick={() => handleFeatureClick(feature.title, feature.href)}
            className="group relative rounded-2xl border p-6 hover:shadow-lg transition-all cursor-pointer"
          >
            <div
              className={`rounded-lg p-2.5 inline-block ${feature.color} transition-colors`}
            >
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold">{feature.title}</h3>
            <p className="mt-2 text-muted-foreground">{feature.description}</p>
            <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-20 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-12 text-center text-white">
        <h2 className="text-3xl font-bold">Ready to Transform Your Creative Business?</h2>
        <p className="mt-4 text-lg opacity-90">
          Join thousands of successful freelancers using KAZI
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={handleStartRevolution} size="lg" variant="secondary">
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button onClick={handleScheduleDemo} size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
            Schedule Demo
          </Button>
        </div>
      </div>
    </div>
  );
} 