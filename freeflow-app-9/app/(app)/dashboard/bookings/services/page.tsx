'use client'

import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import { Plus, Download } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockServices } from '@/lib/bookings-utils'

const logger = createFeatureLogger('BookingsServices')

export default function ServicesPage() {
  const handleManageServices = () => {
    logger.info('Manage services opened')
    toast.info('Manage Services', {
      description: 'Edit pricing, durations, and availability'
    })
  }

  const handleBulkAction = () => {
    logger.info('Bulk action initiated')
    toast.success('Bulk action complete', {
      description: 'Action applied to selected services'
    })
  }

  const handleExportData = () => {
    logger.info('Exporting services data')
    toast.success('Data exported', {
      description: 'Services data exported successfully'
    })
  }

  const handleViewBookings = (serviceId: string) => {
    const service = mockServices.find(s => s.id === serviceId)
    logger.info('Viewing service bookings', { serviceId, serviceName: service?.name })
    toast.info('Service Bookings', {
      description: `Viewing bookings for ${service?.name}`
    })
  }

  const handleEditService = (serviceId: string) => {
    const service = mockServices.find(s => s.id === serviceId)
    logger.info('Editing service', { serviceId, serviceName: service?.name })
    toast.info('Edit Service', {
      description: `Editing ${service?.name}`
    })
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
        {mockServices.map((service, index) => (
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
                <p className="text-sm text-gray-600">Logo Design Review</p>
              </div>
              <Badge className="bg-blue-600">10 bookings</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Highest Revenue Service</p>
                <p className="text-sm text-gray-600">Website Consultation</p>
              </div>
              <Badge className="bg-green-600">$1,350</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="font-medium">Average Service Price</p>
                <p className="text-sm text-gray-600">Across all services</p>
              </div>
              <Badge className="bg-purple-600">$199</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
