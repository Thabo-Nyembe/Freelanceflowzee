'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { GlobalPresenceWidget } from '@/components/realtime/presence-indicator'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useSidebar } from '@/lib/sidebar-context'
import { SidebarCollapseToggle } from '@/components/navigation/sidebar-collapse-toggle'
import {
  BarChart3,
  FolderOpen,
  Video,
  Users,
  Sparkles,
  Calendar,
  Shield,
  FileText,
  TrendingUp,
  Settings,
  Palette,
  MessageSquare,
  Bell,
  DollarSign,
  Zap,
  Monitor,
  Receipt,
  Clock,
  Image,
  Brain,
  Rocket,
  Package,
  Mic,
  Wand2,
  GitBranch,
  Cloud,
  BookOpen,
  User,
  Code,
  Gauge,
  FileBarChart,
  Smartphone,
  Layers,
  Music,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  PanelLeftClose,
  PanelLeftOpen,
  Briefcase,
  Film,
  Box,
  GripVertical,
  RotateCcw,
  Crown,
  Target,
  Mail,
  UserPlus,
  BarChart2,
  Save,
  Trash2,
  Bookmark,
  Star,
  CheckCircle2,
  // Additional icons for new pages
  Truck,
  Warehouse,
  AlertTriangle,
  Bug,
  TestTube,
  Radio,
  Megaphone,
  FileQuestion,
  Key,
  Lock,
  Activity,
  Heart,
  Award,
  Store,
  PieChart,
  Terminal,
  Plug,
  Link as LinkIcon,
  ClipboardList,
  Timer,
  Workflow,
  Wrench,
  Grid,
  LayoutGrid,
  Component,
  Puzzle,
  Lightbulb,
  Tag,
  Ticket,
  LifeBuoy,
  Headphones,
  MessagesSquare,
  Folder,
  RefreshCw,
  Edit,
  ArrowUpRight,
  // Icons for orphaned pages
  Bot,
  Calculator,
  Building,
  CheckSquare,
  CreditCard,
  FolderSync
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

interface SidebarItem {
  id: string
  name: string
  href: string
  icon: LucideIcon
  badge?: string
  description?: string
}

interface SidebarSubcategory {
  id: string
  name: string
  items: SidebarItem[]
  visible: boolean
}

interface SidebarCategory {
  id: string
  name: string
  icon: LucideIcon
  subcategories: SidebarSubcategory[]
  visible: boolean
}

// Default navigation structure
const DEFAULT_CATEGORIES: SidebarCategory[] = [
  {
    id: 'ai-creative-suite',
    name: 'AI Creative Suite',
    icon: Brain,
    visible: true,
    subcategories: [
      {
        id: 'ai-tools',
        name: 'AI Tools',
        visible: true,
        items: [
          { id: 'ai-assistant', name: 'AI Assistant', href: '/dashboard/ai-assistant-v2', icon: Brain, description: 'AI-powered assistant' },
          { id: 'ai-design', name: 'AI Design', href: '/dashboard/ai-design-v2', icon: Zap, description: 'AI design generation' },
          { id: 'ai-create', name: 'AI Create', href: '/dashboard/ai-create-v2', icon: Sparkles, description: 'AI content creation' },
          { id: 'ai-image-generator', name: 'AI Image Generator', href: '/dashboard/ai-image-generator', icon: Image, description: 'Nano Banana image generation', badge: 'Hot' },
          { id: 'ai-music-studio', name: 'AI Music Studio', href: '/dashboard/ai-music-studio', icon: Music, description: 'Suno AI music creation', badge: 'Hot' },
          { id: 'ai-video-studio', name: 'AI Video Studio', href: '/dashboard/ai-video-studio', icon: Film, description: 'Veo 3 video generation', badge: 'Hot' }
        ]
      },
      {
        id: 'advanced-ai',
        name: 'Advanced AI',
        visible: true,
        items: [
          { id: 'ai-video-generation', name: 'AI Video Generation', href: '/dashboard/ai-video-generation', icon: Video, description: 'AI video creation', badge: 'New' },
          { id: 'ai-voice-synthesis', name: 'AI Voice Synthesis', href: '/dashboard/ai-voice-synthesis', icon: Mic, description: 'AI voice generation', badge: 'New' },
          { id: 'ai-code-completion', name: 'AI Code Completion', href: '/dashboard/ai-code-completion', icon: Code, description: 'AI coding assistant', badge: 'New' },
          { id: 'ml-insights', name: 'ML Insights', href: '/dashboard/ml-insights', icon: Brain, description: 'Machine learning', badge: 'New' },
          { id: 'ai-settings', name: 'AI Settings', href: '/dashboard/ai-settings', icon: Settings, description: 'AI configuration', badge: 'New' },
          { id: 'ai-business-advisor', name: 'AI Business Advisor', href: '/dashboard/ai-business-advisor', icon: Brain, description: 'Business AI advisor', badge: 'New' },
          { id: 'ai-content-studio', name: 'AI Content Studio', href: '/dashboard/ai-content-studio', icon: Sparkles, description: 'Content generation', badge: 'New' },
          { id: 'real-time-translation', name: 'Real-time Translation', href: '/dashboard/real-time-translation', icon: MessageSquare, description: 'AI translation', badge: 'New' },
          { id: 'ai-agents', name: 'AI Agents', href: '/dashboard/ai-agents-v2', icon: Bot, description: 'AI agent automation', badge: 'New' },
          { id: 'ai-code-builder', name: 'AI Code Builder', href: '/dashboard/ai-code-builder-v2', icon: Code, description: 'AI code generation', badge: 'New' },
          { id: 'meeting-summaries', name: 'Meeting Summaries', href: '/dashboard/meeting-summaries-v2', icon: FileText, description: 'AI meeting notes', badge: 'New' },
          { id: 'voice-ai', name: 'Voice AI', href: '/dashboard/voice-ai-v2', icon: Mic, description: 'Voice AI assistant', badge: 'New' }
        ]
      }
    ]
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    icon: Users,
    visible: true,
    subcategories: [
      {
        id: 'collaboration-tools',
        name: 'Collaboration Tools',
        visible: true,
        items: [
          { id: 'collaboration-hub', name: 'Collaboration Hub', href: '/dashboard/collaboration-v2', icon: Users, description: 'Real-time collaboration', badge: 'New' },
          { id: 'canvas-collaboration', name: 'Canvas Collaboration', href: '/dashboard/canvas-collaboration', icon: Palette, description: 'Collaborative design', badge: 'New' },
          { id: 'ar-collaboration', name: 'AR Collaboration', href: '/dashboard/ar-collaboration', icon: Box, description: 'AR experiences', badge: 'New' },
          { id: 'voice-collaboration', name: 'Voice Collaboration', href: '/dashboard/voice-collaboration', icon: Mic, description: 'Voice calls & meetings', badge: 'New' }
        ]
      }
    ]
  },
  {
    id: 'storage',
    name: 'Storage',
    icon: Cloud,
    visible: true,
    subcategories: [
      {
        id: 'storage-main',
        name: 'Storage Management',
        visible: true,
        items: [
          { id: 'files-hub', name: 'Files Hub', href: '/dashboard/files-hub-v2', icon: FolderOpen, description: 'File management', badge: 'NewTab' },
          { id: 'documents', name: 'Documents', href: '/dashboard/documents-v2', icon: FileText, description: 'Document management', badge: 'New' },
          { id: 'storage', name: 'Storage', href: '/dashboard/storage', icon: Cloud, description: 'Multi-cloud storage', badge: 'New' },
          { id: 'cloud-storage', name: 'Cloud Storage', href: '/dashboard/cloud-storage-v2', icon: Cloud, description: 'Cloud files', badge: 'New' },
          { id: 'resource-library', name: 'Resource Library', href: '/dashboard/resource-library', icon: BookOpen, description: 'Asset library', badge: 'New' },
          { id: 'widgets', name: 'Widgets', href: '/dashboard/widgets', icon: Layers, description: 'Dashboard widgets', badge: 'New' },
          { id: 'knowledge-base', name: 'Knowledge Base', href: '/dashboard/client-zone/knowledge-base', icon: BookOpen, description: 'Help center & docs', badge: 'New' },
          { id: 'assets', name: 'Assets', href: '/dashboard/assets-v2', icon: Image, description: 'Asset management', badge: 'New' },
          { id: 'media-library', name: 'Media Library', href: '/dashboard/media-library-v2', icon: Image, description: 'Media files', badge: 'New' },
          { id: 'backups', name: 'Backups', href: '/dashboard/backups-v2', icon: Cloud, description: 'Data backups', badge: 'New' },
          { id: 'data-export', name: 'Data Export', href: '/dashboard/data-export-v2', icon: FileText, description: 'Export data', badge: 'New' },
          { id: 'templates', name: 'Templates', href: '/dashboard/templates-v2', icon: FileText, description: 'Template library', badge: 'New' }
        ]
      }
    ]
  },
  {
    id: 'business-intelligence',
    name: 'Business Intelligence',
    icon: TrendingUp,
    visible: true,
    subcategories: [
      {
        id: 'overview',
        name: 'Overview',
        visible: true,
        items: [
          { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: BarChart3, description: 'Business overview' },
          { id: 'my-day', name: 'My Day', href: '/dashboard/my-day-v2', icon: Calendar, description: 'Daily planner' },
          { id: 'growth-hub', name: 'Growth Hub', href: '/dashboard/growth-hub-v2', icon: Rocket, description: 'Business growth & monetization', badge: 'New' }
        ]
      },
      {
        id: 'project-management',
        name: 'Project Management',
        visible: true,
        items: [
          { id: 'projects-hub', name: 'Projects Hub', href: '/dashboard/projects-hub-v2', icon: FolderOpen, description: 'Project management' },
          { id: 'project-templates', name: 'Project Templates', href: '/dashboard/project-templates', icon: FileText, description: 'Templates', badge: 'New' },
          { id: 'workflow-builder', name: 'Workflow Builder', href: '/dashboard/workflow-builder-v2', icon: GitBranch, description: 'Custom workflows', badge: 'New' },
          { id: 'time-tracking', name: 'Time Tracking', href: '/dashboard/time-tracking-v2', icon: Clock, description: 'Track time' }
        ]
      },
      {
        id: 'analytics-reports',
        name: 'Analytics & Reports',
        visible: true,
        items: [
          { id: 'business-intelligence', name: 'Business Intelligence', href: '/dashboard/business-intelligence-v2', icon: Crown, description: 'Maximize your business', badge: 'Pro' },
          { id: 'analytics', name: 'Analytics', href: '/dashboard/analytics-v2', icon: TrendingUp, description: 'Performance insights' },
          { id: 'custom-reports', name: 'Custom Reports', href: '/dashboard/custom-reports', icon: FileBarChart, description: 'Custom reporting', badge: 'New' },
          { id: 'performance', name: 'Performance', href: '/dashboard/performance-analytics-v2', icon: Gauge, description: 'Performance metrics', badge: 'New' },
          { id: 'reports', name: 'Reports', href: '/dashboard/reports-v2', icon: FileBarChart, description: 'All reports', badge: 'New' }
        ]
      },
      {
        id: 'financial',
        name: 'Financial',
        visible: true,
        items: [
          { id: 'financial-hub', name: 'Financial Hub', href: '/dashboard/financial-v2', icon: DollarSign, description: 'Finance management' },
          { id: 'invoices', name: 'Invoices', href: '/dashboard/invoices-v2', icon: Receipt, description: 'Invoice system', badge: 'New' },
          { id: 'escrow', name: 'Escrow', href: '/dashboard/escrow-v2', icon: Shield, description: 'Secure payments' },
          { id: 'expenses', name: 'Expenses', href: '/dashboard/expenses-v2', icon: Receipt, description: 'Expense tracking', badge: 'New' },
          { id: 'contracts', name: 'Contracts', href: '/dashboard/contracts-v2', icon: FileText, description: 'Contract management', badge: 'New' },
          { id: 'crypto-payments', name: 'Crypto Payments', href: '/dashboard/crypto-payments', icon: DollarSign, description: 'Crypto support', badge: 'New' },
          { id: 'transactions', name: 'Transactions', href: '/dashboard/transactions-v2', icon: DollarSign, description: 'Transaction history', badge: 'New' },
          { id: 'budgets', name: 'Budgets', href: '/dashboard/budgets-v2', icon: DollarSign, description: 'Budget planning', badge: 'New' },
          { id: 'billing', name: 'Billing', href: '/dashboard/billing-v2', icon: Receipt, description: 'Billing management', badge: 'New' },
          { id: 'payroll', name: 'Payroll', href: '/dashboard/payroll-v2', icon: DollarSign, description: 'Payroll management', badge: 'New' },
          { id: 'accounting', name: 'Accounting', href: '/dashboard/accounting-v2', icon: Calculator, description: 'Accounting management', badge: 'New' },
          { id: 'tax-intelligence', name: 'Tax Intelligence', href: '/dashboard/tax-intelligence-v2', icon: Receipt, description: 'Tax planning & analysis', badge: 'New' },
          { id: 'bank-connections', name: 'Bank Connections', href: '/dashboard/bank-connections', icon: Building, description: 'Bank account linking', badge: 'New' },
          { id: 'recurring-invoices', name: 'Recurring Invoices', href: '/dashboard/recurring-invoices', icon: RefreshCw, description: 'Automated invoicing', badge: 'New' }
        ]
      },
      {
        id: 'commerce',
        name: 'Commerce',
        visible: true,
        items: [
          { id: 'orders', name: 'Orders', href: '/dashboard/orders-v2', icon: Package, description: 'Order management', badge: 'New' },
          { id: 'products', name: 'Products', href: '/dashboard/products-v2', icon: Package, description: 'Product catalog', badge: 'New' },
          { id: 'inventory', name: 'Inventory', href: '/dashboard/inventory-v2', icon: Package, description: 'Stock management', badge: 'New' }
        ]
      },
      {
        id: 'team-clients',
        name: 'Team & Clients',
        visible: true,
        items: [
          { id: 'team-hub', name: 'Team Hub', href: '/dashboard/team-hub-v2', icon: Users, description: 'Team collaboration', badge: 'New' },
          { id: 'team-management', name: 'Team Management', href: '/dashboard/team-management-v2', icon: Users, description: 'Manage team', badge: 'New' },
          { id: 'clients', name: 'Clients', href: '/dashboard/clients-v2', icon: Users, description: 'Client directory', badge: 'New' },
          { id: 'client-portal', name: 'Client Portal', href: '/dashboard/client-portal', icon: Users, description: 'Client management', badge: 'New' },
          { id: 'client-zone', name: 'Client Zone', href: '/dashboard/client-zone', icon: Users, description: 'Client portal' },
          { id: 'customers', name: 'Customers', href: '/dashboard/customers-v2', icon: Users, description: 'Customer database', badge: 'New' },
          { id: 'employees', name: 'Employees', href: '/dashboard/employees-v2', icon: Users, description: 'Employee directory', badge: 'New' }
        ]
      },
      {
        id: 'sales',
        name: 'Sales',
        visible: true,
        items: [
          { id: 'sales-pipeline', name: 'Sales Pipeline', href: '/dashboard/sales-v2', icon: TrendingUp, description: 'Sales management', badge: 'New' }
        ]
      },
      {
        id: 'communication',
        name: 'Communication',
        visible: true,
        items: [
          { id: 'messages', name: 'Messages', href: '/dashboard/messages-v2', icon: MessageSquare, description: 'Communication' },
          { id: 'community-hub', name: 'Community Hub', href: '/dashboard/community-hub', icon: Users, description: 'Creator network' },
          { id: 'support-tickets', name: 'Support Tickets', href: '/dashboard/support-tickets-v2', icon: MessageSquare, description: 'Support management', badge: 'New' }
        ]
      },
      {
        id: 'scheduling',
        name: 'Scheduling',
        visible: true,
        items: [
          { id: 'calendar', name: 'Calendar', href: '/dashboard/calendar-v2', icon: Calendar, description: 'Scheduling' },
          { id: 'bookings', name: 'Bookings', href: '/dashboard/bookings-v2', icon: Calendar, description: 'Booking system' },
          { id: 'events', name: 'Events', href: '/dashboard/events-v2', icon: Calendar, description: 'Event management', badge: 'New' },
          { id: 'webinars', name: 'Webinars', href: '/dashboard/webinars-v2', icon: Video, description: 'Online events', badge: 'New' }
        ]
      },
      {
        id: 'marketing',
        name: 'Marketing',
        visible: true,
        items: [
          { id: 'campaigns', name: 'Campaigns', href: '/dashboard/campaigns-v2', icon: Target, description: 'Marketing campaigns', badge: 'New' },
          { id: 'social-media', name: 'Social Media', href: '/dashboard/social-media-v2', icon: Users, description: 'Social management', badge: 'New' },
          { id: 'seo', name: 'SEO', href: '/dashboard/seo-v2', icon: TrendingUp, description: 'SEO tools', badge: 'New' },
          { id: 'surveys', name: 'Surveys', href: '/dashboard/surveys-v2', icon: FileText, description: 'Customer surveys', badge: 'New' },
          { id: 'feedback', name: 'Feedback', href: '/dashboard/feedback-v2', icon: MessageSquare, description: 'Customer feedback', badge: 'New' }
        ]
      }
    ]
  },
  {
    id: 'admin-overview',
    name: 'Business Admin Intelligence',
    icon: Briefcase,
    visible: true,
    subcategories: [
      {
        id: 'admin-dashboard',
        name: 'Admin Dashboard',
        visible: true,
        items: [
          { id: 'admin-overview', name: 'Admin Overview', href: '/dashboard/admin-overview', icon: BarChart2, description: 'Unified admin dashboard', badge: 'New' }
        ]
      },
      {
        id: 'admin-business',
        name: 'Business Management',
        visible: true,
        items: [
          { id: 'analytics-advanced', name: 'Analytics', href: '/dashboard/analytics-advanced', icon: TrendingUp, description: 'Business intelligence', badge: 'New' },
          { id: 'crm', name: 'CRM & Sales', href: '/dashboard/crm-v2', icon: Briefcase, description: 'Sales pipeline', badge: 'New' },
          { id: 'invoicing', name: 'Invoicing', href: '/dashboard/invoicing-v2', icon: Receipt, description: 'Billing management', badge: 'New' },
          { id: 'client-portal-admin', name: 'Client Portal', href: '/dashboard/client-portal', icon: Users, description: 'Client management', badge: 'New' }
        ]
      },
      {
        id: 'admin-marketing',
        name: 'Marketing & Sales',
        visible: true,
        items: [
          { id: 'lead-generation', name: 'Lead Generation', href: '/dashboard/lead-generation-v2', icon: Target, description: 'Lead capture', badge: 'New' },
          { id: 'email-marketing', name: 'Email Marketing', href: '/dashboard/email-marketing-v2', icon: Mail, description: 'Email campaigns', badge: 'New' }
        ]
      },
      {
        id: 'admin-operations',
        name: 'Operations',
        visible: true,
        items: [
          { id: 'user-management', name: 'User Management', href: '/dashboard/user-management-v2', icon: UserPlus, description: 'Team & permissions', badge: 'New' },
          { id: 'system-insights', name: 'System Insights', href: '/dashboard/system-insights-v2', icon: Gauge, description: 'System analytics', badge: 'New' },
          { id: 'investor-metrics', name: 'Investor Metrics', href: '/dashboard/investor-metrics-v2', icon: TrendingUp, description: 'Investor dashboard', badge: 'New' },
          { id: 'roles', name: 'Roles & Permissions', href: '/dashboard/roles-v2', icon: Shield, description: 'Access control', badge: 'New' },
          { id: 'compliance', name: 'Compliance', href: '/dashboard/compliance-v2', icon: Shield, description: 'Regulatory compliance', badge: 'New' },
          { id: 'monitoring', name: 'Monitoring', href: '/dashboard/monitoring-v2', icon: Gauge, description: 'System monitoring', badge: 'New' },
          { id: 'onboarding', name: 'Onboarding', href: '/dashboard/onboarding-v2', icon: UserPlus, description: 'User onboarding', badge: 'New' }
        ]
      },
      {
        id: 'hr',
        name: 'Human Resources',
        visible: true,
        items: [
          { id: 'recruitment', name: 'Recruitment', href: '/dashboard/recruitment-v2', icon: UserPlus, description: 'Hiring management', badge: 'New' },
          { id: 'training', name: 'Training', href: '/dashboard/training-v2', icon: BookOpen, description: 'Employee training', badge: 'New' },
          { id: 'learning', name: 'Learning', href: '/dashboard/learning-v2', icon: BookOpen, description: 'Learning platform', badge: 'New' },
          { id: 'courses', name: 'Courses', href: '/dashboard/courses-v2', icon: BookOpen, description: 'Course management', badge: 'New' }
        ]
      },
      {
        id: 'admin-automation',
        name: 'Business Automation',
        visible: true,
        items: [
          { id: 'email-agent', name: 'Business Agent', href: '/dashboard/email-agent', icon: Zap, description: 'AI automation hub', badge: 'New' },
          { id: 'email-agent-setup', name: 'Setup Integrations', href: '/dashboard/email-agent/setup', icon: Settings, description: '5-min setup' }
        ]
      }
    ]
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    icon: Palette,
    visible: true,
    subcategories: [
      {
        id: 'video-media',
        name: 'Video & Media',
        visible: true,
        items: [
          { id: 'video-studio', name: 'Video Studio', href: '/dashboard/video-studio-v2', icon: Video, description: 'Video editing' },
          { id: 'canvas', name: 'Canvas', href: '/dashboard/canvas-v2', icon: Palette, description: 'Design canvas' },
          { id: 'gallery', name: 'Gallery', href: '/dashboard/gallery-v2', icon: Image, description: 'Media gallery' },
          { id: 'screen-recording', name: 'Screen Recording', href: '/dashboard/screen-recording-v2', icon: Monitor, description: 'Screen capture', badge: 'New' }
        ]
      },
      {
        id: 'audio-music',
        name: 'Audio & Music',
        visible: true,
        items: [
          { id: 'audio-studio', name: 'Audio Studio', href: '/dashboard/audio-studio-v2', icon: Music, description: 'Audio production', badge: 'New' },
          { id: 'voice-collaboration', name: 'Voice Collaboration', href: '/dashboard/voice-collaboration', icon: Mic, description: 'Voice calls', badge: 'New' }
        ]
      },
      {
        id: '3d-animation',
        name: '3D & Animation',
        visible: true,
        items: [
          { id: '3d-modeling', name: '3D Modeling', href: '/dashboard/3d-modeling-v2', icon: Box, description: '3D design', badge: 'New' },
          { id: 'motion-graphics', name: 'Motion Graphics', href: '/dashboard/motion-graphics-v2', icon: Film, description: 'Motion design', badge: 'New' }
        ]
      },
      {
        id: 'portfolio',
        name: 'Portfolio',
        visible: true,
        items: [
          { id: 'cv-portfolio', name: 'CV Portfolio', href: '/dashboard/cv-portfolio', icon: Briefcase, description: 'CV builder' }
        ]
      }
    ]
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    visible: true,
    subcategories: [
      {
        id: 'settings-main',
        name: 'Settings & Configuration',
        visible: true,
        items: [
          { id: 'settings', name: 'Settings', href: '/dashboard/settings-v2', icon: Settings, description: 'Account settings', badge: 'NewTab' },
          { id: 'profile', name: 'Profile', href: '/dashboard/profile-v2', icon: User, description: 'Your profile', badge: 'New' },
          { id: 'notifications', name: 'Notifications', href: '/dashboard/notifications-v2', icon: Bell, description: 'Alerts', badge: 'NewTab' },
          { id: 'white-label', name: 'White Label', href: '/dashboard/white-label', icon: Crown, description: 'Rebrand platform', badge: 'Pro' },
          { id: 'plugins', name: 'Plugins', href: '/dashboard/plugin-marketplace', icon: Package, description: 'App integrations', badge: 'New' },
          { id: 'integrations-marketplace', name: 'Integrations', href: '/dashboard/integrations-v2', icon: Layers, description: 'Third-party integrations', badge: 'New' },
          { id: 'browser-extension', name: 'Browser Extension', href: '/dashboard/browser-extension', icon: Monitor, description: 'Browser extension', badge: 'New' },
          { id: 'desktop-app', name: 'Desktop App', href: '/dashboard/desktop-app-v2', icon: Monitor, description: 'Desktop version', badge: 'New' },
          { id: 'mobile-app', name: 'Mobile App', href: '/dashboard/mobile-app-v2', icon: Smartphone, description: 'Mobile version', badge: 'New' }
        ]
      },
      {
        id: 'developer',
        name: 'Developer',
        visible: true,
        items: [
          { id: 'api-keys', name: 'API Keys', href: '/dashboard/api-keys-v2', icon: Code, description: 'API management', badge: 'New' },
          { id: 'webhooks', name: 'Webhooks', href: '/dashboard/webhooks-v2', icon: Zap, description: 'Webhook configuration', badge: 'New' },
          { id: 'automation', name: 'Automation', href: '/dashboard/automation-v2', icon: Zap, description: 'Workflow automation', badge: 'New' }
        ]
      },
      {
        id: 'security-audit',
        name: 'Security & Audit',
        visible: true,
        items: [
          { id: 'audit-logs', name: 'Audit Logs', href: '/dashboard/audit-logs-v2', icon: FileText, description: 'Activity audit trail', badge: 'New' },
          { id: 'security-audit', name: 'Security Audit', href: '/dashboard/security-audit-v2', icon: Shield, description: 'Security analysis', badge: 'New' },
          { id: 'access-logs', name: 'Access Logs', href: '/dashboard/access-logs-v2', icon: FileText, description: 'Access history', badge: 'New' }
        ]
      },
      {
        id: 'help-support',
        name: 'Help & Support',
        visible: true,
        items: [
          { id: 'help-center', name: 'Help Center', href: '/dashboard/help-center-v2', icon: BookOpen, description: 'Help documentation', badge: 'New' },
          { id: 'help-docs', name: 'Help Docs', href: '/dashboard/help-docs-v2', icon: FileQuestion, description: 'Documentation', badge: 'New' },
          { id: 'faq', name: 'FAQ', href: '/dashboard/faq-v2', icon: MessageSquare, description: 'Common questions', badge: 'New' },
          { id: 'tutorials', name: 'Tutorials', href: '/dashboard/tutorials-v2', icon: BookOpen, description: 'How-to guides', badge: 'New' },
          { id: 'changelog', name: 'Changelog', href: '/dashboard/changelog-v2', icon: FileText, description: 'Release notes', badge: 'New' },
          { id: 'roadmap', name: 'Roadmap', href: '/dashboard/roadmap-v2', icon: Target, description: 'Product roadmap', badge: 'New' },
          { id: 'support', name: 'Support', href: '/dashboard/support-v2', icon: Headphones, description: 'Get help', badge: 'New' },
          { id: 'customer-support', name: 'Customer Support', href: '/dashboard/customer-support-v2', icon: LifeBuoy, description: 'Support center', badge: 'New' },
          { id: 'customer-success', name: 'Customer Success', href: '/dashboard/customer-success-v2', icon: Heart, description: 'Success team', badge: 'New' },
          { id: 'knowledge-base', name: 'Knowledge Base', href: '/dashboard/knowledge-base-v2', icon: BookOpen, description: 'Knowledge center', badge: 'New' },
          { id: 'knowledge-articles', name: 'Knowledge Articles', href: '/dashboard/knowledge-articles-v2', icon: FileText, description: 'Help articles', badge: 'New' },
          { id: 'docs', name: 'Docs', href: '/dashboard/docs-v2', icon: FileText, description: 'Documentation', badge: 'New' },
          { id: 'documentation', name: 'Documentation', href: '/dashboard/documentation-v2', icon: BookOpen, description: 'Full docs', badge: 'New' }
        ]
      }
    ]
  },
  {
    id: 'commerce-logistics',
    name: 'Commerce & Logistics',
    icon: Store,
    visible: true,
    subcategories: [
      {
        id: 'marketplace',
        name: 'Marketplace',
        visible: true,
        items: [
          { id: 'marketplace', name: 'Marketplace', href: '/dashboard/marketplace-v2', icon: Store, description: 'App marketplace', badge: 'New' },
          { id: 'app-store', name: 'App Store', href: '/dashboard/app-store-v2', icon: Store, description: 'Applications', badge: 'New' },
          { id: 'theme-store', name: 'Theme Store', href: '/dashboard/theme-store-v2', icon: Palette, description: 'Themes & templates', badge: 'New' },
          { id: 'pricing', name: 'Pricing', href: '/dashboard/pricing-v2', icon: Tag, description: 'Price management', badge: 'New' },
          { id: 'add-ons', name: 'Add-ons', href: '/dashboard/add-ons-v2', icon: Puzzle, description: 'Extensions', badge: 'New' },
          { id: 'subscriptions', name: 'Subscriptions', href: '/dashboard/subscriptions-v2', icon: CreditCard, description: 'Subscription management', badge: 'New' },
          { id: 'vendors', name: 'Vendors', href: '/dashboard/vendors-v2', icon: Users, description: 'Vendor management', badge: 'New' },
          { id: 'disputes', name: 'Disputes', href: '/dashboard/disputes', icon: AlertTriangle, description: 'Dispute resolution', badge: 'New' },
          { id: 'jobs', name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase, description: 'Job postings', badge: 'New' }
        ]
      },
      {
        id: 'logistics',
        name: 'Logistics & Shipping',
        visible: true,
        items: [
          { id: 'shipping', name: 'Shipping', href: '/dashboard/shipping-v2', icon: Truck, description: 'Shipping management', badge: 'New' },
          { id: 'warehouse', name: 'Warehouse', href: '/dashboard/warehouse-v2', icon: Warehouse, description: 'Warehouse management', badge: 'New' },
          { id: 'logistics', name: 'Logistics', href: '/dashboard/logistics-v2', icon: Truck, description: 'Logistics hub', badge: 'New' },
          { id: 'stock', name: 'Stock', href: '/dashboard/stock-v2', icon: Package, description: 'Stock control', badge: 'New' }
        ]
      },
      {
        id: 'tickets-renewals',
        name: 'Tickets & Renewals',
        visible: true,
        items: [
          { id: 'tickets', name: 'Tickets', href: '/dashboard/tickets-v2', icon: Ticket, description: 'Ticket system', badge: 'New' },
          { id: 'renewals', name: 'Renewals', href: '/dashboard/renewals-v2', icon: RefreshCw, description: 'Subscription renewals', badge: 'New' }
        ]
      }
    ]
  },
  {
    id: 'devops',
    name: 'DevOps & Development',
    icon: Terminal,
    visible: true,
    subcategories: [
      {
        id: 'development',
        name: 'Development',
        visible: true,
        items: [
          { id: 'api', name: 'API', href: '/dashboard/api-v2', icon: Code, description: 'API management', badge: 'New' },
          { id: 'bugs', name: 'Bugs', href: '/dashboard/bugs-v2', icon: Bug, description: 'Bug tracking', badge: 'New' },
          { id: 'qa', name: 'QA', href: '/dashboard/qa-v2', icon: TestTube, description: 'Quality assurance', badge: 'New' },
          { id: 'testing', name: 'Testing', href: '/dashboard/testing-v2', icon: TestTube, description: 'Test management', badge: 'New' },
          { id: 'builds', name: 'Builds', href: '/dashboard/builds-v2', icon: Package, description: 'Build management', badge: 'New' },
          { id: 'releases', name: 'Releases', href: '/dashboard/releases-v2', icon: Rocket, description: 'Release management', badge: 'New' },
          { id: 'release-notes', name: 'Release Notes', href: '/dashboard/release-notes-v2', icon: FileText, description: 'Version notes', badge: 'New' }
        ]
      },
      {
        id: 'deployment',
        name: 'Deployment & CI/CD',
        visible: true,
        items: [
          { id: 'deployments', name: 'Deployments', href: '/dashboard/deployments-v2', icon: Rocket, description: 'Deploy management', badge: 'New' },
          { id: 'ci-cd', name: 'CI/CD', href: '/dashboard/ci-cd-v2', icon: GitBranch, description: 'CI/CD pipelines', badge: 'New' },
          { id: 'dependencies', name: 'Dependencies', href: '/dashboard/dependencies-v2', icon: Layers, description: 'Dependency management', badge: 'New' }
        ]
      },
      {
        id: 'integrations',
        name: 'Integrations',
        visible: true,
        items: [
          { id: 'connectors', name: 'Connectors', href: '/dashboard/connectors-v2', icon: Plug, description: 'Data connectors', badge: 'New' },
          { id: 'extensions', name: 'Extensions', href: '/dashboard/extensions-v2', icon: Puzzle, description: 'Platform extensions', badge: 'New' },
          { id: 'plugins', name: 'Plugins', href: '/dashboard/plugins-v2', icon: Puzzle, description: 'Plugin management', badge: 'New' },
          { id: 'third-party-integrations', name: 'Third-Party Integrations', href: '/dashboard/third-party-integrations-v2', icon: LinkIcon, description: 'External services', badge: 'New' },
          { id: 'integrations-marketplace', name: 'Integrations Marketplace', href: '/dashboard/integrations-marketplace-v2', icon: Store, description: 'Integration store', badge: 'New' }
        ]
      },
      {
        id: 'workflows-automation',
        name: 'Workflows & Automation',
        visible: true,
        items: [
          { id: 'kazi-workflows', name: 'Kazi Workflows', href: '/dashboard/kazi-workflows-v2', icon: Workflow, description: 'Visual workflow automation', badge: 'Hot' },
          { id: 'kazi-automations', name: 'Kazi Automations', href: '/dashboard/kazi-automations-v2', icon: Zap, description: 'Business automation rules', badge: 'Hot' },
          { id: 'workflows', name: 'Workflows', href: '/dashboard/workflows-v2', icon: Workflow, description: 'Workflow automation', badge: 'New' },
          { id: 'automations', name: 'Automations', href: '/dashboard/automations-v2', icon: Zap, description: 'Automation rules', badge: 'New' },
          { id: 'automation-recipes', name: 'Automation Recipes', href: '/dashboard/automation-recipes-v2', icon: Zap, description: 'Pre-built automations', badge: 'New' }
        ]
      }
    ]
  },
  {
    id: 'project-tools',
    name: 'Project Tools',
    icon: ClipboardList,
    visible: true,
    subcategories: [
      {
        id: 'agile',
        name: 'Agile & Sprints',
        visible: true,
        items: [
          { id: 'sprints', name: 'Sprints', href: '/dashboard/sprints-v2', icon: Timer, description: 'Sprint planning', badge: 'New' },
          { id: 'milestones', name: 'Milestones', href: '/dashboard/milestones-v2', icon: Target, description: 'Project milestones', badge: 'New' },
          { id: 'capacity', name: 'Capacity', href: '/dashboard/capacity-v2', icon: Gauge, description: 'Team capacity', badge: 'New' },
          { id: 'allocation', name: 'Allocation', href: '/dashboard/allocation-v2', icon: PieChart, description: 'Resource allocation', badge: 'New' },
          { id: 'tasks', name: 'Tasks', href: '/dashboard/tasks-v2', icon: CheckSquare, description: 'Task management', badge: 'New' },
          { id: 'goals', name: 'Goals', href: '/dashboard/goals', icon: Target, description: 'Goal tracking', badge: 'New' }
        ]
      },
      {
        id: 'resources',
        name: 'Resources',
        visible: true,
        items: [
          { id: 'resources', name: 'Resources', href: '/dashboard/resources-v2', icon: Folder, description: 'Resource management', badge: 'New' },
          { id: 'forms', name: 'Forms', href: '/dashboard/forms-v2', icon: ClipboardList, description: 'Form builder', badge: 'New' },
          { id: 'registrations', name: 'Registrations', href: '/dashboard/registrations-v2', icon: UserPlus, description: 'Registration management', badge: 'New' },
          { id: 'certifications', name: 'Certifications', href: '/dashboard/certifications-v2', icon: Award, description: 'Certifications', badge: 'New' }
        ]
      }
    ]
  },
  {
    id: 'communication-hub',
    name: 'Communication Hub',
    icon: MessagesSquare,
    visible: true,
    subcategories: [
      {
        id: 'messaging',
        name: 'Messaging',
        visible: true,
        items: [
          { id: 'messaging', name: 'Messaging', href: '/dashboard/messaging-v2', icon: MessageSquare, description: 'Team messaging', badge: 'New' },
          { id: 'chat', name: 'Chat', href: '/dashboard/chat-v2', icon: MessagesSquare, description: 'Live chat', badge: 'New' },
          { id: 'broadcasts', name: 'Broadcasts', href: '/dashboard/broadcasts-v2', icon: Radio, description: 'Broadcast messages', badge: 'New' },
          { id: 'announcements', name: 'Announcements', href: '/dashboard/announcements-v2', icon: Megaphone, description: 'Company announcements', badge: 'New' },
          { id: 'community', name: 'Community', href: '/dashboard/community-v2', icon: Users, description: 'Community forum', badge: 'New' },
          { id: 'polls', name: 'Polls', href: '/dashboard/polls-v2', icon: BarChart2, description: 'Team polls', badge: 'New' }
        ]
      }
    ]
  },
  {
    id: 'admin-security',
    name: 'Admin & Security',
    icon: Shield,
    visible: true,
    subcategories: [
      {
        id: 'admin-panel',
        name: 'Admin Panel',
        visible: true,
        items: [
          { id: 'admin', name: 'Admin', href: '/dashboard/admin-v2', icon: Shield, description: 'Admin dashboard', badge: 'New' },
          { id: 'user-management-v2', name: 'User Management', href: '/dashboard/user-management-v2', icon: Users, description: 'Manage users', badge: 'New' },
          { id: 'permissions', name: 'Permissions', href: '/dashboard/permissions-v2', icon: Key, description: 'Permission settings', badge: 'New' },
          { id: 'security', name: 'Security', href: '/dashboard/security-v2', icon: Lock, description: 'Security settings', badge: 'New' },
          { id: 'directory-sync', name: 'Directory Sync', href: '/dashboard/directory-sync-v2', icon: FolderSync, description: 'Directory synchronization', badge: 'New' },
          { id: 'white-label-v2', name: 'White Label', href: '/dashboard/white-label-v2', icon: Palette, description: 'Platform branding', badge: 'Pro' }
        ]
      },
      {
        id: 'monitoring-logs',
        name: 'Monitoring & Logs',
        visible: true,
        items: [
          { id: 'logs', name: 'Logs', href: '/dashboard/logs-v2', icon: FileText, description: 'System logs', badge: 'New' },
          { id: 'activity-logs', name: 'Activity Logs', href: '/dashboard/activity-logs-v2', icon: Activity, description: 'Activity tracking', badge: 'New' },
          { id: 'audit-trail', name: 'Audit Trail', href: '/dashboard/audit-trail', icon: FileText, description: 'Audit history', badge: 'New' },
          { id: 'audit', name: 'Audit', href: '/dashboard/audit-v2', icon: Shield, description: 'Audit management', badge: 'New' },
          { id: 'alerts', name: 'Alerts', href: '/dashboard/alerts-v2', icon: AlertTriangle, description: 'System alerts', badge: 'New' },
          { id: 'maintenance', name: 'Maintenance', href: '/dashboard/maintenance-v2', icon: Wrench, description: 'System maintenance', badge: 'New' },
          { id: 'health-score', name: 'Health Score', href: '/dashboard/health-score-v2', icon: Activity, description: 'System health', badge: 'New' },
          { id: 'vulnerability-scan', name: 'Vulnerability Scan', href: '/dashboard/vulnerability-scan-v2', icon: Shield, description: 'Security scanning', badge: 'New' }
        ]
      }
    ]
  },
  {
    id: 'reports-analytics',
    name: 'Reports & Analytics',
    icon: PieChart,
    visible: true,
    subcategories: [
      {
        id: 'reports-main',
        name: 'Reports',
        visible: true,
        items: [
          { id: 'reporting', name: 'Reporting', href: '/dashboard/reporting-v2', icon: FileBarChart, description: 'Report generation', badge: 'New' },
          { id: 'overview', name: 'Overview', href: '/dashboard/overview-v2', icon: BarChart3, description: 'Dashboard overview', badge: 'New' },
          { id: 'performance', name: 'Performance', href: '/dashboard/performance-v2', icon: Gauge, description: 'Performance reports', badge: 'New' },
          { id: 'financial-hub', name: 'Financial Hub', href: '/dashboard/financial-hub', icon: DollarSign, description: 'Financial overview', badge: 'New' },
          { id: 'marketing', name: 'Marketing', href: '/dashboard/marketing-v2', icon: Target, description: 'Marketing analytics', badge: 'New' }
        ]
      }
    ]
  },
  {
    id: 'misc',
    name: 'More Features',
    icon: Layers,
    visible: true,
    subcategories: [
      {
        id: 'additional',
        name: 'Additional Pages',
        visible: true,
        items: [
          { id: 'files', name: 'Files', href: '/dashboard/files-hub-v2', icon: FolderOpen, description: 'File manager', badge: 'New' },
          { id: 'booking', name: 'Booking', href: '/dashboard/bookings-v2', icon: Calendar, description: 'Booking page', badge: 'New' },
          { id: 'team-page', name: 'Team', href: '/dashboard/team-hub-v2', icon: Users, description: 'Team page', badge: 'New' },
          { id: 'features', name: 'Features', href: '/dashboard/features-v2', icon: Sparkles, description: 'Feature list', badge: 'New' },
          { id: 'coming-soon', name: 'Coming Soon', href: '/dashboard/coming-soon', icon: Rocket, description: 'Coming soon', badge: 'New' },
          { id: 'ai-enhanced', name: 'AI Enhanced', href: '/dashboard/ai-enhanced', icon: Brain, description: 'AI features', badge: 'New' },
          { id: 'content-studio', name: 'Content Studio', href: '/dashboard/content-studio-v2', icon: Edit, description: 'Content creation', badge: 'New' },
          { id: 'content', name: 'Content', href: '/dashboard/content-v2', icon: FileText, description: 'Content management', badge: 'New' }
        ]
      },
      {
        id: 'showcases',
        name: 'Showcases & Demos',
        visible: true,
        items: [
          { id: 'a-plus-showcase', name: 'A+ Showcase', href: '/dashboard/a-plus-showcase', icon: Star, description: 'Premium showcase', badge: 'Demo' },
          { id: 'advanced-features-demo', name: 'Advanced Features', href: '/dashboard/advanced-features-demo', icon: Lightbulb, description: 'Feature demo', badge: 'Demo' },
          { id: 'advanced-micro-features', name: 'Micro Features', href: '/dashboard/advanced-micro-features', icon: Component, description: 'Micro features', badge: 'Demo' },
          { id: 'collaboration-demo', name: 'Collaboration Demo', href: '/dashboard/collaboration-demo', icon: Users, description: 'Collab demo', badge: 'Demo' },
          { id: 'component-library', name: 'Component Library', href: '/dashboard/component-library-v2', icon: Component, description: 'UI components', badge: 'Demo' },
          { id: 'comprehensive-testing', name: 'Comprehensive Testing', href: '/dashboard/comprehensive-testing', icon: TestTube, description: 'Testing suite', badge: 'Demo' },
          { id: 'example-modern', name: 'Modern Example', href: '/dashboard/example-modern', icon: Sparkles, description: 'Modern dashboard', badge: 'Demo' },
          { id: 'feature-testing', name: 'Feature Testing', href: '/dashboard/feature-testing', icon: TestTube, description: 'Feature tests', badge: 'Demo' },
          { id: 'micro-features-showcase', name: 'Micro Features Showcase', href: '/dashboard/micro-features-showcase', icon: Component, description: 'Micro features', badge: 'Demo' },
          { id: 'shadcn-showcase', name: 'Shadcn Showcase', href: '/dashboard/shadcn-showcase', icon: Palette, description: 'UI showcase', badge: 'Demo' },
          { id: 'ui-showcase', name: 'UI Showcase', href: '/dashboard/ui-showcase', icon: LayoutGrid, description: 'UI components', badge: 'Demo' },
          { id: 'upgrades-showcase', name: 'Upgrades Showcase', href: '/dashboard/upgrades-showcase', icon: ArrowUpRight, description: 'Upgrade options', badge: 'Demo' },
          { id: 'widget-library', name: 'Widget Library', href: '/dashboard/widget-library-v2', icon: Grid, description: 'Widget collection', badge: 'Demo' }
        ]
      }
    ]
  }
]

// Helper to transform hrefs for V1 context
function getVersionedHref(href: string, pathname: string | null): string {
  // If we're in V1 context, transform dashboard hrefs to V1 paths
  if (pathname?.startsWith('/v1/')) {
    if (href.startsWith('/dashboard/')) {
      // Remove -v2 suffix and add /v1 prefix
      const v1Href = href.replace(/-v2$/, '').replace('/dashboard/', '/v1/dashboard/')
      return v1Href
    }
    if (href === '/dashboard') {
      return '/v1/dashboard'
    }
  }
  return href
}

// Sortable subcategory component
function SortableSubcategory({
  subcategory,
  categoryId,
  isExpanded,
  onToggle,
  isActive,
  pathname,
  isCustomizing
}: {
  subcategory: SidebarSubcategory
  categoryId: string
  isExpanded: boolean
  onToggle: () => void
  isActive: (href: string) => boolean
  pathname: string | null
  isCustomizing: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: subcategory.id, disabled: !isCustomizing })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const hasActiveItem = subcategory.items.some(item => isActive(getVersionedHref(item.href, pathname)))

  if (!subcategory.visible && !isCustomizing) return null

  return (
    <div ref={setNodeRef} style={style} className="ml-2 space-y-1">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-md transition-all group min-w-0',
          'hover:bg-gray-50 dark:hover:bg-gray-900',
          hasActiveItem
            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
            : 'text-gray-600 dark:text-gray-400',
          !subcategory.visible && 'opacity-50'
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isCustomizing && (
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-shrink-0">
              <GripVertical className="h-3 w-3 text-gray-400" />
            </div>
          )}
          <span className="uppercase tracking-wide truncate">{subcategory.name}</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-3 w-3" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="ml-2 space-y-0.5 overflow-hidden"
          >
            {subcategory.items.map((item) => {
              const ItemIcon = item.icon
              const versionedHref = getVersionedHref(item.href, pathname)
              const itemIsActive = isActive(versionedHref)

              return (
                <Link
                  key={item.href}
                  href={versionedHref}
                  data-tour={`nav-${item.id}`}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-all duration-200 group min-w-0',
                    itemIsActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <ItemIcon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      itemIsActive
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'
                    )}
                  />
                  <span className="flex-1 truncate min-w-0">{item.name}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 text-xs font-medium rounded flex-shrink-0',
                        itemIsActive
                          ? 'bg-white/20 text-white'
                          : item.badge === 'Pro'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SidebarEnhanced() {
  const pathname = usePathname()
  const { userId } = useCurrentUser()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [categories, setCategories] = useState<SidebarCategory[]>(DEFAULT_CATEGORIES)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'ai-creative-suite',
    'collaboration',
    'storage',
    'business-intelligence',
    'admin-overview',
    'creative-studio',
    'settings'
  ])
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([])
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [savedPresets, setSavedPresets] = useState<Array<{ id: string, name: string, config: SidebarCategory[] }>>([])
  const [activePreset, setActivePreset] = useState<string>('default')
  const [showPresetSaved, setShowPresetSaved] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Load saved configuration and presets from localStorage
  useEffect(() => {
    // Ensure this only runs on client
    if (typeof window === 'undefined') return

    const saved = localStorage.getItem('kazi-navigation-config')
    const presets = localStorage.getItem('kazi-navigation-presets')
    const active = localStorage.getItem('kazi-navigation-active-preset')

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCategories(parsed)
      } catch {
        // Silently ignore invalid localStorage data
      }
    }

    if (presets) {
      try {
        const parsedPresets = JSON.parse(presets)
        setSavedPresets(parsedPresets)
      } catch {
        // Silently ignore invalid localStorage data
      }
    }

    if (active) {
      setActivePreset(active)
    }

    // Track that user has seen the customization feature
    const hasSeenCustomization = localStorage.getItem('kazi-seen-customization')
    if (!hasSeenCustomization) {
      const timeoutId = setTimeout(() => {
        toast.info('💡 Pro Tip: Customize your navigation!', {
          description: 'Click "Customize Navigation" to personalize your workspace',
          duration: 8000,
          action: {
            label: 'Show me',
            onClick: () => setIsSettingsOpen(true)
          }
        })
        localStorage.setItem('kazi-seen-customization', 'true')
      }, 3000)

      return () => clearTimeout(timeoutId)
    }
  }, [])

  // Auto-expand the subcategory containing the current page
  useEffect(() => {
    const allSubcategories: string[] = []
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        const hasActiveItem = subcategory.items.some(item => pathname === item.href)
        if (hasActiveItem && !expandedSubcategories.includes(subcategory.id)) {
          allSubcategories.push(subcategory.id)
        }
      })
    })
    if (allSubcategories.length > 0) {
      setExpandedSubcategories(prev => [...new Set([...prev, ...allSubcategories])])
    }
  }, [pathname, categories])

  const saveConfiguration = (newCategories: SidebarCategory[]) => {
    setCategories(newCategories)
    localStorage.setItem('kazi-navigation-config', JSON.stringify(newCategories))

    // Track customization event
    const customizationCount = parseInt(localStorage.getItem('kazi-customization-count') || '0') + 1
    localStorage.setItem('kazi-customization-count', customizationCount.toString())

    toast.success('✅ Navigation saved successfully', {
      description: `Your personalized workspace is ready! (${customizationCount} customizations)`,
      duration: 3000
    })
  }

  const saveAsPreset = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name')
      return
    }

    const newPreset = {
      id: Date.now().toString(),
      name: presetName,
      config: categories
    }

    const updatedPresets = [...savedPresets, newPreset]
    setSavedPresets(updatedPresets)
    localStorage.setItem('kazi-navigation-presets', JSON.stringify(updatedPresets))
    setActivePreset(newPreset.id)
    localStorage.setItem('kazi-navigation-active-preset', newPreset.id)
    setPresetName('')
    setShowPresetSaved(true)

    toast.success('🎯 Preset saved!', {
      description: `"${newPreset.name}" is now available for quick switching`,
      duration: 4000
    })

    setTimeout(() => setShowPresetSaved(false), 3000)
  }

  const loadPreset = (presetId: string) => {
    if (presetId === 'default') {
      setCategories(DEFAULT_CATEGORIES)
      localStorage.setItem('kazi-navigation-config', JSON.stringify(DEFAULT_CATEGORIES))
    } else {
      const preset = savedPresets.find(p => p.id === presetId)
      if (preset) {
        setCategories(preset.config)
        localStorage.setItem('kazi-navigation-config', JSON.stringify(preset.config))
        toast.success(`Loaded "${preset.name}" preset`, { duration: 2000 })
      }
    }
    setActivePreset(presetId)
    localStorage.setItem('kazi-navigation-active-preset', presetId)
  }

  const deletePreset = (presetId: string) => {
    const preset = savedPresets.find(p => p.id === presetId)
    const updatedPresets = savedPresets.filter(p => p.id !== presetId)
    setSavedPresets(updatedPresets)
    localStorage.setItem('kazi-navigation-presets', JSON.stringify(updatedPresets))

    if (activePreset === presetId) {
      loadPreset('default')
    }

    toast.success(`Deleted "${preset?.name}" preset`, { duration: 2000 })
  }

  const resetToDefault = () => {
    setCategories(DEFAULT_CATEGORIES)
    localStorage.setItem('kazi-navigation-config', JSON.stringify(DEFAULT_CATEGORIES))
    setActivePreset('default')
    localStorage.setItem('kazi-navigation-active-preset', 'default')

    toast.success('Navigation reset to defaults', {
      description: 'Your navigation has been restored to the original layout',
      duration: 2000
    })
  }

  const applyWorkflowPreset = (workflow: string) => {
    let workflowConfig: SidebarCategory[] = []

    switch (workflow) {
      case 'creator':
        workflowConfig = DEFAULT_CATEGORIES.map(cat => ({
          ...cat,
          visible: ['ai-creative-suite', 'creative-studio', 'storage'].includes(cat.id)
        }))
        break
      case 'business':
        workflowConfig = DEFAULT_CATEGORIES.map(cat => ({
          ...cat,
          visible: ['business-intelligence', 'admin-overview', 'settings'].includes(cat.id)
        }))
        break
      case 'developer':
        workflowConfig = DEFAULT_CATEGORIES.map(cat => ({
          ...cat,
          visible: ['ai-creative-suite', 'business-intelligence', 'storage'].includes(cat.id)
        }))
        break
      case 'all':
        workflowConfig = DEFAULT_CATEGORIES
        break
    }

    setCategories(workflowConfig)
    saveConfiguration(workflowConfig)

    toast.success(`🎨 Applied ${workflow} workflow`, {
      description: 'Navigation optimized for your workflow',
      duration: 3000
    })
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId]
    )
  }

  const toggleCategoryVisibility = (categoryId: string) => {
    const newCategories = categories.map(cat =>
      cat.id === categoryId ? { ...cat, visible: !cat.visible } : cat
    )
    saveConfiguration(newCategories)
  }

  const toggleSubcategoryVisibility = (categoryId: string, subcategoryId: string) => {
    const newCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories.map(sub =>
            sub.id === subcategoryId ? { ...sub, visible: !sub.visible } : sub
          )
        }
      }
      return cat
    })
    saveConfiguration(newCategories)
  }

  const handleDragEnd = (event: DragEndEvent, categoryId: string) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const newCategories = categories.map(cat => {
        if (cat.id === categoryId) {
          const oldIndex = cat.subcategories.findIndex(sub => sub.id === active.id)
          const newIndex = cat.subcategories.findIndex(sub => sub.id === over.id)
          return {
            ...cat,
            subcategories: arrayMove(cat.subcategories, oldIndex, newIndex)
          }
        }
        return cat
      })
      saveConfiguration(newCategories)
    }
  }

  const isActive = (href: string) => {
    if (!pathname) return false
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  }

  return (
    <aside
      data-tour="sidebar-nav"
      className={cn(
        "fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth p-4 space-y-1">
        {/* Navigation Categories */}
        {categories.map((category) => {
          if (!category.visible) return null

          const isCategoryExpanded = expandedCategories.includes(category.id)
          const CategoryIcon = category.icon

          return (
            <div key={category.id} className="space-y-1">
              <button
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 min-w-0',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'text-gray-900 dark:text-gray-100'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <CategoryIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="truncate">{category.name}</span>
                </div>
                <motion.div
                  animate={{ rotate: isCategoryExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isCategoryExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 overflow-hidden"
                  >
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, category.id)}
                    >
                      <SortableContext
                        items={category.subcategories.map(sub => sub.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {category.subcategories.map((subcategory) => (
                          <SortableSubcategory
                            key={subcategory.id}
                            subcategory={subcategory}
                            categoryId={category.id}
                            isExpanded={expandedSubcategories.includes(subcategory.id)}
                            onToggle={() => toggleSubcategory(subcategory.id)}
                            isActive={isActive}
                            pathname={pathname}
                            isCustomizing={isCustomizing}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {/* Coming Soon */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href={getVersionedHref('/dashboard/coming-soon', pathname)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-all duration-200 min-w-0',
              isActive(getVersionedHref('/dashboard/coming-soon', pathname))
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <Rocket className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 truncate">Coming Soon</span>
            <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-gradient-to-r from-blue-500 to-purple-500 text-white flex-shrink-0">
              New
            </span>
          </Link>
        </div>
      </div>

      {/* Online Presence Widget */}
      <div className="px-4 pb-4">
        <GlobalPresenceWidget userId={userId || '00000000-0000-0000-0000-000000000001'} />
      </div>

      {/* Customize Navigation - Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 min-w-0"
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Customize Navigation</span>
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-950 border-2 border-gray-300 dark:border-gray-700"
            style={{ backgroundColor: 'white', color: 'black' }}
          >
            <DialogHeader className="pb-4 border-b-2 border-gray-300 dark:border-gray-700" style={{ backgroundColor: 'white' }}>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2" style={{ color: 'black' }}>
                    <Wand2 className="h-6 w-6 text-blue-600" />
                    Customize Your Workspace
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2" style={{ color: '#4B5563' }}>
                    Personalize your navigation to match your workflow. Changes save automatically.
                  </DialogDescription>
                </div>
                <AnimatePresence>
                  {showPresetSaved && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-2 text-green-600"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Saved!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </DialogHeader>

            <Tabs defaultValue="customize" className="w-full" style={{ backgroundColor: 'white' }}>
              <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-100 dark:bg-gray-900" style={{ backgroundColor: '#F3F4F6' }}>
                <TabsTrigger
                  value="presets"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                  style={{ color: 'black' }}
                >
                  <Bookmark className="h-4 w-4" />
                  Quick Presets
                </TabsTrigger>
                <TabsTrigger
                  value="customize"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                  style={{ color: 'black' }}
                >
                  <Settings className="h-4 w-4" />
                  Customize
                </TabsTrigger>
                <TabsTrigger
                  value="saved"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                  style={{ color: 'black' }}
                >
                  <Star className="h-4 w-4" />
                  My Presets ({savedPresets.length})
                </TabsTrigger>
              </TabsList>

              {/* Quick Workflow Presets */}
              <TabsContent value="presets" className="space-y-4 p-4 bg-white dark:bg-gray-950" style={{ backgroundColor: 'white', color: 'black' }}>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => applyWorkflowPreset('creator')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold">Creator Mode</h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-left">
                      Optimized for content creation, video editing, and creative work
                    </p>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => applyWorkflowPreset('business')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Business Mode</h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-left">
                      Focus on analytics, admin tools, and business intelligence
                    </p>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => applyWorkflowPreset('developer')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold">Developer Mode</h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-left">
                      Streamlined for development, AI tools, and technical work
                    </p>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto flex-col items-start p-4 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => applyWorkflowPreset('all')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-semibold">Full Access</h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-left">
                      Show all features and tools for maximum flexibility
                    </p>
                  </Button>
                </div>

                <Separator className="my-4" />

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Pro Tip</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Apply a preset, then customize it further and save as your own! Perfect for creating role-specific views for your team.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Customization Tab */}
              <TabsContent value="customize" className="space-y-4 p-4 bg-white dark:bg-gray-950" style={{ backgroundColor: 'white', color: 'black' }}>
                <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2">
                  {/* Customization Mode Toggle */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div>
                      <Label htmlFor="customize-mode" className="text-sm font-medium text-gray-900 dark:text-white">
                        Reorder Mode
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Enable to drag and reorder subcategories
                      </p>
                    </div>
                    <Switch
                      id="customize-mode"
                      checked={isCustomizing}
                      onCheckedChange={(checked) => {
                        setIsCustomizing(checked)
                        toast.info(checked ? 'Reorder mode enabled - drag to reorder' : 'Reorder mode disabled', { duration: 2000 })
                      }}
                    />
                  </div>

                  {/* Categories Visibility */}
                  {categories.map((category) => (
                    <div key={category.id} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <category.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <span className="font-semibold text-gray-900 dark:text-white">{category.name}</span>
                        </div>
                        <Switch
                          checked={category.visible}
                          onCheckedChange={() => toggleCategoryVisibility(category.id)}
                        />
                      </div>

                      {/* Subcategories */}
                      <div className="ml-7 space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        {category.subcategories.map((subcategory) => (
                          <div key={subcategory.id} className="flex items-center justify-between text-sm py-1">
                            <span className={cn(
                              "text-gray-700 dark:text-gray-300",
                              !subcategory.visible && 'text-gray-400 dark:text-gray-600 line-through'
                            )}>
                              {subcategory.name}
                            </span>
                            <Switch
                              checked={subcategory.visible}
                              onCheckedChange={() =>
                                toggleSubcategoryVisibility(category.id, subcategory.id)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Save as Preset Section */}
                  <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Save className="h-4 w-4 text-purple-600" />
                      Save Current Layout as Preset
                    </h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., My Morning Workflow"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && saveAsPreset()}
                      />
                      <Button onClick={saveAsPreset} className="bg-purple-600 hover:bg-purple-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <Button
                    variant="outline"
                    onClick={resetToDefault}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default Layout
                  </Button>
                </div>
              </TabsContent>

              {/* My Presets Tab */}
              <TabsContent value="saved" className="space-y-4 p-4 bg-white dark:bg-gray-950" style={{ backgroundColor: 'white', color: 'black' }}>
                {savedPresets.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No saved presets yet
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Customize your navigation and save it as a preset for quick access
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const tabs = document.querySelector('[value="customize"]') as HTMLElement
                        tabs?.click()
                      }}
                    >
                      Start Customizing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Default Preset */}
                    <div
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all cursor-pointer',
                        activePreset === 'default'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-800 hover:border-blue-300'
                      )}
                      onClick={() => loadPreset('default')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                            <Star className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Default Layout</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Original KAZI workspace</p>
                          </div>
                        </div>
                        {activePreset === 'default' && (
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>

                    {/* User Saved Presets */}
                    {savedPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all cursor-pointer',
                          activePreset === preset.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-purple-300'
                        )}
                        onClick={() => loadPreset(preset.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                              <Bookmark className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{preset.name}</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {preset.config.filter(c => c.visible).length} sections visible
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {activePreset === preset.id && (
                              <CheckCircle2 className="h-5 w-5 text-purple-600" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm(`Delete "${preset.name}" preset?`)) {
                                  deletePreset(preset.id)
                                }
                              }}
                              className="hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  )
}
