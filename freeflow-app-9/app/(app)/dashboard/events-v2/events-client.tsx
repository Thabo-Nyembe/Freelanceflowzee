'use client'

import { useState, useMemo } from 'react'
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
  Receipt
} from 'lucide-react'

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
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="attendees">Attendees</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
            <TabsContent value="events" className="space-y-4">
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
            <TabsContent value="attendees" className="space-y-4">
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
          </Tabs>
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
