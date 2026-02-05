'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Download, Send, Edit, Printer, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

interface Invoice {
  id: string
  invoice_number: string
  client_name?: string
  client_email?: string
  amount: number
  currency: string
  status: string
  due_date: string
  issue_date: string
  items?: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
  notes?: string
  tax_rate?: number
}

export default function InvoiceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await fetch(`/api/invoices/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Invoice not found')
            router.push('/dashboard/invoices-v2')
            return
          }
          throw new Error('Failed to fetch invoice')
        }

        const data = await response.json()
        setInvoice(data)
      } catch (error) {
        console.error('Error fetching invoice:', error)
        toast.error('Failed to load invoice')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [params.id, router])

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      paid: 'bg-green-500',
      pending: 'bg-yellow-500',
      overdue: 'bg-red-500',
      draft: 'bg-gray-500',
      cancelled: 'bg-gray-400',
    }
    return statusColors[status?.toLowerCase()] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl p-6 space-y-6">
        <Skeleton className="h-12 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Invoice Not Found</h2>
            <p className="text-gray-500 mb-6">The invoice you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/dashboard/invoices-v2')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const subtotal = invoice.items?.reduce((sum, item) => sum + item.amount, 0) || invoice.amount
  const tax = (subtotal * (invoice.tax_rate || 0)) / 100
  const total = subtotal + tax

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/invoices-v2')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">
                Invoice #{invoice.invoice_number}
              </CardTitle>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status?.toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Issue Date</p>
              <p className="font-semibold">{new Date(invoice.issue_date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500 mt-2">Due Date</p>
              <p className="font-semibold">{new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Client Info */}
          <div>
            <h3 className="font-semibold mb-2">Bill To:</h3>
            <p className="font-medium">{invoice.client_name || 'Client Name'}</p>
            {invoice.client_email && (
              <p className="text-sm text-gray-500">{invoice.client_email}</p>
            )}
          </div>

          <Separator />

          {/* Invoice Items */}
          {invoice.items && invoice.items.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-4">Items</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 pb-2 border-b">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Quantity</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
                {invoice.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 py-2">
                    <div className="col-span-6">{item.description}</div>
                    <div className="col-span-2 text-right">{item.quantity}</div>
                    <div className="col-span-2 text-right">
                      {invoice.currency} {item.rate.toFixed(2)}
                    </div>
                    <div className="col-span-2 text-right font-medium">
                      {invoice.currency} {item.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <Separator />

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-medium">
                  {invoice.currency} {subtotal.toFixed(2)}
                </span>
              </div>
              {invoice.tax_rate ? (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax ({invoice.tax_rate}%):</span>
                  <span className="font-medium">
                    {invoice.currency} {tax.toFixed(2)}
                  </span>
                </div>
              ) : null}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>
                  {invoice.currency} {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
