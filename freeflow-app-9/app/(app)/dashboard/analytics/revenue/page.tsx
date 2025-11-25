'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'
import { KAZI_ANALYTICS_DATA, formatCurrency } from '@/lib/analytics-utils'

export default function RevenueAnalyticsPage() {
  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle>Revenue Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Revenue Analytics</h3>
            <p className="text-gray-500">Detailed revenue breakdown and forecasting</p>
            <p className="text-2xl font-bold text-gray-900 mt-4">
              {formatCurrency(KAZI_ANALYTICS_DATA.overview.totalRevenue)}
            </p>
            <p className="text-sm text-green-600 mt-2">Total revenue (all time)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
