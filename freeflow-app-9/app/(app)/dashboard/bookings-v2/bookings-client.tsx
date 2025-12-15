'use client'
import { useState } from 'react'
import { useBookings, type Booking, type BookingType, type BookingStatus, type PaymentStatus } from '@/lib/hooks/use-bookings'

export default function BookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookingTypeFilter, setBookingTypeFilter] = useState<BookingType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const { bookings, loading, error } = useBookings({ bookingType: bookingTypeFilter, status: statusFilter, paymentStatus: paymentStatusFilter })
  const displayBookings = bookings.length > 0 ? bookings : initialBookings

  const stats = {
    total: displayBookings.length,
    confirmed: displayBookings.filter(b => b.status === 'confirmed').length,
    totalRevenue: displayBookings.reduce((sum, b) => sum + b.price, 0).toFixed(2),
    avgPrice: displayBookings.length > 0 ? (displayBookings.reduce((sum, b) => sum + b.price, 0) / displayBookings.length).toFixed(0) : '0'
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Bookings</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Bookings</div><div className="text-3xl font-bold text-sky-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Confirmed</div><div className="text-3xl font-bold text-green-600">{stats.confirmed}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Revenue</div><div className="text-3xl font-bold text-blue-600">${stats.totalRevenue}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Avg Price</div><div className="text-3xl font-bold text-purple-600">${stats.avgPrice}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={bookingTypeFilter} onChange={(e) => setBookingTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="appointment">Appointment</option><option value="reservation">Reservation</option><option value="session">Session</option><option value="class">Class</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option>
            </select>
            <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Payments</option><option value="unpaid">Unpaid</option><option value="partial">Partial</option><option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayBookings.filter(b => (bookingTypeFilter === 'all' || b.booking_type === bookingTypeFilter) && (statusFilter === 'all' || b.status === statusFilter) && (paymentStatusFilter === 'all' || b.payment_status === paymentStatusFilter)).map(booking => (
          <div key={booking.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{booking.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-sky-100 text-sky-700">{booking.booking_type}</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${booking.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : booking.payment_status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{booking.payment_status}</span>
                </div>
                <h3 className="text-lg font-semibold">{booking.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  {booking.customer_name && <span>👤 {booking.customer_name}</span>}
                  {booking.booking_number && <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{booking.booking_number}</span>}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>{new Date(booking.start_time).toLocaleDateString()}</span>
                  <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                  <span>{booking.duration_minutes}min</span>
                  {booking.guest_count > 1 && <span>👥 {booking.guest_count} guests</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-sky-600">${booking.price.toFixed(2)}</div>
                <div className="text-xs text-gray-500">price</div>
                {booking.balance_due > 0 && <div className="text-xs text-red-600 mt-1">Due: ${booking.balance_due.toFixed(2)}</div>}
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
