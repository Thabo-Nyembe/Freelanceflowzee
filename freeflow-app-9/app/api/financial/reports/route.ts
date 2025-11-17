import { NextRequest, NextResponse } from 'next/server'

// Financial reports and export API
// Supports: P&L, Cash Flow, Tax Summary, Expense Reports, Revenue Reports

interface ReportRequest {
  reportType: 'profit-loss' | 'cash-flow' | 'tax-summary' | 'expenses' | 'revenue' | 'client-revenue' | 'comprehensive'
  period?: {
    start: string
    end: string
  }
  format?: 'json' | 'csv' | 'pdf'
  filters?: {
    client?: string
    category?: string
    minAmount?: number
    maxAmount?: number
  }
}

interface ReportResponse {
  success: boolean
  reportType: string
  period: {
    start: string
    end: string
  }
  data: any
  summary?: any
  downloadUrl?: string
  format: string
}

// Generate Profit & Loss Report
function generateProfitLossReport(period: any) {
  return {
    revenue: {
      projectPayments: 145000,
      consulting: 28500,
      productSales: 12300,
      other: 2450,
      total: 188250
    },
    expenses: {
      software: 4500,
      marketing: 8200,
      equipment: 3200,
      contractor: 15000,
      office: 2100,
      other: 1800,
      total: 34800
    },
    grossProfit: 153450,
    operatingExpenses: 34800,
    netProfit: 118650,
    profitMargin: 63.0,
    period: period
  }
}

// Generate Cash Flow Report
function generateCashFlowReport(period: any) {
  return {
    operatingActivities: {
      cashFromClients: 165000,
      cashPaidToSuppliers: -28400,
      cashPaidForExpenses: -15200,
      netCashFromOperations: 121400
    },
    investingActivities: {
      equipmentPurchases: -8900,
      softwareInvestments: -3200,
      netCashFromInvesting: -12100
    },
    financingActivities: {
      loanRepayments: -5000,
      ownerContributions: 0,
      netCashFromFinancing: -5000
    },
    netCashFlow: 104300,
    beginningCash: 52480,
    endingCash: 156780,
    period: period
  }
}

// Generate Tax Summary Report
function generateTaxSummaryReport(period: any) {
  return {
    taxableIncome: 118650,
    estimatedTaxRate: 0.25,
    estimatedTax: 29663,
    deductions: {
      businessExpenses: 34800,
      homeOffice: 3600,
      equipment: 8900,
      software: 4500,
      marketing: 8200,
      total: 60000
    },
    quarterlyPayments: {
      q1: 7500,
      q2: 8200,
      q3: 7800,
      q4: 0,
      total: 23500
    },
    remainingTaxDue: 6163,
    documents: [
      { type: '1099-NEC', count: 8, totalAmount: 145000 },
      { type: 'Receipts', count: 142, totalAmount: 34800 },
      { type: 'Invoices', count: 67, totalAmount: 188250 }
    ],
    period: period
  }
}

// Generate Expense Report
function generateExpenseReport(period: any, filters: any) {
  const expenses = [
    {
      category: 'software',
      name: 'Adobe Creative Cloud',
      amount: 899,
      date: '2025-01-31',
      vendor: 'Adobe Inc.',
      recurring: true,
      deductible: true
    },
    {
      category: 'marketing',
      name: 'Google Ads Campaign',
      amount: 1200,
      date: '2025-01-29',
      vendor: 'Google LLC',
      recurring: false,
      deductible: true
    },
    {
      category: 'equipment',
      name: 'MacBook Pro M3',
      amount: 2899,
      date: '2025-01-15',
      vendor: 'Apple Inc.',
      recurring: false,
      deductible: true
    },
    {
      category: 'contractor',
      name: 'Freelance Developer',
      amount: 3500,
      date: '2025-01-28',
      vendor: 'John Doe',
      recurring: false,
      deductible: true
    },
    {
      category: 'office',
      name: 'Co-working Space',
      amount: 450,
      date: '2025-01-01',
      vendor: 'WeWork',
      recurring: true,
      deductible: true
    }
  ]

  let filtered = expenses
  if (filters?.category) {
    filtered = filtered.filter(e => e.category === filters.category)
  }
  if (filters?.minAmount) {
    filtered = filtered.filter(e => e.amount >= filters.minAmount)
  }

  const total = filtered.reduce((sum, e) => sum + e.amount, 0)
  const byCategory = filtered.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  return {
    expenses: filtered,
    summary: {
      total,
      count: filtered.length,
      byCategory,
      deductible: filtered.filter(e => e.deductible).reduce((sum, e) => sum + e.amount, 0),
      recurring: filtered.filter(e => e.recurring).reduce((sum, e) => sum + e.amount, 0)
    },
    period: period
  }
}

// Generate Revenue Report
function generateRevenueReport(period: any) {
  return {
    totalRevenue: 188250,
    bySource: {
      projectPayments: 145000,
      consulting: 28500,
      productSales: 12300,
      recurring: 2450
    },
    byClient: [
      { client: 'TechCorp Inc.', revenue: 67500, projects: 8, avgProject: 8437 },
      { client: 'StartupXYZ', revenue: 45200, projects: 5, avgProject: 9040 },
      { client: 'RetailMax', revenue: 38900, projects: 6, avgProject: 6483 },
      { client: 'Others', revenue: 36650, projects: 18, avgProject: 2036 }
    ],
    byCategory: {
      webDevelopment: 85000,
      mobileApps: 52000,
      branding: 28000,
      consulting: 23250
    },
    monthlyTrend: [
      { month: 'Jan', revenue: 32000 },
      { month: 'Feb', revenue: 35000 },
      { month: 'Mar', revenue: 28000 },
      { month: 'Apr', revenue: 42000 },
      { month: 'May', revenue: 38000 },
      { month: 'Jun', revenue: 45231 }
    ],
    metrics: {
      averageProjectValue: 3827,
      revenueGrowth: 23.4,
      clientRetention: 94.2,
      newClientsRevenue: 28400
    },
    period: period
  }
}

// Generate Comprehensive Report (All-in-one)
function generateComprehensiveReport(period: any) {
  return {
    executiveSummary: {
      totalRevenue: 188250,
      totalExpenses: 34800,
      netProfit: 118650,
      profitMargin: 63.0,
      cashFlow: 156780,
      growth: {
        monthly: 23.4,
        quarterly: 67.8,
        yearly: 145.2
      }
    },
    profitLoss: generateProfitLossReport(period),
    cashFlow: generateCashFlowReport(period),
    revenue: generateRevenueReport(period),
    expenses: generateExpenseReport(period, {}),
    tax: generateTaxSummaryReport(period),
    kpis: {
      clientSatisfaction: 94.2,
      projectSuccess: 96.7,
      teamProductivity: 87.3,
      utilizationRate: 78.9,
      roi: 234.5
    },
    period: period
  }
}

// Convert report to CSV format
function convertToCSV(data: any, reportType: string): string {
  let csv = `${reportType.toUpperCase()} REPORT\n\n`

  // Simple CSV conversion for demonstration
  csv += `Generated: ${new Date().toISOString()}\n`
  csv += `Period: ${data.period?.start} to ${data.period?.end}\n\n`

  // Add data based on report type
  csv += `Data: ${JSON.stringify(data, null, 2)}\n`

  return csv
}

// Main POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ReportRequest = await request.json()

    const period = body.period || {
      start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }

    let reportData: any

    switch (body.reportType) {
      case 'profit-loss':
        reportData = generateProfitLossReport(period)
        break

      case 'cash-flow':
        reportData = generateCashFlowReport(period)
        break

      case 'tax-summary':
        reportData = generateTaxSummaryReport(period)
        break

      case 'expenses':
        reportData = generateExpenseReport(period, body.filters || {})
        break

      case 'revenue':
        reportData = generateRevenueReport(period)
        break

      case 'comprehensive':
        reportData = generateComprehensiveReport(period)
        break

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown report type: ${body.reportType}`
        }, { status: 400 })
    }

    const format = body.format || 'json'
    let response: ReportResponse = {
      success: true,
      reportType: body.reportType,
      period,
      data: reportData,
      format
    }

    // Handle different export formats
    if (format === 'csv') {
      const csv = convertToCSV(reportData, body.reportType)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${body.reportType}-report-${Date.now()}.csv"`
        }
      })
    }

    if (format === 'pdf') {
      // In production, generate actual PDF
      response.downloadUrl = `/api/financial/reports/${body.reportType}/pdf`
    }

    return NextResponse.json(response)
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate report'
    }, { status: 500 })
  }
}

// GET handler for quick report access
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'comprehensive'
    const format = searchParams.get('format') || 'json'

    const period = {
      start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }

    const reportData = type === 'comprehensive'
      ? generateComprehensiveReport(period)
      : generateProfitLossReport(period)

    if (format === 'csv') {
      const csv = convertToCSV(reportData, type)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}-report-${Date.now()}.csv"`
        }
      })
    }

    return NextResponse.json({
      success: true,
      reportType: type,
      period,
      data: reportData,
      format
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch report'
    }, { status: 500 })
  }
}
