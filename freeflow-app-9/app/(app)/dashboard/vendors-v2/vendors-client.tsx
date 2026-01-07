'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Star,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  FileText,
  ExternalLink,
  Globe,
  Copy,
  Send,
} from 'lucide-react'
import { useVendors } from '@/lib/hooks/use-vendors-extended'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Vendor {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  type: 'supplier' | 'manufacturer' | 'distributor' | 'service' | 'contractor'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  rating: number
  total_orders: number
  total_spent: number
  payment_terms: string
  lead_time: number
  notes: string
  website: string
  contact_person: string
  created_at: string
  updated_at: string
}

interface VendorFormData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  type: Vendor['type']
  status: Vendor['status']
  payment_terms: string
  lead_time: number
  notes: string
  website: string
  contact_person: string
}

const initialFormData: VendorFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  type: 'supplier',
  status: 'active',
  payment_terms: 'Net 30',
  lead_time: 7,
  notes: '',
  website: '',
  contact_person: '',
}

export default function VendorsClient() {
  const { vendors: hookVendors, isLoading: hookLoading, refresh } = useVendors()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [formData, setFormData] = useState<VendorFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch vendors from API
  const fetchVendors = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/vendors')
      if (!response.ok) {
        throw new Error('Failed to fetch vendors')
      }
      const data = await response.json()
      setVendors(data.vendors || [])
    } catch (error) {
      console.error('Error fetching vendors:', error)
      // Fallback to hook data if available
      if (hookVendors && hookVendors.length > 0) {
        setVendors(hookVendors)
      }
    } finally {
      setIsLoading(false)
    }
  }, [hookVendors])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  // Filter vendors based on search and filters
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesSearch =
        searchQuery === '' ||
        vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter
      const matchesType = typeFilter === 'all' || vendor.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [vendors, searchQuery, statusFilter, typeFilter])

  // Stats calculations
  const stats = useMemo(() => {
    const activeVendors = vendors.filter((v) => v.status === 'active').length
    const totalSpent = vendors.reduce((sum, v) => sum + (v.total_spent || 0), 0)
    const avgRating = vendors.length > 0
      ? vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.length
      : 0
    const pendingVendors = vendors.filter((v) => v.status === 'pending').length

    return { activeVendors, totalSpent, avgRating, pendingVendors }
  }, [vendors])

  // Add vendor handler - REAL API call
  const handleAddVendor = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill in required fields (Name and Email)')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create vendor')
      }

      const data = await response.json()
      setVendors((prev) => [...prev, data.vendor])
      setIsAddDialogOpen(false)
      setFormData(initialFormData)
      toast.success(`Vendor "${formData.name}" created successfully`)
    } catch (error) {
      console.error('Error creating vendor:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create vendor')
    } finally {
      setIsSaving(false)
    }
  }

  // Update vendor handler - REAL API call
  const handleUpdateVendor = async () => {
    if (!selectedVendor || !formData.name || !formData.email) {
      toast.error('Please fill in required fields (Name and Email)')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/vendors/${selectedVendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update vendor')
      }

      const data = await response.json()
      setVendors((prev) =>
        prev.map((v) => (v.id === selectedVendor.id ? data.vendor : v))
      )
      setIsEditDialogOpen(false)
      setSelectedVendor(null)
      setFormData(initialFormData)
      toast.success(`Vendor "${formData.name}" updated successfully`)
    } catch (error) {
      console.error('Error updating vendor:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update vendor')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete vendor handler - REAL API call with confirmation
  const handleDeleteVendor = async (vendor: Vendor) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete vendor "${vendor.name}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete vendor')
      }

      setVendors((prev) => prev.filter((v) => v.id !== vendor.id))
      toast.success(`Vendor "${vendor.name}" deleted successfully`)
    } catch (error) {
      console.error('Error deleting vendor:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete vendor')
    }
  }

  // Export to CSV - REAL download
  const handleExportCSV = async () => {
    try {
      const headers = [
        'Name',
        'Email',
        'Phone',
        'Contact Person',
        'Type',
        'Status',
        'Address',
        'City',
        'Country',
        'Rating',
        'Total Orders',
        'Total Spent',
        'Payment Terms',
        'Lead Time (days)',
        'Website',
        'Notes',
        'Created At',
      ]

      const csvRows = [
        headers.join(','),
        ...filteredVendors.map((vendor) =>
          [
            `"${(vendor.name || '').replace(/"/g, '""')}"`,
            `"${(vendor.email || '').replace(/"/g, '""')}"`,
            `"${(vendor.phone || '').replace(/"/g, '""')}"`,
            `"${(vendor.contact_person || '').replace(/"/g, '""')}"`,
            `"${vendor.type || ''}"`,
            `"${vendor.status || ''}"`,
            `"${(vendor.address || '').replace(/"/g, '""')}"`,
            `"${(vendor.city || '').replace(/"/g, '""')}"`,
            `"${(vendor.country || '').replace(/"/g, '""')}"`,
            vendor.rating || 0,
            vendor.total_orders || 0,
            vendor.total_spent || 0,
            `"${(vendor.payment_terms || '').replace(/"/g, '""')}"`,
            vendor.lead_time || 0,
            `"${(vendor.website || '').replace(/"/g, '""')}"`,
            `"${(vendor.notes || '').replace(/"/g, '""')}"`,
            vendor.created_at ? new Date(vendor.created_at).toISOString() : '',
          ].join(',')
        ),
      ]

      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vendors-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Exported ${filteredVendors.length} vendors to CSV`)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error('Failed to export vendors')
    }
  }

  // Contact vendor via email - REAL mailto link
  const handleEmailVendor = (vendor: Vendor) => {
    if (!vendor.email) {
      toast.error('No email address available for this vendor')
      return
    }
    const subject = encodeURIComponent(`Inquiry from ${window.location.hostname}`)
    const body = encodeURIComponent(`Dear ${vendor.contact_person || vendor.name},\n\n`)
    window.location.href = `mailto:${vendor.email}?subject=${subject}&body=${body}`
    toast.success(`Opening email to ${vendor.email}`)
  }

  // Contact vendor via phone - REAL tel link
  const handleCallVendor = (vendor: Vendor) => {
    if (!vendor.phone) {
      toast.error('No phone number available for this vendor')
      return
    }
    window.location.href = `tel:${vendor.phone}`
    toast.success(`Calling ${vendor.phone}`)
  }

  // Visit vendor website - REAL external link
  const handleVisitWebsite = (vendor: Vendor) => {
    if (!vendor.website) {
      toast.error('No website available for this vendor')
      return
    }
    const url = vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`
    window.open(url, '_blank', 'noopener,noreferrer')
    toast.success(`Opening ${vendor.website}`)
  }

  // Copy vendor info to clipboard
  const handleCopyInfo = async (vendor: Vendor) => {
    const info = `${vendor.name}\nEmail: ${vendor.email}\nPhone: ${vendor.phone}\nAddress: ${vendor.address}, ${vendor.city}, ${vendor.country}`
    try {
      await navigator.clipboard.writeText(info)
      toast.success('Vendor info copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  // Open edit dialog
  const openEditDialog = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setFormData({
      name: vendor.name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      city: vendor.city || '',
      country: vendor.country || '',
      type: vendor.type || 'supplier',
      status: vendor.status || 'active',
      payment_terms: vendor.payment_terms || 'Net 30',
      lead_time: vendor.lead_time || 7,
      notes: vendor.notes || '',
      website: vendor.website || '',
      contact_person: vendor.contact_person || '',
    })
    setIsEditDialogOpen(true)
  }

  // Open view dialog
  const openViewDialog = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsViewDialogOpen(true)
  }

  // Refresh vendors
  const handleRefresh = async () => {
    await fetchVendors()
    toast.success('Vendors refreshed')
  }

  const getStatusColor = (status: Vendor['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getTypeColor = (type: Vendor['type']) => {
    switch (type) {
      case 'supplier':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'manufacturer':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'distributor':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
      case 'service':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
      case 'contractor':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage your suppliers, manufacturers, and service providers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeVendors}</div>
            <p className="text-xs text-muted-foreground">
              of {vendors.length} total vendors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime spending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVendors}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="supplier">Supplier</SelectItem>
              <SelectItem value="manufacturer">Manufacturer</SelectItem>
              <SelectItem value="distributor">Distributor</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {filteredVendors.length} of {vendors.length} vendors
        </p>
      </div>

      {/* Vendors List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No vendors found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first vendor'}
              </p>
              {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor
                </Button>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{vendor.name}</h4>
                          <Badge className={getStatusColor(vendor.status)}>
                            {vendor.status}
                          </Badge>
                          <Badge variant="outline" className={getTypeColor(vendor.type)}>
                            {vendor.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          {vendor.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {vendor.email}
                            </span>
                          )}
                          {vendor.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {vendor.phone}
                            </span>
                          )}
                          {vendor.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {vendor.city}, {vendor.country}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{vendor.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {vendor.total_orders || 0} orders
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(vendor)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(vendor)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEmailVendor(vendor)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCallVendor(vendor)}>
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </DropdownMenuItem>
                          {vendor.website && (
                            <DropdownMenuItem onClick={() => handleVisitWebsite(vendor)}>
                              <Globe className="h-4 w-4 mr-2" />
                              Visit Website
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleCopyInfo(vendor)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Info
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteVendor(vendor)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add Vendor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
            <DialogDescription>
              Enter the vendor details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Vendor name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="vendor@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_person: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Vendor['type']) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Vendor['status']) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Business St"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="USA"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Input
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_terms: e.target.value })
                  }
                  placeholder="Net 30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead_time">Lead Time (days)</Label>
                <Input
                  id="lead_time"
                  type="number"
                  value={formData.lead_time}
                  onChange={(e) =>
                    setFormData({ ...formData, lead_time: parseInt(e.target.value) || 0 })
                  }
                  placeholder="7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://vendor.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about the vendor..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVendor} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vendor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>
              Update the vendor details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Vendor name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="vendor@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact_person">Contact Person</Label>
                <Input
                  id="edit-contact_person"
                  value={formData.contact_person}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_person: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Vendor['type']) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Vendor['status']) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Business St"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="USA"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-payment_terms">Payment Terms</Label>
                <Input
                  id="edit-payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_terms: e.target.value })
                  }
                  placeholder="Net 30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lead_time">Lead Time (days)</Label>
                <Input
                  id="edit-lead_time"
                  type="number"
                  value={formData.lead_time}
                  onChange={(e) =>
                    setFormData({ ...formData, lead_time: parseInt(e.target.value) || 0 })
                  }
                  placeholder="7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://vendor.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about the vendor..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateVendor} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Vendor Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedVendor?.name}
            </DialogTitle>
            <DialogDescription>
              Vendor details and contact information
            </DialogDescription>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(selectedVendor.status)}>
                  {selectedVendor.status}
                </Badge>
                <Badge variant="outline" className={getTypeColor(selectedVendor.type)}>
                  {selectedVendor.type}
                </Badge>
              </div>

              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="business">Business</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Contact Person</Label>
                      <p className="font-medium">
                        {selectedVendor.contact_person || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Rating</Label>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">
                          {selectedVendor.rating?.toFixed(1) || '0.0'} / 5.0
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedVendor.notes && (
                    <div>
                      <Label className="text-muted-foreground">Notes</Label>
                      <p className="text-sm mt-1">{selectedVendor.notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="space-y-3">
                    {selectedVendor.email && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedVendor.email}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEmailVendor(selectedVendor)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    )}
                    {selectedVendor.phone && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedVendor.phone}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCallVendor(selectedVendor)}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      </div>
                    )}
                    {selectedVendor.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {selectedVendor.address}, {selectedVendor.city},{' '}
                          {selectedVendor.country}
                        </span>
                      </div>
                    )}
                    {selectedVendor.website && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedVendor.website}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVisitWebsite(selectedVendor)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="business" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Total Orders</Label>
                      <p className="text-2xl font-bold">
                        {selectedVendor.total_orders || 0}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total Spent</Label>
                      <p className="text-2xl font-bold">
                        ${(selectedVendor.total_spent || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Payment Terms</Label>
                      <p className="font-medium">
                        {selectedVendor.payment_terms || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Lead Time</Label>
                      <p className="font-medium">
                        {selectedVendor.lead_time || 0} days
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false)
                if (selectedVendor) openEditDialog(selectedVendor)
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
