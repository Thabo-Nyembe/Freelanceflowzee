"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Send, Download, Plus, Trash2, Eye, Palette, Layout, Settings } from "lucide-react"
import { useState } from "react"

export function InvoiceCreator() {
  const [selectedTemplate, setSelectedTemplate] = useState("modern")
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
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
            Templates
          </Button>
          <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
            <FileText className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Template Selector */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Invoice Templates
          </CardTitle>
          <p className="text-sm text-slate-500">Choose a template that matches your brand</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedTemplate === template.id
                    ? "border-purple-300 bg-purple-50/50"
                    : "border-slate-200 hover:border-purple-200 bg-white/50"
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className={`aspect-[3/4] rounded-lg mb-3 ${template.preview} border border-slate-200/50`}>
                  <div className="p-3 space-y-2">
                    <div className="h-2 bg-white/70 rounded w-3/4"></div>
                    <div className="h-1 bg-white/50 rounded w-1/2"></div>
                    <div className="h-1 bg-white/50 rounded w-2/3"></div>
                    <div className="mt-4 space-y-1">
                      <div className="h-1 bg-white/40 rounded"></div>
                      <div className="h-1 bg-white/40 rounded"></div>
                      <div className="h-1 bg-white/40 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
                <h4 className="font-medium text-slate-800 text-sm mb-1">{template.name}</h4>
                <p className="text-xs text-slate-500">{template.description}</p>
                {selectedTemplate === template.id && (
                  <Badge className="mt-2 bg-purple-100 text-purple-700">Selected</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-8">
        {/* Invoice Form */}
        <div className="col-span-2">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Create New Invoice
                </CardTitle>
                <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </div>
              <p className="text-sm text-slate-500">
                Using {templates.find((t) => t.id === selectedTemplate)?.name} template
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Customization */}
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/50">
                <h4 className="font-semibold text-slate-800 mb-3">Template Customization</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Primary Color</label>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg border-2 border-white shadow cursor-pointer"></div>
                      <div className="w-8 h-8 bg-blue-500 rounded-lg border-2 border-white shadow cursor-pointer"></div>
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg border-2 border-white shadow cursor-pointer"></div>
                      <div className="w-8 h-8 bg-amber-500 rounded-lg border-2 border-white shadow cursor-pointer"></div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Font Style</label>
                    <select className="w-full p-2 border border-slate-200 rounded-md bg-white text-sm">
                      <option>Inter (Modern)</option>
                      <option>Times New Roman (Classic)</option>
                      <option>Montserrat (Creative)</option>
                      <option>Playfair Display (Elegant)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Client & Invoice Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Client Information</label>
                    <Input placeholder="Client Name" className="bg-white/70 border-slate-200" />
                  </div>
                  <Textarea placeholder="Client Address" className="bg-white/70 border-slate-200" rows={3} />
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Invoice #</label>
                      <Input defaultValue="INV-005" className="bg-white/70 border-slate-200" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Date</label>
                      <Input type="date" className="bg-white/70 border-slate-200" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Due Date</label>
                    <Input type="date" className="bg-white/70 border-slate-200" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Project</label>
                    <Input placeholder="Project Name" className="bg-white/70 border-slate-200" />
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800">Line Items</h4>
                  <Button size="sm" variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3 text-sm font-medium text-slate-600 pb-2 border-b border-slate-200">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Rate</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-1"></div>
                  </div>

                  {lineItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                      <Input
                        placeholder="Description"
                        className="col-span-5 bg-white/70 border-slate-200"
                        defaultValue={item.description}
                      />
                      <Input
                        placeholder="1"
                        type="number"
                        className="col-span-2 bg-white/70 border-slate-200"
                        defaultValue={item.quantity}
                      />
                      <Input
                        placeholder="0.00"
                        type="number"
                        className="col-span-2 bg-white/70 border-slate-200"
                        defaultValue={item.rate}
                      />
                      <div className="col-span-2 text-slate-700 font-medium">${item.amount.toFixed(2)}</div>
                      <Button size="sm" variant="ghost" className="col-span-1 text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Fields */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-800">Custom Fields</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Payment Terms" className="bg-white/70 border-slate-200" />
                  <Input placeholder="Late Fee %" className="bg-white/70 border-slate-200" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Notes</label>
                <Textarea
                  placeholder="Additional notes or payment terms..."
                  className="bg-white/70 border-slate-200"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Summary & Actions */}
        <div className="space-y-6">
          {/* Totals */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-emerald-800">Invoice Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (10%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-emerald-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-emerald-800">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Preview */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Template Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`aspect-[3/4] rounded-lg ${templates.find((t) => t.id === selectedTemplate)?.preview} border border-slate-200/50 p-4`}
              >
                <div className="space-y-3">
                  <div className="h-3 bg-white/70 rounded w-1/2"></div>
                  <div className="h-2 bg-white/50 rounded w-1/3"></div>
                  <div className="mt-6 space-y-2">
                    <div className="h-2 bg-white/40 rounded"></div>
                    <div className="h-2 bg-white/40 rounded"></div>
                    <div className="h-2 bg-white/40 rounded w-3/4"></div>
                  </div>
                  <div className="mt-6 space-y-1">
                    <div className="h-1 bg-white/30 rounded"></div>
                    <div className="h-1 bg-white/30 rounded"></div>
                    <div className="h-1 bg-white/30 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardContent className="p-6 space-y-3">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <Send className="h-4 w-4 mr-2" />
                Send Invoice
              </Button>
              <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Invoices Sent</span>
                <span className="font-semibold text-slate-800">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Billed</span>
                <span className="font-semibold text-emerald-600">$24,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Paid</span>
                <span className="font-semibold text-emerald-600">$18,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Outstanding</span>
                <span className="font-semibold text-amber-600">$6,300</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Invoices */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-200/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{invoice.id}</h4>
                    <p className="text-sm text-slate-600">{invoice.client}</p>
                    <p className="text-xs text-slate-500">
                      {templates.find((t) => t.id === invoice.template)?.name} • Created: {invoice.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">${invoice.amount.toLocaleString()}</p>
                    <Badge
                      variant="secondary"
                      className={
                        invoice.status === "Paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : invoice.status === "Pending"
                            ? "bg-amber-100 text-amber-700"
                            : invoice.status === "Overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
