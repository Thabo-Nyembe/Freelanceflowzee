'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTaxSummary, useTaxInsights } from '@/lib/hooks/use-tax-intelligence'
import { Calculator, TrendingUp, TrendingDown, ArrowRight, AlertCircle, DollarSign, PiggyBank, Receipt } from 'lucide-react'
import Link from 'next/link'

interface TaxSummaryDashboardWidgetProps {
  year?: number
  className?: string
}

export default function TaxSummaryDashboardWidget({
  year,
  className = ''
}: TaxSummaryDashboardWidgetProps) {
  const targetYear = year || new Date().getFullYear()
  const { summary, isLoading } = useTaxSummary(targetYear)
  const { insights } = useTaxInsights()

  const urgentInsights = insights?.filter(i => i.priority === 'urgent' && !i.isRead) || []

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalTaxPaid = summary?.totalTaxPaid || 0
  const totalDeductions = summary?.totalDeductions || 0
  const estimatedOwed = summary?.estimatedTaxOwed || 0
  const estimatedSavings = totalDeductions * 0.25 // Assuming 25% marginal tax rate

  // Calculate if user is on track for quarterly payments
  const currentQuarter = Math.floor((new Date().getMonth()) / 3) + 1
  const expectedQuarterlyPayment = estimatedOwed / 4
  const paidThisQuarter = totalTaxPaid / currentQuarter

  const isOnTrack = paidThisQuarter >= expectedQuarterlyPayment * 0.9 // 90% threshold

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-500" />
            Tax Summary {targetYear}
          </CardTitle>
          <CardDescription>
            Your year-to-date tax overview
          </CardDescription>
        </div>
        {urgentInsights.length > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {urgentInsights.length}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Tax Paid */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <DollarSign className="h-3 w-3" />
              Tax Paid
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${totalTaxPaid.toLocaleString()}
              </p>
              {isOnTrack && (
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-2 w-2 mr-1" />
                  On Track
                </Badge>
              )}
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <Receipt className="h-3 w-3" />
              Deductions
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${totalDeductions.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Estimated Owed */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <AlertCircle className="h-3 w-3" />
              Est. Owed
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ${estimatedOwed.toLocaleString()}
              </p>
              {!isOnTrack && estimatedOwed > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <TrendingDown className="h-2 w-2 mr-1" />
                  Behind
                </Badge>
              )}
            </div>
          </div>

          {/* Tax Savings */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <PiggyBank className="h-3 w-3" />
              Tax Savings
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${estimatedSavings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Quarterly Breakdown (if available) */}
        {summary?.quarterlyBreakdown && summary.quarterlyBreakdown.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Quarterly Progress
            </p>
            <div className="grid grid-cols-4 gap-2">
              {summary.quarterlyBreakdown.map((quarter: { quarter: number; taxPaid: number; deductions: number }, i: number) => (
                <div
                  key={i}
                  className={`text-center p-2 rounded border ${
                    quarter.quarter === currentQuarter
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-xs font-medium">Q{quarter.quarter}</p>
                  <p className="text-sm font-bold mt-1">
                    ${quarter.taxPaid.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Urgent Insights */}
        {urgentInsights.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  {urgentInsights[0].title}
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {urgentInsights[0].description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button asChild className="w-full" variant="outline">
          <Link href="/dashboard/tax-intelligence-v2" className="flex items-center justify-between">
            <span>View Full Tax Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
          <span>
            {summary?.calculationCount || 0} transactions tracked
          </span>
          <span>
            {summary?.deductionCount || 0} deductions
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
