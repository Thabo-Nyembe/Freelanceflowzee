# Tax Intelligence - Integration Guide

This guide shows you exactly how to integrate the Tax Intelligence System into your existing invoice, expense, and dashboard pages.

## 📋 Pre-Integration Checklist

✅ **Completed:**
- [x] Database migrations created (2 files in `/supabase/migrations/`)
- [x] Tax service business logic (`/lib/tax/tax-service.ts`)
- [x] API routes (16 endpoints in `/app/api/tax/`)
- [x] React hooks (`/lib/hooks/use-tax-intelligence.ts`)
- [x] Tax dashboard page (`/app/(app)/dashboard/tax-intelligence-v2/`)
- [x] Tax profile wizard (`/components/tax/tax-profile-wizard.tsx`)
- [x] Navigation link added (Tax Intelligence in sidebar)
- [x] Integration widgets (3 reusable components):
  - Tax Calculation Widget
  - Deduction Suggestion Widget
  - Tax Summary Dashboard Widget

⚠️ **Pending:**
- [ ] Run database migrations (see [MANUAL_MIGRATION_GUIDE.md](MANUAL_MIGRATION_GUIDE.md))
- [ ] Configure API keys (optional but recommended)
- [ ] Integrate widgets into existing pages (see below)

---

## 🚀 Quick Start Integrations

### 1. Invoice Integration (5 minutes)

Add automatic tax calculation to your invoice creation form.

**File:** `app/(app)/dashboard/invoices-v2/invoices-client.tsx`

#### Step 1: Import the Tax Calculation Widget

```typescript
// Add to imports at top of file
import TaxCalculationWidget from '@/components/tax/tax-calculation-widget'
```

#### Step 2: Add Tax State to newInvoice

```typescript
// In your newInvoice state (around line 150), add:
const [newInvoice, setNewInvoice] = useState({
  client: '',
  clientEmail: '',
  title: '',
  currency: 'USD',
  // ... existing fields ...

  // NEW: Tax-related fields
  clientCountry: 'US',
  clientState: '',
  clientPostalCode: '',
  subtotal: 0,
  taxAmount: 0,
  total: 0,
})
```

#### Step 3: Add Tax Calculation Handler

```typescript
// Add this function in your component
const handleTaxCalculated = (taxAmount: number, taxRate: number, total: number) => {
  setNewInvoice(prev => ({
    ...prev,
    taxAmount,
    total
  }))
}

// Also update subtotal calculation when line items change
useEffect(() => {
  const subtotal = newInvoice.items.reduce((sum, item) => sum + item.amount, 0)
  setNewInvoice(prev => ({ ...prev, subtotal }))
}, [newInvoice.items])
```

#### Step 4: Add Widget to Invoice Creation Modal

```typescript
{/* In your invoice creation dialog/modal, add this widget */}
<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
  {/* ... existing invoice form fields ... */}

  {/* Add client location fields if not already present */}
  <div className="grid grid-cols-3 gap-3">
    <div>
      <Label>Client Country</Label>
      <Select
        value={newInvoice.clientCountry}
        onValueChange={(value) => setNewInvoice({ ...newInvoice, clientCountry: value })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="US">United States</SelectItem>
          <SelectItem value="GB">United Kingdom</SelectItem>
          <SelectItem value="CA">Canada</SelectItem>
          {/* Add more countries */}
        </SelectContent>
      </Select>
    </div>
    {/* Add state and postal code inputs similarly */}
  </div>

  {/* NEW: Tax Calculation Widget */}
  <TaxCalculationWidget
    subtotal={newInvoice.subtotal}
    transactionType="invoice"
    destinationCountry={newInvoice.clientCountry}
    destinationState={newInvoice.clientState}
    destinationPostalCode={newInvoice.clientPostalCode}
    onTaxCalculated={handleTaxCalculated}
    showLocationFields={false} {/* We already have location fields above */}
    className="mt-4"
  />
</DialogContent>
```

**Result:** Tax will automatically calculate as users fill out the invoice form!

---

### 2. Expense Integration (5 minutes)

Add AI-powered deduction suggestions to your expense creation form.

**File:** `app/(app)/dashboard/expenses-v2/expenses-client.tsx` (or similar)

#### Step 1: Import the Deduction Widget

```typescript
import DeductionSuggestionWidget from '@/components/tax/deduction-suggestion-widget'
```

#### Step 2: Add Deduction State

```typescript
const [newExpense, setNewExpense] = useState({
  description: '',
  amount: 0,
  category: '',
  merchant: '',
  date: '',
  // NEW: Tax-related fields
  isDeductible: false,
  deductionCategory: '',
  deductionPercentage: 0,
  notes: ''
})
```

#### Step 3: Add Suggestion Handler

```typescript
const handleDeductionSuggested = (suggestion: any) => {
  setNewExpense(prev => ({
    ...prev,
    category: suggestion.category,
    isDeductible: suggestion.isDeductible,
    deductionCategory: suggestion.category,
    deductionPercentage: suggestion.deductionPercentage,
    notes: `AI Suggested: ${suggestion.reasoning}`
  }))
}
```

#### Step 4: Add Widget to Expense Form

```typescript
{/* In your expense creation dialog/modal */}
<DialogContent className="max-w-3xl">
  <DialogHeader>
    <DialogTitle>Add Expense</DialogTitle>
  </DialogHeader>

  {/* ... existing expense form fields ... */}

  {/* NEW: Deduction Suggestion Widget */}
  {newExpense.description && newExpense.amount > 0 && (
    <DeductionSuggestionWidget
      description={newExpense.description}
      amount={newExpense.amount}
      category={newExpense.category}
      merchant={newExpense.merchant}
      expenseDate={newExpense.date}
      onSuggestionApplied={handleDeductionSuggested}
      className="mt-4"
    />
  )}

  {/* Show applied deduction */}
  {newExpense.isDeductible && (
    <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
      <p className="text-sm font-medium text-green-900 dark:text-green-100">
        ✅ Marked as {newExpense.deductionPercentage}% deductible
      </p>
      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
        Category: {newExpense.deductionCategory}
      </p>
    </div>
  )}
</DialogContent>
```

**Result:** Users get instant AI suggestions for tax deductions as they enter expenses!

---

### 3. Main Dashboard Integration (3 minutes)

Add the Tax Summary Widget to your main dashboard overview.

**File:** `app/(app)/dashboard/page.tsx` or `app/(app)/dashboard/overview-v2/overview-client.tsx`

#### Step 1: Import the Dashboard Widget

```typescript
import TaxSummaryDashboardWidget from '@/components/tax/tax-summary-dashboard-widget'
```

#### Step 2: Add to Dashboard Grid

```typescript
{/* In your dashboard grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* ... existing dashboard widgets ... */}

  {/* NEW: Tax Summary Widget */}
  <TaxSummaryDashboardWidget className="col-span-1" />

  {/* Or for larger display */}
  <TaxSummaryDashboardWidget className="col-span-2 md:col-span-1" />
</div>
```

**Alternative:** Add as a sidebar widget

```typescript
{/* In a sidebar or side panel */}
<aside className="space-y-4">
  {/* NEW: Tax Summary Widget */}
  <TaxSummaryDashboardWidget />

  {/* ... other sidebar widgets ... */}
</aside>
```

**Result:** Users see their tax summary right on the main dashboard!

---

## 🔧 Advanced Integrations

### Custom Tax Calculation

For advanced use cases, call the tax service directly:

```typescript
import { useTaxCalculation } from '@/lib/hooks/use-tax-intelligence'

function MyComponent() {
  const { calculateTax, isCalculating } = useTaxCalculation()

  const handleCustomCalculation = async () => {
    const result = await calculateTax({
      transactionId: 'my-transaction-id',
      transactionType: 'invoice',
      subtotal: 1000,
      destinationCountry: 'US',
      destinationState: 'CA',
      destinationPostalCode: '90210',
      // Optional:
      customerId: 'customer-id',
      productIds: ['product-1', 'product-2'],
      exemptionCertificateId: 'cert-id',
      manualTaxRate: 0.08, // Manual override
    })

    console.log('Tax Amount:', result.taxAmount)
    console.log('Tax Rate:', result.taxRate)
    console.log('Total:', result.totalAmount)
    console.log('Has Nexus:', result.hasNexus)
  }

  return (
    <button onClick={handleCustomCalculation} disabled={isCalculating}>
      Calculate Tax
    </button>
  )
}
```

### Manual Deduction Creation

Create deductions programmatically:

```typescript
import { useDeductions } from '@/lib/hooks/use-tax-intelligence'

function MyComponent() {
  const { createDeduction } = useDeductions()

  const handleCreateDeduction = async () => {
    const newDeduction = await createDeduction({
      category: 'office_supplies',
      description: 'Office desk and chair',
      expense_amount: 500,
      expense_date: '2026-01-15',
      deduction_percentage: 100,
      ai_suggested: false,
      status: 'pending',
    })

    console.log('Deduction created:', newDeduction)
  }

  return <button onClick={handleCreateDeduction}>Create Deduction</button>
}
```

### Tax Profile Setup Integration

Integrate tax profile setup into onboarding:

```typescript
import TaxProfileWizard from '@/components/tax/tax-profile-wizard'

function OnboardingFlow() {
  const [step, setStep] = useState(1)

  return (
    <div>
      {step === 1 && <BasicInfoStep onComplete={() => setStep(2)} />}
      {step === 2 && <BusinessDetailsStep onComplete={() => setStep(3)} />}
      {step === 3 && (
        <TaxProfileWizard
          onComplete={() => {
            setStep(4)
            toast.success('Tax profile configured!')
          }}
        />
      )}
      {step === 4 && <FinalStep />}
    </div>
  )
}
```

---

## 📊 Available API Endpoints

All API endpoints are ready to use:

```typescript
// Tax Calculation
POST /api/tax/calculate
GET  /api/tax/summary?year=2026
GET  /api/tax/rates/US?state=CA&type=sales_tax
GET  /api/tax/breakdown?year=2026

// Tax Profile
GET  /api/tax/profile
PUT  /api/tax/profile
POST /api/tax/profile

// Deductions
GET  /api/tax/deductions?year=2026&category=office_supplies
POST /api/tax/deductions
GET  /api/tax/deductions/:id
PUT  /api/tax/deductions/:id
DELETE /api/tax/deductions/:id
POST /api/tax/deductions/suggest

// Insights
GET  /api/tax/insights?priority=urgent
POST /api/tax/insights
POST /api/tax/insights/:id/dismiss

// Reports
GET  /api/tax/reports?year=2026&type=quarterly&quarter=1
```

See API files in `/app/api/tax/` for full request/response schemas.

---

## 🧪 Testing Your Integration

### Test Invoice Tax Calculation

1. Create a new invoice
2. Enter client location (US, CA, 90210)
3. Add line items totaling $1,000
4. Verify tax calculates automatically (~$95 for CA sales tax)
5. Check invoice total includes tax

### Test Expense Deduction Suggestion

1. Create a new expense
2. Enter description: "Office desk and chair"
3. Enter amount: $500
4. Click "Get Suggestion"
5. Verify AI suggests "office_supplies" or "office_equipment"
6. Apply suggestion and verify category is set

### Test Dashboard Widget

1. Navigate to main dashboard
2. Verify Tax Summary widget displays
3. Check metrics are loading (may be $0 initially)
4. Click "View Full Tax Dashboard"
5. Verify navigates to `/dashboard/tax-intelligence-v2`

---

## 🔐 Environment Variables

Don't forget to add these to `.env.local` for full functionality:

```bash
# Tax APIs (Optional - system works without them using database rates)
TAXJAR_API_KEY=your_taxjar_sandbox_key
AVALARA_API_KEY=your_avalara_sandbox_key

# AI Features (Optional - for deduction suggestions)
OPENAI_API_KEY=your_openai_key

# Already set (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://gcinvwprtlnwuwuvmrux.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 📝 Component Props Reference

### TaxCalculationWidget

```typescript
interface TaxCalculationWidgetProps {
  subtotal: number                  // Required: Amount before tax
  transactionType: 'invoice' | 'expense'  // Required
  transactionId?: string           // Optional: Transaction ID
  destinationCountry?: string      // Optional: Defaults to user profile
  destinationState?: string        // Optional
  destinationPostalCode?: string   // Optional
  onTaxCalculated?: (
    taxAmount: number,
    taxRate: number,
    total: number
  ) => void                        // Callback when tax is calculated
  showLocationFields?: boolean     // Show country/state inputs (default: true)
  className?: string
}
```

### DeductionSuggestionWidget

```typescript
interface DeductionSuggestionWidgetProps {
  description: string              // Required: Expense description
  amount: number                   // Required: Expense amount
  category?: string                // Optional: Current category
  merchant?: string                // Optional: Merchant name
  expenseDate?: string             // Optional: Date of expense
  onSuggestionApplied?: (
    suggestion: DeductionSuggestion
  ) => void                        // Callback when suggestion is applied
  className?: string
}
```

### TaxSummaryDashboardWidget

```typescript
interface TaxSummaryDashboardWidgetProps {
  year?: number                    // Tax year (defaults to current year)
  className?: string
}
```

---

## 🎯 Next Steps

1. ✅ Run database migrations ([MANUAL_MIGRATION_GUIDE.md](MANUAL_MIGRATION_GUIDE.md))
2. ✅ Integrate Tax Calculation Widget into invoice form
3. ✅ Integrate Deduction Widget into expense form
4. ✅ Add Tax Summary Widget to main dashboard
5. ✅ Test all integrations
6. ✅ (Optional) Configure API keys for live tax rates
7. ✅ (Optional) Customize widget styling to match your brand
8. ✅ Launch and monitor usage!

---

## 💬 Support

Need help with integration?

1. Check [TAX_INTELLIGENCE_SYSTEM.md](TAX_INTELLIGENCE_SYSTEM.md) for technical details
2. Review [INTEGRATION_EXAMPLES.md](INTEGRATION_EXAMPLES.md) for more code examples
3. Inspect component source code in `/components/tax/`
4. Test API endpoints in `/app/api/tax/`

---

**Total Integration Time:** ~15 minutes for all three integrations!
**Lines of Code Added:** ~50 lines (mostly imports and widget placements)
**User Value:** Priceless tax savings and compliance confidence!
