// MIGRATED: Batch #28 - Removed mock data, using database hooks
'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { Plus, Download, Trash2 } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { Service } from '@/lib/bookings-utils'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'

const logger = createFeatureLogger('BookingsServices')

// Extended Service interface for form data
interface ServiceFormData {
  name: string
  description: string
  duration: number
  price: number
  color: string
  buffer: number
  maxCapacity: number
  category: string
  status: 'active' | 'inactive'
}

const defaultFormData: ServiceFormData = {
  name: '',
  description: '',
  duration: 60,
  price: 0,
  color: 'sky',
  buffer: 10,
  maxCapacity: 1,
  category: 'consultation',
  status: 'active'
}

const colorOptions = [
  { value: 'sky', label: 'Sky Blue' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'purple', label: 'Purple' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'amber', label: 'Amber' },
  { value: 'rose', label: 'Rose' },
  { value: 'teal', label: 'Teal' }
]

const categoryOptions = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' }
]

export default function ServicesPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewBookingsDialog, setShowViewBookingsDialog] = useState(false)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [serviceBookings, setServiceBookings] = useState<any[]>([])

  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // Load services from API
  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/bookings/services')
      const data = res?.ok ? await res.json() : null

      if (data?.success && data.services) {
        setServices(data.services)
        announce('Services loaded', 'polite')
      } else {
        // Fallback to basic endpoint
        const fallbackRes = await fetch('/api/bookings?type=services')
        const fallbackData = fallbackRes?.ok ? await fallbackRes.json() : null
        setServices(fallbackData?.services || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services')
      announce('Error loading services', 'assertive')
    } finally {
      setIsLoading(false)
    }
  }, [announce])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  // Create new service
  const handleCreateService = async () => {
    if (!formData.name || !formData.duration) {
      toast.error('Validation Error', { description: 'Name and duration are required' })
      return
    }

    setIsSaving(true)
    toast.loading('Creating service...', { id: 'create-service' })

    try {
      const response = await fetch('/api/bookings/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          duration: formData.duration,
          price: formData.price,
          color: formData.color,
          buffer: formData.buffer,
          maxCapacity: formData.maxCapacity
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create service')
      }

      toast.success('Service Created', {
        id: 'create-service',
        description: `${formData.name} has been added to your services`
      })

      setShowAddDialog(false)
      setFormData(defaultFormData)
      loadServices()

      // Send notification
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          data: {
            title: 'New Service Created',
            message: `Service "${formData.name}" has been created and is now available for booking.`,
            type: 'success',
            category: 'general',
            channels: ['in_app']
          }
        })
      }).catch(() => {}) // Silent fail for notifications
    } catch (err) {
      toast.error('Failed to Create', {
        id: 'create-service',
        description: err instanceof Error ? err.message : 'An error occurred'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Update existing service
  const handleUpdateService = async () => {
    if (!selectedService || !formData.name) {
      toast.error('Validation Error', { description: 'Service name is required' })
      return
    }

    setIsSaving(true)
    toast.loading('Saving changes...', { id: 'update-service' })

    try {
      const response = await fetch('/api/bookings/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedService.id,
          name: formData.name,
          description: formData.description,
          duration: formData.duration,
          price: formData.price,
          color: formData.color,
          buffer: formData.buffer,
          maxCapacity: formData.maxCapacity
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update service')
      }

      toast.success('Service Updated', {
        id: 'update-service',
        description: `${formData.name} has been updated successfully`
      })

      setShowEditDialog(false)
      setSelectedService(null)
      setFormData(defaultFormData)
      loadServices()
    } catch (err) {
      toast.error('Failed to Update', {
        id: 'update-service',
        description: err instanceof Error ? err.message : 'An error occurred'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Delete service
  const handleDeleteService = async () => {
    if (!selectedService) return

    setIsSaving(true)
    toast.loading('Deleting service...', { id: 'delete-service' })

    try {
      const response = await fetch(`/api/bookings/services?id=${selectedService.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete service')
      }

      toast.success('Service Deleted', {
        id: 'delete-service',
        description: `${selectedService.name} has been removed`
      })

      setShowDeleteConfirmDialog(false)
      setSelectedService(null)
      loadServices()
    } catch (err) {
      toast.error('Failed to Delete', {
        id: 'delete-service',
        description: err instanceof Error ? err.message : 'An error occurred'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Open add service dialog
  const handleManageServices = () => {
    logger.info('Opening add service dialog')
    setFormData(defaultFormData)
    setShowAddDialog(true)
  }

  // Bulk export services data
  const handleExportData = () => {
    logger.info('Exporting services data')

    if (services.length === 0) {
      toast.info('No Data', { description: 'No services to export' })
      return
    }

    const csvContent = [
      ['ID', 'Name', 'Description', 'Duration (min)', 'Price ($)', 'Category', 'Status', 'Bookings', 'Revenue'].join(','),
      ...services.map(s => [
        s.id,
        `"${s.name}"`,
        `"${s.description || ''}"`,
        s.duration,
        s.price,
        s.category || 'N/A',
        s.status || 'active',
        s.bookingsThisMonth || 0,
        s.revenue || 0
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `services-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Export Complete', { description: 'Services data exported to CSV' })
  }

  // Bulk action - toggle status for all services
  const handleBulkAction = async () => {
    logger.info('Bulk action initiated')
    toast.info('Bulk Actions', {
      description: 'Select services to perform bulk operations',
      action: {
        label: 'Activate All',
        onClick: async () => {
          for (const service of services) {
            await fetch('/api/bookings/services', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: service.id, status: 'active' })
            }).catch(() => {})
          }
          loadServices()
          toast.success('Bulk Update Complete')
        }
      }
    })
  }

  // View bookings for a service
  const handleViewBookings = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return

    logger.info('Viewing service bookings', { serviceId, serviceName: service.name })
    setSelectedService(service)

    // Fetch bookings for this service
    try {
      const res = await fetch(`/api/bookings?type=list&serviceId=${serviceId}`)
      const data = res?.ok ? await res.json() : null
      setServiceBookings(data?.data || [])
    } catch (err) {
      setServiceBookings([])
    }

    setShowViewBookingsDialog(true)
  }

  // Open edit dialog for a service
  const handleEditService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return

    logger.info('Editing service', { serviceId, serviceName: service.name })
    setSelectedService(service)
    setFormData({
      name: service.name || '',
      description: service.description || '',
      duration: service.duration || 60,
      price: service.price || 0,
      color: service.color || 'sky',
      buffer: service.buffer || 10,
      maxCapacity: service.maxCapacity || 1,
      category: service.category || 'consultation',
      status: service.status as 'active' | 'inactive' || 'active'
    })
    setShowEditDialog(true)
  }

  // Open delete confirmation dialog
  const handleDeleteClick = (service: Service) => {
    setSelectedService(service)
    setShowDeleteConfirmDialog(true)
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Services Management</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="container mx-auto px-4 space-y-4">
        <ErrorEmptyState
          error={error}
          action={{
            label: 'Retry',
            onClick: () => window.location.reload()
          }}
        />
      </div>
    )
  }

  // A+++ EMPTY STATE
  if (services.length === 0) {
    return (
      <div className="container mx-auto px-4 space-y-4">
        <NoDataEmptyState
          entityName="services"
          description="Create your first service to start accepting bookings."
          action={{
            label: 'Create Service',
            onClick: handleManageServices
          }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Services Management</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkAction}
            data-testid="services-bulk-edit-btn"
          >
            Bulk Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            data-testid="services-export-btn"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button
            size="sm"
            onClick={handleManageServices}
            data-testid="services-add-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service, index) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {service.status === 'active' ? 'Active' : service.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Price</span>
                <span className="font-semibold text-lg">${service.price}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">{service.duration} minutes</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Bookings (This Month)</span>
                <span className="font-medium">
                  {service.bookingsThisMonth} bookings
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Revenue</span>
                <span className="font-medium">${service.revenue}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Category</span>
                <Badge variant="outline">{service.category}</Badge>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewBookings(service.id)}
                  data-testid={`service-view-bookings-${index + 1}-btn`}
                >
                  View Bookings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditService(service.id)}
                  data-testid={`service-edit-${index + 1}-btn`}
                >
                  Edit Service
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Performance */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Service Performance</CardTitle>
          <CardDescription>
            Overview of your most popular services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Most Booked Service</p>
                <p className="text-sm text-gray-600">
                  {services.length > 0
                    ? services.reduce((a, b) => (a.bookingsThisMonth || 0) > (b.bookingsThisMonth || 0) ? a : b).name
                    : 'N/A'}
                </p>
              </div>
              <Badge className="bg-blue-600">
                {services.length > 0
                  ? Math.max(...services.map(s => s.bookingsThisMonth || 0))
                  : 0} bookings
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Highest Revenue Service</p>
                <p className="text-sm text-gray-600">
                  {services.length > 0
                    ? services.reduce((a, b) => (a.revenue || 0) > (b.revenue || 0) ? a : b).name
                    : 'N/A'}
                </p>
              </div>
              <Badge className="bg-green-600">
                ${services.length > 0 ? Math.max(...services.map(s => s.revenue || 0)).toLocaleString() : 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="font-medium">Average Service Price</p>
                <p className="text-sm text-gray-600">Across all services</p>
              </div>
              <Badge className="bg-purple-600">
                ${services.length > 0
                  ? Math.round(services.reduce((sum, s) => sum + (s.price || 0), 0) / services.length)
                  : 0}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Service Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>Create a new booking service with pricing and availability settings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="service-name">Service Name *</Label>
              <Input
                id="service-name"
                placeholder="e.g., Strategy Consultation"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="service-desc">Description</Label>
              <Textarea
                id="service-desc"
                placeholder="Describe what this service includes..."
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-duration">Duration (minutes) *</Label>
                <Input
                  id="service-duration"
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={e => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="service-price">Price ($)</Label>
                <Input
                  id="service-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-buffer">Buffer Time (minutes)</Label>
                <Input
                  id="service-buffer"
                  type="number"
                  min="0"
                  value={formData.buffer}
                  onChange={e => setFormData(prev => ({ ...prev, buffer: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="service-capacity">Max Capacity</Label>
                <Input
                  id="service-capacity"
                  type="number"
                  min="1"
                  value={formData.maxCapacity}
                  onChange={e => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) || 1 }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Color</Label>
                <Select value={formData.color} onValueChange={value => setFormData(prev => ({ ...prev, color: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleCreateService} disabled={isSaving}>
              {isSaving ? 'Creating...' : 'Create Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update service details, pricing, and availability settings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="edit-service-name">Service Name *</Label>
              <Input
                id="edit-service-name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-service-desc">Description</Label>
              <Textarea
                id="edit-service-desc"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-service-duration">Duration (minutes)</Label>
                <Input
                  id="edit-service-duration"
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={e => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-service-price">Price ($)</Label>
                <Input
                  id="edit-service-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-service-buffer">Buffer Time (minutes)</Label>
                <Input
                  id="edit-service-buffer"
                  type="number"
                  min="0"
                  value={formData.buffer}
                  onChange={e => setFormData(prev => ({ ...prev, buffer: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-service-capacity">Max Capacity</Label>
                <Input
                  id="edit-service-capacity"
                  type="number"
                  min="1"
                  value={formData.maxCapacity}
                  onChange={e => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) || 1 }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Color</Label>
                <Select value={formData.color} onValueChange={value => setFormData(prev => ({ ...prev, color: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="destructive"
              onClick={() => { setShowEditDialog(false); handleDeleteClick(selectedService!) }}
              disabled={isSaving}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleUpdateService} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Bookings Dialog */}
      <Dialog open={showViewBookingsDialog} onOpenChange={setShowViewBookingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bookings for {selectedService?.name}</DialogTitle>
            <DialogDescription>
              View all bookings associated with this service.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-96 overflow-y-auto">
            {serviceBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No bookings found for this service.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {serviceBookings.map((booking: any) => (
                  <div key={booking.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{booking.customer_name || 'Unknown Client'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.start_time).toLocaleDateString()} at {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'cancelled' ? 'destructive' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewBookingsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedService?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)} disabled={isSaving}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteService} disabled={isSaving}>
              {isSaving ? 'Deleting...' : 'Delete Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
