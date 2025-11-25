'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain } from 'lucide-react'
import { KAZI_ANALYTICS_DATA, formatCurrency, getKaziInsightColor, getKaziInsightIcon } from '@/lib/analytics-utils'

export default function IntelligenceAnalyticsPage() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Business Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {KAZI_ANALYTICS_DATA.insights.map((insight, index) => {
              const InsightIcon = getKaziInsightIcon(insight.type)
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-lg border-l-4 ${getKaziInsightColor(insight.impact)} flex items-start gap-4`}
                >
                  <InsightIcon className="h-6 w-6 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {insight.impact}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      {insight.potentialValue > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          Potential value: {formatCurrency(insight.potentialValue)}
                        </p>
                      )}
                      <Button size="sm" variant="outline">
                        {insight.recommendation}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
