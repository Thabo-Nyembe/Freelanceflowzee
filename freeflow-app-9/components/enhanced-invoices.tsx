'use client'

import { useState, useReducer } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye, Download, Send, DollarSign, Calendar, FileText, Palette, Layout, Type, Image, Star, Copy } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'

interface InvoiceClient {
    name: string;
    email: string;
    company: string;
    address: string;
}

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface InvoiceCustomization {
    logoUrl?: string;
    brandColors?: { primary: string; secondary: string };
    paymentTerms?: string;
    headerText?: string;
    footerText?: string;
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
}

interface Invoice {
    id: string;
    number: string;
    client: InvoiceClient;
    project: string;
    date: string;
    dueDate: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    currency: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    notes: string;
    terms: string;
    template: InvoiceTemplate;
    customization?: InvoiceCustomization;
}

interface InvoiceTemplate {
    id: string;
    name: string;
    description: string;
    category: 'modern' | 'classic' | 'creative' | 'elegant';
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: 'minimal' | 'standard' | 'detailed' | 'compact';
    headerStyle: 'logo-left' | 'logo-center' | 'logo-right';
    showDividers: boolean;
    showBackground: boolean;
    previewImage: string;
}

interface InvoiceState {
  invoices: Invoice[];
  templates: InvoiceTemplate[];
  selectedTemplate: InvoiceTemplate | null;
  selectedInvoice: Invoice | null;
  showCreateModal: boolean;
  showTemplateModal: boolean;
  showPreviewModal: boolean;
  previewMode: 'form' | 'template' | 'preview';
  template: Record<string, string>;
}

type InvoiceAction =
  | { type: 'SET_SELECTED_TEMPLATE'; template: InvoiceTemplate | null }
  | { type: 'SET_SELECTED_INVOICE'; invoice: Invoice | null }
  | { type: 'SET_CREATE_MODAL'; show: boolean }
  | { type: 'SET_TEMPLATE_MODAL'; show: boolean }
  | { type: 'SET_PREVIEW_MODAL'; show: boolean }
  | { type: 'SET_PREVIEW_MODE'; mode: 'form' | 'template' | 'preview' }
  | { type: 'ADD_INVOICE'; invoice: Invoice }
  | { type: 'UPDATE_INVOICE'; id: string; invoice: Partial<Invoice> }
  | { type: 'DELETE_INVOICE'; id: string }
  | { type: 'ADD_CUSTOM_TEMPLATE'; template: InvoiceTemplate }
  | { type: 'UPDATE_TEMPLATE_HISTORY'; invoiceId: string; templateId: string };

// Invoice Templates
const defaultTemplates: InvoiceTemplate[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean and contemporary design with elegant typography',
    category: 'modern',
    primaryColor: '#3B82F6',
    secondaryColor: '#E5E7EB',
    fontFamily: 'Inter, sans-serif',
    layout: 'minimal',
    headerStyle: 'logo-left',
    showDividers: true,
    showBackground: false,
    previewImage: '/templates/modern-minimal.png'
  },
  {
    id: 'classic-business',
    name: 'Classic Business',
    description: 'Traditional professional template perfect for corporate clients',
    category: 'classic',
    primaryColor: '#1F2937',
    secondaryColor: '#F3F4F6',
    fontFamily: 'Georgia, serif',
    layout: 'standard',
    headerStyle: 'logo-center',
    showDividers: true,
    showBackground: true,
    previewImage: '/templates/classic-business.png'
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    description: 'Bold and artistic design for creative professionals',
    category: 'creative',
    primaryColor: '#8B5CF6',
    secondaryColor: '#F3E8FF',
    fontFamily: 'Poppins, sans-serif',
    layout: 'detailed',
    headerStyle: 'logo-right',
    showDividers: false,
    showBackground: true,
    previewImage: '/templates/creative-studio.png'
  },
  {
    id: 'elegant-professional',
    name: 'Elegant Professional',
    description: 'Sophisticated design with luxury aesthetic',
    category: 'elegant',
    primaryColor: '#059669',
    secondaryColor: '#ECFDF5',
    fontFamily: 'Playfair Display, serif',
    layout: 'compact',
    headerStyle: 'logo-left',
    showDividers: true,
    showBackground: false,
    previewImage: '/templates/elegant-professional.png'
  }
]

// Sample invoices with template data
const sampleInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-2024-001',
    client: {
      name: 'John Smith',
      email: 'john@techcorp.com',
      company: 'TechCorp Solutions',
      address: '123 Business St, San Francisco, CA 94105'
    },
    project: 'Website Redesign',
    date: '2024-06-01',
    dueDate: '2024-06-15',
    status: 'sent',
    currency: 'USD',
    items: [
      {
        id: '1',
        description: 'UI/UX Design - Homepage',
        quantity: 1,
        rate: 2500,
        amount: 2500
      },
      {
        id: '2',
        description: 'Frontend Development',
        quantity: 40,
        rate: 125,
        amount: 5000
      }
    ],
    subtotal: 7500,
    tax: 675,
    total: 8175,
    notes: 'Thank you for your business!',
    terms: 'Payment due within 15 days',
    template: defaultTemplates[0],
    customization: {
      logoUrl: '/logo.png',
      brandColors: {
        primary: '#3B82F6',
        secondary: '#E5E7EB'
      },
      paymentTerms: 'Net 15',
      headerText: 'Professional Design Services',
      footerText: 'Thank you for choosing KAZI'
    }
  }
]

// Reducer for managing invoice state using Context7 patterns
function invoiceReducer(state: InvoiceState, action: InvoiceAction): InvoiceState {
  switch (action.type) {
    case 'SET_SELECTED_TEMPLATE':
      return { ...state, selectedTemplate: action.template }
    case 'SET_SELECTED_INVOICE':
      return { ...state, selectedInvoice: action.invoice }
    case 'SET_CREATE_MODAL':
      return { ...state, showCreateModal: action.show }
    case 'SET_TEMPLATE_MODAL':
      return { ...state, showTemplateModal: action.show }
    case 'SET_PREVIEW_MODAL':
      return { ...state, showPreviewModal: action.show }
    case 'SET_PREVIEW_MODE':
      return { ...state, previewMode: action.mode }
    case 'ADD_INVOICE':
      return { ...state, invoices: [...state.invoices, action.invoice] }
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map(inv => 
          inv.id === action.id ? { ...inv, ...action.invoice } : inv
        )
      }
    case 'DELETE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.filter(inv => inv.id !== action.id)
      }
    case 'ADD_CUSTOM_TEMPLATE':
      return {
        ...state,
        templates: [...state.templates, action.template]
      }
    case 'UPDATE_TEMPLATE_HISTORY':
      return {
        ...state,
        template: {
          ...state.template,
          [action.invoiceId]: action.templateId
        }
      }
    default:
      return state
  }
}

// Initial state
const initialState: InvoiceState = {
  invoices: sampleInvoices,
  templates: defaultTemplates,
  selectedTemplate: defaultTemplates[0],
  selectedInvoice: null,
  showCreateModal: false,
  showTemplateModal: false,
  showPreviewModal: false,
  previewMode: 'form',
  template: {}
}

export function EnhancedInvoices() {
  const [state, dispatch] = useReducer(invoiceReducer, initialState)
  const [newInvoice, setNewInvoice] = useState<any>({
    client: { name: '', email: '', company: '', address: '' },
    project: '',
    dueDate: '',
    items: [{id: '1', description: '', quantity: 1, rate: 0, amount: 0 }],
    notes: '',
    terms: 'Payment due within 15 days',
    currency: 'USD'
  })
  const [customization, setCustomization] = useState<InvoiceCustomization>({
    logoUrl: '',
    brandColors: { primary: '#3B82F6', secondary: '#E5E7EB' },
    paymentTerms: 'Net 15',
    headerText: '',
    footerText: '',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    accentColor: '#3B82F6'
  })

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      modern: 'bg-blue-50 border-blue-200 text-blue-700',
      classic: 'bg-gray-50 border-gray-200 text-gray-700',
      creative: 'bg-purple-50 border-purple-200 text-purple-700',
      elegant: 'bg-green-50 border-green-200 text-green-700'
    }
    return colors[category as keyof typeof colors] || colors.modern
  }

  const templateStats = {
    total: state.templates.length,
    used: Object.keys(state.template).length,
    favorite: 'modern-minimal'
  }

  const invoiceStats = {
    total: state.invoices.length,
    totalAmount: state.invoices.reduce((sum, inv) => sum + inv.total, 0),
    paid: state.invoices.filter(inv => inv.status === 'paid').length,
    pending: state.invoices.filter(inv => inv.status === 'sent').length
  }

  return (
    <div className= "space-y-6">
      {/* Header */}
      <div className= "flex justify-between items-start">
        <div>
          <h2 className= "text-3xl font-light text-slate-800">Enhanced Invoices</h2>
          <p className= "text-lg text-slate-500 mt-1">Create stunning, customizable invoices with professional templates</p>
        </div>
        <div className= "flex space-x-3">
          <Button
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
            onClick={() => dispatch({ type: 'SET_TEMPLATE_MODAL', show: true })}
          >
            <Palette className= "h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button className= "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
            <Plus className= "h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className= "grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className= "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
          <CardContent className= "p-6">
            <div className= "flex items-center justify-between">
              <div>
                <p className= "text-sm font-medium text-blue-600">Total Invoices</p>
                <p className= "text-2xl font-bold text-blue-900">{invoiceStats.total}</p>
              </div>
              <div className= "w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className= "h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className= "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
          <CardContent className= "p-6">
            <div className= "flex items-center justify-between">
              <div>
                <p className= "text-sm font-medium text-green-600">Total Value</p>
                <p className= "text-2xl font-bold text-green-900">${invoiceStats.totalAmount.toLocaleString()}</p>
              </div>
              <div className= "w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className= "h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className= "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50">
          <CardContent className= "p-6">
            <div className= "flex items-center justify-between">
              <div>
                <p className= "text-sm font-medium text-purple-600">Templates</p>
                <p className= "text-2xl font-bold text-purple-900">{templateStats.total}</p>
              </div>
              <div className= "w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Layout className= "h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className= "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50">
          <CardContent className= "p-6">
            <div className= "flex items-center justify-between">
              <div>
                <p className= "text-sm font-medium text-orange-600">Pending</p>
                <p className= "text-2xl font-bold text-orange-900">{invoiceStats.pending}</p>
              </div>
              <div className= "w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className= "h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Gallery Modal */}
      <Dialog 
        open={state.showTemplateModal} 
        onOpenChange={(open) => dispatch({ type: 'SET_TEMPLATE_MODAL', show: open })}
      >
        <DialogContent className= "max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className= "text-2xl font-semibold">Invoice Templates</DialogTitle>
            <DialogDescription>
              Choose from our professionally designed templates or create your own custom design
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue= "gallery" className= "w-full">
            <TabsList className= "grid w-full grid-cols-3">
              <TabsTrigger value= "gallery">Template Gallery</TabsTrigger>
              <TabsTrigger value= "customize">Customize</TabsTrigger>
              <TabsTrigger value= "history">Usage</TabsTrigger>
            </TabsList>
            
            <TabsContent value= "gallery" className= "space-y-6">
              <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
                {state.templates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      state.selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => dispatch({ type: 'SET_SELECTED_TEMPLATE', template })}
                  >
                    <CardContent className= "p-6">
                      <div className= "space-y-4">
                        {/* Template Preview */}
                        <div 
                          className="w-full h-48 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center"
                          style={{ backgroundColor: template.secondaryColor }}
                        >
                          <div className= "text-center">
                            <Layout className= "h-12 w-12 mx-auto mb-2" style={{ color: template.primaryColor }} />
                            <p className= "text-sm text-slate-600" style={{ fontFamily: template.fontFamily }}>
                              {template.name} Preview
                            </p>
                          </div>
                        </div>

                        {/* Template Info */}
                        <div>
                          <div className= "flex items-center justify-between mb-2">
                            <h3 className= "text-lg font-semibold text-slate-800">{template.name}</h3>
                            <Badge className={getCategoryColor(template.category)}>
                              {template.category}
                            </Badge>
                          </div>
                          <p className= "text-sm text-slate-600 mb-3">{template.description}</p>
                          
                          {/* Template Features */}
                          <div className= "flex items-center gap-2 text-xs text-slate-500">
                            <span className= "flex items-center gap-1">
                              <Type className= "h-3 w-3" />
                              {template.fontFamily.split(',')[0]}
                            </span>
                            <span>•</span>
                            <span className= "flex items-center gap-1">
                              <Layout className= "h-3 w-3" />
                              {template.layout}
                            </span>
                            {template.showBackground && (
                              <>
                                <span>•</span>
                                <span className= "flex items-center gap-1">
                                  <Image className= "h-3 w-3" />
                                  Background
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Color Scheme */}
                        <div className= "flex items-center gap-2">
                          <span className= "text-xs text-slate-500">Colors:</span>
                          <div 
                            className= "w-4 h-4 rounded-full border border-slate-200" 
                            style={{ backgroundColor: template.primaryColor }}
                          ></div>
                          <div 
                            className= "w-4 h-4 rounded-full border border-slate-200" 
                            style={{ backgroundColor: template.secondaryColor }}
                          ></div>
                        </div>

                        {/* Action Buttons */}
                        <div className= "flex gap-2 pt-2">
                          <Button 
                            size= "sm" 
                            variant= "outline" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ type: 'SET_PREVIEW_MODE', mode: 'preview' })
                            }}
                          >
                            <Eye className= "h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button 
                            size= "sm" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ type: 'SET_SELECTED_TEMPLATE', template });
                              dispatch({ type: 'SET_TEMPLATE_MODAL', show: false });
                            }}
                          >
                            <Star className= "h-3 w-3 mr-1" />
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value= "customize" className= "space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customize Template</CardTitle>
                  <CardDescription>
                    Personalize your selected template with your brand colors and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className= "space-y-6">
                  {state.selectedTemplate && (
                    <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customization Controls */}
                      <div className= "space-y-4">
                        <div>
                          <Label htmlFor= "primary-color">Primary Color</Label>
                          <div className= "flex gap-2 mt-1">
                            <Input
                              id= "primary-color"
                              type="color"
                              value={customization.brandColors?.primary || state.selectedTemplate.primaryColor}
                              onChange={(e) => setCustomization(prev => ({
                                ...prev,
                                brandColors: {
                                  ...(prev.brandColors || { primary: '', secondary: '' }),
                                  primary: e.target.value
                                }
                              }))}
                              className="w-16 h-10"
                            />
                            <Input
                              value={customization.brandColors?.primary || state.selectedTemplate.primaryColor}
                              onChange={(e) => setCustomization(prev => ({
                                ...prev,
                                brandColors: {
                                  ...(prev.brandColors || { primary: '', secondary: '' }),
                                  primary: e.target.value
                                }
                              }))}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor= "secondary-color">Secondary Color</Label>
                          <div className= "flex gap-2 mt-1">
                            <Input
                              id= "secondary-color"
                              type="color"
                              value={customization.brandColors?.secondary || state.selectedTemplate.secondaryColor}
                              onChange={(e) => setCustomization(prev => ({
                                ...prev,
                                brandColors: {
                                  ...(prev.brandColors || { primary: '', secondary: '' }),
                                  secondary: e.target.value
                                }
                              }))}
                              className="w-16 h-10"
                            />
                            <Input
                              value={customization.brandColors?.secondary || state.selectedTemplate.secondaryColor}
                              onChange={(e) => setCustomization(prev => ({
                                ...prev,
                                brandColors: {
                                  ...(prev.brandColors || { primary: '', secondary: '' }),
                                  secondary: e.target.value
                                }
                              }))}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor= "header-text">Header Text</Label>
                          <Input
                            id= "header-text"
                            value={customization.headerText || ''}
                            onChange={(e) => setCustomization(prev => ({
                              ...prev,
                              headerText: e.target.value
                            }))}
                            placeholder="Professional Services"
                          />
                        </div>

                        <div>
                          <Label htmlFor= "footer-text">Footer Text</Label>
                          <Input
                            id= "footer-text"
                            value={customization.footerText || ''}
                            onChange={(e) => setCustomization(prev => ({
                              ...prev,
                              footerText: e.target.value
                            }))}
                            placeholder="Thank You!"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Invoice List */}
      <Card className= "bg-white/70 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <CardTitle className= "text-xl font-semibold text-slate-800">Recent Invoices</CardTitle>
          <CardDescription>
            Manage your professional invoices with custom templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className= "space-y-4">
            {state.invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-all duration-200 bg-white/50"
              >
                <div className= "flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: invoice.template.secondaryColor }}
                  >
                    <FileText
                      className= "h-6 w-6" 
                      style={{ color: invoice.template.primaryColor }}
                    />
                  </div>
                  <div>
                    <div className= "flex items-center gap-2 mb-1">
                      <p className= "font-semibold text-slate-800">{invoice.number}</p>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                      <Badge className={`text-xs ${getCategoryColor(invoice.template.category)}`}>
                        {invoice.template.name}
                      </Badge>
                    </div>
                    <p className= "text-sm text-slate-600">{invoice.client.name} • {invoice.project}</p>
                    <p className= "text-xs text-slate-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className= "flex items-center gap-4">
                  <div className= "text-right">
                    <p className= "font-semibold text-slate-800">${invoice.total.toLocaleString()}</p>
                    <p className= "text-sm text-slate-500">{invoice.currency}</p>
                  </div>
                  
                  <div className= "flex gap-2">
                    <Button 
                      variant= "outline" 
                      size= "sm"
                      onClick={() => {
                        dispatch({ type: 'SET_SELECTED_INVOICE', invoice })
                        dispatch({ type: 'SET_PREVIEW_MODAL', show: true })
                      }}
                    >
                      <Eye className= "h-4 w-4" />
                    </Button>
                    <Button variant= "outline" size= "sm">
                      <Download className= "h-4 w-4" />
                    </Button>
                    <Button variant= "outline" size= "sm">
                      <Send className= "h-4 w-4" />
                    </Button>
                    <Button variant= "outline" size= "sm">
                      <Copy className= "h-4 w-4" />
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