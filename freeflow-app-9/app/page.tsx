import { Metadata } from "next";
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Video, 
  FileText, 
  Users, 
  Brain,
  Calendar,
  BarChart3,
  FileBox,
  MessageSquare
} from 'lucide-react'

const features = [
  {
    title: 'AI Video Studio',
    description: 'Create, edit, and analyze videos with AI assistance',
    icon: Video,
    href: '/video-studio',
    color: 'text-blue-500'
  },
  {
    title: 'Document Collaboration',
    description: 'Real-time document editing with smart suggestions',
    icon: FileText,
    href: '/documents',
    color: 'text-green-500'
  },
  {
    title: 'Community Hub',
    description: 'Connect with other freelancers and share resources',
    icon: Users,
    href: '/community',
    color: 'text-purple-500'
  },
  {
    title: 'AI Assistant',
    description: 'Get help with tasks, analysis, and optimization',
    icon: Brain,
    href: '/ai-assistant',
    color: 'text-orange-500'
  },
  {
    title: 'Smart Calendar',
    description: 'AI-powered scheduling and time management',
    icon: Calendar,
    href: '/calendar',
    color: 'text-red-500'
  },
  {
    title: 'Analytics Dashboard',
    description: 'Track performance and business metrics',
    icon: BarChart3,
    href: '/analytics',
    color: 'text-indigo-500'
  },
  {
    title: 'File Management',
    description: 'Organize and share files securely',
    icon: FileBox,
    href: '/files',
    color: 'text-teal-500'
  },
  {
    title: 'Client Portal',
    description: 'Collaborate with clients seamlessly',
    icon: MessageSquare,
    href: '/client-portal',
    color: 'text-pink-500'
  }
]

export const metadata: Metadata = {
  title: "FreeflowZee - AI-Powered Creative Platform",
  description: "Generate creative assets with AI, share files like WeTransfer, manage projects with escrow payments, and build your creative business - all in one revolutionary platform.",
  keywords: "AI, creative platform, file sharing, project management, escrow payments, freelance",
  authors: [{ name: "FreeflowZee Team" }],
  creator: "FreeflowZee"
};

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to FreeFlowZee
        </h1>
        <p className="text-xl text-muted-foreground mt-4">
          Your all-in-one freelance management platform with AI superpowers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Link key={feature.title} href={feature.href}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
                <CardTitle className="mt-4">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Explore {feature.title}
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
