# Tax Intelligence Integration Examples

This document provides code examples for integrating the Tax Intelligence System with your existing invoices, expenses, and other features.

---

## 📌 Table of Contents

1. [Invoice Tax Calculation](#invoice-tax-calculation)
2. [Expense Deduction Suggestion](#expense-deduction-suggestion)
3. [Dashboard Tax Widgets](#dashboard-tax-widgets)
4. [Tax Profile Setup Flow](#tax-profile-setup-flow)
5. [Tax Insights Notifications](#tax-insights-notifications)

---

## 1. Invoice Tax Calculation

### Automatic Tax Calculation on Invoice Creation

Add this to your invoice creation component:

```typescript
// In your invoice creation form component
import { useTaxCalculation } from '@/lib/hooks/use-tax-intelligence'
import { useTaxProfile } from '@/lib/hooks/use-tax-intelligence'

export function InvoiceForm() {
  const { calculateTax, isCalculating } = useTaxCalculation()
  const { profile } = useTaxProfile()
  const [invoice, setInvoice] = useState({
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    clientCountry: 'US',
    clientState: '',
    clientPostalCode: '',
  })

  // Calculate tax when invoice amount or client location changes
  useEffect(() => {
    if (!profile?.autoCalculateTax || invoice.subtotal === 0) return

    const calculateInvoiceTax = async () => {
      try {
        const result = await calculateTax({
          transactionId: invoice.id || 'draft',
          transactionType: 'invoice',
          subtotal: invoice.subtotal,
          destinationCountry: invoice.clientCountry,
          destinationState: invoice.clientState,
          destinationPostalCode: invoice.clientPostalCode,
        })

        setInvoice(prev => ({
          ...prev,
          taxAmount: result.taxAmount,
          total: result.totalAmount,
          taxRate: result.taxRate,
          taxBreakdown: result.breakdown,
        }))

        toast.success('Tax calculated automatically')
      } catch (error) {
        console.error('Tax calculation failed:', error)
      }
    }

    calculateInvoiceTax()
  }, [invoice.subtotal, invoice.clientCountry, invoice.clientState, profile?.autoCalculateTax])

  return (
    <form>
      {/* Invoice form fields */}
      <Input
        label="Subtotal"
        type="number"
        value={invoice.subtotal}
        onChange={(e) => setInvoice({ ...invoice, subtotal: parseFloat(e.target.value) })}
      />

      {/* Tax breakdown display */}
      {invoice.taxAmount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Tax ({(invoice.taxRate * 100).toFixed(2)}%):</span>
            <span>${invoice.taxAmount.toFixed(2)}</span>
          </div>
          {invoice.taxBreakdown && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {Object.entries(invoice.taxBreakdown).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key}:</span>
                  <span>${value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between font-bold mt-2 pt-2 border-t">
            <span>Total:</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {isCalculating && <p className="text-sm text-gray-500">Calculating tax...</p>}
    </form>
  )
}
```

### Manual Tax Override

```typescript
// Add a manual tax override option
const [manualTax, setManualTax] = useState(false)

{manualTax ? (
  <Input
    label="Tax Amount"
    type="number"
    value={invoice.taxAmount}
    onChange={(e) => setInvoice({ ...invoice, taxAmount: parseFloat(e.target.value) })}
  />
) : (
  <Button
    variant="outline"
    onClick={() => setManualTax(true)}
    size="sm"
  >
    Override Tax
  </Button>
)}
```

---

## 2. Expense Deduction Suggestion

### AI-Powered Deduction Categorization

Add this to your expense creation component:

```typescript
// In your expense creation form component
import { useDeductionSuggestion } from '@/lib/hooks/use-tax-intelligence'

export function ExpenseForm() {
  const { suggestDeduction, isSuggesting } = useDeductionSuggestion()
  const [expense, setExpense] = useState({
    description: '',
    amount: 0,
    category: '',
  })
  const [deductionSuggestion, setDeductionSuggestion] = useState(null)

  // Get deduction suggestion when description changes
  const handleDescriptionBlur = async () => {
    if (!expense.description || !expense.amount) return

    try {
      const suggestion = await suggestDeduction({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
      })

      setDeductionSuggestion(suggestion)
    } catch (error) {
      console.error('Deduction suggestion failed:', error)
    }
  }

  return (
    <form>
      <Input
        label="Description"
        value={expense.description}
        onChange={(e) => setExpense({ ...expense, description: e.target.value })}
        onBlur={handleDescriptionBlur}
      />

      <Input
        label="Amount"
        type="number"
        value={expense.amount}
        onChange={(e) => setExpense({ ...expense, amount: parseFloat(e.target.value) })}
      />

      {/* AI Suggestion Display */}
      {deductionSuggestion && (
        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-green-600" />
            <span className="font-medium">AI Deduction Suggestion</span>
            <Badge variant="secondary">
              {(deductionSuggestion.confidence * 100).toFixed(0)}% confidence
            </Badge>
          </div>

          <p className="text-sm mb-3">
            This expense may qualify as a{' '}
            <strong className="capitalize">
              {deductionSuggestion.category.replace(/_/g, ' ')}
            </strong>{' '}
            deduction.
          </p>

          <div className="text-sm mb-3">
            <strong>Estimated Deduction:</strong> ${deductionSuggestion.estimatedDeduction.toFixed(2)}
          </div>

          <div className="text-sm mb-3">
            <strong>Requirements:</strong>
            <ul className="list-disc list-inside mt-1">
              {deductionSuggestion.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>

          <div className="text-sm mb-3">
            <strong>Documentation Needed:</strong>
            <ul className="list-disc list-inside mt-1">
              {deductionSuggestion.documentation.map((doc, i) => (
                <li key={i}>{doc}</li>
              ))}
            </ul>
          </div>

          <Button
            size="sm"
            onClick={() => {
              setExpense({
                ...expense,
                category: deductionSuggestion.category,
                isDeductible: true,
              })
              toast.success('Deduction category applied')
            }}
          >
            Apply Suggestion
          </Button>
        </div>
      )}

      {isSuggesting && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing expense for deductions...
        </div>
      )}
    </form>
  )
}
```

---

## 3. Dashboard Tax Widgets

### Year-to-Date Tax Summary Widget

Add this to your main dashboard:

```typescript
// In your main dashboard component
import { useTaxSummary } from '@/lib/hooks/use-tax-intelligence'

export function DashboardTaxWidget() {
  const { summary, isLoading } = useTaxSummary()

  if (isLoading) return <Skeleton className="h-32" />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Summary {new Date().getFullYear()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tax Paid</p>
            <p className="text-2xl font-bold text-blue-600">
              ${summary?.totalTaxPaid.toLocaleString() || '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Deductions</p>
            <p className="text-2xl font-bold text-green-600">
              ${summary?.totalDeductions.toLocaleString() || '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Est. Owed</p>
            <p className="text-2xl font-bold text-orange-600">
              ${summary?.estimatedTaxOwed.toLocaleString() || '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tax Savings</p>
            <p className="text-2xl font-bold text-purple-600">
              ${((summary?.totalDeductions || 0) * 0.25).toLocaleString()}
            </p>
          </div>
        </div>

        <Button className="w-full mt-4" variant="outline" asChild>
          <Link href="/dashboard/tax-intelligence-v2">
            View Full Tax Dashboard
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Tax Insights Widget

```typescript
// Quick tax insights widget for dashboard
import { useTaxInsights } from '@/lib/hooks/use-tax-intelligence'

export function TaxInsightsWidget() {
  const { insights, dismissInsight } = useTaxInsights()

  const topInsights = insights.slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topInsights.map((insight) => (
          <div
            key={insight.id}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">{insight.title}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {insight.description}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissInsight(insight.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        <Button className="w-full" variant="outline" asChild>
          <Link href="/dashboard/tax-intelligence-v2?tab=insights">
            View All Insights
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## 4. Tax Profile Setup Flow

### Onboarding Integration

Add tax profile setup to your onboarding flow:

```typescript
// In your onboarding component
import TaxProfileWizard from '@/components/tax/tax-profile-wizard'

export function OnboardingFlow() {
  const [step, setStep] = useState(1)

  return (
    <div>
      {step === 1 && <BasicInfoStep onComplete={() => setStep(2)} />}
      {step === 2 && <BusinessDetailsStep onComplete={() => setStep(3)} />}
      {step === 3 && (
        <TaxProfileWizard onComplete={() => {
          setStep(4)
          toast.success('Tax profile configured!')
        }} />
      )}
      {step === 4 && <FinalStep />}
    </div>
  )
}
```

### First-Time User Prompt

```typescript
// Prompt users to set up tax profile
import { useTaxProfile } from '@/lib/hooks/use-tax-intelligence'

export function TaxProfilePrompt() {
  const { profile } = useTaxProfile()
  const [dismissed, setDismissed] = useState(false)

  if (profile || dismissed) return null

  return (
    <Card className="border-blue-500">
      <CardHeader>
        <CardTitle>Set Up Your Tax Profile</CardTitle>
        <CardDescription>
          Get started with automatic tax calculations and AI-powered deduction suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard/tax-intelligence-v2?setup=true">
            Set Up Now
          </Link>
        </Button>
        <Button variant="outline" onClick={() => setDismissed(true)}>
          Later
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## 5. Tax Insights Notifications

### Real-Time Tax Notifications

```typescript
// Add tax notifications to your notification system
import { useTaxInsights } from '@/lib/hooks/use-tax-intelligence'

export function NotificationCenter() {
  const { insights } = useTaxInsights()

  const urgentTaxInsights = insights.filter(i => i.priority === 'urgent' && !i.isRead)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {urgentTaxInsights.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
              {urgentTaxInsights.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {urgentTaxInsights.map((insight) => (
          <DropdownMenuItem key={insight.id} asChild>
            <Link href={`/dashboard/tax-intelligence-v2?tab=insights&id=${insight.id}`}>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
                <div>
                  <p className="font-medium">{insight.title}</p>
                  <p className="text-xs text-gray-500">{insight.description}</p>
                </div>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## Environment Variables

Don't forget to add these to your `.env.local`:

```bash
# Tax Calculation APIs
TAXJAR_API_KEY=your_taxjar_sandbox_key
AVALARA_API_KEY=your_avalara_sandbox_key

# OpenAI for AI deduction categorization
OPENAI_API_KEY=your_openai_key
```

---

## Testing Examples

### Test Tax Calculation

```typescript
// Example test for tax calculation
describe('Tax Calculation', () => {
  it('should calculate tax for US invoice', async () => {
    const result = await fetch('/api/tax/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: 'test_123',
        transactionType: 'invoice',
        subtotal: 1000,
        destinationCountry: 'US',
        destinationState: 'CA',
        destinationPostalCode: '90210'
      })
    })

    const data = await result.json()

    expect(data.success).toBe(true)
    expect(data.data.taxAmount).toBeGreaterThan(0)
    expect(data.data.taxRate).toBeGreaterThan(0)
  })
})
```

---

## Best Practices

1. **Always handle errors gracefully** - Tax API calls can fail
2. **Cache tax calculations** - Don't recalculate on every render
3. **Validate user input** - Ensure postal codes and states are valid
4. **Show loading states** - Tax calculations can take 1-2 seconds
5. **Provide manual override** - Let users override automatic calculations
6. **Log all calculations** - Keep audit trail for compliance

---

## Need Help?

- See [TAX_INTELLIGENCE_SYSTEM.md](TAX_INTELLIGENCE_SYSTEM.md) for full documentation
- See [TAX_IMPLEMENTATION_SUMMARY.md](TAX_IMPLEMENTATION_SUMMARY.md) for setup guide
- Check API routes in `app/api/tax/` for endpoint specs
- Review tax service in `lib/tax/tax-service.ts` for business logic

---

*These examples cover the most common integration scenarios. Adapt them to fit your specific use cases.*
