'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDeductionSuggestion } from '@/lib/hooks/use-tax-intelligence'
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface DeductionSuggestionWidgetProps {
  description: string
  amount: number
  category?: string
  merchant?: string
  expenseDate?: string
  onSuggestionApplied?: (suggestion: DeductionSuggestion) => void
  className?: string
}

interface DeductionSuggestion {
  category: string
  subcategory?: string
  confidence: number
  isDeductible: boolean
  deductionPercentage: number
  estimatedDeduction: number
  reasoning: string
  requirements: string[]
  documentation: string[]
  warnings?: string[]
}

export default function DeductionSuggestionWidget({
  description,
  amount,
  category,
  merchant,
  expenseDate,
  onSuggestionApplied,
  className = ''
}: DeductionSuggestionWidgetProps) {
  const { suggestDeduction, isSuggesting } = useDeductionSuggestion()
  const [suggestion, setSuggestion] = useState<DeductionSuggestion | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleGetSuggestion = async () => {
    if (!description || amount === 0) {
      toast.error('Please provide expense description and amount')
      return
    }

    try {
      const result = await suggestDeduction({
        description,
        amount,
        category,
        merchant,
        expenseDate,
      })

      setSuggestion(result as unknown as DeductionSuggestion)
      setShowDetails(true)
    } catch (error) {
      console.error('Deduction suggestion error:', error)
      toast.error('Failed to get deduction suggestion')
    }
  }

  const handleApplySuggestion = () => {
    if (suggestion) {
      onSuggestionApplied?.(suggestion)
      toast.success('Deduction category applied')
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-orange-600 bg-orange-50 border-orange-200'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          AI Deduction Suggestion
        </CardTitle>
        {suggestion && (
          <Badge
            variant="secondary"
            className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}
          >
            {getConfidenceLabel(suggestion.confidence)} Confidence
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {!suggestion ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-3">
              Get AI-powered suggestions for tax deductions based on your expense
            </p>
            <Button
              size="sm"
              onClick={handleGetSuggestion}
              disabled={isSuggesting || !description || amount === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSuggesting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-2" />
                  Get Suggestion
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Main Suggestion */}
            <div
              className={`p-3 rounded-lg border ${
                suggestion.isDeductible
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                {suggestion.isDeductible ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {suggestion.isDeductible ? 'Potentially Deductible' : 'Not Deductible'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Category:{' '}
                    <span className="font-medium capitalize">
                      {suggestion.category.replace(/_/g, ' ')}
                      {suggestion.subcategory && ` - ${suggestion.subcategory}`}
                    </span>
                  </p>
                </div>
              </div>

              {suggestion.isDeductible && (
                <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Deductible Amount ({suggestion.deductionPercentage}%):
                    </span>
                    <span className="font-bold text-green-700 dark:text-green-400">
                      ${suggestion.estimatedDeduction.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Reasoning */}
            <div className="text-sm">
              <p className="font-medium mb-1">Reasoning:</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                {suggestion.reasoning}
              </p>
            </div>

            {/* Expandable Details */}
            {suggestion.isDeductible && (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {showDetails ? 'Hide' : 'Show'} Requirements & Documentation
                  </span>
                  <span className="text-xs">
                    {showDetails ? '▲' : '▼'}
                  </span>
                </Button>

                {showDetails && (
                  <div className="space-y-3 pl-3 text-xs">
                    {suggestion.requirements.length > 0 && (
                      <div>
                        <p className="font-medium mb-1">Requirements:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                          {suggestion.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {suggestion.documentation.length > 0 && (
                      <div>
                        <p className="font-medium mb-1">Documentation Needed:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                          {suggestion.documentation.map((doc, i) => (
                            <li key={i}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {suggestion.warnings && suggestion.warnings.length > 0 && (
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded">
                        <p className="font-medium mb-1 text-yellow-800 dark:text-yellow-300">
                          ⚠️ Warnings:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-400">
                          {suggestion.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {suggestion.isDeductible && (
                <Button
                  size="sm"
                  onClick={handleApplySuggestion}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Apply Suggestion
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSuggestion(null)}
                className="flex-1"
              >
                Get New Suggestion
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 text-center italic">
              This is an AI suggestion. Consult a tax professional for confirmation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
