"use client"

// jsPDF and autoTable are dynamically imported on demand to reduce bundle size
// These libraries are ~300KB combined and only needed when generating PDFs

import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Send, Download, Plus, Trash2, Eye, Palette, Settings, Loader2 } from "lucide-react"
import { useState, useCallback } from "react"

export function InvoiceCreator() {
  const [selectedTemplate, setSelectedTemplate] = useState("modern")
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [lineItems, setLineItems] = useState([
    { id: 1, description: "Logo Design & Brand Identity", quantity: 1, rate: 1500, amount: 1500 },
    { id: 2, description: "Brand Guidelines Document", quantity: 1, rate: 800, amount: 800 },
  ])

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
  const tax = subtotal * 0.1
  const total = subtotal + tax

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
      doc.text(`Invoice #: INV-005`, 14, 30)
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35)
      doc.text(`Due Date: 2024-02-08`, 14, 40)

      // Add From/To
      doc.text("From:", 14, 55)
      doc.text("Creative Design Studio", 14, 60)
      doc.text("123 Design Avenue, San Francisco, CA", 14, 65)

      doc.text("Bill To:", 100, 55)
      doc.text("Acme Corporation", 100, 60)
      doc.text("456 Corporate Plaza, New York, NY", 100, 65)

      // Add Line Items Table
      const tableData = lineItems.map(item => [
        item.description,
        item.quantity.toString(),
        `$${item.rate}`,
        `$${item.amount}`
      ])

      autoTable(doc, {
        head: [['Description', 'Qty', 'Rate', 'Amount']],
        body: tableData,
        startY: 80,
      })

      // Add Totals
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
      doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 140, finalY)
      doc.text(`Tax (10%): $${tax.toFixed(2)}`, 140, finalY + 5)
      doc.setFontSize(12)
      doc.text(`Total: $${total.toFixed(2)}`, 140, finalY + 12)

      // Save
      doc.save("invoice.pdf")
    } finally {
      setIsGeneratingPDF(false)
    }
  }, [lineItems, subtotal, tax, total])

  const recentInvoices = [
    {
      id: "INV-001",
      client: "Acme Corporation",
      amount: 2500,
      status: "Paid",
      date: "2024-01-15",
      dueDate: "2024-01-30",
      template: "modern",
    },
    {
      id: "INV-002",
      client: "Tech Startup Inc.",
      amount: 3200,
      status: "Pending",
      date: "2024-01-20",
      dueDate: "2024-02-05",
      template: "classic",
    },
    {
      id: "INV-003",
      client: "Creative Agency",
      amount: 1800,
      status: "Overdue",
      date: "2024-01-10",
      dueDate: "2024-01-25",
      template: "creative",
    },
    {
      id: "INV-004",
      client: "Fashion Brand",
      amount: 4200,
      status: "Draft",
      date: "2024-01-22",
      dueDate: "2024-02-08",
      template: "elegant",
    },
  ]

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
          <Button onClick={() => toast.success('Invoice Sent', { description: 'Invoice has been sent to the client' })}>
            <Send className="h-4 w-4 mr-2" />
            Send Invoice
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
                  <p className="text-sm text-slate-500">INV-005 • Created: Jan 25, 2024</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-slate-600">
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
                    defaultValue="Creative Design Studio"
                  />
                  <Textarea
                    placeholder="Your Address"
                    className="h-24 mb-2"
                    defaultValue="123 Design Avenue
San Francisco, CA 94107
United States
creative@example.com"
                  />
                  <Input placeholder="Phone Number" defaultValue="+1 (555) 123-4567" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Bill To</h3>
                  <Input
                    placeholder="Client Name/Business"
                    className="mb-2"
                    defaultValue="Acme Corporation"
                  />
                  <Textarea
                    placeholder="Client Address"
                    className="h-24 mb-2"
                    defaultValue="456 Corporate Plaza
New York, NY 10001
United States
billing@acme.com"
                  />
                  <Input placeholder="Client Phone Number" defaultValue="+1 (555) 987-6543" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Invoice Number</h3>
                  <Input defaultValue="INV-005" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Issue Date</h3>
                  <Input type="date" defaultValue="2024-01-25" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Due Date</h3>
                  <Input type="date" defaultValue="2024-02-08" />
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
                        <div className="bg-slate-100 p-2 rounded text-right">${item.amount}</div>
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
                    defaultValue="Payment is due within 14 days of receipt. Please include the invoice number in your payment reference."
                  />
                </div>
                <div>
                  <div className="bg-white/50 rounded-lg p-4 border border-slate-200/50">
                    <div className="flex justify-between py-2 text-slate-600">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-slate-600 border-b border-slate-200/50">
                      <span>Tax (10%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-3 font-semibold text-lg">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
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
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
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
                    <Badge className={
                      invoice.status === "Paid" ? "bg-emerald-100 text-emerald-800" :
                        invoice.status === "Pending" ? "bg-amber-100 text-amber-800" :
                          invoice.status === "Overdue" ? "bg-red-100 text-red-800" :
                            "bg-slate-100 text-slate-800"
                    }>
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold">${invoice.amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}

              <div className="flex justify-center pt-2">
                <Button variant="outline" className="text-slate-600 w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  View All Invoices
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
                <select className="w-full p-2 rounded-md border border-slate-200 bg-white">
                  <option>USD - US Dollar</option>
                  <option>EUR - Euro</option>
                  <option>GBP - British Pound</option>
                  <option>CAD - Canadian Dollar</option>
                  <option>AUD - Australian Dollar</option>
                </select>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Tax Rate</h3>
                <div className="flex">
                  <Input type="number" defaultValue="10" className="rounded-r-none" />
                  <div className="bg-slate-100 px-3 flex items-center rounded-r-md border border-l-0 border-slate-200">
                    %
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Payment Terms</h3>
                <select className="w-full p-2 rounded-md border border-slate-200 bg-white">
                  <option>Due on Receipt</option>
                  <option>Net 15</option>
                  <option>Net 30</option>
                  <option>Net 45</option>
                  <option>Net 60</option>
                </select>
              </div>

              <Button className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
