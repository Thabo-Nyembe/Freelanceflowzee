'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KAZI_ANALYTICS_DATA, formatCurrency } from '@/lib/analytics-utils'

export default function ClientAnalyticsPage() {
  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle>Client Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{KAZI_ANALYTICS_DATA.clients.retention}%</p>
                <p className="text-sm text-gray-600 mt-1">Client Retention</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{formatCurrency(KAZI_ANALYTICS_DATA.clients.averageLifetimeValue)}</p>
                <p className="text-sm text-gray-600 mt-1">Avg Lifetime Value</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">{KAZI_ANALYTICS_DATA.clients.churnRate}%</p>
                <p className="text-sm text-gray-600 mt-1">Churn Rate</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Top Performing Clients</h4>
              <div className="space-y-3">
                {KAZI_ANALYTICS_DATA.clients.topPerformers.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.projects} projects • {client.satisfaction}% satisfaction</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(client.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
