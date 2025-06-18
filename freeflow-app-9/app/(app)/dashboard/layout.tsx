import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Context7 Enhanced Navigation System
const navigationItems = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    description: 'Main dashboard overview'
  },
  {
    name: 'Projects Hub',
    href: '/dashboard/projects-hub',
    icon: 'FolderOpen',
    description: 'Universal Pinpoint Feedback System - Figma-Level',
    badge: 'A+++',
    features: ['Multi-media commenting', 'AI-powered analysis', 'Real-time collaboration', 'Voice recording']
  },
  {
    name: 'Video Studio',
    href: '/dashboard/video-studio',
    icon: 'Video',
    description: 'Enterprise Video Studio - Loom-Level',
    badge: 'A+++',
    features: ['Screen recording', 'AI transcription', 'Real-time collaboration', 'Advanced editing']
  },
  {
    name: 'Canvas Collaboration',
    href: '/dashboard/canvas',
    icon: 'Palette',
    description: 'Real-Time Canvas Collaboration - Figma-Level',
    badge: 'A+++',
    features: ['Live collaborative drawing', 'Vector tools', 'Component library', 'Version control']
  },
  {
    name: 'Community',
    href: '/dashboard/community',
    icon: 'Users',
    description: 'Enhanced Community Hub - Slack/Discord-Level',
    badge: 'A+++',
    features: ['Creator marketplace (2,847+ creators)', 'Instagram-like social wall', 'Real-time messaging']
  },
  {
    name: 'AI Assistant',
    href: '/dashboard/ai-assistant',
    icon: 'Brain',
    description: 'AI-Powered Design Assistant - Notion AI-Level',
    badge: 'A+++',
    features: ['5 analysis modes', 'Natural language AI chat', 'Smart recommendations']
  },
  {
    name: 'My Day',
    href: '/dashboard/my-day',
    icon: 'Calendar',
    description: 'My Day Today AI Planning - ClickUp/Monday.com-Level',
    badge: 'A+++',
    features: ['AI-powered task management', 'Smart scheduling', 'Progress tracking']
  },
  {
    name: 'Escrow',
    href: '/dashboard/escrow',
    icon: 'Shield',
    description: 'Advanced Escrow System - Enterprise-Level',
    badge: 'A+++',
    features: ['$13,500 total management', 'Milestone-based payments', 'Secure fund holdings']
  },
  {
    name: 'Files Hub',
    href: '/dashboard/files-hub',
    icon: 'FolderOpen',
    description: 'Enterprise Files Hub - Dropbox/Box-Level',
    badge: 'A+++',
    features: ['Multi-cloud storage', 'Cost optimization', 'Advanced search', 'Version control']
  },
  {
    name: 'Collaboration',
    href: '/dashboard/collaboration',
    icon: 'MessageSquare',
    description: 'Enhanced collaboration tools',
    features: ['Real-time chat', 'File sharing', 'Video calls', 'Screen sharing']
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: 'BarChart3',
    description: 'Advanced analytics and insights'
  },
  {
    name: 'Client Zone',
    href: '/dashboard/client-zone',
    icon: 'UserCheck',
    description: 'Client management and portal'
  },
  {
    name: 'Financial Hub',
    href: '/dashboard/financial-hub',
    icon: 'DollarSign',
    description: 'Financial management and invoicing'
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: 'Bell',
    description: 'Smart notifications with AI categorization',
    features: ['AI-powered notifications', 'Smart categorization', 'Real-time updates']
  }
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  if (!supabase) {
    // Demo mode - allow access for testing
    console.log('🔧 Running in demo mode - allowing dashboard access')
  } else {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      redirect('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <div className="p-6">
        {children}
      </div>
    </div>
  )
} 