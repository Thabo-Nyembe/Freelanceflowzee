// ============================================================================
// BOOKINGS UTILITIES - Shared types, helpers, and mock data
// ============================================================================

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
export interface Booking {
  id: string
  clientName: string
  service: string
  date: string
  time: string
  duration: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  payment: 'awaiting' | 'paid' | 'refunded'
  amount: number
  email?: string
  phone?: string
  notes?: string
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  bookingsThisMonth: number
  revenue: number
  status: string
  category: string
  availability: string
}

export interface ClientAnalytics {
  totalClients: number
  activeClients: number
  vipClients: number
  newThisMonth: number
  averageLifetimeValue: number
  repeatRate: number
  averageBookingsPerClient: number
}

// ============================================================================
// MOCK DATA
// ============================================================================
export const mockBookings: Booking[] = [
  {
    id: 'B-2025-001',
    clientName: 'Alex Johnson',
    service: 'Brand Strategy Session',
    date: '2025-08-07',
    time: '10:00 AM',
    duration: '60 min',
    status: 'confirmed',
    payment: 'paid',
    amount: 150,
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 001-0001',
    notes: 'First-time client, referred by Sarah'
  },
  {
    id: 'B-2025-002',
    clientName: 'Maria Garcia',
    service: 'Website Consultation',
    date: '2025-08-07',
    time: '2:30 PM',
    duration: '90 min',
    status: 'pending',
    payment: 'awaiting',
    amount: 225,
    email: 'maria.garcia@email.com',
    phone: '+1 (555) 002-0002',
    notes: 'Needs website redesign consultation'
  },
  {
    id: 'B-2025-003',
    clientName: 'John Smith',
    service: 'Logo Design Review',
    date: '2025-08-08',
    time: '11:00 AM',
    duration: '45 min',
    status: 'confirmed',
    payment: 'paid',
    amount: 120,
    email: 'john.smith@email.com',
    phone: '+1 (555) 003-0003',
    notes: 'Bringing 3 logo concepts for review'
  },
  {
    id: 'B-2025-004',
    clientName: 'Sarah Williams',
    service: 'Marketing Strategy',
    date: '2025-08-09',
    time: '3:00 PM',
    duration: '120 min',
    status: 'cancelled',
    payment: 'refunded',
    amount: 300,
    email: 'sarah.williams@email.com',
    phone: '+1 (555) 004-0004',
    notes: 'Rescheduled to next week'
  },
  {
    id: 'B-2025-005',
    clientName: 'David Lee',
    service: 'Project Kickoff',
    date: '2025-08-10',
    time: '9:30 AM',
    duration: '60 min',
    status: 'confirmed',
    payment: 'paid',
    amount: 150,
    email: 'david.lee@email.com',
    phone: '+1 (555) 005-0005',
    notes: 'New project starting this month'
  },
  {
    id: 'B-2025-006',
    clientName: 'Emily Chen',
    service: 'Brand Strategy Session',
    date: '2025-08-11',
    time: '10:00 AM',
    duration: '60 min',
    status: 'confirmed',
    payment: 'paid',
    amount: 150,
    email: 'emily.chen@email.com',
    phone: '+1 (555) 006-0006',
    notes: 'Startup brand positioning'
  },
  {
    id: 'B-2025-007',
    clientName: 'Michael Brown',
    service: 'Website Consultation',
    date: '2025-08-11',
    time: '2:00 PM',
    duration: '90 min',
    status: 'pending',
    payment: 'awaiting',
    amount: 225,
    email: 'michael.brown@email.com',
    phone: '+1 (555) 007-0007',
    notes: 'E-commerce site planning'
  },
  {
    id: 'B-2025-008',
    clientName: 'Jessica Taylor',
    service: 'Logo Design Review',
    date: '2025-08-12',
    time: '11:30 AM',
    duration: '45 min',
    status: 'confirmed',
    payment: 'paid',
    amount: 120,
    email: 'jessica.taylor@email.com',
    phone: '+1 (555) 008-0008',
    notes: 'Final logo approval meeting'
  }
]

export const mockServices: Service[] = [
  {
    id: 'S-001',
    name: 'Brand Strategy Session',
    description: 'Comprehensive brand strategy consultation',
    price: 150,
    duration: 60,
    bookingsThisMonth: 8,
    revenue: 1200,
    status: 'active',
    category: 'Strategy',
    availability: 'Mon-Fri 9AM-5PM'
  },
  {
    id: 'S-002',
    name: 'Website Consultation',
    description: 'In-depth website strategy and UX review',
    price: 225,
    duration: 90,
    bookingsThisMonth: 6,
    revenue: 1350,
    status: 'active',
    category: 'Design',
    availability: 'Mon-Fri 10AM-4PM'
  },
  {
    id: 'S-003',
    name: 'Logo Design Review',
    description: 'Expert feedback on logo concepts',
    price: 120,
    duration: 45,
    bookingsThisMonth: 10,
    revenue: 1200,
    status: 'active',
    category: 'Design',
    availability: 'Mon-Fri 9AM-6PM'
  },
  {
    id: 'S-004',
    name: 'Marketing Strategy',
    description: 'Complete marketing plan development',
    price: 300,
    duration: 120,
    bookingsThisMonth: 4,
    revenue: 1200,
    status: 'active',
    category: 'Marketing',
    availability: 'Tue, Thu 1PM-5PM'
  }
]

export const mockClientAnalytics: ClientAnalytics = {
  totalClients: 24,
  activeClients: 18,
  vipClients: 3,
  newThisMonth: 5,
  averageLifetimeValue: 4700,
  repeatRate: 78,
  averageBookingsPerClient: 7.2
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check for double booking conflicts
 */
export const checkDoubleBooking = (
  bookings: Booking[],
  date: string,
  time: string,
  excludeId?: string
): boolean => {
  return bookings.some(
    booking =>
      booking.id !== excludeId &&
      booking.date === date &&
      booking.time === time &&
      booking.status !== 'cancelled'
  )
}

/**
 * Validate booking date (must be in the future)
 */
export const validateBookingDate = (date: string): boolean => {
  const bookingDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return bookingDate >= today
}

/**
 * Calculate total revenue from bookings
 */
export const calculateRevenue = (bookings: Booking[]): number => {
  return bookings
    .filter(b => b.payment === 'paid')
    .reduce((sum, b) => sum + b.amount, 0)
}

/**
 * Count bookings by status
 */
export const countByStatus = (
  bookings: Booking[],
  status: Booking['status']
): number => {
  return bookings.filter(b => b.status === status).length
}

/**
 * Filter bookings based on criteria
 */
export const filterBookings = (
  bookings: Booking[],
  filters: {
    statusFilter?: string
    dateFilter?: string
    serviceFilter?: string
    searchQuery?: string
  }
): Booking[] => {
  let filtered = [...bookings]

  // Status filter
  if (filters.statusFilter && filters.statusFilter !== 'all') {
    filtered = filtered.filter(b => b.status === filters.statusFilter)
  }

  // Date filter
  if (filters.dateFilter) {
    filtered = filtered.filter(b => b.date === filters.dateFilter)
  }

  // Service filter
  if (filters.serviceFilter && filters.serviceFilter !== 'all') {
    filtered = filtered.filter(b => b.service === filters.serviceFilter)
  }

  // Search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter(
      b =>
        b.clientName.toLowerCase().includes(query) ||
        b.service.toLowerCase().includes(query) ||
        b.notes?.toLowerCase().includes(query)
    )
  }

  return filtered
}

/**
 * Generate next booking ID
 */
export const generateBookingId = (bookings: Booking[]): string => {
  const year = new Date().getFullYear()
  const maxId = bookings.reduce((max, b) => {
    const num = parseInt(b.id.split('-').pop() || '0')
    return Math.max(max, num)
  }, 0)
  return `B-${year}-${String(maxId + 1).padStart(3, '0')}`
}

/**
 * Format date for display
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

/**
 * Get booking duration in minutes
 */
export const getDurationMinutes = (duration: string): number => {
  return parseInt(duration.replace(/\D/g, ''))
}

/**
 * Calculate total duration for bookings
 */
export const calculateDailyDuration = (bookings: Booking[]): number => {
  return bookings.reduce((total, booking) => {
    return total + getDurationMinutes(booking.duration)
  }, 0)
}

/**
 * Get upcoming bookings
 */
export const getUpcomingBookings = (bookings: Booking[]): Booking[] => {
  return bookings
    .filter(
      b => b.status !== 'cancelled' && new Date(b.date) >= new Date()
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/**
 * Get past bookings
 */
export const getPastBookings = (bookings: Booking[]): Booking[] => {
  return bookings
    .filter(b => new Date(b.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Check if booking can be cancelled
 */
export const canCancelBooking = (booking: Booking): boolean => {
  const bookingDate = new Date(booking.date)
  const now = new Date()
  const hoursDifference =
    (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursDifference > 24 && booking.status !== 'cancelled'
}

/**
 * Check if booking can be rescheduled
 */
export const canRescheduleBooking = (booking: Booking): boolean => {
  return booking.status !== 'cancelled' && booking.status !== 'completed'
}

/**
 * Get client initials
 */
export const getClientInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
}

/**
 * Calculate booking statistics
 */
export const calculateBookingStats = (bookings: Booking[]) => {
  const total = bookings.length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const pending = bookings.filter(b => b.status === 'pending').length
  const cancelled = bookings.filter(b => b.status === 'cancelled').length
  const totalRevenue = bookings
    .filter(b => b.payment === 'paid')
    .reduce((sum, b) => sum + b.amount, 0)

  return {
    total,
    confirmed,
    pending,
    cancelled,
    totalRevenue,
    averageValue: total > 0 ? totalRevenue / total : 0,
    conversionRate: total > 0 ? (confirmed / total) * 100 : 0
  }
}

/**
 * Get service popularity
 */
export const getServicePopularity = (
  bookings: Booking[],
  serviceName: string
) => {
  const serviceBookings = bookings.filter(b => b.service === serviceName)
  return {
    count: serviceBookings.length,
    percentage: (serviceBookings.length / bookings.length) * 100
  }
}

/**
 * Get client booking count
 */
export const getClientBookingCount = (
  bookings: Booking[],
  clientName: string
): number => {
  return bookings.filter(b => b.clientName === clientName).length
}

/**
 * Get top clients by revenue
 */
export const getTopClients = (bookings: Booking[]) => {
  const clientRevenue: Record<string, number> = {}
  bookings.forEach(booking => {
    if (booking.payment === 'paid') {
      clientRevenue[booking.clientName] =
        (clientRevenue[booking.clientName] || 0) + booking.amount
    }
  })
  return Object.entries(clientRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, revenue]) => ({ name, revenue }))
}

/**
 * Get service distribution
 */
export const getServiceDistribution = (bookings: Booking[]) => {
  const distribution: Record<string, number> = {}
  bookings.forEach(booking => {
    distribution[booking.service] = (distribution[booking.service] || 0) + 1
  })
  return Object.entries(distribution).map(([service, count]) => ({
    service,
    count,
    percentage: (count / bookings.length) * 100
  }))
}
