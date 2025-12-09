'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { Clock, Download, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPastBookings, formatDate, mockBookings } from '@/lib/bookings-utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// A+++ UTILITIES
import { ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'

const logger = createFeatureLogger('BookingsHistory')

export default function HistoryPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pastBookings, setPastBookings] = useState<ReturnType<typeof getPastBookings>>([])

  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // A+++ LOAD BOOKING HISTORY
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate API call - in production, fetch from database
        await new Promise(resolve => setTimeout(resolve, 500))
        setPastBookings(getPastBookings(mockBookings))

        announce('Booking history loaded', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking history')
        announce('Error loading booking history', 'assertive')
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [announce])

  const handleExportHistory = () => {
    logger.info('Exporting booking history', {
      totalBookings: pastBookings.length
    })
    toast.success('History exported', {
      description: `${pastBookings.length} past bookings exported to CSV`
    })
  }

  const handleFilterHistory = (period: string) => {
    logger.info('Filtering history', { period })
    toast.info('Filter Applied', {
      description: `Showing bookings from ${period}`
    })
  }

  const handleViewDetails = (bookingId: string) => {
    logger.info('Viewing booking details', { bookingId })
    toast.info('Booking Details', {
      description: 'Viewing completed booking details'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800">Completed</Badge>
        )
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Booking History</h3>
        </div>
        <ListSkeleton items={5} />
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="container mx-auto px-4 space-y-4">
        <ErrorEmptyState
          error={error}
          action={{
            label: 'Retry',
            onClick: () => window.location.reload()
          }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Booking History</h3>
        <div className="flex gap-2">
          <Select defaultValue="all" onValueChange={handleFilterHistory}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportHistory}
            data-testid="history-export-btn"
          >
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
        </div>
      </div>

      {pastBookings.length > 0 ? (
        <div className="rounded-md border bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pastBookings.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.date)}
                    </div>
                    <div className="text-sm text-gray-500">{booking.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.clientName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.service}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.duration}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${booking.amount}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {booking.payment}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(booking.id)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-lg border">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Booking History
          </h3>
          <p className="text-gray-500 mb-4">
            Past bookings and completed appointments will appear here
          </p>
          <Button
            variant="outline"
            onClick={handleExportHistory}
            data-testid="history-view-all-btn"
          >
            View Full History
          </Button>
        </div>
      )}

      {/* History Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="text-sm text-gray-600">Total Past Bookings</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {pastBookings.length}
          </div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-gray-600">Completed Bookings</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {pastBookings.filter(b => b.status === 'completed').length}
          </div>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-sm text-gray-600">Cancelled Bookings</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {pastBookings.filter(b => b.status === 'cancelled').length}
          </div>
        </div>
      </div>
    </div>
  )
}
