'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { KAZI_ANALYTICS_DATA, formatCurrency } from '@/lib/analytics-utils'

export default function PerformanceAnalyticsPage() {
  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Operational Metrics</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Project Completion Rate</span>
                    <span className="font-semibold">{KAZI_ANALYTICS_DATA.performance.projectCompletionRate}%</span>
                  </div>
                  <Progress value={KAZI_ANALYTICS_DATA.performance.projectCompletionRate} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">On-Time Delivery</span>
                    <span className="font-semibold">{KAZI_ANALYTICS_DATA.performance.onTimeDelivery}%</span>
                  </div>
                  <Progress value={KAZI_ANALYTICS_DATA.performance.onTimeDelivery} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Client Satisfaction</span>
                    <span className="font-semibold">{KAZI_ANALYTICS_DATA.performance.clientSatisfaction}%</span>
                  </div>
                  <Progress value={KAZI_ANALYTICS_DATA.performance.clientSatisfaction} className="h-2" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Financial Performance</h4>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Revenue per Project</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(KAZI_ANALYTICS_DATA.performance.revenuePerProject)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className="text-2xl font-bold text-green-600">{KAZI_ANALYTICS_DATA.performance.profitMargin}%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
