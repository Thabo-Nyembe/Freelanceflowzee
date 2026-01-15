'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTaxProfile } from '@/lib/hooks/use-tax-intelligence'
import { toast } from 'sonner'
import { Building, MapPin, FileText, CheckCircle, Loader2 } from 'lucide-react'

const BUSINESS_STRUCTURES = [
  { value: 'sole_proprietor', label: 'Sole Proprietor' },
  { value: 'llc', label: 'LLC (Limited Liability Company)' },
  { value: 's_corp', label: 'S Corporation' },
  { value: 'c_corp', label: 'C Corporation' },
  { value: 'partnership', label: 'Partnership' },
]

const COUNTRIES = [
  { code: 'US', name: 'United States', hasStates: true },
  { code: 'GB', name: 'United Kingdom', hasStates: false },
  { code: 'CA', name: 'Canada', hasStates: true },
  { code: 'AU', name: 'Australia', hasStates: true },
  { code: 'DE', name: 'Germany', hasStates: true },
  { code: 'FR', name: 'France', hasStates: false },
  { code: 'ES', name: 'Spain', hasStates: false },
  { code: 'IT', name: 'Italy', hasStates: false },
  { code: 'NL', name: 'Netherlands', hasStates: false },
  { code: 'SE', name: 'Sweden', hasStates: false },
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const FILING_FREQUENCIES = [
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
]

interface TaxProfileWizardProps {
  onComplete?: () => void
}

export default function TaxProfileWizard({ onComplete }: TaxProfileWizardProps) {
  const { profile, updateProfile } = useTaxProfile()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    primaryCountry: profile?.primaryCountry || 'US',
    primaryState: profile?.primaryState || '',
    businessStructure: profile?.businessStructure || 'sole_proprietor',
    taxIdNumber: profile?.taxIdNumber || '',
    taxFilingFrequency: profile?.taxFilingFrequency || 'quarterly',
    estimatedAnnualIncome: 0,
    autoCalculateTax: true,
  })

  const selectedCountry = COUNTRIES.find(c => c.code === formData.primaryCountry)

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const { error } = await updateProfile({
        primary_country: formData.primaryCountry,
        primary_state: formData.primaryState,
        business_structure: formData.businessStructure,
        tax_id_number: formData.taxIdNumber,
        tax_filing_frequency: formData.taxFilingFrequency,
        estimated_annual_income: formData.estimatedAnnualIncome,
        auto_calculate_tax: formData.autoCalculateTax,
      })

      if (error) {
        throw error
      }

      toast.success('Tax profile saved successfully!')
      onComplete?.()
    } catch (error) {
      toast.error('Failed to save tax profile')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Tax Profile Setup</CardTitle>
          <CardDescription>
            Help us understand your tax situation for accurate calculations and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    s <= step
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {s < step ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span>{s}</span>
                  )}
                </div>
                {s < 3 && (
                  <div
                    className={`w-24 h-1 ${
                      s < step ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Location */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Location Information</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="country">Primary Country</Label>
                  <Select
                    value={formData.primaryCountry}
                    onValueChange={(value) =>
                      setFormData({ ...formData, primaryCountry: value, primaryState: '' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    Where your business is primarily located
                  </p>
                </div>

                {selectedCountry?.hasStates && formData.primaryCountry === 'US' && (
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={formData.primaryState}
                      onValueChange={(value) =>
                        setFormData({ ...formData, primaryState: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Business Structure */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Business Information</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessStructure">Business Structure</Label>
                  <Select
                    value={formData.businessStructure}
                    onValueChange={(value) =>
                      setFormData({ ...formData, businessStructure: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_STRUCTURES.map((structure) => (
                        <SelectItem key={structure.value} value={structure.value}>
                          {structure.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    Your legal business entity type
                  </p>
                </div>

                <div>
                  <Label htmlFor="taxId">Tax ID Number (Optional)</Label>
                  <Input
                    id="taxId"
                    type="text"
                    placeholder={
                      formData.primaryCountry === 'US'
                        ? 'EIN or SSN'
                        : formData.primaryCountry === 'GB'
                        ? 'VAT Number'
                        : 'Tax ID'
                    }
                    value={formData.taxIdNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, taxIdNumber: e.target.value })
                    }
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your EIN, VAT number, or other tax identification
                  </p>
                </div>

                <div>
                  <Label htmlFor="income">Estimated Annual Income</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="50000"
                    value={formData.estimatedAnnualIncome}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedAnnualIncome: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Helps us provide accurate tax estimates
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Tax Settings */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Tax Settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="frequency">Filing Frequency</Label>
                  <Select
                    value={formData.taxFilingFrequency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, taxFilingFrequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FILING_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    How often you need to file taxes
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="autoCalc"
                      checked={formData.autoCalculateTax}
                      onChange={(e) =>
                        setFormData({ ...formData, autoCalculateTax: e.target.checked })
                      }
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="autoCalc" className="font-medium">
                        Automatic Tax Calculation
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Automatically calculate taxes on invoices and expenses using real-time
                        rates
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    What happens next?
                  </h4>
                  <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5" />
                      <span>Real-time tax calculations on all transactions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5" />
                      <span>AI-powered deduction suggestions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5" />
                      <span>Tax filing reminders and deadlines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5" />
                      <span>Personalized tax insights and recommendations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
            >
              Back
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
