'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SiteHeader } from '@/components/site-header'
import { 
  Calendar,
  Clock,
  DollarSign,
  Star,
  Users,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'

interface Service {
  id: string
  title: string
  description: string
  duration: number
  price: number
  category: string
  formattedPrice: string
  tags?: string[]
  requirements?: string[]
  deliverables?: string[]
}

export default function BookAppointmentPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/bookings/services?active=true')
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      const data = await response.json()
      setServices(data.services || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
  }

  const handleBackToServices = () => {
    setSelectedService(null)
  }

  if (selectedService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <SiteHeader variant="minimal" />
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={handleBackToServices}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedService.title}</h1>
                    <p className="text-gray-600 mt-1">{selectedService.description}</p>
                  </div>
                  <Badge variant="secondary" className="ml-4">
                    {selectedService.category}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedService.duration} minutes
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {selectedService.formattedPrice}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Ready to Book?</h2>
              <p className="text-gray-600 mb-4">
                Contact us to schedule your {selectedService.title} session. We'll work with you to find the perfect time slot.
              </p>
              <div className="flex gap-4">
                <Button>Contact to Book</Button>
                <Button variant="outline">Call Us</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <SiteHeader variant="minimal" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Book an Appointment
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our professional services and schedule a consultation that fits your needs.
            </p>
          </div>

          {/* Services Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <div className="text-lg font-medium">Error loading services</div>
                <div className="text-sm">{error}</div>
              </div>
              <Button onClick={fetchServices}>Try Again</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card 
                  key={service.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleServiceSelect(service)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {service.title}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-2">
                          {service.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {service.formattedPrice}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.duration} min
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {service.description}
                    </p>
                    
                    {service.tags && service.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {service.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        Available today
                      </div>
                      <Button size="sm" className="group-hover:bg-blue-600">
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Features Section */}
          <div className="mt-16 bg-white rounded-xl p-8 shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Why Choose Our Services?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Professional Expertise</h3>
                <p className="text-gray-600 text-sm">
                  Years of experience delivering high-quality solutions for businesses of all sizes.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">5-Star Rated</h3>
                <p className="text-gray-600 text-sm">
                  Consistently rated 5 stars by our clients for quality and professionalism.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Personalized Approach</h3>
                <p className="text-gray-600 text-sm">
                  Every project is tailored to your specific needs and business objectives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 