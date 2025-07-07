'use client'

import Link from 'next/link';
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
    title: 'AI-Powered Asset Generation',
    description:
      'Generate images, copy and video transcripts with a single prompt. Powered by the latest OpenAI & Anthropic models.',
    icon: Brain,
    href: '/dashboard/ai-create',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    title: 'Secure Escrow Payments',
    description:
      'Built-in escrow keeps funds safe until milestones are approved – no plugins required.',
    icon: Shield,
    href: '/dashboard/escrow',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    title: 'Smart Document Management',
    description:
      'Organize, share, and collaborate on documents with version control and real-time editing.',
    icon: FileText,
    href: '/dashboard/documents',
    color: 'bg-yellow-500/10 text-yellow-500',
  },
  {
    title: 'Professional Video Studio',
    description:
      'Record, edit, and share high-quality videos with our built-in studio. Includes screen recording and webcam.',
    icon: Video,
    href: '/dashboard/video-studio',
    color: 'bg-red-500/10 text-red-500',
  },
  {
    title: 'Team Collaboration',
    description:
      'Work together seamlessly with real-time chat, file sharing, and task management.',
    icon: Users,
    href: '/dashboard/team',
    color: 'bg-green-500/10 text-green-500',
  },
  {
    title: 'Global Creator Network',
    description:
      'Connect with talented creators worldwide. Find the perfect match for your project.',
    icon: Globe,
    href: '/dashboard/creators',
    color: 'bg-indigo-500/10 text-indigo-500',
  },
  {
    title: 'Smart Scheduling',
    description:
      'AI-powered calendar that automatically finds the best meeting times across time zones.',
    icon: Calendar,
    href: '/dashboard/calendar',
    color: 'bg-orange-500/10 text-orange-500',
  },
  {
    title: 'Universal Feedback System',
    description:
      'Leave contextual feedback on any type of content – video timestamps, image regions, or text.',
    icon: MessageSquare,
    href: '/dashboard/feedback',
    color: 'bg-pink-500/10 text-pink-500',
  },
  {
    title: 'Automated Invoicing',
    description:
      'Generate and send professional invoices automatically. Track payments and expenses.',
    icon: DollarSign,
    href: '/dashboard/invoices',
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    title: 'Multi-Cloud Storage',
    description:
      'Store files across multiple cloud providers for maximum reliability and cost savings.',
    icon: Cloud,
    href: '/dashboard/storage',
    color: 'bg-cyan-500/10 text-cyan-500',
  },
  {
    title: 'Performance Analytics',
    description:
      'Track project metrics, team productivity, and financial performance in real-time.',
    icon: Zap,
    href: '/dashboard/analytics',
    color: 'bg-rose-500/10 text-rose-500',
  },
];

export default function FeaturesPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Everything you need to{' '}
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            succeed
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Our platform combines powerful tools with intuitive design to help you
          work smarter, not harder. Start your journey today.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className="group relative rounded-2xl border p-6 hover:shadow-lg transition-all"
          >
            <div
              className={`rounded-lg p-2.5 inline-block ${feature.color} transition-colors`}
            >
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold">{feature.title}</h3>
            <p className="mt-2 text-muted-foreground">{feature.description}</p>
            <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  );
} 