'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  UserPlus,
  Search,
  Download,
  Mail,
  CheckCircle2,
  Clock,
  TrendingUp,
  Settings,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  QrCode,
  Calendar,
  MapPin,
  Phone,
  Building2,
  Briefcase,
  CreditCard,
  DollarSign,
  BarChart3,
  Send,
  Printer,
  Tag,
  List,
  Grid3X3,
  UserCheck,
  UserX,
  Timer,
  Ticket,
  Star,
  Globe,
  Shield,
  Utensils,
  Accessibility,
  RefreshCw,
  MoreHorizontal,
  XCircle,
  CheckCheck,
  Loader2,
  ArrowUpRight,
  Layers,
  Hash,
  Sliders,
  Webhook,
  Bell,
  Network
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'




import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CardDescription } from '@/components/ui/card'

// ============================================================================
// DATABASE TYPE DEFINITIONS
// ============================================================================

interface DbRegistration {
  id: string
  user_id: string
  organization_id: string | null
  event_id: string | null
  webinar_id: string | null
  registration_type: 'event' | 'webinar'
  registrant_name: string
  registrant_email: string
  registrant_phone: string | null
  company: string | null
  job_title: string | null
  status: 'pending' | 'confirmed' | 'attended' | 'no-show' | 'cancelled' | 'waitlist'
  ticket_type: 'free' | 'paid' | 'vip' | 'speaker' | 'sponsor' | 'press' | null
  ticket_price: number | null
  payment_status: 'pending' | 'paid' | 'refunded' | 'cancelled' | null
  checked_in_at: string | null
  attendance_duration: number | null
  confirmation_sent: boolean
  reminder_sent: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Form State Interface
interface RegistrationFormData {
  registrant_name: string
  registrant_email: string
  registrant_phone: string
  company: string
  job_title: string
  event_id: string
  registration_type: 'event' | 'webinar'
  ticket_type: 'free' | 'paid' | 'vip' | 'speaker' | 'sponsor' | 'press'
  ticket_price: number
  status: 'pending' | 'confirmed' | 'attended' | 'no-show' | 'cancelled' | 'waitlist'
  payment_status: 'pending' | 'paid' | 'refunded' | 'cancelled'
}

const initialFormData: RegistrationFormData = {
  registrant_name: '',
  registrant_email: '',
  registrant_phone: '',
  company: '',
  job_title: '',
  event_id: '',
  registration_type: 'event',
  ticket_type: 'paid',
  ticket_price: 0,
  status: 'pending',
  payment_status: 'pending'
}

// ============================================================================
// TYPE DEFINITIONS - Salesforce Level Event Registration
// ============================================================================

type RegistrationStatus = 'pending' | 'confirmed' | 'checked_in' | 'attended' | 'no_show' | 'cancelled' | 'waitlist' | 'refunded'
type TicketType = 'free' | 'early_bird' | 'regular' | 'vip' | 'speaker' | 'sponsor' | 'student' | 'group'
type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed' | 'waived'
type RegistrationType = 'event' | 'webinar' | 'conference' | 'workshop' | 'training' | 'meetup'
type CommunicationChannel = 'email' | 'sms' | 'whatsapp' | 'in_app'

interface Registration {
  id: string
  registrationNumber: string
  event: {
    id: string
    name: string
    type: RegistrationType
    date: string
    endDate?: string
    location: string
    isVirtual: boolean
    virtualLink?: string
  }
  attendee: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    company?: string
    jobTitle?: string
    avatar?: string
    linkedIn?: string
    dietaryRequirements?: string
    accessibilityNeeds?: string
  }
  ticketType: TicketType
  ticketPrice: number
  promoCode?: string
  discountAmount: number
  totalPaid: number
  paymentStatus: PaymentStatus
  paymentMethod?: string
  status: RegistrationStatus
  sessions: RegistrationSession[]
  checkedInAt?: string
  checkedInBy?: string
  attendanceDuration?: number
  qrCode: string
  badgePrinted: boolean
  communicationsSent: CommunicationLog[]
  customFields: Record<string, string>
  notes?: string
  source: string
  referralCode?: string
  groupId?: string
  isGroupLeader: boolean
  createdAt: string
  updatedAt: string
}

interface RegistrationSession {
  id: string
  sessionName: string
  track: string
  time: string
  capacity: number
  enrolled: number
  location: string
}

interface CommunicationLog {
  id: string
  type: CommunicationChannel
  subject: string
  sentAt: string
  opened: boolean
  clicked: boolean
}

interface Event {
  id: string
  name: string
  type: RegistrationType
  description: string
  date: string
  endDate?: string
  location: string
  isVirtual: boolean
  virtualLink?: string
  capacity: number
  registrationCount: number
  ticketTypes: TicketTypeConfig[]
  sessions: EventSession[]
  waitlistCount: number
  revenue: number
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
}

interface TicketTypeConfig {
  type: TicketType
  name: string
  price: number
  quantity: number
  sold: number
  benefits: string[]
}

interface EventSession {
  id: string
  name: string
  track: string
  speaker: string
  time: string
  duration: number
  capacity: number
  enrolled: number
  location: string
}

interface Analytics {
  totalRegistrations: number
  confirmedCount: number
  checkedInCount: number
  noShowCount: number
  cancelledCount: number
  waitlistCount: number
  totalRevenue: number
  avgTicketPrice: number
  conversionRate: number
  checkInRate: number
  registrationsByDay: { date: string; count: number }[]
  registrationsByTicketType: { type: TicketType; count: number; revenue: number }[]
  topReferralSources: { source: string; count: number }[]
  communicationStats: { type: string; sent: number; opened: number; clicked: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockEvents: Event[] = [
  {
    id: 'event-1',
    name: 'Tech Innovation Summit 2025',
    type: 'conference',
    description: 'Annual technology conference featuring industry leaders',
    date: '2025-03-15T09:00:00Z',
    endDate: '2025-03-17T18:00:00Z',
    location: 'San Francisco Convention Center',
    isVirtual: false,
    capacity: 500,
    registrationCount: 347,
    ticketTypes: [
      { type: 'early_bird', name: 'Early Bird', price: 299, quantity: 100, sold: 100, benefits: ['All sessions', 'Lunch included', 'Swag bag'] },
      { type: 'regular', name: 'Regular', price: 399, quantity: 300, sold: 197, benefits: ['All sessions', 'Lunch included', 'Swag bag'] },
      { type: 'vip', name: 'VIP', price: 799, quantity: 50, sold: 35, benefits: ['All sessions', 'VIP lounge', 'Speaker dinner', 'Premium swag'] },
      { type: 'student', name: 'Student', price: 99, quantity: 50, sold: 15, benefits: ['All sessions', 'Student networking'] }
    ],
    sessions: [
      { id: 'sess-1', name: 'AI in Enterprise', track: 'AI/ML', speaker: 'Dr. Sarah Chen', time: '10:00 AM', duration: 60, capacity: 150, enrolled: 142, location: 'Main Hall' },
      { id: 'sess-2', name: 'Cloud Architecture', track: 'Infrastructure', speaker: 'Mike Johnson', time: '11:30 AM', duration: 45, capacity: 100, enrolled: 87, location: 'Room A' }
    ],
    waitlistCount: 23,
    revenue: 98750,
    status: 'published'
  },
  {
    id: 'event-2',
    name: 'Product Management Workshop',
    type: 'workshop',
    description: 'Intensive workshop on modern product management techniques',
    date: '2025-02-20T10:00:00Z',
    location: 'Virtual',
    isVirtual: true,
    virtualLink: 'https://zoom.us/j/123456789',
    capacity: 100,
    registrationCount: 78,
    ticketTypes: [
      { type: 'regular', name: 'Standard', price: 199, quantity: 100, sold: 78, benefits: ['Live workshop', 'Recording access', 'Certificate'] }
    ],
    sessions: [],
    waitlistCount: 12,
    revenue: 15522,
    status: 'published'
  },
  {
    id: 'event-3',
    name: 'Startup Networking Night',
    type: 'meetup',
    description: 'Monthly networking event for startup founders',
    date: '2025-01-25T18:00:00Z',
    location: 'TechHub Downtown',
    isVirtual: false,
    capacity: 75,
    registrationCount: 68,
    ticketTypes: [
      { type: 'free', name: 'Free Entry', price: 0, quantity: 75, sold: 68, benefits: ['Networking', 'Refreshments'] }
    ],
    sessions: [],
    waitlistCount: 7,
    revenue: 0,
    status: 'published'
  }
]

const mockRegistrations: Registration[] = [
  {
    id: 'reg-1',
    registrationNumber: 'REG-2025-001',
    event: {
      id: 'event-1',
      name: 'Tech Innovation Summit 2025',
      type: 'conference',
      date: '2025-03-15T09:00:00Z',
      location: 'San Francisco Convention Center',
      isVirtual: false
    },
    attendee: {
      id: 'att-1',
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Inc',
      jobTitle: 'VP of Engineering',
      dietaryRequirements: 'Vegetarian',
      accessibilityNeeds: undefined
    },
    ticketType: 'vip',
    ticketPrice: 799,
    discountAmount: 0,
    totalPaid: 799,
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    status: 'confirmed',
    sessions: [
      { id: 'sess-1', sessionName: 'AI in Enterprise', track: 'AI/ML', time: '10:00 AM', capacity: 150, enrolled: 142, location: 'Main Hall' },
      { id: 'sess-2', sessionName: 'Cloud Architecture', track: 'Infrastructure', time: '11:30 AM', capacity: 100, enrolled: 87, location: 'Room A' }
    ],
    qrCode: 'QR-SC-001',
    badgePrinted: false,
    communicationsSent: [
      { id: 'comm-1', type: 'email', subject: 'Registration Confirmed', sentAt: '2024-12-15T10:00:00Z', opened: true, clicked: true },
      { id: 'comm-2', type: 'email', subject: 'Event Reminder', sentAt: '2024-12-20T09:00:00Z', opened: true, clicked: false }
    ],
    customFields: { 'tshirt_size': 'M', 'dietary': 'Vegetarian' },
    source: 'website',
    isGroupLeader: false,
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z'
  },
  {
    id: 'reg-2',
    registrationNumber: 'REG-2025-002',
    event: {
      id: 'event-1',
      name: 'Tech Innovation Summit 2025',
      type: 'conference',
      date: '2025-03-15T09:00:00Z',
      location: 'San Francisco Convention Center',
      isVirtual: false
    },
    attendee: {
      id: 'att-2',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.j@startup.io',
      phone: '+1 (555) 234-5678',
      company: 'StartupIO',
      jobTitle: 'Founder & CEO'
    },
    ticketType: 'regular',
    ticketPrice: 399,
    promoCode: 'EARLY20',
    discountAmount: 79.80,
    totalPaid: 319.20,
    paymentStatus: 'paid',
    paymentMethod: 'paypal',
    status: 'checked_in',
    sessions: [
      { id: 'sess-1', sessionName: 'AI in Enterprise', track: 'AI/ML', time: '10:00 AM', capacity: 150, enrolled: 142, location: 'Main Hall' }
    ],
    checkedInAt: '2024-12-22T08:45:00Z',
    checkedInBy: 'Staff - John',
    qrCode: 'QR-MJ-002',
    badgePrinted: true,
    communicationsSent: [
      { id: 'comm-3', type: 'email', subject: 'Registration Confirmed', sentAt: '2024-12-16T11:00:00Z', opened: true, clicked: true }
    ],
    customFields: { 'tshirt_size': 'L' },
    source: 'referral',
    referralCode: 'REF-SARAH',
    isGroupLeader: false,
    createdAt: '2024-12-16T11:00:00Z',
    updatedAt: '2024-12-22T08:45:00Z'
  },
  {
    id: 'reg-3',
    registrationNumber: 'REG-2025-003',
    event: {
      id: 'event-1',
      name: 'Tech Innovation Summit 2025',
      type: 'conference',
      date: '2025-03-15T09:00:00Z',
      location: 'San Francisco Convention Center',
      isVirtual: false
    },
    attendee: {
      id: 'att-3',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@enterprise.com',
      company: 'Enterprise Solutions',
      jobTitle: 'Product Manager'
    },
    ticketType: 'early_bird',
    ticketPrice: 299,
    discountAmount: 0,
    totalPaid: 299,
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    status: 'confirmed',
    sessions: [],
    qrCode: 'QR-ED-003',
    badgePrinted: false,
    communicationsSent: [
      { id: 'comm-4', type: 'email', subject: 'Registration Confirmed', sentAt: '2024-12-10T15:00:00Z', opened: true, clicked: false }
    ],
    customFields: {},
    source: 'linkedin',
    isGroupLeader: false,
    createdAt: '2024-12-10T15:00:00Z',
    updatedAt: '2024-12-10T15:00:00Z'
  },
  {
    id: 'reg-4',
    registrationNumber: 'REG-2025-004',
    event: {
      id: 'event-2',
      name: 'Product Management Workshop',
      type: 'workshop',
      date: '2025-02-20T10:00:00Z',
      location: 'Virtual',
      isVirtual: true,
      virtualLink: 'https://zoom.us/j/123456789'
    },
    attendee: {
      id: 'att-4',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex.r@designco.com',
      company: 'DesignCo',
      jobTitle: 'Senior Designer'
    },
    ticketType: 'regular',
    ticketPrice: 199,
    discountAmount: 0,
    totalPaid: 199,
    paymentStatus: 'paid',
    paymentMethod: 'stripe',
    status: 'pending',
    sessions: [],
    qrCode: 'QR-AR-004',
    badgePrinted: false,
    communicationsSent: [
      { id: 'comm-5', type: 'email', subject: 'Registration Pending', sentAt: '2024-12-22T09:00:00Z', opened: false, clicked: false }
    ],
    customFields: {},
    source: 'twitter',
    isGroupLeader: false,
    createdAt: '2024-12-22T09:00:00Z',
    updatedAt: '2024-12-22T09:00:00Z'
  },
  {
    id: 'reg-5',
    registrationNumber: 'REG-2025-005',
    event: {
      id: 'event-1',
      name: 'Tech Innovation Summit 2025',
      type: 'conference',
      date: '2025-03-15T09:00:00Z',
      location: 'San Francisco Convention Center',
      isVirtual: false
    },
    attendee: {
      id: 'att-5',
      firstName: 'Jordan',
      lastName: 'Taylor',
      email: 'jordan.t@university.edu',
      company: 'State University',
      jobTitle: 'PhD Student'
    },
    ticketType: 'student',
    ticketPrice: 99,
    discountAmount: 0,
    totalPaid: 99,
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    status: 'waitlist',
    sessions: [],
    qrCode: 'QR-JT-005',
    badgePrinted: false,
    communicationsSent: [
      { id: 'comm-6', type: 'email', subject: 'Added to Waitlist', sentAt: '2024-12-21T14:00:00Z', opened: true, clicked: false }
    ],
    customFields: { 'student_id': 'STU-12345' },
    source: 'website',
    isGroupLeader: false,
    createdAt: '2024-12-21T14:00:00Z',
    updatedAt: '2024-12-21T14:00:00Z'
  },
  {
    id: 'reg-6',
    registrationNumber: 'REG-2025-006',
    event: {
      id: 'event-3',
      name: 'Startup Networking Night',
      type: 'meetup',
      date: '2025-01-25T18:00:00Z',
      location: 'TechHub Downtown',
      isVirtual: false
    },
    attendee: {
      id: 'att-6',
      firstName: 'Chris',
      lastName: 'Wong',
      email: 'chris@foundershub.co',
      company: 'FoundersHub',
      jobTitle: 'Co-Founder'
    },
    ticketType: 'free',
    ticketPrice: 0,
    discountAmount: 0,
    totalPaid: 0,
    paymentStatus: 'waived',
    status: 'confirmed',
    sessions: [],
    qrCode: 'QR-CW-006',
    badgePrinted: false,
    communicationsSent: [
      { id: 'comm-7', type: 'email', subject: 'You\'re Registered!', sentAt: '2024-12-23T10:00:00Z', opened: true, clicked: true }
    ],
    customFields: {},
    source: 'referral',
    referralCode: 'REF-MIKE',
    isGroupLeader: false,
    createdAt: '2024-12-23T10:00:00Z',
    updatedAt: '2024-12-23T10:00:00Z'
  }
]

const mockAnalytics: Analytics = {
  totalRegistrations: 493,
  confirmedCount: 358,
  checkedInCount: 127,
  noShowCount: 23,
  cancelledCount: 42,
  waitlistCount: 42,
  totalRevenue: 114272,
  avgTicketPrice: 231.79,
  conversionRate: 72.6,
  checkInRate: 35.5,
  registrationsByDay: [
    { date: '2024-12-17', count: 23 },
    { date: '2024-12-18', count: 31 },
    { date: '2024-12-19', count: 28 },
    { date: '2024-12-20', count: 45 },
    { date: '2024-12-21', count: 19 },
    { date: '2024-12-22', count: 15 },
    { date: '2024-12-23', count: 12 }
  ],
  registrationsByTicketType: [
    { type: 'early_bird', count: 100, revenue: 29900 },
    { type: 'regular', count: 275, revenue: 87725 },
    { type: 'vip', count: 35, revenue: 27965 },
    { type: 'student', count: 15, revenue: 1485 },
    { type: 'free', count: 68, revenue: 0 }
  ],
  topReferralSources: [
    { source: 'website', count: 187 },
    { source: 'linkedin', count: 124 },
    { source: 'referral', count: 89 },
    { source: 'twitter', count: 52 },
    { source: 'email', count: 41 }
  ],
  communicationStats: [
    { type: 'Confirmation', sent: 493, opened: 421, clicked: 312 },
    { type: 'Reminder', sent: 358, opened: 287, clicked: 156 },
    { type: 'Update', sent: 127, opened: 98, clicked: 45 }
  ]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusBadge = (status: RegistrationStatus) => {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />Confirmed</Badge>
    case 'checked_in':
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"><UserCheck className="w-3 h-3 mr-1" />Checked In</Badge>
    case 'attended':
      return <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"><CheckCheck className="w-3 h-3 mr-1" />Attended</Badge>
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
    case 'waitlist':
      return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"><Layers className="w-3 h-3 mr-1" />Waitlist</Badge>
    case 'no_show':
      return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"><UserX className="w-3 h-3 mr-1" />No Show</Badge>
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>
    case 'refunded':
      return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"><RefreshCw className="w-3 h-3 mr-1" />Refunded</Badge>
  }
}

const getTicketTypeBadge = (type: TicketType) => {
  switch (type) {
    case 'vip':
      return <Badge className="bg-purple-100 text-purple-700"><Star className="w-3 h-3 mr-1" />VIP</Badge>
    case 'early_bird':
      return <Badge className="bg-green-100 text-green-700"><Timer className="w-3 h-3 mr-1" />Early Bird</Badge>
    case 'regular':
      return <Badge className="bg-blue-100 text-blue-700"><Ticket className="w-3 h-3 mr-1" />Regular</Badge>
    case 'student':
      return <Badge className="bg-cyan-100 text-cyan-700"><Users className="w-3 h-3 mr-1" />Student</Badge>
    case 'speaker':
      return <Badge className="bg-orange-100 text-orange-700"><Star className="w-3 h-3 mr-1" />Speaker</Badge>
    case 'sponsor':
      return <Badge className="bg-pink-100 text-pink-700"><Shield className="w-3 h-3 mr-1" />Sponsor</Badge>
    case 'free':
      return <Badge className="bg-gray-100 text-gray-700"><Ticket className="w-3 h-3 mr-1" />Free</Badge>
    case 'group':
      return <Badge className="bg-indigo-100 text-indigo-700"><Users className="w-3 h-3 mr-1" />Group</Badge>
  }
}

const getPaymentBadge = (status: PaymentStatus) => {
  switch (status) {
    case 'paid':
      return <Badge className="bg-green-100 text-green-700"><CreditCard className="w-3 h-3 mr-1" />Paid</Badge>
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
    case 'refunded':
      return <Badge className="bg-orange-100 text-orange-700"><RefreshCw className="w-3 h-3 mr-1" />Refunded</Badge>
    case 'failed':
      return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
    case 'waived':
      return <Badge className="bg-gray-100 text-gray-700"><CheckCircle2 className="w-3 h-3 mr-1" />Waived</Badge>
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Enhanced Competitive Upgrade Mock Data
const mockRegistrationsAIInsights = [
  { id: '1', type: 'success' as const, title: 'High Registration Rate', description: 'Tech Conference 2024 at 85% capacity. Trending to sell out.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Events' },
  { id: '2', type: 'warning' as const, title: 'Pending Approvals', description: '12 VIP registrations awaiting manual approval.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Approvals' },
  { id: '3', type: 'info' as const, title: 'Early Bird Ending', description: 'Early bird pricing ends in 3 days. Consider reminder campaign.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Pricing' },
]

const mockRegistrationsCollaborators = [
  { id: '1', name: 'Event Manager', avatar: '/avatars/events.jpg', status: 'online' as const, role: 'Manager' },
  { id: '2', name: 'Registration Lead', avatar: '/avatars/reg.jpg', status: 'online' as const, role: 'Lead' },
  { id: '3', name: 'Marketing', avatar: '/avatars/marketing.jpg', status: 'away' as const, role: 'Marketing' },
]

const mockRegistrationsPredictions = [
  { id: '1', title: 'Attendance Forecast', prediction: 'Expecting 2,500 attendees based on current registrations', confidence: 88, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Revenue Projection', prediction: 'Total ticket revenue projected at $125K', confidence: 85, trend: 'up' as const, impact: 'high' as const },
]

const mockRegistrationsActivities = [
  { id: '1', user: 'Event Manager', action: 'Approved', target: '15 speaker registrations', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'System', action: 'Sent', target: 'confirmation emails to 50 registrants', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Marketing', action: 'Created', target: 'early bird reminder campaign', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions are now defined inside the component to use state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RegistrationsClient() {
  const supabase = createClient()

  // UI State
  const [activeTab, setActiveTab] = useState('registrations')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('all')
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [settingsTab, setSettingsTab] = useState('general')

  // CRUD Dialog State
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Quick Action Dialog State
  const [showNewEventDialog, setShowNewEventDialog] = useState(false)
  const [showImportListDialog, setShowImportListDialog] = useState(false)
  const [showExportDataDialog, setShowExportDataDialog] = useState(false)

  // Additional Dialog States for Buttons
  const [showQrCodeDialog, setShowQrCodeDialog] = useState(false)
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false)
  const [showMoreOptionsDialog, setShowMoreOptionsDialog] = useState(false)
  const [showViewDetailsDialog, setShowViewDetailsDialog] = useState(false)
  const [showStartScanningDialog, setShowStartScanningDialog] = useState(false)
  const [showSendCommunicationDialog, setShowSendCommunicationDialog] = useState(false)
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false)
  const [showSendRemindersDialog, setShowSendRemindersDialog] = useState(false)
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false)
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false)
  const [showExportAllDataDialog, setShowExportAllDataDialog] = useState(false)
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
  const [showCheckInConfirmDialog, setShowCheckInConfirmDialog] = useState(false)
  const [showPrintBadgeDialog, setShowPrintBadgeDialog] = useState(false)
  const [showTicketsDialog, setShowTicketsDialog] = useState(false)
  const [showBadgesDialog, setShowBadgesDialog] = useState(false)
  const [showReportsDialog, setShowReportsDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<{ name: string; connected: boolean; icon: string } | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<{ name: string; type: string; lastSent: string; openRate: number } | null>(null)

  // Form State
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData)

  // Loading States
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Data State - Mix of DB and mock for fallback
  const [dbRegistrations, setDbRegistrations] = useState<DbRegistration[]>([])
  const [registrations] = useState<Registration[]>(mockRegistrations)
  const [events] = useState<Event[]>(mockEvents)
  const [analytics] = useState<Analytics>(mockAnalytics)
  const [registrationToEdit, setRegistrationToEdit] = useState<DbRegistration | null>(null)
  const [registrationToDelete, setRegistrationToDelete] = useState<DbRegistration | null>(null)

  // Fetch registrations from Supabase
  const fetchRegistrations = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbRegistrations(data || [])
    } catch (error) {
      console.error('Error fetching registrations:', error)
      toast.error('Failed to load registrations')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Initial data fetch
  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('registrations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDbRegistrations(prev => [payload.new as DbRegistration, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setDbRegistrations(prev => prev.map(r => r.id === payload.new.id ? payload.new as DbRegistration : r))
        } else if (payload.eventType === 'DELETE') {
          setDbRegistrations(prev => prev.filter(r => r.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Create registration
  const handleCreateRegistration = async () => {
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to create a registration')
        return
      }

      const regData = {
        user_id: user.id,
        registrant_name: formData.registrant_name,
        registrant_email: formData.registrant_email,
        registrant_phone: formData.registrant_phone || null,
        company: formData.company || null,
        job_title: formData.job_title || null,
        event_id: formData.event_id || null,
        registration_type: formData.registration_type,
        ticket_type: formData.ticket_type,
        ticket_price: formData.ticket_price,
        status: formData.status,
        payment_status: formData.payment_status,
        confirmation_sent: false,
        reminder_sent: false
      }

      const { error } = await supabase
        .from('event_registrations')
        .insert(regData)

      if (error) throw error

      toast.success('Registration created successfully', {
        description: `${formData.registrant_name} has been registered`
      })
      setShowCreateDialog(false)
      setFormData(initialFormData)
      fetchRegistrations()
    } catch (error: any) {
      console.error('Error creating registration:', error)
      toast.error('Failed to create registration', {
        description: error.message
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Update registration
  const handleUpdateRegistration = async () => {
    if (!registrationToEdit) return

    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to update a registration')
        return
      }

      const { error } = await supabase
        .from('event_registrations')
        .update({
          registrant_name: formData.registrant_name,
          registrant_email: formData.registrant_email,
          registrant_phone: formData.registrant_phone || null,
          company: formData.company || null,
          job_title: formData.job_title || null,
          ticket_type: formData.ticket_type,
          ticket_price: formData.ticket_price,
          status: formData.status,
          payment_status: formData.payment_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', registrationToEdit.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Registration updated successfully', {
        description: `${formData.registrant_name}'s registration has been updated`
      })
      setShowEditDialog(false)
      setRegistrationToEdit(null)
      setFormData(initialFormData)
      fetchRegistrations()
    } catch (error: any) {
      console.error('Error updating registration:', error)
      toast.error('Failed to update registration', {
        description: error.message
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Delete registration (soft delete)
  const handleDeleteRegistration = async () => {
    if (!registrationToDelete) return

    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to delete a registration')
        return
      }

      const { error } = await supabase
        .from('event_registrations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', registrationToDelete.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Registration deleted', {
        description: `${registrationToDelete.registrant_name}'s registration has been removed`
      })
      setShowDeleteDialog(false)
      setRegistrationToDelete(null)
      fetchRegistrations()
    } catch (error: any) {
      console.error('Error deleting registration:', error)
      toast.error('Failed to delete registration', {
        description: error.message
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Check in attendee
  const handleCheckIn = async (registration: DbRegistration) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('event_registrations')
        .update({
          status: 'attended',
          checked_in_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', registration.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Check-in complete', {
        description: `${registration.registrant_name} has been checked in`
      })
      fetchRegistrations()
    } catch (error: any) {
      console.error('Error checking in:', error)
      toast.error('Check-in failed', { description: error.message })
    }
  }

  // Confirm registration
  const handleConfirm = async (registration: DbRegistration) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('event_registrations')
        .update({
          status: 'confirmed',
          confirmation_sent: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', registration.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Registration confirmed', {
        description: `${registration.registrant_name} has been confirmed`
      })
      fetchRegistrations()
    } catch (error: any) {
      console.error('Error confirming:', error)
      toast.error('Confirmation failed', { description: error.message })
    }
  }

  // Cancel registration
  const handleCancel = async (registration: DbRegistration) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('event_registrations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', registration.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.info('Registration cancelled', {
        description: `${registration.registrant_name}'s registration has been cancelled`
      })
      fetchRegistrations()
    } catch (error: any) {
      console.error('Error cancelling:', error)
      toast.error('Cancellation failed', { description: error.message })
    }
  }

  // Open edit dialog
  const openEditDialog = (registration: DbRegistration) => {
    setRegistrationToEdit(registration)
    setFormData({
      registrant_name: registration.registrant_name,
      registrant_email: registration.registrant_email,
      registrant_phone: registration.registrant_phone || '',
      company: registration.company || '',
      job_title: registration.job_title || '',
      event_id: registration.event_id || '',
      registration_type: registration.registration_type,
      ticket_type: (registration.ticket_type as any) || 'paid',
      ticket_price: registration.ticket_price || 0,
      status: registration.status,
      payment_status: (registration.payment_status as any) || 'pending'
    })
    setShowEditDialog(true)
  }

  // Open delete dialog
  const openDeleteDialog = (registration: DbRegistration) => {
    setRegistrationToDelete(registration)
    setShowDeleteDialog(true)
  }

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const matchesSearch = !searchQuery ||
        reg.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.attendee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.attendee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.attendee.company?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || reg.status === statusFilter
      const matchesEvent = eventFilter === 'all' || reg.event.id === eventFilter
      return matchesSearch && matchesStatus && matchesEvent
    })
  }, [registrations, searchQuery, statusFilter, eventFilter])

  // Stats
  const stats = useMemo(() => ({
    total: registrations.length,
    confirmed: registrations.filter(r => r.status === 'confirmed').length,
    checkedIn: registrations.filter(r => r.status === 'checked_in').length,
    pending: registrations.filter(r => r.status === 'pending').length,
    waitlist: registrations.filter(r => r.status === 'waitlist').length,
    cancelled: registrations.filter(r => r.status === 'cancelled').length,
    revenue: registrations.reduce((sum, r) => sum + r.totalPaid, 0),
    checkInRate: registrations.length > 0
      ? Math.round((registrations.filter(r => r.status === 'checked_in' || r.status === 'attended').length / registrations.length) * 100)
      : 0
  }), [registrations])

  const handleViewRegistration = (registration: Registration) => {
    setSelectedRegistration(registration)
    setShowRegistrationDialog(true)
  }

  // Export handler
  const handleExportRegistrations = async () => {
    try {
      const csvData = dbRegistrations.map(reg => ({
        Name: reg.registrant_name,
        Email: reg.registrant_email,
        Phone: reg.registrant_phone || '',
        Company: reg.company || '',
        JobTitle: reg.job_title || '',
        Status: reg.status,
        TicketType: reg.ticket_type || '',
        TicketPrice: reg.ticket_price || 0,
        PaymentStatus: reg.payment_status || '',
        CheckedInAt: reg.checked_in_at || '',
        CreatedAt: reg.created_at
      }))

      const csvContent = [
        Object.keys(csvData[0] || {}).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Export complete', {
        description: 'Registrations exported to CSV'
      })
    } catch (error) {
      toast.error('Export failed')
    }
  }

  // Quick Actions with dialog handlers
  const quickActions = [
    { id: '1', label: 'New Event', icon: 'plus', action: () => setShowNewEventDialog(true), variant: 'default' as const },
    { id: '2', label: 'Import List', icon: 'upload', action: () => setShowImportListDialog(true), variant: 'default' as const },
    { id: '3', label: 'Export Data', icon: 'download', action: () => setShowExportDataDialog(true), variant: 'outline' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50/30 to-blue-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Registrations</h1>
                <p className="text-purple-100">Event & attendee management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={handleExportRegistrations}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                className="bg-white text-purple-600 hover:bg-purple-50"
                onClick={() => {
                  setFormData(initialFormData)
                  setShowCreateDialog(true)
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Registration
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-100 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Total</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-100 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Confirmed</span>
              </div>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-100 mb-1">
                <UserCheck className="w-4 h-4" />
                <span className="text-sm">Checked In</span>
              </div>
              <p className="text-2xl font-bold">{stats.checkedIn}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-100 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Pending</span>
              </div>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-100 mb-1">
                <Layers className="w-4 h-4" />
                <span className="text-sm">Waitlist</span>
              </div>
              <p className="text-2xl font-bold">{stats.waitlist}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-100 mb-1">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">Cancelled</span>
              </div>
              <p className="text-2xl font-bold">{stats.cancelled}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-100 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Revenue</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-100 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Check-in Rate</span>
              </div>
              <p className="text-2xl font-bold">{stats.checkInRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="registrations" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Registrations
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="check-in" className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Check-In
              </TabsTrigger>
              <TabsTrigger value="communications" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Communications
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search registrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center border rounded-lg p-1 bg-white dark:bg-gray-800">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-6">
            {/* Registrations Overview Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Event Registrations</h2>
                  <p className="text-purple-100">Eventbrite-level registration management</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.total}</p>
                    <p className="text-purple-200 text-sm">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.confirmed}</p>
                    <p className="text-purple-200 text-sm">Confirmed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.checkedIn}</p>
                    <p className="text-purple-200 text-sm">Checked In</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: UserPlus, label: 'New', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => { setFormData(initialFormData); setShowCreateDialog(true) } },
                { icon: QrCode, label: 'Check-In', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => setActiveTab('check-in') },
                { icon: Mail, label: 'Email All', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => setShowBulkEmailDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => setShowExportDataDialog(true) },
                { icon: Ticket, label: 'Tickets', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => setShowTicketsDialog(true) },
                { icon: Tag, label: 'Badges', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => setShowBadgesDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => setShowReportsDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', action: () => setActiveTab('settings') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Filters */}
            <Card className="dark:bg-gray-800/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | 'all')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="attended">Attended</option>
                    <option value="waitlist">Waitlist</option>
                    <option value="no_show">No Show</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Events</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>{event.name}</option>
                    ))}
                  </select>
                  <div className="flex-1" />
                  <span className="text-sm text-muted-foreground">
                    {filteredRegistrations.length} registrations
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Database Registrations List */}
            {dbRegistrations.length > 0 && (
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Your Registrations ({dbRegistrations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y dark:divide-gray-700">
                    {dbRegistrations.map((reg) => (
                      <div key={reg.id} className="p-4 hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-purple-100 text-purple-700">
                              {reg.registrant_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-semibold">{reg.registrant_name}</span>
                              <Badge className={
                                reg.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                reg.status === 'attended' ? 'bg-blue-100 text-blue-700' :
                                reg.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                reg.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }>
                                {reg.status}
                              </Badge>
                              {reg.ticket_type && (
                                <Badge variant="outline">{reg.ticket_type}</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {reg.registrant_email}
                              </span>
                              {reg.company && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {reg.company}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(reg.ticket_price || 0)}</p>
                            {reg.payment_status && (
                              <Badge className={
                                reg.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                reg.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }>
                                {reg.payment_status}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {reg.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleConfirm(reg)}
                                title="Confirm"
                              >
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            {reg.status === 'confirmed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCheckIn(reg)}
                                title="Check In"
                              >
                                <UserCheck className="w-4 h-4 text-blue-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(reg)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(reg)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mock Registrations List (Demo Data) */}
            <Card className="dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm">Demo Registrations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y dark:divide-gray-700">
                  {filteredRegistrations.map((registration) => (
                    <div
                      key={registration.id}
                      className="p-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleViewRegistration(registration)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={registration.attendee.avatar} />
                          <AvatarFallback className="bg-purple-100 text-purple-700">
                            {registration.attendee.firstName[0]}{registration.attendee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold">
                              {registration.attendee.firstName} {registration.attendee.lastName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {registration.registrationNumber}
                            </span>
                            {getStatusBadge(registration.status)}
                            {getTicketTypeBadge(registration.ticketType)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {registration.attendee.company && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {registration.attendee.company}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {registration.event.name}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(registration.totalPaid)}</p>
                          {getPaymentBadge(registration.paymentStatus)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedRegistration(registration)
                              setShowQrCodeDialog(true)
                            }}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedRegistration(registration)
                              setShowSendEmailDialog(true)
                            }}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedRegistration(registration)
                              setShowMoreOptionsDialog(true)
                            }}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge variant="outline" className="mb-2 capitalize">{event.type}</Badge>
                        <h3 className="font-semibold text-lg">{event.name}</h3>
                      </div>
                      <Badge className={
                        event.status === 'published' ? 'bg-green-100 text-green-700' :
                        event.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                        event.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }>
                        {event.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.isVirtual ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Registrations</span>
                        <span>{event.registrationCount} / {event.capacity}</span>
                      </div>
                      <Progress value={(event.registrationCount / event.capacity) * 100} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="font-semibold text-green-600">{formatCurrency(event.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Waitlist</p>
                        <p className="font-semibold">{event.waitlistCount}</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => {
                        setSelectedEvent(event)
                        setShowViewDetailsDialog(true)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Check-In Tab */}
          <TabsContent value="check-in" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* QR Scanner */}
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    QR Code Scanner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center">
                    <QrCode className="w-24 h-24 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Point camera at QR code</p>
                    <Button onClick={() => setShowStartScanningDialog(true)}>
                      <QrCode className="w-4 h-4 mr-2" />
                      Start Scanning
                    </Button>
                  </div>
                  <div className="mt-4">
                    <Input placeholder="Or enter registration number manually..." />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Check-ins */}
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Recent Check-ins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {registrations.filter(r => r.status === 'checked_in').map((reg) => (
                        <div key={reg.id} className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Avatar>
                            <AvatarFallback className="bg-green-100 text-green-700">
                              {reg.attendee.firstName[0]}{reg.attendee.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">
                              {reg.attendee.firstName} {reg.attendee.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {reg.checkedInAt && formatDate(reg.checkedInAt)}
                            </p>
                          </div>
                          {getTicketTypeBadge(reg.ticketType)}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Check-in Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6 text-center">
                  <UserCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-3xl font-bold">{analytics.checkedInCount}</p>
                  <p className="text-sm text-muted-foreground">Checked In</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-3xl font-bold">{analytics.confirmedCount - analytics.checkedInCount}</p>
                  <p className="text-sm text-muted-foreground">Pending Check-in</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6 text-center">
                  <UserX className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <p className="text-3xl font-bold">{analytics.noShowCount}</p>
                  <p className="text-sm text-muted-foreground">No Shows</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-3xl font-bold">{analytics.checkInRate}%</p>
                  <p className="text-sm text-muted-foreground">Check-in Rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle>Communication Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Registration Confirmation', type: 'email', lastSent: '2 hours ago', openRate: 85 },
                        { name: 'Event Reminder - 1 Day', type: 'email', lastSent: 'Yesterday', openRate: 72 },
                        { name: 'Check-in Instructions', type: 'email', lastSent: '3 hours ago', openRate: 68 },
                        { name: 'Post-Event Survey', type: 'email', lastSent: '5 days ago', openRate: 45 }
                      ].map((template, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-lg border dark:border-gray-700">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{template.name}</p>
                            <p className="text-sm text-muted-foreground">Last sent: {template.lastSent}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{template.openRate}%</p>
                            <p className="text-xs text-muted-foreground">Open Rate</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template)
                              setShowSendCommunicationDialog(true)
                            }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle>Communication Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analytics.communicationStats.map((stat, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{stat.type}</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round((stat.opened / stat.sent) * 100)}% open rate
                          </span>
                        </div>
                        <Progress value={(stat.opened / stat.sent) * 100} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowBulkEmailDialog(true)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Bulk Email
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowSendRemindersDialog(true)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Reminders
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowCreateTemplateDialog(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
                  <p className="text-xs text-green-600">+18.5% from last month</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">Website to registration</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Avg. Ticket Price</span>
                    <DollarSign className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(analytics.avgTicketPrice)}</p>
                  <p className="text-xs text-green-600">+5.2% increase</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Check-in Rate</span>
                    <UserCheck className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.checkInRate}%</p>
                  <p className="text-xs text-muted-foreground">Of confirmed attendees</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registration Trend */}
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle>Registration Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {analytics.registrationsByDay.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t-lg"
                          style={{ height: `${(day.count / 50) * 100}%` }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Registrations by Ticket Type */}
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle>By Ticket Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.registrationsByTicketType.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getTicketTypeBadge(item.type)}
                            <span className="text-sm">{item.count} registrations</span>
                          </div>
                          <span className="font-semibold">{formatCurrency(item.revenue)}</span>
                        </div>
                        <Progress
                          value={(item.count / analytics.totalRegistrations) * 100}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Referral Sources */}
            <Card className="dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle>Top Referral Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {analytics.topReferralSources.map((source, index) => (
                    <div key={index} className="text-center p-4 bg-muted/50 rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white mx-auto mb-2">
                        {index + 1}
                      </div>
                      <p className="font-semibold capitalize">{source.source}</p>
                      <p className="text-2xl font-bold">{source.count}</p>
                      <p className="text-xs text-muted-foreground">registrations</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Eventbrite Level Configuration */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Registration Settings</h2>
                  <p className="text-slate-200">Eventbrite-level configuration and preferences</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">6</p>
                    <p className="text-slate-200 text-sm">Setting Groups</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">28+</p>
                    <p className="text-slate-200 text-sm">Options</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Settings, label: 'General', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', action: () => setSettingsTab('general') },
                { icon: Ticket, label: 'Tickets', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => setSettingsTab('tickets') },
                { icon: Bell, label: 'Notifications', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => setSettingsTab('notifications') },
                { icon: Network, label: 'Integrations', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => setSettingsTab('integrations') },
                { icon: Shield, label: 'Security', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => setSettingsTab('security') },
                { icon: Sliders, label: 'Advanced', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', action: () => setSettingsTab('advanced') },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => setShowExportAllDataDialog(true) },
                { icon: RefreshCw, label: 'Reset', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: () => setShowClearCacheDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur sticky top-4">
                  <CardContent className="p-4">
                    <nav className="space-y-2">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'tickets', label: 'Tickets', icon: Ticket },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Registration Preferences</CardTitle>
                        <CardDescription>Configure default registration behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Auto-Confirm Registrations</Label><p className="text-sm text-gray-500">Automatically confirm new signups</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Waitlist Enabled</Label><p className="text-sm text-gray-500">Allow waitlist when sold out</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Group Registration</Label><p className="text-sm text-gray-500">Allow bulk registrations</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Registration Limit</Label><p className="text-sm text-gray-500">Max attendees per event</p></div>
                          <Input type="number" defaultValue="500" className="w-24" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Check-In Settings</CardTitle>
                        <CardDescription>Configure check-in preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">QR Code Check-In</Label><p className="text-sm text-gray-500">Enable QR scanning</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Self Check-In</Label><p className="text-sm text-gray-500">Allow kiosk mode</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'tickets' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Ticket Configuration</CardTitle>
                        <CardDescription>Configure ticket types and pricing</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Early Bird Pricing</Label><p className="text-sm text-gray-500">Enable early bird discounts</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">VIP Tickets</Label><p className="text-sm text-gray-500">Offer premium tickets</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Group Discounts</Label><p className="text-sm text-gray-500">Bulk pricing available</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Refund Window (days)</Label><p className="text-sm text-gray-500">Days before event</p></div>
                          <Input type="number" defaultValue="7" className="w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Control automated emails</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Confirmation Email</Label><p className="text-sm text-gray-500">Send on registration</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Reminder Emails</Label><p className="text-sm text-gray-500">Before event starts</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Post-Event Survey</Label><p className="text-sm text-gray-500">Request feedback</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">SMS Notifications</Label><p className="text-sm text-gray-500">Text message alerts</p></div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Connected Services</CardTitle>
                        <CardDescription>Manage registration integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Stripe Payments', connected: true, icon: '💳' },
                          { name: 'Mailchimp', connected: true, icon: '📧' },
                          { name: 'Salesforce', connected: false, icon: '☁️' },
                          { name: 'Zoom', connected: true, icon: '📹' },
                          { name: 'Slack', connected: true, icon: '💬' },
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{integration.icon}</span>
                              <div>
                                <p className="font-medium">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.connected ? 'Connected' : 'Not connected'}</p>
                              </div>
                            </div>
                            <Button
                              variant={integration.connected ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => {
                                setSelectedIntegration(integration)
                                setShowIntegrationDialog(true)
                              }}
                            >
                              {integration.connected ? 'Disconnect' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'security' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Protect your registration data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">CAPTCHA Verification</Label><p className="text-sm text-gray-500">Prevent bot registrations</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Email Verification</Label><p className="text-sm text-gray-500">Confirm email addresses</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">PCI Compliance</Label><p className="text-sm text-gray-500">Secure payment handling</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">GDPR Mode</Label><p className="text-sm text-gray-500">EU data protection</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Advanced Options</CardTitle>
                        <CardDescription>Power user settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Custom Fields</Label><p className="text-sm text-gray-500">Add registration fields</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">API Access</Label><p className="text-sm text-gray-500">Enable API endpoints</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><Label className="text-base">Webhooks</Label><p className="text-sm text-gray-500">Real-time notifications</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="dark:bg-gray-800/50">
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Manage registration data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div><p className="font-medium">Export All Data</p><p className="text-sm text-gray-500">Download CSV/Excel</p></div>
                          <Button variant="outline" size="sm" onClick={() => setShowExportAllDataDialog(true)}>Export</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div><p className="font-medium">Clear Cache</p><p className="text-sm text-gray-500">128 MB used</p></div>
                          <Button variant="outline" size="sm" onClick={() => setShowClearCacheDialog(true)}>Clear</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockRegistrationsAIInsights}
              title="Registration Intelligence"
              onInsightAction={(insight: AIInsight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockRegistrationsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockRegistrationsPredictions}
              title="Registration Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockRegistrationsActivities}
            title="Registration Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={quickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Registration Detail Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRegistration && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  {getStatusBadge(selectedRegistration.status)}
                  {getTicketTypeBadge(selectedRegistration.ticketType)}
                  {getPaymentBadge(selectedRegistration.paymentStatus)}
                </div>
                <DialogTitle className="text-2xl">
                  {selectedRegistration.attendee.firstName} {selectedRegistration.attendee.lastName}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Registration Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Attendee Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedRegistration.attendee.email}</span>
                      </div>
                      {selectedRegistration.attendee.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedRegistration.attendee.phone}</span>
                        </div>
                      )}
                      {selectedRegistration.attendee.company && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedRegistration.attendee.company}</span>
                        </div>
                      )}
                      {selectedRegistration.attendee.jobTitle && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedRegistration.attendee.jobTitle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Event Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedRegistration.event.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedRegistration.event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedRegistration.registrationNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{formatCurrency(selectedRegistration.ticketPrice)}</p>
                    <p className="text-sm text-muted-foreground">Ticket Price</p>
                  </div>
                  {selectedRegistration.discountAmount > 0 && (
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">-{formatCurrency(selectedRegistration.discountAmount)}</p>
                      <p className="text-sm text-muted-foreground">Discount ({selectedRegistration.promoCode})</p>
                    </div>
                  )}
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{formatCurrency(selectedRegistration.totalPaid)}</p>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                  </div>
                </div>

                {/* Special Requirements */}
                {(selectedRegistration.attendee.dietaryRequirements || selectedRegistration.attendee.accessibilityNeeds) && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Special Requirements</h4>
                    <div className="flex gap-4">
                      {selectedRegistration.attendee.dietaryRequirements && (
                        <Badge className="bg-orange-100 text-orange-700">
                          <Utensils className="w-3 h-3 mr-1" />
                          {selectedRegistration.attendee.dietaryRequirements}
                        </Badge>
                      )}
                      {selectedRegistration.attendee.accessibilityNeeds && (
                        <Badge className="bg-blue-100 text-blue-700">
                          <Accessibility className="w-3 h-3 mr-1" />
                          {selectedRegistration.attendee.accessibilityNeeds}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Sessions */}
                {selectedRegistration.sessions.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Enrolled Sessions</h4>
                    <div className="space-y-2">
                      {selectedRegistration.sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{session.sessionName}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.track} • {session.time} • {session.location}
                            </p>
                          </div>
                          <Badge variant="outline">{session.enrolled}/{session.capacity}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Check-in Info */}
                {selectedRegistration.checkedInAt && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <UserCheck className="w-5 h-5" />
                      <span className="font-medium">Checked in at {formatDate(selectedRegistration.checkedInAt)}</span>
                    </div>
                    {selectedRegistration.checkedInBy && (
                      <p className="text-sm text-green-600 mt-1">By: {selectedRegistration.checkedInBy}</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  {selectedRegistration.status === 'confirmed' && (
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => setShowCheckInConfirmDialog(true)}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Check In
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowQrCodeDialog(true)}>
                    <QrCode className="w-4 h-4 mr-2" />
                    View QR Code
                  </Button>
                  <Button variant="outline" onClick={() => setShowPrintBadgeDialog(true)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print Badge
                  </Button>
                  <Button variant="outline" onClick={() => setShowSendEmailDialog(true)}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRegistrationDialog(false)
                      if (selectedRegistration) {
                        setFormData({
                          registrant_name: `${selectedRegistration.attendee.firstName} ${selectedRegistration.attendee.lastName}`,
                          registrant_email: selectedRegistration.attendee.email,
                          registrant_phone: selectedRegistration.attendee.phone || '',
                          company: selectedRegistration.attendee.company || '',
                          job_title: selectedRegistration.attendee.jobTitle || '',
                          event_id: selectedRegistration.event.id,
                          registration_type: selectedRegistration.event.type as any || 'event',
                          ticket_type: selectedRegistration.ticketType as any || 'paid',
                          ticket_price: selectedRegistration.ticketPrice,
                          status: selectedRegistration.status as any || 'pending',
                          payment_status: selectedRegistration.paymentStatus as any || 'pending'
                        })
                        setShowEditDialog(true)
                      }
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Registration Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Registration</DialogTitle>
            <DialogDescription>Register a new attendee for an event</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="John Doe"
                  value={formData.registrant_name}
                  onChange={(e) => setFormData({ ...formData, registrant_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.registrant_email}
                  onChange={(e) => setFormData({ ...formData, registrant_email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={formData.registrant_phone}
                  onChange={(e) => setFormData({ ...formData, registrant_phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  placeholder="Company Inc"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                placeholder="Software Engineer"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ticket Type</Label>
                <Select
                  value={formData.ticket_type}
                  onValueChange={(value: any) => setFormData({ ...formData, ticket_type: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="speaker">Speaker</SelectItem>
                    <SelectItem value="sponsor">Sponsor</SelectItem>
                    <SelectItem value="press">Press</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ticket Price</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.ticket_price}
                  onChange={(e) => setFormData({ ...formData, ticket_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="waitlist">Waitlist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value: any) => setFormData({ ...formData, payment_status: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateRegistration}
              disabled={isSaving || !formData.registrant_name || !formData.registrant_email}
            >
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create Registration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Registration Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Registration</DialogTitle>
            <DialogDescription>Update attendee registration details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={formData.registrant_name}
                  onChange={(e) => setFormData({ ...formData, registrant_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.registrant_email}
                  onChange={(e) => setFormData({ ...formData, registrant_email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.registrant_phone}
                  onChange={(e) => setFormData({ ...formData, registrant_phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="attended">Attended</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="waitlist">Waitlist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value: any) => setFormData({ ...formData, payment_status: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button
              onClick={handleUpdateRegistration}
              disabled={isSaving || !formData.registrant_name || !formData.registrant_email}
            >
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {registrationToDelete?.registrant_name}'s registration? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRegistration}
              disabled={isSaving}
            >
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Event Dialog */}
      <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Set up a new event for registrations. Fill in the event details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Input id="event-name" placeholder="Enter event name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-date">Event Date</Label>
                <Input id="event-date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-time">Event Time</Label>
                <Input id="event-time" type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-location">Location</Label>
              <Input id="event-location" placeholder="Enter venue or virtual link" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-capacity">Capacity</Label>
              <Input id="event-capacity" type="number" placeholder="Maximum attendees" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Input id="event-description" placeholder="Brief event description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewEventDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Event Created', { description: 'New event ready for registrations' })
              setShowNewEventDialog(false)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import List Dialog */}
      <Dialog open={showImportListDialog} onOpenChange={setShowImportListDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Registration List</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file containing registrant information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              <Download className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your file here, or click to browse
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.csv,.xlsx'
                  input.onchange = () => {
                    if (input.files && input.files[0]) {
                      toast.success('File Selected', { description: `${input.files[0].name} ready for import` })
                    }
                  }
                  input.click()
                }}
              >
                Choose File
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: CSV, XLSX (Max 10MB)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Import Options</Label>
              <div className="flex items-center space-x-2">
                <Switch id="skip-duplicates" />
                <Label htmlFor="skip-duplicates" className="font-normal">Skip duplicate emails</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="send-confirmations" />
                <Label htmlFor="send-confirmations" className="font-normal">Send confirmation emails</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportListDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('List Imported', { description: 'Registration list imported successfully' })
              setShowImportListDialog(false)
            }}>
              <Download className="w-4 h-4 mr-2" />
              Import List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={showExportDataDialog} onOpenChange={setShowExportDataDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Registration Data</DialogTitle>
            <DialogDescription>
              Choose your export format and options.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data to Include</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="include-contact" defaultChecked />
                  <Label htmlFor="include-contact" className="font-normal">Contact information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="include-payment" defaultChecked />
                  <Label htmlFor="include-payment" className="font-normal">Payment details</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="include-sessions" />
                  <Label htmlFor="include-sessions" className="font-normal">Session selections</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="include-custom" />
                  <Label htmlFor="include-custom" className="font-normal">Custom fields</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDataDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Data Exported', { description: 'Registration data exported to CSV' })
              setShowExportDataDialog(false)
            }}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQrCodeDialog} onOpenChange={setShowQrCodeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registration QR Code</DialogTitle>
            <DialogDescription>
              {selectedRegistration ? `QR code for ${selectedRegistration.attendee.firstName} ${selectedRegistration.attendee.lastName}` : 'Scan this QR code at check-in'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4">
              <QrCode className="w-32 h-32 text-gray-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Registration: {selectedRegistration?.registrationNumber || 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedRegistration?.event.name}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQrCodeDialog(false)}>Close</Button>
            <Button onClick={() => {
              toast.success('QR Code Downloaded', { description: 'QR code saved to downloads' })
              setShowQrCodeDialog(false)
            }}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={showSendEmailDialog} onOpenChange={setShowSendEmailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>
              Send an email to {selectedRegistration?.attendee.firstName} {selectedRegistration?.attendee.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>To</Label>
              <Input value={selectedRegistration?.attendee.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="Email subject..." />
            </div>
            <div className="space-y-2">
              <Label>Email Template</Label>
              <Select defaultValue="confirmation">
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmation">Registration Confirmation</SelectItem>
                  <SelectItem value="reminder">Event Reminder</SelectItem>
                  <SelectItem value="checkin">Check-in Instructions</SelectItem>
                  <SelectItem value="update">Event Update</SelectItem>
                  <SelectItem value="custom">Custom Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Input placeholder="Additional message (optional)..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendEmailDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Email Sent', { description: `Email sent to ${selectedRegistration?.attendee.email}` })
              setShowSendEmailDialog(false)
            }}>
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* More Options Dialog */}
      <Dialog open={showMoreOptionsDialog} onOpenChange={setShowMoreOptionsDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registration Options</DialogTitle>
            <DialogDescription>
              Actions for {selectedRegistration?.attendee.firstName} {selectedRegistration?.attendee.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setShowMoreOptionsDialog(false)
                setShowQrCodeDialog(true)
              }}
            >
              <QrCode className="w-4 h-4 mr-2" />
              View QR Code
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setShowMoreOptionsDialog(false)
                setShowSendEmailDialog(true)
              }}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setShowMoreOptionsDialog(false)
                setShowPrintBadgeDialog(true)
              }}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Badge
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                toast.success('Registration Resent', { description: 'Confirmation email resent successfully' })
                setShowMoreOptionsDialog(false)
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend Confirmation
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700"
              onClick={() => {
                toast.info('Registration Cancelled', { description: 'Registration has been cancelled' })
                setShowMoreOptionsDialog(false)
              }}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Registration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Event Details Dialog */}
      <Dialog open={showViewDetailsDialog} onOpenChange={setShowViewDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.name || 'Event Details'}</DialogTitle>
            <DialogDescription>
              Complete event information and statistics
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Event Type</Label>
                  <p className="font-medium capitalize">{selectedEvent.type}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={
                    selectedEvent.status === 'published' ? 'bg-green-100 text-green-700' :
                    selectedEvent.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }>{selectedEvent.status}</Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{formatDate(selectedEvent.date)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium">{selectedEvent.location}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Capacity</Label>
                  <p className="font-medium">{selectedEvent.registrationCount} / {selectedEvent.capacity}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Revenue</Label>
                  <p className="font-medium text-green-600">{formatCurrency(selectedEvent.revenue)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedEvent.description}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Registration Progress</Label>
                <Progress value={(selectedEvent.registrationCount / selectedEvent.capacity) * 100} className="h-3" />
                <p className="text-xs text-muted-foreground">{selectedEvent.waitlistCount} on waitlist</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDetailsDialog(false)}>Close</Button>
            <Button onClick={() => {
              toast.success('Event Opened', { description: 'Navigating to event management' })
              setShowViewDetailsDialog(false)
            }}>
              <Edit className="w-4 h-4 mr-2" />
              Manage Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Scanning Dialog */}
      <Dialog open={showStartScanningDialog} onOpenChange={setShowStartScanningDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Scanner</DialogTitle>
            <DialogDescription>
              Position the QR code within the frame to scan
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="aspect-square bg-gray-900 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-4 border-2 border-white/30 rounded-lg" />
              <QrCode className="w-16 h-16 text-white/50 mb-4" />
              <p className="text-white/70 text-sm">Camera access required</p>
              <Loader2 className="w-6 h-6 text-white/50 animate-spin mt-4" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Or enter manually</Label>
            <Input placeholder="Registration number (e.g., REG-2025-001)" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartScanningDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Check-in Successful', { description: 'Attendee has been checked in' })
              setShowStartScanningDialog(false)
            }}>
              <UserCheck className="w-4 h-4 mr-2" />
              Manual Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Communication Dialog */}
      <Dialog open={showSendCommunicationDialog} onOpenChange={setShowSendCommunicationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Send this communication template to selected recipients
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">{selectedTemplate?.name}</p>
              <p className="text-sm text-muted-foreground">Last sent: {selectedTemplate?.lastSent}</p>
              <p className="text-sm text-muted-foreground">Open rate: {selectedTemplate?.openRate}%</p>
            </div>
            <div className="space-y-2">
              <Label>Recipients</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Registrants</SelectItem>
                  <SelectItem value="confirmed">Confirmed Only</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="not_checked_in">Not Checked In</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estimated Recipients</Label>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendCommunicationDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Communication Sent', { description: `${selectedTemplate?.name} sent to ${stats.total} recipients` })
              setShowSendCommunicationDialog(false)
            }}>
              <Send className="w-4 h-4 mr-2" />
              Send Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Email Dialog */}
      <Dialog open={showBulkEmailDialog} onOpenChange={setShowBulkEmailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Bulk Email</DialogTitle>
            <DialogDescription>
              Send an email to multiple registrants at once
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Recipients</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Registrants ({stats.total})</SelectItem>
                  <SelectItem value="confirmed">Confirmed ({stats.confirmed})</SelectItem>
                  <SelectItem value="pending">Pending ({stats.pending})</SelectItem>
                  <SelectItem value="waitlist">Waitlist ({stats.waitlist})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="Email subject..." />
            </div>
            <div className="space-y-2">
              <Label>Template</Label>
              <Select defaultValue="custom">
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Message</SelectItem>
                  <SelectItem value="reminder">Event Reminder</SelectItem>
                  <SelectItem value="update">Event Update</SelectItem>
                  <SelectItem value="checkin">Check-in Instructions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Input placeholder="Enter your message..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkEmailDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Bulk Email Sent', { description: `Email sent to ${stats.total} registrants` })
              setShowBulkEmailDialog(false)
            }}>
              <Mail className="w-4 h-4 mr-2" />
              Send to All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminders Dialog */}
      <Dialog open={showSendRemindersDialog} onOpenChange={setShowSendRemindersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Event Reminders</DialogTitle>
            <DialogDescription>
              Send reminder emails to confirmed registrants
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reminder Type</Label>
              <Select defaultValue="1day">
                <SelectTrigger>
                  <SelectValue placeholder="Select reminder type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1day">1 Day Before</SelectItem>
                  <SelectItem value="3days">3 Days Before</SelectItem>
                  <SelectItem value="1week">1 Week Before</SelectItem>
                  <SelectItem value="custom">Custom Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">This will send reminders to:</p>
              <p className="text-2xl font-bold">{stats.confirmed} confirmed registrants</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="include-agenda" defaultChecked />
              <Label htmlFor="include-agenda" className="font-normal">Include event agenda</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="include-venue" defaultChecked />
              <Label htmlFor="include-venue" className="font-normal">Include venue details</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendRemindersDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Reminders Sent', { description: `Reminders sent to ${stats.confirmed} registrants` })
              setShowSendRemindersDialog(false)
            }}>
              <Send className="w-4 h-4 mr-2" />
              Send Reminders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={showCreateTemplateDialog} onOpenChange={setShowCreateTemplateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
            <DialogDescription>
              Create a reusable email template for communications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input placeholder="e.g., Event Reminder - 1 Day" />
            </div>
            <div className="space-y-2">
              <Label>Template Type</Label>
              <Select defaultValue="reminder">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmation">Confirmation</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="checkin">Check-in</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input placeholder="Email subject..." />
            </div>
            <div className="space-y-2">
              <Label>Message Body</Label>
              <Input placeholder="Enter template content..." />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="active-template" defaultChecked />
              <Label htmlFor="active-template" className="font-normal">Set as active template</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTemplateDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Template Created', { description: 'New email template saved successfully' })
              setShowCreateTemplateDialog(false)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Integration Dialog */}
      <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedIntegration?.connected ? 'Disconnect' : 'Connect'} {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration?.connected
                ? `Are you sure you want to disconnect ${selectedIntegration?.name}?`
                : `Connect your ${selectedIntegration?.name} account to enable integration`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <span className="text-3xl">{selectedIntegration?.icon}</span>
              <div>
                <p className="font-medium">{selectedIntegration?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedIntegration?.connected ? 'Currently connected' : 'Not connected'}
                </p>
              </div>
            </div>
            {!selectedIntegration?.connected && (
              <div className="mt-4 space-y-2">
                <Label>API Key</Label>
                <Input type="password" placeholder="Enter your API key..." />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIntegrationDialog(false)}>Cancel</Button>
            <Button
              variant={selectedIntegration?.connected ? 'destructive' : 'default'}
              onClick={() => {
                toast.success(
                  selectedIntegration?.connected ? 'Disconnected' : 'Connected',
                  { description: `${selectedIntegration?.name} ${selectedIntegration?.connected ? 'disconnected' : 'connected'} successfully` }
                )
                setShowIntegrationDialog(false)
              }}
            >
              {selectedIntegration?.connected ? 'Disconnect' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export All Data Dialog */}
      <Dialog open={showExportAllDataDialog} onOpenChange={setShowExportAllDataDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export All Registration Data</DialogTitle>
            <DialogDescription>
              Download a complete backup of all registration data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Export will include:</p>
              <ul className="text-sm space-y-1">
                <li>- {stats.total} registrations</li>
                <li>- {events.length} events</li>
                <li>- All payment records</li>
                <li>- Communication history</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportAllDataDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              handleExportRegistrations()
              setShowExportAllDataDialog(false)
            }}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Cache Dialog */}
      <Dialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Clear Cache</DialogTitle>
            <DialogDescription>
              This will clear all cached data and may temporarily slow down the application
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Warning: This action will clear 128 MB of cached data. The application may be slower until the cache rebuilds.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearCacheDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                toast.success('Cache Cleared', { description: 'All cached data has been cleared' })
                setShowClearCacheDialog(false)
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-In Confirmation Dialog */}
      <Dialog open={showCheckInConfirmDialog} onOpenChange={setShowCheckInConfirmDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Check-In</DialogTitle>
            <DialogDescription>
              Check in {selectedRegistration?.attendee.firstName} {selectedRegistration?.attendee.lastName} to the event?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-green-100 text-green-700">
                  {selectedRegistration?.attendee.firstName[0]}{selectedRegistration?.attendee.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedRegistration?.attendee.firstName} {selectedRegistration?.attendee.lastName}</p>
                <p className="text-sm text-muted-foreground">{selectedRegistration?.registrationNumber}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckInConfirmDialog(false)}>Cancel</Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                toast.success('Check-In Complete', { description: `${selectedRegistration?.attendee.firstName} ${selectedRegistration?.attendee.lastName} has been checked in` })
                setShowCheckInConfirmDialog(false)
                setShowRegistrationDialog(false)
              }}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Confirm Check-In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Badge Dialog */}
      <Dialog open={showPrintBadgeDialog} onOpenChange={setShowPrintBadgeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Print Badge</DialogTitle>
            <DialogDescription>
              Print a name badge for {selectedRegistration?.attendee.firstName} {selectedRegistration?.attendee.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <div className="mb-4">
                <p className="text-2xl font-bold">{selectedRegistration?.attendee.firstName} {selectedRegistration?.attendee.lastName}</p>
                <p className="text-muted-foreground">{selectedRegistration?.attendee.company}</p>
                <p className="text-sm text-muted-foreground">{selectedRegistration?.attendee.jobTitle}</p>
              </div>
              <div className="inline-block">
                {getTicketTypeBadge(selectedRegistration?.ticketType || 'regular')}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label>Badge Size</Label>
              <Select defaultValue="standard">
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (4" x 3")</SelectItem>
                  <SelectItem value="large">Large (4" x 6")</SelectItem>
                  <SelectItem value="compact">Compact (3" x 2")</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrintBadgeDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Badge Printed', { description: 'Badge sent to printer' })
              setShowPrintBadgeDialog(false)
            }}>
              <Printer className="w-4 h-4 mr-2" />
              Print Badge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tickets Dialog */}
      <Dialog open={showTicketsDialog} onOpenChange={setShowTicketsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ticket Management</DialogTitle>
            <DialogDescription>
              View and manage ticket types for your events
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {events[0]?.ticketTypes.map((ticket, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{ticket.name}</p>
                  <p className="text-sm text-muted-foreground">{ticket.sold} / {ticket.quantity} sold</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(ticket.price)}</p>
                  <Progress value={(ticket.sold / ticket.quantity) * 100} className="w-24 h-2" />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTicketsDialog(false)}>Close</Button>
            <Button onClick={() => {
              toast.success('Opening Ticket Editor', { description: 'Navigating to ticket configuration' })
              setShowTicketsDialog(false)
            }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Tickets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badges Dialog */}
      <Dialog open={showBadgesDialog} onOpenChange={setShowBadgesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Badge Printing</DialogTitle>
            <DialogDescription>
              Print badges for checked-in attendees
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Ready to print:</p>
              <p className="text-3xl font-bold">{stats.checkedIn} badges</p>
            </div>
            <div className="space-y-2">
              <Label>Print Selection</Label>
              <Select defaultValue="unprinted">
                <SelectTrigger>
                  <SelectValue placeholder="Select badges to print" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unprinted">Unprinted Only</SelectItem>
                  <SelectItem value="all">All Checked In</SelectItem>
                  <SelectItem value="vip">VIP Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBadgesDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Printing Badges', { description: `${stats.checkedIn} badges sent to printer` })
              setShowBadgesDialog(false)
            }}>
              <Printer className="w-4 h-4 mr-2" />
              Print All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Reports</DialogTitle>
            <DialogDescription>
              Create detailed reports for your events
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select defaultValue="registration">
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registration">Registration Summary</SelectItem>
                  <SelectItem value="attendance">Attendance Report</SelectItem>
                  <SelectItem value="revenue">Revenue Analysis</SelectItem>
                  <SelectItem value="demographics">Demographics</SelectItem>
                  <SelectItem value="engagement">Engagement Metrics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportsDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Report Generated', { description: 'Your report is being prepared for download' })
              setShowReportsDialog(false)
            }}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
