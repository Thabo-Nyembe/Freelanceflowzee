"use client"

// jsPDF and autoTable are dynamically imported on demand to reduce bundle size
// These libraries are ~300KB combined and only needed when generating PDFs

import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Send, Download, Plus, Trash2, Eye, Palette, Settings, Loader2, ExternalLink } from "lucide-react"
import { useState, useCallback, useEffect, useMemo } from "react"
import { useInvoices, type Invoice, type InvoiceStatus } from "@/lib/hooks/use-invoices"
import { useRouter } from "next/navigation"

interface LineItem {
  id: number
  description: string
  quantity: number
  rate: number
  amount: number
}

interface InvoiceFormData {
  fromName: string
  fromAddress: string
  fromPhone: string
  toName: string
  toAddress: string
  toPhone: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  notes: string
}

interface InvoiceSettings {
  currency: string
  taxRate: number
  paymentTerms: string
}

export function InvoiceCreator() {
  const router = useRouter()
  const { invoices, loading: loadingInvoices, createInvoice, mutating } = useInvoices({ limit: 10 })

  const [selectedTemplate, setSelectedTemplate] = useState("modern")
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Form data state (controlled inputs)
  const [formData, setFormData] = useState<InvoiceFormData>({
    fromName: "",
    fromAddress: "",
    fromPhone: "",
    toName: "",
    toAddress: "",
    toPhone: "",
    invoiceNumber: "",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "Payment is due within 14 days of receipt. Please include the invoice number in your payment reference."
  })

  // Settings state
  const [settings, setSettings] = useState<InvoiceSettings>({
    currency: "USD",
    taxRate: 10,
    paymentTerms: "Net 15"
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: "", quantity: 1, rate: 0, amount: 0 },
  ])

  // Generate invoice number on mount
  useEffect(() => {
    const generateInvoiceNumber = () => {
      const year = new Date().getFullYear()
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      return `INV-${year}-${random}`
    }
    setFormData(prev => ({ ...prev, invoiceNumber: generateInvoiceNumber() }))
  }, [])

  const templates = [
    {
      id: "modern",
      name: "Modern Minimal",
      description: "Clean, professional design with purple accents",
      preview: "bg-gradient-to-br from-purple-50 to-pink-50",
    },
    {
      id: "classic",
      name: "Classic Business",
      description: "Traditional layout with blue color scheme",
      preview: "bg-gradient-to-br from-blue-50 to-indigo-50",
    },
    {
      id: "creative",
      name: "Creative Studio",
      description: "Bold design with vibrant colors",
      preview: "bg-gradient-to-br from-emerald-50 to-teal-50",
    },
    {
      id: "elegant",
      name: "Elegant Professional",
      description: "Sophisticated layout with gold accents",
      preview: "bg-gradient-to-br from-amber-50 to-orange-50",
    },
  ]

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const tax = subtotal * (settings.taxRate / 100)
  const total = subtotal + tax

  // Map invoice status to display style
  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return { className: "bg-emerald-100 text-emerald-800", label: "Paid" }
      case 'pending':
      case 'sent':
        return { className: "bg-amber-100 text-amber-800", label: "Pending" }
      case 'overdue':
        return { className: "bg-red-100 text-red-800", label: "Overdue" }
      case 'draft':
        return { className: "bg-slate-100 text-slate-800", label: "Draft" }
      default:
        return { className: "bg-slate-100 text-slate-800", label: status }
    }
  }

  // Map recent invoices from database to display format
  const recentInvoicesList = useMemo(() => {
    return invoices.slice(0, 4).map(inv => ({
      id: inv.invoice_number || inv.id,
      dbId: inv.id,
      client: inv.client_name || 'Unknown Client',
      amount: inv.total_amount || 0,
      status: inv.status,
      date: inv.issue_date,
      dueDate: inv.due_date,
      template: selectedTemplate, // Use current template for styling
    }))
  }, [invoices, selectedTemplate])

  // Dynamic import for PDF generation - reduces initial bundle by ~300KB
  const handleDownloadPDF = useCallback(async () => {
    setIsGeneratingPDF(true)
    try {
      // Dynamically import jsPDF and autoTable only when needed
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ])

      const doc = new jsPDF()

      // Add branding/header
      doc.setFontSize(20)
      doc.text("INVOICE", 14, 22)

      doc.setFontSize(10)
      doc.text(`Invoice #: ${formData.invoiceNumber}`, 14, 30)
      doc.text(`Date: ${new Date(formData.issueDate).toLocaleDateString()}`, 14, 35)
      doc.text(`Due Date: ${new Date(formData.dueDate).toLocaleDateString()}`, 14, 40)

      // Add From/To
      doc.text("From:", 14, 55)
      doc.text(formData.fromName || "Your Business Name", 14, 60)
      const fromLines = (formData.fromAddress || "Your Address").split('\n')
      fromLines.forEach((line, idx) => doc.text(line, 14, 65 + (idx * 5)))

      doc.text("Bill To:", 100, 55)
      doc.text(formData.toName || "Client Name", 100, 60)
      const toLines = (formData.toAddress || "Client Address").split('\n')
      toLines.forEach((line, idx) => doc.text(line, 100, 65 + (idx * 5)))

      // Add Line Items Table
      const tableData = lineItems
        .filter(item => item.description.trim() !== '')
        .map(item => [
          item.description,
          item.quantity.toString(),
          `${settings.currency === 'USD' ? '$' : settings.currency} ${item.rate.toFixed(2)}`,
          `${settings.currency === 'USD' ? '$' : settings.currency} ${item.amount.toFixed(2)}`
        ])

      autoTable(doc, {
        head: [['Description', 'Qty', 'Rate', 'Amount']],
        body: tableData,
        startY: 80,
      })

      // Add Totals
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
      const currencySymbol = settings.currency === 'USD' ? '$' : settings.currency + ' '
      doc.text(`Subtotal: ${currencySymbol}${subtotal.toFixed(2)}`, 140, finalY)
      doc.text(`Tax (${settings.taxRate}%): ${currencySymbol}${tax.toFixed(2)}`, 140, finalY + 5)
      doc.setFontSize(12)
      doc.text(`Total: ${currencySymbol}${total.toFixed(2)}`, 140, finalY + 12)

      // Add Notes
      if (formData.notes) {
        doc.setFontSize(9)
        doc.text("Notes:", 14, finalY + 25)
        const noteLines = doc.splitTextToSize(formData.notes, 180)
        doc.text(noteLines, 14, finalY + 30)
      }

      // Save with invoice number
      doc.save(`${formData.invoiceNumber}.pdf`)
      toast.success('PDF Downloaded', { description: `Invoice ${formData.invoiceNumber} saved successfully` })
    } catch (error) {
      console.error('PDF generation failed:', error)
      toast.error('Download Failed', { description: 'Could not generate PDF. Please try again.' })
    } finally {
      setIsGeneratingPDF(false)
    }
  }, [lineItems, subtotal, tax, total, formData, settings])

  // Send invoice via email API
  const handleSendInvoice = useCallback(async () => {
    // Validate required fields
    if (!formData.toName || !formData.toAddress) {
      toast.error('Missing Information', { description: 'Please fill in client name and email address' })
      return
    }

    // Extract email from address (simple regex)
    const emailMatch = formData.toAddress.match(/[\w.-]+@[\w.-]+\.\w+/)
    const clientEmail = emailMatch ? emailMatch[0] : null

    if (!clientEmail) {
      toast.error('Missing Email', { description: 'Please include client email in the billing address' })
      return
    }

    setIsSending(true)
    try {
      // First, create the invoice in the database
      const invoiceItems = lineItems.filter(item => item.description.trim() !== '').map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.rate,
        total: item.amount
      }))

      const invoiceData = {
        action: 'create',
        number: formData.invoiceNumber,
        clientName: formData.toName,
        clientEmail: clientEmail,
        description: `Invoice from ${formData.fromName || 'Your Business'}`,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        notes: formData.notes,
        items: invoiceItems,
        amount: total,
        subtotal: subtotal,
        tax_amount: tax,
        tax_rate: settings.taxRate,
        currency: settings.currency
      }

      // Create invoice
      const createResponse = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      })

      const createResult = await createResponse.json()

      if (!createResult.success) {
        throw new Error(createResult.error || 'Failed to create invoice')
      }

      const invoiceId = createResult.data?.id

      // Generate invoice HTML for email
      const invoiceHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">Invoice ${formData.invoiceNumber}</h1>
          <p>Dear ${formData.toName},</p>
          <p>Please find your invoice details below:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f1f5f9;">
              <th style="padding: 10px; text-align: left;">Description</th>
              <th style="padding: 10px; text-align: right;">Amount</th>
            </tr>
            ${invoiceItems.map(item => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.description}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">$${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
          <p><strong>Tax (${settings.taxRate}%):</strong> $${tax.toFixed(2)}</p>
          <p style="font-size: 18px;"><strong>Total Due:</strong> $${total.toFixed(2)}</p>
          <p><strong>Due Date:</strong> ${new Date(formData.dueDate).toLocaleDateString()}</p>
          ${formData.notes ? `<p style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">${formData.notes}</p>` : ''}
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px;">From: ${formData.fromName || 'Your Business'}</p>
        </div>
      `

      // Send invoice email
      const emailResponse = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: clientEmail,
          subject: `Invoice ${formData.invoiceNumber} from ${formData.fromName || 'Your Business'}`,
          html: invoiceHtml
        })
      })

      const emailResult = await emailResponse.json()

      if (emailResult.success) {
        // Update invoice status to sent
        if (invoiceId) {
          await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update-status',
              invoiceId: invoiceId,
              status: 'sent'
            })
          })
        }

        toast.success('Invoice Sent', {
          description: `Invoice ${formData.invoiceNumber} has been sent to ${clientEmail}`
        })

        // Reset form for new invoice
        setFormData(prev => ({
          ...prev,
          invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          toName: "",
          toAddress: "",
          toPhone: "",
        }))
        setLineItems([{ id: 1, description: "", quantity: 1, rate: 0, amount: 0 }])
      } else {
        throw new Error(emailResult.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Send invoice failed:', error)
      toast.error('Send Failed', {
        description: error instanceof Error ? error.message : 'Could not send invoice. Please try again.'
      })
    } finally {
      setIsSending(false)
    }
  }, [formData, lineItems, subtotal, tax, total, settings])

  // Save settings to localStorage
  const handleSaveSettings = useCallback(async () => {
    setIsSavingSettings(true)
    try {
      // Save to localStorage
      localStorage.setItem('invoice-settings', JSON.stringify(settings))

      // Optionally save to user preferences API
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceSettings: settings
        })
      }).catch(() => {
        // Silently fail if preferences API doesn't exist
      })

      toast.success('Settings Saved', { description: 'Your invoice settings have been updated' })
    } catch (error) {
      console.error('Save settings failed:', error)
      toast.error('Save Failed', { description: 'Could not save settings' })
    } finally {
      setIsSavingSettings(false)
    }
  }, [settings])

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('invoice-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Navigate to invoices page
  const handleViewAllInvoices = useCallback(() => {
    router.push('/v1/dashboard/invoices')
  }, [router])

  // Handle preview
  const handlePreview = useCallback(() => {
    setShowPreview(true)
  }, [])

  // Currency symbol helper
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$'
      case 'EUR': return '\u20AC'
      case 'GBP': return '\u00A3'
      case 'CAD': return 'CA$'
      case 'AUD': return 'A$'
      default: return currency + ' '
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-slate-800">Invoice Creator</h2>
          <p className="text-lg text-slate-500 mt-1">Generate professional invoices with custom templates</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
            onClick={() => setShowTemplateSelector(true)}
          >
            <Palette className="h-4 w-4 mr-2" />
            Choose Template
          </Button>
          <Button onClick={handleSendInvoice} disabled={isSending || lineItems.every(i => !i.description.trim())}>
            {isSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSending ? 'Sending...' : 'Send Invoice'}
          </Button>
        </div>
      </div>

      {/* Template Selector */}
      {showTemplateSelector && (
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-slate-800">Choose Template</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplateSelector(false)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 rounded-xl ${template.preview} border cursor-pointer transition-all duration-200 ${selectedTemplate === template.id
                      ? "ring-2 ring-purple-500 border-purple-200"
                      : "border-slate-200/50 hover:border-purple-200/50"
                    }`}
                  onClick={() => {
                    setSelectedTemplate(template.id)
                    setShowTemplateSelector(false)
                  }}
                >
                  <div className="mb-2 flex justify-between items-center">
                    <span className="font-medium text-slate-800">{template.name}</span>
                    {selectedTemplate === template.id && (
                      <Badge className="bg-purple-100 text-purple-800 text-xs">Selected</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{template.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Editor */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <Card className={`border-slate-200/50 ${selectedTemplate === "modern" ? "bg-gradient-to-br from-purple-50/30 to-pink-50/30" :
              selectedTemplate === "classic" ? "bg-gradient-to-br from-blue-50/30 to-indigo-50/30" :
                selectedTemplate === "creative" ? "bg-gradient-to-br from-emerald-50/30 to-teal-50/30" :
                  "bg-gradient-to-br from-amber-50/30 to-orange-50/30"
            }`}>
            <CardHeader className="pb-3 border-b border-slate-200/50">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold text-slate-800">New Invoice</CardTitle>
                  <p className="text-sm text-slate-500">{formData.invoiceNumber} {'\u2022'} Created: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-slate-600" onClick={handlePreview}>
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" className="text-slate-600" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                    {isGeneratingPDF ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-1" />
                    )}
                    {isGeneratingPDF ? 'Generating...' : 'Download'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">From</h3>
                  <Input
                    placeholder="Your Name/Business"
                    className="mb-2"
                    value={formData.fromName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fromName: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Your Address (include email)"
                    className="h-24 mb-2"
                    value={formData.fromAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, fromAddress: e.target.value }))}
                  />
                  <Input
                    placeholder="Phone Number"
                    value={formData.fromPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, fromPhone: e.target.value }))}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Bill To</h3>
                  <Input
                    placeholder="Client Name/Business"
                    className="mb-2"
                    value={formData.toName}
                    onChange={(e) => setFormData(prev => ({ ...prev, toName: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Client Address (include email for sending)"
                    className="h-24 mb-2"
                    value={formData.toAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, toAddress: e.target.value }))}
                  />
                  <Input
                    placeholder="Client Phone Number"
                    value={formData.toPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, toPhone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Invoice Number</h3>
                  <Input
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Issue Date</h3>
                  <Input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Due Date</h3>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Items</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-slate-500 pb-2 border-b border-slate-200/50">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Rate</div>
                    <div className="col-span-1">Amount</div>
                    <div className="col-span-1"></div>
                  </div>

                  {lineItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <Input value={item.description} onChange={(e) => {
                          const newItems = lineItems.map(i =>
                            i.id === item.id ? { ...i, description: e.target.value } : i
                          )
                          setLineItems(newItems)
                        }} />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value) || 0
                            const newItems = lineItems.map(i =>
                              i.id === item.id ? { ...i, quantity: qty, amount: qty * i.rate } : i
                            )
                            setLineItems(newItems)
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) => {
                            const rate = parseInt(e.target.value) || 0
                            const newItems = lineItems.map(i =>
                              i.id === item.id ? { ...i, rate, amount: i.quantity * rate } : i
                            )
                            setLineItems(newItems)
                          }}
                        />
                      </div>
                      <div className="col-span-1">
                        <div className="bg-slate-100 p-2 rounded text-right">{getCurrencySymbol(settings.currency)}{item.amount.toFixed(2)}</div>
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setLineItems(lineItems.filter(i => i.id !== item.id))
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="text-slate-600"
                    onClick={() => {
                      const newId = Math.max(...lineItems.map(i => i.id)) + 1
                      setLineItems([...lineItems, { id: newId, description: "", quantity: 1, rate: 0, amount: 0 }])
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Notes</h3>
                  <Textarea
                    placeholder="Additional notes or payment instructions..."
                    className="h-32"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div>
                  <div className="bg-white/50 rounded-lg p-4 border border-slate-200/50">
                    <div className="flex justify-between py-2 text-slate-600">
                      <span>Subtotal:</span>
                      <span>{getCurrencySymbol(settings.currency)}{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-slate-600 border-b border-slate-200/50">
                      <span>Tax ({settings.taxRate}%):</span>
                      <span>{getCurrencySymbol(settings.currency)}{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-3 font-semibold text-lg">
                      <span>Total:</span>
                      <span>{getCurrencySymbol(settings.currency)}{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingInvoices ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : recentInvoicesList.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No invoices yet</p>
                  <p className="text-sm">Create your first invoice above</p>
                </div>
              ) : (
                recentInvoicesList.map((invoice) => {
                  const statusBadge = getStatusBadge(invoice.status)
                  return (
                    <div
                      key={invoice.dbId}
                      className={`p-3 rounded-lg border ${invoice.template === "modern" ? "bg-purple-50/50 border-purple-200/50" :
                          invoice.template === "classic" ? "bg-blue-50/50 border-blue-200/50" :
                            invoice.template === "creative" ? "bg-emerald-50/50 border-emerald-200/50" :
                              "bg-amber-50/50 border-amber-200/50"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-slate-800">{invoice.id}</p>
                          <p className="text-sm text-slate-600">{invoice.client}</p>
                        </div>
                        <Badge className={statusBadge.className}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-semibold">{getCurrencySymbol(settings.currency)}{invoice.amount.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  )
                })
              )}

              <div className="flex justify-center pt-2">
                <Button variant="outline" className="text-slate-600 w-full" onClick={handleViewAllInvoices}>
                  <FileText className="h-4 w-4 mr-2" />
                  View All Invoices
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Currency</h3>
                <select
                  className="w-full p-2 rounded-md border border-slate-200 bg-white"
                  value={settings.currency}
                  onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Tax Rate</h3>
                <div className="flex">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                    className="rounded-r-none"
                  />
                  <div className="bg-slate-100 px-3 flex items-center rounded-r-md border border-l-0 border-slate-200">
                    %
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Payment Terms</h3>
                <select
                  className="w-full p-2 rounded-md border border-slate-200 bg-white"
                  value={settings.paymentTerms}
                  onChange={(e) => setSettings(prev => ({ ...prev, paymentTerms: e.target.value }))}
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>

              <Button className="w-full" onClick={handleSaveSettings} disabled={isSavingSettings}>
                {isSavingSettings ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                {isSavingSettings ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <div className={`p-6 rounded-lg ${
            selectedTemplate === "modern" ? "bg-gradient-to-br from-purple-50 to-pink-50" :
            selectedTemplate === "classic" ? "bg-gradient-to-br from-blue-50 to-indigo-50" :
            selectedTemplate === "creative" ? "bg-gradient-to-br from-emerald-50 to-teal-50" :
            "bg-gradient-to-br from-amber-50 to-orange-50"
          }`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">INVOICE</h1>
                <p className="text-slate-600">{formData.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Issue Date: {new Date(formData.issueDate).toLocaleDateString()}</p>
                <p className="text-sm text-slate-500">Due Date: {new Date(formData.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-1">From</h3>
                <p className="font-medium">{formData.fromName || 'Your Business Name'}</p>
                <p className="text-sm text-slate-600 whitespace-pre-line">{formData.fromAddress || 'Your Address'}</p>
                {formData.fromPhone && <p className="text-sm text-slate-600">{formData.fromPhone}</p>}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-1">Bill To</h3>
                <p className="font-medium">{formData.toName || 'Client Name'}</p>
                <p className="text-sm text-slate-600 whitespace-pre-line">{formData.toAddress || 'Client Address'}</p>
                {formData.toPhone && <p className="text-sm text-slate-600">{formData.toPhone}</p>}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-slate-600">Description</th>
                    <th className="text-right p-3 text-sm font-medium text-slate-600 w-20">Qty</th>
                    <th className="text-right p-3 text-sm font-medium text-slate-600 w-24">Rate</th>
                    <th className="text-right p-3 text-sm font-medium text-slate-600 w-24">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.filter(item => item.description.trim() !== '').map(item => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">{getCurrencySymbol(settings.currency)}{item.rate.toFixed(2)}</td>
                      <td className="p-3 text-right">{getCurrencySymbol(settings.currency)}{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Subtotal:</span>
                  <span>{getCurrencySymbol(settings.currency)}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Tax ({settings.taxRate}%):</span>
                  <span>{getCurrencySymbol(settings.currency)}{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-lg">
                  <span>Total:</span>
                  <span>{getCurrencySymbol(settings.currency)}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {formData.notes && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-slate-500 mb-2">Notes</h3>
                <p className="text-sm text-slate-600">{formData.notes}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
              {isGeneratingPDF ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
