import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/types/booking'

// Mock services data - in production, this would come from a database
const MOCK_SERVICES: BookingService[] = [
  {
    id: 'service-1',
    title: 'Initial Consultation',
    description: 'Comprehensive project consultation and planning session',
    duration: 90,
    price: 15000, // $150.00 in cents
    category: 'consultation',
    freelancerId: 'user1',
    isActive: true,
    maxAdvanceBooking: 30,
    bufferTime: 15,
    tags: ['strategy', 'planning', 'consultation'],
    requirements: ['Project brief', 'Business goals'],
    deliverables: ['Project proposal', 'Timeline'],
    availability: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' }
    }
  },
  {
    id: 'service-2',
    title: 'Design Review Session',
    description: 'Professional review and feedback session for design concepts',
    duration: 60,
    price: 12000, // $120.00 in cents
    category: 'review',
    freelancerId: 'user1',
    isActive: true,
    maxAdvanceBooking: 14,
    bufferTime: 10,
    tags: ['design', 'review', 'feedback'],
    requirements: ['Design files', 'Specific areas for review'],
    deliverables: ['Feedback report', 'Recommendations'],
    availability: {
      monday: { start: '10:00', end: '16:00' },
      tuesday: { start: '10:00', end: '16:00' },
      wednesday: { start: '10:00', end: '16:00' },
      thursday: { start: '10:00', end: '16:00' },
      friday: { start: '10:00', end: '16:00' }
    }
  },
  {
    id: 'service-3',
    title: 'Development Workshop',
    description: 'Hands-on development session with technical guidance',
    duration: 120,
    price: 25000, // $250.00 in cents
    category: 'workshop',
    freelancerId: 'user1',
    isActive: true,
    maxAdvanceBooking: 21,
    bufferTime: 30,
    tags: ['development', 'coding', 'workshop'],
    requirements: ['Dev environment setup', 'Repository access'],
    deliverables: ['Code examples', 'Documentation'],
    availability: {
      monday: { start: '09:00', end: '15:00' },
      wednesday: { start: '09:00', end: '15:00' },
      friday: { start: '09:00', end: '15:00' }
    }
  },
  {
    id: 'service-4',
    title: 'Technical Audit',
    description: 'Comprehensive technical audit of your website, application, or codebase. Identify performance issues, security vulnerabilities, and optimization opportunities.',
    duration: 90,
    price: 18000, // $180.00 in cents
    category: 'other',
    freelancerId: 'user1',
    isActive: true,
    maxAdvanceBooking: 7,
    bufferTime: 15,
    tags: ['audit', 'performance', 'security', 'optimization'],
    requirements: ['Access to codebase or application', 'Current hosting details', 'Performance metrics (if available)'],
    deliverables: ['Detailed audit report', 'Priority recommendations', 'Implementation roadmap'],
    availability: {
      tuesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' }
    }
  },
  {
    id: 'service-5',
    title: 'Quick Q&A Session',
    description: 'Fast-paced question and answer session for urgent technical questions or quick consultations. Perfect for immediate guidance.',
    duration: 30,
    price: 8000, // $80.00 in cents
    category: 'other',
    freelancerId: 'user1',
    isActive: true,
    maxAdvanceBooking: 3,
    bufferTime: 5,
    tags: ['quick-help', 'consultation', 'qa', 'support'],
    requirements: ['Prepared questions list', 'Relevant context/background'],
    deliverables: ['Answers and guidance', 'Resource links', 'Follow-up recommendations'],
    availability: {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' },
      friday: { start: '09:00', end: '18:00' }
    }
  }
]

// GET: Fetch all services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('active')

    let filteredServices = [...MOCK_SERVICES]

    // Apply filters
    if (category) {
      filteredServices = filteredServices.filter(service => 
        service.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (isActive !== null) {
      const activeFilter = isActive === 'true'
      filteredServices = filteredServices.filter(service => 
        service.isActive === activeFilter
      )
    }

    // Add computed fields
    const enrichedServices = filteredServices.map(service => ({
      ...service,
      formattedPrice: `$${(service.price / 100).toFixed(2)}`,
      pricePerMinute: Math.round(service.price / service.duration)
    }))

    return NextResponse.json({
      services: enrichedServices,
      total: enrichedServices.length
    })

  } catch (error) {
    console.error('Services fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

// POST: Create a new service (for freelancers)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      duration,
      price,
      category,
      freelancerId,
      maxAdvanceBooking = 30,
      bufferTime = 15,
      tags = [],
      requirements = [],
      deliverables = [],
      availability = {}
    } = body

    // Validation
    if (!title || !description || !duration || !price || !category || !freelancerId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, duration, price, category, freelancerId' },
        { status: 400 }
      )
    }

    if (duration < 15 || duration > 480) {
      return NextResponse.json(
        { error: 'Duration must be between 15 and 480 minutes' },
        { status: 400 }
      )
    }

    if (price < 1000) { // Minimum $10
      return NextResponse.json(
        { error: 'Price must be at least $10.00' },
        { status: 400 }
      )
    }

    // Create new service
    const newService: BookingService = {
      id: `service-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      duration,
      price,
      category: category.trim(),
      freelancerId,
      isActive: true,
      maxAdvanceBooking,
      bufferTime,
      tags: tags.map((tag: string) => tag.trim()),
      requirements: requirements.map((req: string) => req.trim()),
      deliverables: deliverables.map((del: string) => del.trim()),
      availability
    }

    // Add to mock storage (in production, save to database)
    MOCK_SERVICES.push(newService)

    return NextResponse.json({
      service: newService,
      message: 'Service created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Service creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}

// PUT: Update an existing service
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceId, ...updateData } = body

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Missing serviceId' },
        { status: 400 }
      )
    }

    // Find service
    const serviceIndex = MOCK_SERVICES.findIndex(s => s.id === serviceId)
    if (serviceIndex === -1) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Update service
    const updatedService = {
      ...MOCK_SERVICES[serviceIndex],
      ...updateData,
      id: serviceId // Ensure ID doesn't change
    }

    MOCK_SERVICES[serviceIndex] = updatedService

    return NextResponse.json({
      service: updatedService,
      message: 'Service updated successfully'
    })

  } catch (error) {
    console.error('Service update error:', error)
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a service
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Missing serviceId parameter' },
        { status: 400 }
      )
    }

    // Find service
    const serviceIndex = MOCK_SERVICES.findIndex(s => s.id === serviceId)
    if (serviceIndex === -1) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Remove from storage
    const deletedService = MOCK_SERVICES.splice(serviceIndex, 1)[0]

    return NextResponse.json({
      service: deletedService,
      message: 'Service deleted successfully'
    })

  } catch (error) {
    console.error('Service deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
} 