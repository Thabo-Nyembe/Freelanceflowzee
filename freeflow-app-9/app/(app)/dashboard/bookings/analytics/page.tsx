'use client'

import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  CheckCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockBookings, calculateBookingStats } from '@/lib/bookings-utils'

const logger = createFeatureLogger('BookingsAnalytics')

export default function AnalyticsPage() {
  const stats = calculateBookingStats(mockBookings)

  const handleViewDetailedReport = () => {
    logger.info('Viewing detailed analytics report')
    toast.info('Detailed Analytics Report', {
      description: 'Opening comprehensive booking analytics dashboard'
    })
  }

  return (
    <div className="container mx-auto px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Booking Analytics</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetailedReport}
          data-testid="analytics-view-details-btn"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          View Detailed Report
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Bookings</span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-green-600 mt-1">
              +15% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Revenue</span>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 mt-1">
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Booking Value</span>
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${Math.round(stats.averageValue)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Stable</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(stats.conversionRate)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Conversion Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">94%</div>
              <div className="text-sm text-gray-600 mt-1">Show-up Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">68%</div>
              <div className="text-sm text-gray-600 mt-1">Rebooking Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">24</div>
              <div className="text-sm text-gray-600 mt-1">Active Clients</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peak Times & Top Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Peak Booking Times</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <div className="font-semibold">10:00 AM - 12:00 PM</div>
                <div className="text-sm text-gray-600">Morning Peak</div>
              </div>
              <Badge className="bg-blue-600">35%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-semibold">2:00 PM - 4:00 PM</div>
                <div className="text-sm text-gray-600">Afternoon Peak</div>
              </div>
              <Badge variant="outline">28%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-semibold">Best Day: Tuesday</div>
                <div className="text-sm text-gray-600">Highest conversion</div>
              </div>
              <Badge variant="outline">42%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <div className="font-semibold">Brand Strategy</div>
                <div className="text-sm text-gray-600">8 bookings</div>
              </div>
              <Badge className="bg-green-600">$1,200</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-semibold">Logo Design Review</div>
                <div className="text-sm text-gray-600">10 bookings</div>
              </div>
              <Badge variant="outline">$1,200</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-semibold">Website Consultation</div>
                <div className="text-sm text-gray-600">6 bookings</div>
              </div>
              <Badge variant="outline">$1,350</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-gray-600">Confirmed</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {stats.confirmed}
              </div>
              <div className="text-sm text-green-600 mt-1">
                {Math.round((stats.confirmed / stats.total) * 100)}% of total
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {stats.pending}
              </div>
              <div className="text-sm text-yellow-600 mt-1">
                {Math.round((stats.pending / stats.total) * 100)}% of total
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600">Completed</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">0</div>
              <div className="text-sm text-blue-600 mt-1">Historical data</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-sm text-gray-600">Cancelled</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {stats.cancelled}
              </div>
              <div className="text-sm text-red-600 mt-1">
                {Math.round((stats.cancelled / stats.total) * 100)}% of total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-600" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Increase Tuesday availability</p>
              <p className="text-sm text-gray-600">
                Your highest-converting day with 42% conversion rate
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Offer 10AM slots at premium pricing</p>
              <p className="text-sm text-gray-600">
                Peak demand hour with 35% of bookings
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Bundle popular services for upsell</p>
              <p className="text-sm text-gray-600">
                Brand Strategy + Logo Review = 30% higher value
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Target rebooking at 30-day mark</p>
              <p className="text-sm text-gray-600">
                68% rebooking rate - send reminder at optimal time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-xl font-bold text-gray-900">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">+12%</p>
                <p className="text-xs text-gray-500">vs last month</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Average per Booking</p>
                <p className="text-xl font-bold text-gray-900">
                  ${Math.round(stats.averageValue)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Stable</p>
                <p className="text-xs text-gray-500">No change</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Projected (End of Month)</p>
                <p className="text-xl font-bold text-gray-900">
                  ${Math.round(stats.totalRevenue * 1.5).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">On track</p>
                <p className="text-xs text-gray-500">Based on current rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
