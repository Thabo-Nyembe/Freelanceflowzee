'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useTaxCalculation, useTaxProfile } from '@/lib/hooks/use-tax-intelligence'
import { Calculator, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface TaxCalculationWidgetProps {
  subtotal: number
  transactionId?: string
  transactionType: 'invoice' | 'expense'
  destinationCountry?: string
  destinationState?: string
  destinationPostalCode?: string
  onTaxCalculated?: (taxAmount: number, taxRate: number, total: number) => void
  showLocationFields?: boolean
  className?: string
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export default function TaxCalculationWidget({
  subtotal,
  transactionId,
  transactionType,
  destinationCountry: propCountry,
  destinationState: propState,
  destinationPostalCode: propPostalCode,
  onTaxCalculated,
  showLocationFields = true,
  className = ''
}: TaxCalculationWidgetProps) {
  const { profile } = useTaxProfile()
  const { calculateTax, isCalculating } = useTaxCalculation()

  const [autoCalculate, setAutoCalculate] = useState(profile?.autoCalculateTax !== false)
  const [country, setCountry] = useState(propCountry || profile?.primaryCountry || 'US')
  const [state, setState] = useState(propState || profile?.primaryState || '')
  const [postalCode, setPostalCode] = useState(propPostalCode || '')
  const [manualOverride, setManualOverride] = useState(false)
  const [manualTaxAmount, setManualTaxAmount] = useState(0)

  const [taxResult, setTaxResult] = useState<{
    taxAmount: number
    taxRate: number
    totalAmount: number
    breakdown?: Record<string, number>
    hasNexus?: boolean
    calculationMethod?: string
  } | null>(null)

  // Update local state when props change
  useEffect(() => {
    if (propCountry) setCountry(propCountry)
    if (propState) setState(propState)
    if (propPostalCode) setPostalCode(propPostalCode)
  }, [propCountry, propState, propPostalCode])

  // Calculate tax when inputs change
  useEffect(() => {
    if (!autoCalculate || manualOverride || subtotal === 0) return

    const debounceTimer = setTimeout(() => {
      handleCalculateTax()
    }, 500) // Debounce for 500ms

    return () => clearTimeout(debounceTimer)
  }, [subtotal, country, state, postalCode, autoCalculate, manualOverride])

  const handleCalculateTax = async () => {
    if (subtotal === 0) {
      setTaxResult(null)
      onTaxCalculated?.(0, 0, subtotal)
      return
    }

    try {
      const result = await calculateTax({
        transactionId: transactionId || `temp_${Date.now()}`,
        transactionType,
        subtotal,
        destinationCountry: country,
        destinationState: state || undefined,
        destinationPostalCode: postalCode || undefined,
      })

      setTaxResult(result)
      onTaxCalculated?.(result.taxAmount, result.taxRate, result.totalAmount)
    } catch (error) {
      console.error('Tax calculation error:', error)
      toast.error('Failed to calculate tax')
    }
  }

  const handleManualTaxChange = (value: number) => {
    setManualTaxAmount(value)
    const total = subtotal + value
    const rate = subtotal > 0 ? value / subtotal : 0
    onTaxCalculated?.(value, rate, total)
  }

  const total = manualOverride ? subtotal + manualTaxAmount : taxResult?.totalAmount || subtotal

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Tax Calculation
        </CardTitle>
        <div className="flex items-center gap-2">
          {taxResult && (
            <Badge variant={taxResult.hasNexus ? 'default' : 'secondary'} className="text-xs">
              {taxResult.calculationMethod || 'Auto'}
            </Badge>
          )}
          <Switch
            checked={autoCalculate}
            onCheckedChange={setAutoCalculate}
            className="scale-75"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Fields */}
        {showLocationFields && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="tax-country" className="text-xs">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="tax-country" className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {country === 'US' && (
              <div className="space-y-1">
                <Label htmlFor="tax-state" className="text-xs">State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger id="tax-state" className="h-8">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {country === 'US' && (
              <div className="space-y-1 col-span-2">
                <Label htmlFor="tax-postal" className="text-xs">Postal Code (Optional)</Label>
                <Input
                  id="tax-postal"
                  type="text"
                  placeholder="90210"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="h-8"
                />
              </div>
            )}
          </div>
        )}

        {/* Manual Override Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="manual-override" className="text-xs">Manual Tax Override</Label>
          <Switch
            id="manual-override"
            checked={manualOverride}
            onCheckedChange={setManualOverride}
            className="scale-75"
          />
        </div>

        {/* Manual Tax Input */}
        {manualOverride ? (
          <div className="space-y-1">
            <Label htmlFor="manual-tax" className="text-xs">Tax Amount</Label>
            <Input
              id="manual-tax"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={manualTaxAmount}
              onChange={(e) => handleManualTaxChange(parseFloat(e.target.value) || 0)}
              className="h-8"
            />
          </div>
        ) : (
          <>
            {/* Tax Breakdown */}
            {isCalculating ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-gray-500">Calculating tax...</span>
              </div>
            ) : taxResult ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tax ({(taxResult.taxRate * 100).toFixed(2)}%):
                  </span>
                  <span className="font-medium">${taxResult.taxAmount.toFixed(2)}</span>
                </div>

                {taxResult.breakdown && Object.keys(taxResult.breakdown).length > 0 && (
                  <div className="pl-4 space-y-1 text-xs text-gray-500">
                    {Object.entries(taxResult.breakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span>${value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>${taxResult.totalAmount.toFixed(2)}</span>
                </div>

                {taxResult.hasNexus !== undefined && (
                  <div className="flex items-center gap-2 text-xs mt-2">
                    {taxResult.hasNexus ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">Nexus established - tax applies</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-orange-500" />
                        <span className="text-orange-600">No nexus - tax may not apply</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : subtotal > 0 && autoCalculate ? (
              <div className="text-center py-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCalculateTax}
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-3 w-3 mr-2" />
                      Calculate Tax
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </>
        )}

        {/* Summary when auto-calculate is off */}
        {!autoCalculate && !manualOverride && (
          <div className="text-xs text-center text-gray-500 py-2">
            Auto-calculation disabled. Enable to calculate tax automatically.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
