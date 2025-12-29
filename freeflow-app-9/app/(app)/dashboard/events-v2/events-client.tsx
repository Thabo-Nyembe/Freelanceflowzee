'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  Search,
  Ticket,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Settings,
  BarChart3,
  Download,
  Share2,
  Mail,
  Globe,
  Video,
  Building2,
  Star,
  Heart,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Grid3X3,
  List,
  CalendarDays,
  Timer,
  Mic,
  PartyPopper,
  GraduationCap,
  Briefcase,
  Coffee,
  Music,
  Palette,
  Dumbbell,
  Utensils,
  ChevronRight,
  ExternalLink,
  Copy,
  QrCode,
  Send,
  UserPlus,
  CreditCard,
  Receipt,
  Shield,
  Sliders,
  Bell,
  Lock,
  Webhook,
  Database,
  RefreshCw,
  Trash2,
  Key,
  History,
  Zap,
  LayoutGrid,
  Terminal
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

import {
  eventsAIInsights,
  eventsCollaborators,
  eventsPredictions,
  eventsActivities,
  eventsQuickActions,
} from '@/lib/mock-data/adapters'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CardDescription } from '@/components/ui/card'

// Types
type EventStatus = 'draft' | 'published' | 'live' | 'completed' | 'cancelled' | 'postponed'
type EventType = 'conference' | 'workshop' | 'meetup' | 'concert' | 'seminar' | 'webinar' | 'networking' | 'festival' | 'sports' | 'class' | 'party' | 'other'
type EventFormat = 'in-person' | 'virtual' | 'hybrid'
type TicketStatus = 'available' | 'sold-out' | 'limited' | 'coming-soon'
type AttendeeStatus = 'registered' | 'checked-in' | 'cancelled' | 'no-show' | 'waitlisted'

interface Event {
  id: string
  title: string
  slug: string
  description: string
  type: EventType
  format: EventFormat
  status: EventStatus
  coverImage?: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  timezone: string
  venue?: {
    name: string
    address: string
    city: string
    state: string
    country: string
    capacity: number
    mapUrl?: string
  }
  virtualUrl?: string
  organizer: {
    name: string
    avatar?: string
    email: string
  }
  ticketTypes: TicketType[]
  tags: string[]
  totalCapacity: number
  totalRegistrations: number
  totalRevenue: number
  isPublic: boolean
  requireApproval: boolean
  createdAt: string
}

interface TicketType {
  id: string
  name: string
  description: string
  price: number
  currency: string
  quantity: number
  sold: number
  status: TicketStatus
  salesStart: string
  salesEnd: string
  maxPerOrder: number
  benefits: string[]
}

interface Attendee {
  id: string
  eventId: string
  name: string
  email: string
  avatar?: string
  ticketType: string
  ticketPrice: number
  status: AttendeeStatus
  registeredAt: string
  checkedInAt?: string
  orderNumber: string
  source: 'direct' | 'referral' | 'social' | 'email'
  notes?: string
}

interface Registration {
  id: string
  orderNumber: string
  eventId: string
  eventTitle: string
  buyerName: string
  buyerEmail: string
  tickets: { type: string; quantity: number; price: number }[]
  totalAmount: number
  status: 'completed' | 'pending' | 'refunded' | 'cancelled'
  paymentMethod: string
  createdAt: string
}

// Mock Data
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    slug: 'tech-innovation-summit-2024',
    description: 'Join industry leaders for two days of inspiring talks, workshops, and networking opportunities focused on the future of technology.',
    type: 'conference',
    format: 'hybrid',
    status: 'published',
    coverImage: '',
    startDate: '2024-03-15',
    endDate: '2024-03-16',
    startTime: '09:00',
    endTime: '18:00',
    timezone: 'America/Los_Angeles',
    venue: {
      name: 'Moscone Center',
      address: '747 Howard St',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      capacity: 2500,
      mapUrl: 'https://maps.google.com'
    },
    virtualUrl: 'https://stream.techsummit.com',
    organizer: {
      name: 'TechEvents Inc.',
      email: 'events@techevents.com'
    },
    ticketTypes: [
      {
        id: 't1',
        name: 'Early Bird',
        description: 'Limited early bird pricing',
        price: 299,
        currency: 'USD',
        quantity: 500,
        sold: 500,
        status: 'sold-out',
        salesStart: '2024-01-01',
        salesEnd: '2024-02-01',
        maxPerOrder: 5,
        benefits: ['Full conference access', 'Lunch included', 'Swag bag']
      },
      {
        id: 't2',
        name: 'General Admission',
        description: 'Standard conference ticket',
        price: 449,
        currency: 'USD',
        quantity: 1500,
        sold: 892,
        status: 'available',
        salesStart: '2024-02-01',
        salesEnd: '2024-03-14',
        maxPerOrder: 10,
        benefits: ['Full conference access', 'Lunch included', 'Swag bag']
      },
      {
        id: 't3',
        name: 'VIP Pass',
        description: 'Premium experience with exclusive perks',
        price: 799,
        currency: 'USD',
        quantity: 200,
        sold: 145,
        status: 'limited',
        salesStart: '2024-01-01',
        salesEnd: '2024-03-14',
        maxPerOrder: 2,
        benefits: ['All GA benefits', 'VIP lounge access', 'Meet & greet', 'Priority seating', 'Exclusive dinner']
      },
      {
        id: 't4',
        name: 'Virtual Pass',
        description: 'Stream all sessions online',
        price: 149,
        currency: 'USD',
        quantity: 5000,
        sold: 1234,
        status: 'available',
        salesStart: '2024-01-01',
        salesEnd: '2024-03-16',
        maxPerOrder: 1,
        benefits: ['Live stream access', '30-day replay', 'Digital resources']
      }
    ],
    tags: ['technology', 'innovation', 'AI', 'networking'],
    totalCapacity: 7200,
    totalRegistrations: 2771,
    totalRevenue: 847250,
    isPublic: true,
    requireApproval: false,
    createdAt: '2023-12-01'
  },
  {
    id: '2',
    title: 'Design Thinking Workshop',
    slug: 'design-thinking-workshop',
    description: 'A hands-on workshop to learn design thinking methodologies and apply them to real-world problems.',
    type: 'workshop',
    format: 'in-person',
    status: 'published',
    startDate: '2024-02-28',
    endDate: '2024-02-28',
    startTime: '10:00',
    endTime: '16:00',
    timezone: 'America/New_York',
    venue: {
      name: 'Innovation Hub',
      address: '123 Creative Ave',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      capacity: 50
    },
    organizer: {
      name: 'Design Academy',
      email: 'hello@designacademy.com'
    },
    ticketTypes: [
      {
        id: 't5',
        name: 'Workshop Seat',
        description: 'Full workshop participation',
        price: 199,
        currency: 'USD',
        quantity: 50,
        sold: 38,
        status: 'limited',
        salesStart: '2024-01-15',
        salesEnd: '2024-02-27',
        maxPerOrder: 3,
        benefits: ['Materials included', 'Certificate', 'Lunch']
      }
    ],
    tags: ['design', 'workshop', 'creativity'],
    totalCapacity: 50,
    totalRegistrations: 38,
    totalRevenue: 7562,
    isPublic: true,
    requireApproval: false,
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    title: 'Startup Pitch Night',
    slug: 'startup-pitch-night',
    description: 'Watch 10 promising startups pitch their ideas to a panel of investors and industry experts.',
    type: 'networking',
    format: 'in-person',
    status: 'live',
    startDate: '2024-02-20',
    endDate: '2024-02-20',
    startTime: '18:00',
    endTime: '21:00',
    timezone: 'America/Los_Angeles',
    venue: {
      name: 'Startup Garage',
      address: '456 Venture Blvd',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      capacity: 150
    },
    organizer: {
      name: 'VC Connect',
      email: 'events@vcconnect.com'
    },
    ticketTypes: [
      {
        id: 't6',
        name: 'Attendee',
        description: 'General admission',
        price: 25,
        currency: 'USD',
        quantity: 120,
        sold: 118,
        status: 'limited',
        salesStart: '2024-02-01',
        salesEnd: '2024-02-20',
        maxPerOrder: 4,
        benefits: ['Entry', 'Networking', 'Refreshments']
      },
      {
        id: 't7',
        name: 'Investor',
        description: 'Reserved seating for investors',
        price: 0,
        currency: 'USD',
        quantity: 30,
        sold: 28,
        status: 'limited',
        salesStart: '2024-02-01',
        salesEnd: '2024-02-20',
        maxPerOrder: 1,
        benefits: ['Priority seating', 'Pitcher intros', 'Private networking']
      }
    ],
    tags: ['startups', 'investing', 'networking', 'pitching'],
    totalCapacity: 150,
    totalRegistrations: 146,
    totalRevenue: 2950,
    isPublic: true,
    requireApproval: false,
    createdAt: '2024-02-01'
  },
  {
    id: '4',
    title: 'AI & Machine Learning Webinar',
    slug: 'ai-ml-webinar',
    description: 'Deep dive into the latest advancements in AI and machine learning with expert speakers.',
    type: 'webinar',
    format: 'virtual',
    status: 'published',
    startDate: '2024-03-05',
    endDate: '2024-03-05',
    startTime: '14:00',
    endTime: '16:00',
    timezone: 'UTC',
    virtualUrl: 'https://zoom.us/webinar/ai-ml',
    organizer: {
      name: 'AI Institute',
      email: 'webinars@aiinstitute.org'
    },
    ticketTypes: [
      {
        id: 't8',
        name: 'Free Registration',
        description: 'Join the live webinar',
        price: 0,
        currency: 'USD',
        quantity: 1000,
        sold: 756,
        status: 'available',
        salesStart: '2024-02-01',
        salesEnd: '2024-03-05',
        maxPerOrder: 1,
        benefits: ['Live access', 'Q&A participation', 'Recording access']
      }
    ],
    tags: ['AI', 'machine learning', 'webinar', 'free'],
    totalCapacity: 1000,
    totalRegistrations: 756,
    totalRevenue: 0,
    isPublic: true,
    requireApproval: false,
    createdAt: '2024-02-05'
  },
  {
    id: '5',
    title: 'Summer Music Festival',
    slug: 'summer-music-festival',
    description: 'Three days of amazing live music, food, and entertainment under the summer sun.',
    type: 'festival',
    format: 'in-person',
    status: 'draft',
    startDate: '2024-07-12',
    endDate: '2024-07-14',
    startTime: '12:00',
    endTime: '23:00',
    timezone: 'America/Los_Angeles',
    venue: {
      name: 'Golden Gate Park',
      address: 'Golden Gate Park',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      capacity: 50000
    },
    organizer: {
      name: 'Festival Productions',
      email: 'info@festivalproductions.com'
    },
    ticketTypes: [
      {
        id: 't9',
        name: 'Single Day Pass',
        description: 'Access for one day',
        price: 125,
        currency: 'USD',
        quantity: 15000,
        sold: 0,
        status: 'coming-soon',
        salesStart: '2024-04-01',
        salesEnd: '2024-07-11',
        maxPerOrder: 6,
        benefits: ['Full day access', 'All stages']
      },
      {
        id: 't10',
        name: '3-Day Pass',
        description: 'Full festival experience',
        price: 299,
        currency: 'USD',
        quantity: 25000,
        sold: 0,
        status: 'coming-soon',
        salesStart: '2024-04-01',
        salesEnd: '2024-07-11',
        maxPerOrder: 4,
        benefits: ['3-day access', 'All stages', 'Festival merch']
      },
      {
        id: 't11',
        name: 'VIP Experience',
        description: 'Ultimate festival luxury',
        price: 899,
        currency: 'USD',
        quantity: 1000,
        sold: 0,
        status: 'coming-soon',
        salesStart: '2024-04-01',
        salesEnd: '2024-07-11',
        maxPerOrder: 2,
        benefits: ['3-day access', 'VIP areas', 'Premium viewing', 'Backstage tours', 'Artist meet & greet']
      }
    ],
    tags: ['music', 'festival', 'summer', 'outdoor'],
    totalCapacity: 50000,
    totalRegistrations: 0,
    totalRevenue: 0,
    isPublic: false,
    requireApproval: false,
    createdAt: '2024-01-20'
  }
]

const mockAttendees: Attendee[] = [
  { id: '1', eventId: '1', name: 'John Smith', email: 'john@example.com', ticketType: 'VIP Pass', ticketPrice: 799, status: 'registered', registeredAt: '2024-02-10', orderNumber: 'ORD-001', source: 'direct' },
  { id: '2', eventId: '1', name: 'Sarah Johnson', email: 'sarah@example.com', ticketType: 'General Admission', ticketPrice: 449, status: 'registered', registeredAt: '2024-02-11', orderNumber: 'ORD-002', source: 'social' },
  { id: '3', eventId: '1', name: 'Mike Chen', email: 'mike@example.com', ticketType: 'Virtual Pass', ticketPrice: 149, status: 'registered', registeredAt: '2024-02-12', orderNumber: 'ORD-003', source: 'email' },
  { id: '4', eventId: '1', name: 'Emily Davis', email: 'emily@example.com', ticketType: 'General Admission', ticketPrice: 449, status: 'checked-in', registeredAt: '2024-02-08', checkedInAt: '2024-02-15', orderNumber: 'ORD-004', source: 'referral' },
  { id: '5', eventId: '1', name: 'Alex Wilson', email: 'alex@example.com', ticketType: 'VIP Pass', ticketPrice: 799, status: 'cancelled', registeredAt: '2024-02-05', orderNumber: 'ORD-005', source: 'direct' },
  { id: '6', eventId: '2', name: 'Lisa Brown', email: 'lisa@example.com', ticketType: 'Workshop Seat', ticketPrice: 199, status: 'registered', registeredAt: '2024-02-15', orderNumber: 'ORD-006', source: 'direct' },
  { id: '7', eventId: '3', name: 'David Lee', email: 'david@example.com', ticketType: 'Attendee', ticketPrice: 25, status: 'checked-in', registeredAt: '2024-02-18', checkedInAt: '2024-02-20', orderNumber: 'ORD-007', source: 'social' }
]

const mockRegistrations: Registration[] = [
  { id: 'r1', orderNumber: 'ORD-001', eventId: '1', eventTitle: 'Tech Innovation Summit 2024', buyerName: 'John Smith', buyerEmail: 'john@example.com', tickets: [{ type: 'VIP Pass', quantity: 1, price: 799 }], totalAmount: 799, status: 'completed', paymentMethod: 'Credit Card', createdAt: '2024-02-10' },
  { id: 'r2', orderNumber: 'ORD-002', eventId: '1', eventTitle: 'Tech Innovation Summit 2024', buyerName: 'Sarah Johnson', buyerEmail: 'sarah@example.com', tickets: [{ type: 'General Admission', quantity: 2, price: 449 }], totalAmount: 898, status: 'completed', paymentMethod: 'PayPal', createdAt: '2024-02-11' },
  { id: 'r3', orderNumber: 'ORD-003', eventId: '1', eventTitle: 'Tech Innovation Summit 2024', buyerName: 'Mike Chen', buyerEmail: 'mike@example.com', tickets: [{ type: 'Virtual Pass', quantity: 1, price: 149 }], totalAmount: 149, status: 'completed', paymentMethod: 'Credit Card', createdAt: '2024-02-12' },
  { id: 'r4', orderNumber: 'ORD-005', eventId: '1', eventTitle: 'Tech Innovation Summit 2024', buyerName: 'Alex Wilson', buyerEmail: 'alex@example.com', tickets: [{ type: 'VIP Pass', quantity: 1, price: 799 }], totalAmount: 799, status: 'refunded', paymentMethod: 'Credit Card', createdAt: '2024-02-05' },
  { id: 'r5', orderNumber: 'ORD-006', eventId: '2', eventTitle: 'Design Thinking Workshop', buyerName: 'Lisa Brown', buyerEmail: 'lisa@example.com', tickets: [{ type: 'Workshop Seat', quantity: 1, price: 199 }], totalAmount: 199, status: 'completed', paymentMethod: 'Apple Pay', createdAt: '2024-02-15' }
]

export default function EventsClient() {
  const [activeTab, setActiveTab] = useState('events')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null)
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Stats calculations
  const stats = useMemo(() => {
    const totalEvents = mockEvents.length
    const publishedEvents = mockEvents.filter(e => e.status === 'published').length
    const liveEvents = mockEvents.filter(e => e.status === 'live').length
    const totalRegistrations = mockEvents.reduce((sum, e) => sum + e.totalRegistrations, 0)
    const totalRevenue = mockEvents.reduce((sum, e) => sum + e.totalRevenue, 0)
    const avgAttendance = totalEvents > 0
      ? Math.round(mockEvents.reduce((sum, e) => sum + (e.totalRegistrations / e.totalCapacity) * 100, 0) / totalEvents)
      : 0

    return {
      totalEvents,
      publishedEvents,
      liveEvents,
      totalRegistrations,
      totalRevenue,
      avgAttendance,
      totalAttendees: mockAttendees.length,
      checkedIn: mockAttendees.filter(a => a.status === 'checked-in').length
    }
  }, [])

  // Filtered events
  const filteredEvents = useMemo(() => {
    return mockEvents.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter
      const matchesType = typeFilter === 'all' || event.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchQuery, statusFilter, typeFilter])

  const handleCreateEvent = () => {
    toast.info('Create Event', {
      description: 'Opening event creation wizard...'
    })
  }

  const handlePublishEvent = (event: Event) => {
    toast.success('Event published', {
      description: `${event.title} is now live`
    })
  }

  const handleExportAttendees = () => {
    toast.success('Export started', {
      description: 'Attendee list is being exported'
    })
  }

  // Helper functions
  const getEventStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'published': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'live': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'completed': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'postponed': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTicketStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'sold-out': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'limited': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'coming-soon': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getAttendeeStatusColor = (status: AttendeeStatus) => {
    switch (status) {
      case 'registered': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'checked-in': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'no-show': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'waitlisted': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'conference': return <Mic className="w-4 h-4" />
      case 'workshop': return <GraduationCap className="w-4 h-4" />
      case 'meetup': return <Coffee className="w-4 h-4" />
      case 'concert': return <Music className="w-4 h-4" />
      case 'seminar': return <Briefcase className="w-4 h-4" />
      case 'webinar': return <Video className="w-4 h-4" />
      case 'networking': return <Users className="w-4 h-4" />
      case 'festival': return <PartyPopper className="w-4 h-4" />
      case 'sports': return <Dumbbell className="w-4 h-4" />
      case 'class': return <GraduationCap className="w-4 h-4" />
      case 'party': return <PartyPopper className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getFormatIcon = (format: EventFormat) => {
    switch (format) {
      case 'in-person': return <Building2 className="w-4 h-4" />
      case 'virtual': return <Video className="w-4 h-4" />
      case 'hybrid': return <Globe className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:bg-none dark:bg-gray-900">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events</h1>
                <p className="text-gray-500 dark:text-gray-400">Eventbrite-level Event Management Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEvents}</div>
                <div className="text-xs text-gray-500">Total Events</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publishedEvents}</div>
                <div className="text-xs text-gray-500">Published</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Timer className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.liveEvents}</div>
                <div className="text-xs text-gray-500">Live Now</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRegistrations.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Registrations</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</div>
                <div className="text-xs text-gray-500">Total Revenue</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-cyan-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgAttendance}%</div>
                <div className="text-xs text-gray-500">Avg Fill Rate</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-600 mb-1">
                  <Ticket className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAttendees}</div>
                <div className="text-xs text-gray-500">Attendees</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.checkedIn}</div>
                <div className="text-xs text-gray-500">Checked In</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
                <TabsTrigger value="events" className="gap-2"><Calendar className="w-4 h-4" />Events</TabsTrigger>
                <TabsTrigger value="attendees" className="gap-2"><Users className="w-4 h-4" />Attendees</TabsTrigger>
                <TabsTrigger value="orders" className="gap-2"><Receipt className="w-4 h-4" />Orders</TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="w-4 h-4" />Analytics</TabsTrigger>
                <TabsTrigger value="settings" className="gap-2"><Settings className="w-4 h-4" />Settings</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="flex items-center border rounded-lg bg-white dark:bg-gray-800">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-r-none"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-6">
              {/* Events Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Event Management</h3>
                      <p className="text-orange-100">Create and manage events like Eventbrite</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{stats.totalEvents}</p>
                      <p className="text-sm text-orange-100">Total Events</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{stats.publishedEvents}</p>
                      <p className="text-sm text-orange-100">Published</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                      <p className="text-sm text-orange-100">Revenue</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
                      <p className="text-sm text-orange-100">Registrations</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: Plus, label: 'Create Event', color: 'from-orange-500 to-pink-600' },
                  { icon: Ticket, label: 'Manage Tickets', color: 'from-blue-500 to-indigo-600' },
                  { icon: Users, label: 'Attendees', color: 'from-green-500 to-emerald-600' },
                  { icon: QrCode, label: 'Check-in', color: 'from-purple-500 to-pink-600' },
                  { icon: Mail, label: 'Send Invite', color: 'from-cyan-500 to-blue-600' },
                  { icon: BarChart3, label: 'Analytics', color: 'from-yellow-500 to-orange-600' },
                  { icon: Download, label: 'Export', color: 'from-indigo-500 to-purple-600' },
                  { icon: Settings, label: 'Settings', color: 'from-gray-500 to-gray-600' },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                {(['draft', 'published', 'live', 'completed', 'cancelled'] as EventStatus[]).map(status => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>

              {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map(event => (
                    <Card
                      key={event.id}
                      className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="h-32 bg-gradient-to-br from-orange-400 to-pink-500 relative">
                        <div className="absolute top-3 right-3">
                          <Badge className={getEventStatusColor(event.status)}>{event.status}</Badge>
                        </div>
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          <Badge variant="outline" className="bg-white/90 text-gray-800 flex items-center gap-1">
                            {getEventTypeIcon(event.type)}
                            {event.type}
                          </Badge>
                          <Badge variant="outline" className="bg-white/90 text-gray-800 flex items-center gap-1">
                            {getFormatIcon(event.format)}
                            {event.format}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">{event.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{event.description}</p>

                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4" />
                            <span>{formatDate(event.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                          {event.venue && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{event.venue.city}, {event.venue.state}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Registrations</span>
                            <span className="text-sm font-medium">{event.totalRegistrations.toLocaleString()} / {event.totalCapacity.toLocaleString()}</span>
                          </div>
                          <Progress value={(event.totalRegistrations / event.totalCapacity) * 100} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(event.totalRevenue)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map(event => (
                    <Card
                      key={event.id}
                      className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white">
                            {getEventTypeIcon(event.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{event.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-1">{event.description}</p>
                              </div>
                              <Badge className={getEventStatusColor(event.status)}>{event.status}</Badge>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mt-4">
                              <div className="flex items-center gap-1">
                                <CalendarDays className="w-4 h-4" />
                                {formatDate(event.startDate)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {event.startTime}
                              </div>
                              {event.venue && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {event.venue.city}, {event.venue.state}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {event.totalRegistrations.toLocaleString()} registered
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {formatCurrency(event.totalRevenue)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Attendees Tab */}
            <TabsContent value="attendees" className="space-y-6">
              {/* Attendees Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Attendee Management</h3>
                      <p className="text-purple-100">Track and manage event attendees</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{stats.totalAttendees}</p>
                      <p className="text-sm text-purple-100">Total Attendees</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{stats.checkedIn}</p>
                      <p className="text-sm text-purple-100">Checked In</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{mockAttendees.filter(a => a.status === 'cancelled').length}</p>
                      <p className="text-sm text-purple-100">Cancelled</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{Math.round((stats.checkedIn / stats.totalAttendees) * 100) || 0}%</p>
                      <p className="text-sm text-purple-100">Check-in Rate</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: UserPlus, label: 'Add Attendee', color: 'from-purple-500 to-violet-600' },
                  { icon: QrCode, label: 'Check-in', color: 'from-blue-500 to-indigo-600' },
                  { icon: Mail, label: 'Email All', color: 'from-green-500 to-emerald-600' },
                  { icon: Send, label: 'Send Reminder', color: 'from-orange-500 to-amber-600' },
                  { icon: Download, label: 'Export List', color: 'from-cyan-500 to-blue-600' },
                  { icon: Filter, label: 'Filter', color: 'from-pink-500 to-rose-600' },
                  { icon: Search, label: 'Search', color: 'from-indigo-500 to-purple-600' },
                  { icon: CreditCard, label: 'Refunds', color: 'from-gray-500 to-gray-600' },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Attendee
                </Button>
              </div>

              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {mockAttendees.map(attendee => (
                        <tr key={attendee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                                  {attendee.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{attendee.name}</div>
                                <div className="text-sm text-gray-500">{attendee.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{attendee.ticketType}</div>
                            <div className="text-sm text-gray-500">{formatCurrency(attendee.ticketPrice)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getAttendeeStatusColor(attendee.status)}>{attendee.status}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {attendee.orderNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(attendee.registeredAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <QrCode className="w-4 h-4" />
                              </Button>
                              {attendee.status === 'registered' && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Check In
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <div className="grid gap-4">
                {mockRegistrations.map(order => (
                  <Card key={order.id} className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white">
                            <Receipt className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{order.orderNumber}</h3>
                              <Badge className={
                                order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                order.status === 'refunded' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }>
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{order.eventTitle}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>{order.buyerName}</span>
                              <span>{order.buyerEmail}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(order.totalAmount)}
                          </div>
                          <div className="text-sm text-gray-500">{order.paymentMethod}</div>
                          <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center gap-4">
                          {order.tickets.map((ticket, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Ticket className="w-4 h-4 text-gray-400" />
                              <span>{ticket.quantity}x {ticket.type}</span>
                              <span className="text-gray-500">({formatCurrency(ticket.price)} each)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Analytics Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Event Analytics</h3>
                      <p className="text-emerald-100">Insights and performance metrics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                      <p className="text-sm text-emerald-100">Total Revenue</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{stats.avgAttendance}%</p>
                      <p className="text-sm text-emerald-100">Avg Fill Rate</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
                      <p className="text-sm text-emerald-100">Registrations</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">{stats.liveEvents}</p>
                      <p className="text-sm text-emerald-100">Live Events</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: BarChart3, label: 'Full Report', color: 'from-emerald-500 to-teal-600' },
                  { icon: Download, label: 'Export CSV', color: 'from-blue-500 to-indigo-600' },
                  { icon: TrendingUp, label: 'Trends', color: 'from-purple-500 to-pink-600' },
                  { icon: DollarSign, label: 'Revenue', color: 'from-green-500 to-emerald-600' },
                  { icon: Ticket, label: 'Ticket Sales', color: 'from-orange-500 to-amber-600' },
                  { icon: Users, label: 'Demographics', color: 'from-cyan-500 to-blue-600' },
                  { icon: Globe, label: 'Geo Data', color: 'from-pink-500 to-rose-600' },
                  { icon: Eye, label: 'Page Views', color: 'from-indigo-500 to-purple-600' },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 hover:scale-105 transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Revenue Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {formatCurrency(stats.totalRevenue)}
                    </div>
                    <div className="text-sm text-green-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +23% vs last month
                    </div>
                    <div className="mt-4 space-y-2">
                      {mockEvents.slice(0, 3).map(event => (
                        <div key={event.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400 truncate">{event.title}</span>
                          <span className="font-medium">{formatCurrency(event.totalRevenue)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Registration Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {stats.totalRegistrations.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +18% vs last month
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Registered</span>
                        <span className="font-medium">{mockAttendees.filter(a => a.status === 'registered').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Checked In</span>
                        <span className="font-medium">{mockAttendees.filter(a => a.status === 'checked-in').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Cancelled</span>
                        <span className="font-medium">{mockAttendees.filter(a => a.status === 'cancelled').length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-purple-600" />
                      Ticket Sales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockEvents[0].ticketTypes.map(ticket => (
                        <div key={ticket.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{ticket.name}</span>
                            <span className="text-sm text-gray-500">{ticket.sold}/{ticket.quantity}</span>
                          </div>
                          <Progress value={(ticket.sold / ticket.quantity) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-orange-600" />
                      Traffic Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { source: 'Direct', count: 45, color: 'bg-blue-500' },
                        { source: 'Social Media', count: 28, color: 'bg-pink-500' },
                        { source: 'Email', count: 18, color: 'bg-green-500' },
                        { source: 'Referral', count: 9, color: 'bg-yellow-500' }
                      ].map(item => (
                        <div key={item.source} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{item.source}</span>
                          <span className="text-sm font-medium">{item.count}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-cyan-600" />
                      Events by Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['conference', 'workshop', 'networking', 'webinar', 'festival'].map(type => {
                        const count = mockEvents.filter(e => e.type === type).length
                        return (
                          <div key={type} className="flex items-center gap-3">
                            {getEventTypeIcon(type as EventType)}
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 capitalize">{type}</span>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Top Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockEvents
                        .sort((a, b) => b.totalRevenue - a.totalRevenue)
                        .slice(0, 4)
                        .map((event, i) => (
                          <div key={event.id} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                              {i + 1}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 truncate">{event.title}</span>
                            <span className="text-sm font-medium">{formatCurrency(event.totalRevenue)}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {/* Settings Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 p-6 text-white">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Event Settings</h3>
                      <p className="text-gray-300">Configure your event platform</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">6</p>
                      <p className="text-sm text-gray-300">Settings Areas</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">Active</p>
                      <p className="text-sm text-gray-300">Status</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-sm text-gray-300">Payment Methods</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-2xl font-bold">2</p>
                      <p className="text-sm text-gray-300">Integrations</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Settings Grid with Sidebar Navigation */}
              <div className="grid grid-cols-12 gap-6">
                {/* Settings Sidebar */}
                <div className="col-span-12 lg:col-span-3">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm sticky top-6">
                    <CardContent className="p-4">
                      <nav className="space-y-1">
                        {[
                          { id: 'general', label: 'General', icon: Settings, description: 'Basic settings' },
                          { id: 'tickets', label: 'Tickets', icon: Ticket, description: 'Ticket settings' },
                          { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert preferences' },
                          { id: 'payments', label: 'Payments', icon: CreditCard, description: 'Payment options' },
                          { id: 'security', label: 'Security', icon: Shield, description: 'Access control' },
                          { id: 'advanced', label: 'Advanced', icon: Sliders, description: 'Power features' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSettingsTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                              settingsTab === item.id
                                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-l-4 border-orange-500'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <item.icon className={`h-5 w-5 ${settingsTab === item.id ? 'text-orange-600' : 'text-gray-400'}`} />
                            <div>
                              <p className="font-medium text-sm">{item.label}</p>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                          </button>
                        ))}
                      </nav>
                    </CardContent>
                  </Card>
                </div>

                {/* Settings Content */}
                <div className="col-span-12 lg:col-span-9 space-y-6">
                  {/* General Settings */}
                  {settingsTab === 'general' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-orange-600" />Organization</CardTitle>
                          <CardDescription>Your organization details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Organization Name</Label>
                              <Input defaultValue="Acme Events Inc." className="mt-1" />
                            </div>
                            <div>
                              <Label>Website</Label>
                              <Input defaultValue="https://acme-events.com" className="mt-1" />
                            </div>
                          </div>
                          <div>
                            <Label>Default Timezone</Label>
                            <Input defaultValue="America/New_York" className="mt-1" />
                          </div>
                          <div>
                            <Label>Default Currency</Label>
                            <Input defaultValue="USD" className="mt-1" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-orange-600" />Event Defaults</CardTitle>
                          <CardDescription>Default settings for new events</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Public Events by Default</p>
                              <p className="text-sm text-gray-500">New events are public by default</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Enable Waitlist</p>
                              <p className="text-sm text-gray-500">Allow waitlist for sold out events</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Tickets Settings */}
                  {settingsTab === 'tickets' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Ticket className="w-5 h-5 text-orange-600" />Ticket Settings</CardTitle>
                          <CardDescription>Configure ticket behavior</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Show Remaining Tickets</p>
                              <p className="text-sm text-gray-500">Display remaining ticket count to buyers</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Allow Refunds</p>
                              <p className="text-sm text-gray-500">Enable refund requests for tickets</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Ticket Transfers</p>
                              <p className="text-sm text-gray-500">Allow attendees to transfer tickets</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">QR Code Tickets</p>
                              <p className="text-sm text-gray-500">Generate QR codes for check-in</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Notification Settings */}
                  {settingsTab === 'notifications' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-orange-600" />Email Notifications</CardTitle>
                          <CardDescription>Configure email alerts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">New Registrations</p>
                              <p className="text-sm text-gray-500">Email when someone registers</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Cancellations</p>
                              <p className="text-sm text-gray-500">Email when attendees cancel</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Daily Summary</p>
                              <p className="text-sm text-gray-500">Receive daily activity summary</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Check-in Alerts</p>
                              <p className="text-sm text-gray-500">Real-time check-in notifications</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Payments Settings */}
                  {settingsTab === 'payments' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-orange-600" />Payment Methods</CardTitle>
                          <CardDescription>Manage payment options</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><CreditCard className="w-4 h-4 text-blue-600" /></div>
                              <div>
                                <p className="font-medium">Stripe</p>
                                <p className="text-sm text-gray-500">Connected to acme@stripe.com</p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Connected</Badge>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><DollarSign className="w-4 h-4 text-blue-600" /></div>
                              <div>
                                <p className="font-medium">PayPal</p>
                                <p className="text-sm text-gray-500">Not connected</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">Connect</Button>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5 text-orange-600" />Payout Settings</CardTitle>
                          <CardDescription>Configure how you receive payments</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Automatic Payouts</p>
                              <p className="text-sm text-gray-500">Receive payouts automatically</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div>
                            <Label>Payout Schedule</Label>
                            <Input defaultValue="Weekly" className="mt-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Security Settings */}
                  {settingsTab === 'security' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-orange-600" />Account Security</CardTitle>
                          <CardDescription>Protect your account</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Two-Factor Authentication</p>
                              <p className="text-sm text-gray-500">Add extra security to your account</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Login Notifications</p>
                              <p className="text-sm text-gray-500">Get notified of new logins</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Change Password</p>
                              <p className="text-sm text-gray-500">Update your password</p>
                            </div>
                            <Button variant="outline" size="sm"><Key className="w-4 h-4 mr-2" />Change</Button>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-orange-600" />Login History</CardTitle>
                          <CardDescription>Recent account access</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {[
                              { device: 'Chrome on Mac', location: 'New York, NY', time: '2 hours ago', current: true },
                              { device: 'Safari on iPhone', location: 'New York, NY', time: '1 day ago', current: false },
                              { device: 'Firefox on Windows', location: 'Chicago, IL', time: '3 days ago', current: false },
                            ].map((session, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Terminal className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm flex items-center gap-2">
                                      {session.device}
                                      {session.current && <Badge className="bg-green-100 text-green-700 text-xs">Current</Badge>}
                                    </p>
                                    <p className="text-xs text-gray-500">{session.location} • {session.time}</p>
                                  </div>
                                </div>
                                {!session.current && <Button variant="ghost" size="sm" className="text-red-600">Sign out</Button>}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Advanced Settings */}
                  {settingsTab === 'advanced' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Sliders className="w-5 h-5 text-orange-600" />Advanced Settings</CardTitle>
                          <CardDescription>Power user features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">API Access</p>
                              <p className="text-sm text-gray-500">Enable API access for integrations</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Webhook Notifications</p>
                              <p className="text-sm text-gray-500">Send events to your server</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Debug Mode</p>
                              <p className="text-sm text-gray-500">Enable verbose logging</p>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-orange-600" />Data Management</CardTitle>
                          <CardDescription>Manage your data</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Export All Data</p>
                              <p className="text-sm text-gray-500">Download all your event data</p>
                            </div>
                            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <p className="font-medium">Clear Cache</p>
                              <p className="text-sm text-gray-500">Refresh cached data</p>
                            </div>
                            <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Clear</Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Delete All Events</p>
                              <p className="text-sm text-red-600 dark:text-red-400">Permanently delete all events</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
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
                insights={eventsAIInsights}
                title="Event Intelligence"
                onInsightAction={(insight) => console.log('Insight action:', insight)}
              />
            </div>
            <div className="space-y-6">
              <CollaborationIndicator
                collaborators={eventsCollaborators}
                maxVisible={4}
              />
              <PredictiveAnalytics
                predictions={eventsPredictions}
                title="Event Forecasts"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ActivityFeed
              activities={eventsActivities}
              title="Event Activity"
              maxItems={5}
            />
            <QuickActionsToolbar
              actions={eventsQuickActions}
              variant="grid"
            />
          </div>
        </div>
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white">
                {selectedEvent && getEventTypeIcon(selectedEvent.type)}
              </div>
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge className={getEventStatusColor(selectedEvent.status)}>{selectedEvent.status}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getEventTypeIcon(selectedEvent.type)}
                  {selectedEvent.type}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getFormatIcon(selectedEvent.format)}
                  {selectedEvent.format}
                </Badge>
              </div>

              <p className="text-gray-600 dark:text-gray-400">{selectedEvent.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Date & Time</div>
                  <div className="font-medium">{formatDate(selectedEvent.startDate)}</div>
                  <div className="text-sm text-gray-500">{selectedEvent.startTime} - {selectedEvent.endTime}</div>
                </div>
                {selectedEvent.venue && (
                  <div>
                    <div className="text-sm text-gray-500">Venue</div>
                    <div className="font-medium">{selectedEvent.venue.name}</div>
                    <div className="text-sm text-gray-500">{selectedEvent.venue.city}, {selectedEvent.venue.state}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">Registrations</div>
                  <div className="font-medium">{selectedEvent.totalRegistrations.toLocaleString()} / {selectedEvent.totalCapacity.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Revenue</div>
                  <div className="font-medium">{formatCurrency(selectedEvent.totalRevenue)}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-3">Ticket Types</div>
                <div className="space-y-3">
                  {selectedEvent.ticketTypes.map(ticket => (
                    <div key={ticket.id} className="p-4 border rounded-lg dark:border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium">{ticket.name}</div>
                          <div className="text-sm text-gray-500">{ticket.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{ticket.price > 0 ? formatCurrency(ticket.price) : 'Free'}</div>
                          <Badge className={getTicketStatusColor(ticket.status)}>{ticket.status}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{ticket.sold} / {ticket.quantity} sold</span>
                        <Progress value={(ticket.sold / ticket.quantity) * 100} className="w-32 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedEvent.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Event
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
