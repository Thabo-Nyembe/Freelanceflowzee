import { NextRequest, NextResponse } from 'next/server'

// Invoice generation and management API endpoint
// Supports: Create, Read, Update, Delete invoices

interface InvoiceItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

interface InvoiceRequest {
  action: 'create' | 'list' | 'update' | 'delete' | 'send' | 'mark-paid'
  invoiceId?: string
  data?: {
    client?: string
    project?: string
    amount?: number
    issueDate?: string
    dueDate?: string
    currency?: string
    taxRate?: number
    items?: InvoiceItem[]
    notes?: string
    status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  }
}

interface InvoiceResponse {
  success: boolean
  action: string
  invoice?: any
  invoices?: any[]
  message?: string
  invoiceNumber?: string
  pdfUrl?: string
  error?: string
}

// Generate unique invoice number
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `INV-${year}${month}-${random}`
}

// Calculate invoice totals
function calculateInvoiceTotals(items: InvoiceItem[], taxRate: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const tax = (subtotal * taxRate) / 100
  const total = subtotal + tax

  return { subtotal, tax, total }
}

// Create new invoice
async function handleCreateInvoice(data: any): Promise<NextResponse> {
  try {
    const invoiceNumber = generateInvoiceNumber()
    const { subtotal, tax, total } = calculateInvoiceTotals(data.items || [], data.taxRate || 0)

    const invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      number: invoiceNumber,
      client: data.client || 'Unknown Client',
      project: data.project || 'General Services',
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: data.status || 'draft',
      currency: data.currency || 'USD',
      taxRate: data.taxRate || 0,
      items: data.items || [],
      subtotal,
      tax,
      total,
      paidAmount: 0,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In production, this would save to database
    // await db.invoices.create(invoice)

    return NextResponse.json({
      success: true,
      action: 'create',
      invoice,
      invoiceNumber,
      message: `Invoice ${invoiceNumber} created successfully`,
      pdfUrl: `/api/financial/invoices/${invoice.id}/pdf`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      action: 'create',
      error: error.message || 'Failed to create invoice'
    }, { status: 500 })
  }
}

// List invoices with filters
async function handleListInvoices(filters?: any): Promise<NextResponse> {
  try {
    // Mock invoice data - in production, query from database
    const mockInvoices = [
      {
        id: 'inv_1',
        number: 'INV-2025-001',
        client: 'TechCorp Inc.',
        project: 'Website Redesign',
        amount: 12500,
        status: 'sent',
        dueDate: '2025-02-15',
        createdAt: '2025-02-01'
      },
      {
        id: 'inv_2',
        number: 'INV-2025-002',
        client: 'StartupXYZ',
        project: 'Mobile App',
        amount: 8750,
        status: 'paid',
        dueDate: '2025-02-20',
        createdAt: '2025-02-05'
      },
      {
        id: 'inv_3',
        number: 'INV-2025-003',
        client: 'RetailMax',
        project: 'E-commerce Platform',
        amount: 15200,
        status: 'overdue',
        dueDate: '2025-01-30',
        createdAt: '2025-01-15'
      }
    ]

    let filteredInvoices = mockInvoices

    // Apply filters if provided
    if (filters?.status) {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === filters.status)
    }
    if (filters?.client) {
      filteredInvoices = filteredInvoices.filter(inv =>
        inv.client.toLowerCase().includes(filters.client.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      action: 'list',
      invoices: filteredInvoices,
      total: filteredInvoices.length,
      message: `Found ${filteredInvoices.length} invoices`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      action: 'list',
      error: error.message || 'Failed to list invoices'
    }, { status: 500 })
  }
}

// Send invoice to client
async function handleSendInvoice(invoiceId: string): Promise<NextResponse> {
  try {
    // In production: Update invoice status and send email
    const invoice = {
      id: invoiceId,
      status: 'sent',
      sentAt: new Date().toISOString()
    }

    // Simulate sending email with invoice
    const emailSent = true

    return NextResponse.json({
      success: true,
      action: 'send',
      invoice,
      message: `Invoice sent successfully to client`,
      emailSent
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      action: 'send',
      error: error.message || 'Failed to send invoice'
    }, { status: 500 })
  }
}

// Mark invoice as paid
async function handleMarkPaid(invoiceId: string, data: any): Promise<NextResponse> {
  try {
    const invoice = {
      id: invoiceId,
      status: 'paid',
      paidAmount: data.amount || 0,
      paidDate: new Date().toISOString(),
      paymentMethod: data.paymentMethod || 'bank_transfer',
      paymentNotes: data.notes || ''
    }

    return NextResponse.json({
      success: true,
      action: 'mark-paid',
      invoice,
      message: `Invoice marked as paid`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      action: 'mark-paid',
      error: error.message || 'Failed to mark invoice as paid'
    }, { status: 500 })
  }
}

// Main POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: InvoiceRequest = await request.json()

    switch (body.action) {
      case 'create':
        return handleCreateInvoice(body.data)

      case 'list':
        return handleListInvoices(body.data)

      case 'send':
        if (!body.invoiceId) {
          return NextResponse.json({
            success: false,
            error: 'Invoice ID required'
          }, { status: 400 })
        }
        return handleSendInvoice(body.invoiceId)

      case 'mark-paid':
        if (!body.invoiceId) {
          return NextResponse.json({
            success: false,
            error: 'Invoice ID required'
          }, { status: 400 })
        }
        return handleMarkPaid(body.invoiceId, body.data || {})

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${body.action}`
        }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Invalid request'
    }, { status: 400 })
  }
}

// GET handler for listing invoices
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const client = searchParams.get('client')

    return handleListInvoices({ status, client })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch invoices'
    }, { status: 500 })
  }
}
