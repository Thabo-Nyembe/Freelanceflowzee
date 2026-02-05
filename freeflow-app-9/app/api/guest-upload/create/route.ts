import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('GuestUpload:Create')

/**
 * POST /api/guest-upload/create
 *
 * Initiates a guest upload and calculates pricing
 * No authentication required - this is for guests!
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, fileSize, fileName } = body

    logger.info('Guest upload initiation request', { email, fileSize, fileName })

    // Validate inputs
    if (!email || !fileSize || !fileName) {
      return NextResponse.json(
        { error: 'Email, file size, and file name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate file size (max 25GB)
    const maxSize = 25 * 1024 * 1024 * 1024 // 25GB in bytes
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 25GB' },
        { status: 400 }
      )
    }

    // Calculate price based on file size
    const priceAmount = calculatePrice(fileSize)

    // Calculate expiration (7 days for free, 30 days for paid)
    const expiresAt = calculateExpiration(priceAmount)

    // Create database record
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('guest_upload_payments')
      .insert({
        email,
        file_size: fileSize,
        file_name: fileName,
        payment_amount: priceAmount,
        payment_status: priceAmount === 0 ? 'completed' : 'pending', // Free uploads auto-complete
        expires_at: expiresAt.toISOString(),
        metadata: {
          initiated_at: new Date().toISOString(),
          user_agent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          is_free_tier: priceAmount === 0
        }
      })
      .select()
      .single()

    if (error) {
      logger.error('Database error creating guest upload', { error: error.message })
      return NextResponse.json(
        { error: 'Failed to create upload record' },
        { status: 500 }
      )
    }

    logger.info('Guest upload record created', {
      uploadLink: data.upload_link,
      amount: priceAmount,
      email
    })

    // In production, integrate Stripe Payment Intent here
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: priceAmount * 100,
    //   currency: 'usd',
    //   metadata: { uploadLink: data.upload_link, email }
    // })

    return NextResponse.json({
      success: true,
      uploadLink: data.upload_link,
      amount: priceAmount,
      expiresAt: data.expires_at,
      // clientSecret: paymentIntent.client_secret, // Stripe integration
      message: 'Upload initiated successfully'
    })

  } catch (error) {
    logger.error('Guest upload creation failed', { error: error.message })
    return NextResponse.json(
      { error: error.message || 'Failed to create guest upload' },
      { status: 500 }
    )
  }
}

/**
 * Calculate price based on file size
 * NEW: 1-6GB is FREE! 🎉
 * Paid tiers last 30 days (vs 7 days for free)
 */
function calculatePrice(fileSizeBytes: number): number {
  const gb = fileSizeBytes / (1024 * 1024 * 1024)

  // FREE TIER: 1-6GB
  if (gb <= 6) return 0

  // PAID TIERS: Extended to 30 days validity
  if (gb <= 10) return 5   // 6-10GB
  if (gb <= 15) return 10  // 10-15GB
  if (gb <= 20) return 15  // 15-20GB
  if (gb <= 25) return 20  // 20-25GB
  return 25                // 25GB+
}

/**
 * Calculate expiration based on price
 * Free: 7 days, Paid: 30 days
 */
export function calculateExpiration(price: number): Date {
  const now = new Date()
  const days = price === 0 ? 7 : 30 // Free: 7 days, Paid: 30 days
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
}

/**
 * GET /api/guest-upload/create
 *
 * Returns pricing information
 */
export async function GET() {
  return NextResponse.json({
    pricing: [
      {
        range: '1GB - 6GB',
        price: 0,
        priceFormatted: 'FREE! 🎉',
        validity: '7 days',
        highlight: true
      },
      {
        range: '6GB - 10GB',
        price: 5,
        priceFormatted: '$5',
        validity: '30 days'
      },
      {
        range: '10GB - 15GB',
        price: 10,
        priceFormatted: '$10',
        validity: '30 days'
      },
      {
        range: '15GB - 20GB',
        price: 15,
        priceFormatted: '$15',
        validity: '30 days'
      },
      {
        range: '20GB - 25GB',
        price: 20,
        priceFormatted: '$20',
        validity: '30 days'
      },
      {
        range: '25GB+',
        price: 25,
        priceFormatted: '$25',
        validity: '30 days',
        note: 'Maximum file size'
      }
    ],
    features: [
      'FREE for files up to 6GB',
      'Paid links last 30 days',
      'Up to 10 downloads per link',
      'Secure cloud storage',
      'No subscription required',
      'Instant access'
    ],
    maxFileSize: 25 * 1024 * 1024 * 1024, // 25GB
    freeTierLimit: 6 * 1024 * 1024 * 1024, // 6GB free
    maxDownloads: 10
  })
}
