'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UserButton } from '@/components/user-button'

// Context7 Enhanced Navigation System
const navigationItems = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    description: 'Main dashboard overview',
    badge: 'A+++'
  },
  {
    name: 'Projects Hub',
    href: '/dashboard/projects-hub',
    icon: 'FolderOpen',
    description: 'Universal Pinpoint Feedback System',
    badge: 'A+++',
    features: ['Multi-media commenting', 'AI-powered analysis', 'Real-time collaboration']
  },
  {
    name: 'AI Assistant',
    href: '/dashboard/ai-assistant',
    icon: 'Brain',
    description: 'Intelligent AI Assistant',
    badge: 'A+++',
    features: ['Real-time analysis', 'Smart suggestions', 'Context-aware help']
  },
  {
    name: 'AI Create',
    href: '/dashboard/ai-create',
    icon: 'Sparkles',
    description: 'AI-Powered Content Creation',
    badge: 'A+++',
    features: ['Content generation', 'Asset creation', 'Smart templates']
  },
  {
    name: 'My Day Today',
    href: '/dashboard/my-day',
    icon: 'Calendar',
    description: 'AI-Powered Daily Planning',
    badge: 'A+++',
    features: ['Smart task management', 'AI insights', 'Progress tracking']
  },
  {
    name: 'Files Hub',
    href: '/dashboard/files-hub',
    icon: 'FileText',
    description: 'Advanced File Management',
    badge: 'A+++',
    features: ['Multi-cloud storage', 'Smart organization', 'Secure sharing']
  },
  {
    name: 'Video Studio',
    href: '/dashboard/video-studio',
    icon: 'Video',
    description: 'Professional Video Tools',
    badge: 'A+++',
    features: ['Screen recording', 'Video editing', 'Collaboration']
  },
  {
    name: 'Escrow System',
    href: '/dashboard/escrow',
    icon: 'Shield',
    description: 'Secure Payment System',
    badge: 'A+++',
    features: ['Milestone tracking', 'Secure payments', 'Project protection']
  },
  {
    name: 'Client Portal',
    href: '/dashboard/client-portal',
    icon: 'Users',
    description: 'Enhanced Client Management',
    badge: 'A+++',
    features: ['Project access', 'Feedback system', 'File sharing']
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: 'BarChart',
    description: 'Advanced Analytics',
    badge: 'A+++',
    features: ['Revenue tracking', 'Project metrics', 'Performance insights']
  }
]

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router, supabase.auth])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      {/* Enhanced Navigation Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">FreeflowZee</h2>
            <p className="text-sm text-gray-600">Enterprise Dashboard</p>
          </div>
          
          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
              >
                <span className="mr-3 text-gray-400">{item.icon === 'LayoutDashboard' ? '📊' : 
                  item.icon === 'FolderOpen' ? '📁' : 
                  item.icon === 'Video' ? '🎬' : 
                  item.icon === 'Palette' ? '🎨' : 
                  item.icon === 'Users' ? '👥' : 
                  item.icon === 'Brain' ? '🧠' : 
                  item.icon === 'Sparkles' ? '✨' : 
                  item.icon === 'Calendar' ? '📅' : 
                  item.icon === 'Shield' ? '🛡️' : 
                  item.icon === 'MessageSquare' ? '💬' : 
                  item.icon === 'BarChart3' ? '📈' : 
                  item.icon === 'UserCheck' ? '👤' : 
                  item.icon === 'DollarSign' ? '💰' : 
                  item.icon === 'Bell' ? '🔔' : '⭐'
                }</span>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <div>🚀 All 8 A+++ Features</div>
              <div>Context7 + Playwright Ready</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="ml-64">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
} 