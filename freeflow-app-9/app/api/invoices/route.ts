import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo purposes (would be database in production)
let mockInvoices = [
  {
    id: 1,
    number: 'INV-001',
    client_id: '1',
    clientName: 'Acme Corp',
    clientEmail: 'john@acme.com',
    project: 'Brand Identity Package',
    amount: 5000,
    status: 'paid',
    dueDate: '2024-01-15',
    issueDate: '2024-01-01',
    paidDate: '2024-01-14',
    description: 'Brand Identity Package',
    notes: 'Thank you for your business',
    paymentMethod: 'Credit Card',
    items: [
      { description: 'Logo Design', quantity: 1, unitPrice: 2500, total: 2500 },
      { description: 'Brand Guidelines', quantity: 1, unitPrice: 2500, total: 2500 }
    ]
  },
  {
    id: 2,
    number: 'INV-002',
    client_id: '1',
    clientName: 'TechStart',
    clientEmail: 'contact@techstart.com',
    project: 'Website Development',
    amount: 3500,
    status: 'pending',
    dueDate: '2024-01-25',
    issueDate: '2024-01-10',
    paidDate: null,
    description: 'Website Development Project',
    notes: 'Payment due within 15 days',
    items: [
      { description: 'Frontend Development', quantity: 1, unitPrice: 2000, total: 2000 },
      { description: 'Backend Integration', quantity: 1, unitPrice: 1500, total: 1500 }
    ]
  },
  {
    id: 3,
    number: 'INV-003',
    client_id: '2',
    clientName: 'GreenCo',
    clientEmail: 'billing@greenco.com',
    project: 'Marketing Campaign',
    amount: 7500,
    status: 'overdue',
    dueDate: '2024-01-10',
    issueDate: '2024-01-01',
    paidDate: null,
    description: 'Marketing Campaign Q1',
    notes: 'This invoice is now overdue',
    items: [
      { description: 'Campaign Strategy', quantity: 1, unitPrice: 3500, total: 3500 },
      { description: 'Ad Creative Design', quantity: 1, unitPrice: 4000, total: 4000 }
    ]
  },
  {
    id: 4,
    number: 'INV-004',
    client_id: '3',
    clientName: 'StartupXYZ',
    clientEmail: 'finance@startupxyz.com',
    project: 'App Development',
    amount: 2000,
    status: 'pending',
    dueDate: '2024-02-15',
    issueDate: '2024-02-01',
    paidDate: null,
    description: 'Mobile App Development Phase 1',
    notes: '',
    items: [
      { description: 'UI/UX Design', quantity: 1, unitPrice: 2000, total: 2000 }
    ]
  },
]

// GET: Fetch invoices with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('client_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    let filteredInvoices = [...mockInvoices]

    // Apply filters
    if (status && status !== 'all') {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === status)
    }

    if (clientId) {
      filteredInvoices = filteredInvoices.filter(inv => inv.client_id === clientId)
    }

    if (dateFrom) {
      filteredInvoices = filteredInvoices.filter(inv =>
        new Date(inv.issueDate) >= new Date(dateFrom)
      )
    }

    if (dateTo) {
      filteredInvoices = filteredInvoices.filter(inv =>
        new Date(inv.issueDate) <= new Date(dateTo)
      )
    }

    // Calculate stats
    const stats = {
      totalInvoiced: mockInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      totalPaid: mockInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
      totalPending: mockInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
      totalOverdue: mockInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
      totalInvoices: mockInvoices.length
    }

    return NextResponse.json({
      success: true,
      data: {
        invoices: filteredInvoices,
        stats
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

// POST: Handle various invoice actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { action } = body

    switch (action) {
      case 'create': {
        const { number, project, clientName, clientEmail, description, issueDate, dueDate, notes, items, amount } = body

        const newInvoice = {
          id: Math.max(0, ...mockInvoices.map(i => i.id)) + 1,
          number: number || `INV-${String(mockInvoices.length + 1).padStart(3, '0')}`,
          client_id: body.client_id || '0',
          clientName,
          clientEmail,
          project: project || '',
          amount: amount || items?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0,
          status: 'pending' as const,
          dueDate,
          issueDate: issueDate || new Date().toISOString().split('T')[0],
          paidDate: null,
          description: description || '',
          notes: notes || '',
          paymentMethod: '',
          items: items || []
        }

        mockInvoices = [newInvoice, ...mockInvoices]

        return NextResponse.json({
          success: true,
          data: newInvoice,
          message: `Invoice ${newInvoice.number} created successfully`
        })
      }

      case 'update-status': {
        const { invoiceId, status, paymentMethod, paymentReference, paidDate } = body

        const invoiceIndex = mockInvoices.findIndex(inv => inv.id === invoiceId)
        if (invoiceIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Invoice not found' },
            { status: 404 }
          )
        }

        mockInvoices[invoiceIndex] = {
          ...mockInvoices[invoiceIndex],
          status,
          ...(paymentMethod && { paymentMethod }),
          ...(paidDate && { paidDate })
        }

        return NextResponse.json({
          success: true,
          data: mockInvoices[invoiceIndex],
          message: `Invoice status updated to ${status}`
        })
      }

      case 'send': {
        const { invoiceId, email, message } = body

        const invoice = mockInvoices.find(inv => inv.id === invoiceId)
        if (!invoice) {
          return NextResponse.json(
            { success: false, error: 'Invoice not found' },
            { status: 404 }
          )
        }

        // In production, this would send an actual email
        console.log(`Sending invoice ${invoice.number} to ${email}`)

        return NextResponse.json({
          success: true,
          data: { invoiceId, email, sentAt: new Date().toISOString() },
          message: `Invoice sent to ${email}`
        })
      }

      case 'mark-paid': {
        const { invoiceId, paymentMethod, paymentReference } = body

        const invoiceIndex = mockInvoices.findIndex(inv => inv.id === invoiceId)
        if (invoiceIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Invoice not found' },
            { status: 404 }
          )
        }

        mockInvoices[invoiceIndex] = {
          ...mockInvoices[invoiceIndex],
          status: 'paid',
          paymentMethod: paymentMethod || 'Other',
          paidDate: new Date().toISOString().split('T')[0]
        }

        return NextResponse.json({
          success: true,
          data: mockInvoices[invoiceIndex],
          message: `Invoice ${mockInvoices[invoiceIndex].number} marked as paid`
        })
      }

      case 'add-payment': {
        const { invoiceId, amount, paymentMethod, paymentReference, paymentDate } = body

        const invoiceIndex = mockInvoices.findIndex(inv => inv.id === invoiceId)
        if (invoiceIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Invoice not found' },
            { status: 404 }
          )
        }

        // For simplicity, mark as paid if full payment received
        mockInvoices[invoiceIndex] = {
          ...mockInvoices[invoiceIndex],
          status: 'paid',
          paymentMethod: paymentMethod || 'Other',
          paidDate: paymentDate || new Date().toISOString().split('T')[0]
        }

        return NextResponse.json({
          success: true,
          data: mockInvoices[invoiceIndex],
          message: `Payment of ${amount} added to invoice`
        })
      }

      case 'duplicate': {
        const { invoiceId } = body

        const originalInvoice = mockInvoices.find(inv => inv.id === invoiceId)
        if (!originalInvoice) {
          return NextResponse.json(
            { success: false, error: 'Invoice not found' },
            { status: 404 }
          )
        }

        const newInvoice = {
          ...originalInvoice,
          id: Math.max(0, ...mockInvoices.map(i => i.id)) + 1,
          number: `INV-${String(mockInvoices.length + 1).padStart(3, '0')}`,
          status: 'pending' as const,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          paidDate: null,
          paymentMethod: ''
        }

        mockInvoices = [newInvoice, ...mockInvoices]

        return NextResponse.json({
          success: true,
          data: newInvoice,
          message: `Invoice duplicated as ${newInvoice.number}`
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Invoice POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process invoice action' },
      { status: 500 }
    )
  }
}

// PUT: Update an existing invoice
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { id, ...updateData } = body

    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id)
    if (invoiceIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Calculate new amount from items if items are provided
    const amount = updateData.items
      ? updateData.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0)
      : updateData.amount || mockInvoices[invoiceIndex].amount

    mockInvoices[invoiceIndex] = {
      ...mockInvoices[invoiceIndex],
      ...updateData,
      amount,
      id // Ensure ID doesn't change
    }

    return NextResponse.json({
      success: true,
      data: mockInvoices[invoiceIndex],
      message: `Invoice ${mockInvoices[invoiceIndex].number} updated successfully`
    })
  } catch (error) {
    console.error('Invoice PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}

// DELETE: Delete an invoice
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')

    if (!idParam) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    const id = parseInt(idParam, 10)
    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id)

    if (invoiceIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const deletedInvoice = mockInvoices[invoiceIndex]
    mockInvoices = mockInvoices.filter(inv => inv.id !== id)

    return NextResponse.json({
      success: true,
      data: { id: deletedInvoice.id, number: deletedInvoice.number },
      message: `Invoice ${deletedInvoice.number} deleted successfully`
    })
  } catch (error) {
    console.error('Invoice DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}
