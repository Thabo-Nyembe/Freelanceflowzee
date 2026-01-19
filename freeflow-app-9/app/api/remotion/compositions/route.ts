/**
 * Remotion Compositions API
 *
 * GET /api/remotion/compositions - List available compositions
 * GET /api/remotion/compositions?id=... - Get composition details
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { remotionService } from '@/lib/remotion/remotion-service'

// Composition metadata
const compositionMeta: Record<
  string,
  {
    name: string
    description: string
    category: 'basic' | 'social' | 'marketing' | 'presentation' | 'full'
    thumbnail: string
    defaultDuration: number
    props: Array<{
      name: string
      type: 'string' | 'number' | 'boolean' | 'color' | 'image' | 'array' | 'object'
      required: boolean
      description: string
      default?: unknown
      options?: string[]
    }>
  }
> = {
  TextSlide: {
    name: 'Text Slide',
    description: 'Animated text with customizable effects',
    category: 'basic',
    thumbnail: '/api/placeholder/400/225',
    defaultDuration: 3,
    props: [
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Main title text',
      },
      {
        name: 'subtitle',
        type: 'string',
        required: false,
        description: 'Optional subtitle',
      },
      {
        name: 'backgroundColor',
        type: 'color',
        required: false,
        description: 'Background color',
        default: '#1a1a2e',
      },
      {
        name: 'textColor',
        type: 'color',
        required: false,
        description: 'Text color',
        default: '#ffffff',
      },
      {
        name: 'animation',
        type: 'string',
        required: false,
        description: 'Animation style',
        default: 'fade',
        options: ['fade', 'slide', 'scale', 'typewriter'],
      },
    ],
  },
  ImageSlide: {
    name: 'Image Slide',
    description: 'Image with Ken Burns and other effects',
    category: 'basic',
    thumbnail: '/api/placeholder/400/225',
    defaultDuration: 5,
    props: [
      {
        name: 'src',
        type: 'image',
        required: true,
        description: 'Image URL',
      },
      {
        name: 'title',
        type: 'string',
        required: false,
        description: 'Optional overlay title',
      },
      {
        name: 'animation',
        type: 'string',
        required: false,
        description: 'Animation effect',
        default: 'kenBurns',
        options: ['fade', 'zoom', 'pan', 'kenBurns'],
      },
      {
        name: 'overlayColor',
        type: 'color',
        required: false,
        description: 'Overlay color',
        default: 'rgba(0,0,0,0.3)',
      },
    ],
  },
  LogoReveal: {
    name: 'Logo Reveal',
    description: 'Animated logo introduction',
    category: 'marketing',
    thumbnail: '/api/placeholder/400/225',
    defaultDuration: 3,
    props: [
      {
        name: 'logoSrc',
        type: 'image',
        required: true,
        description: 'Logo image URL',
      },
      {
        name: 'backgroundColor',
        type: 'color',
        required: false,
        description: 'Background color',
        default: '#000000',
      },
      {
        name: 'animation',
        type: 'string',
        required: false,
        description: 'Reveal animation',
        default: 'scale',
        options: ['fade', 'scale', 'rotate', 'glitch'],
      },
    ],
  },
  SocialProof: {
    name: 'Social Proof / Testimonial',
    description: 'Customer testimonial with quote styling',
    category: 'social',
    thumbnail: '/api/placeholder/400/225',
    defaultDuration: 5,
    props: [
      {
        name: 'testimonial',
        type: 'string',
        required: true,
        description: 'The testimonial quote',
      },
      {
        name: 'author',
        type: 'string',
        required: true,
        description: 'Author name',
      },
      {
        name: 'authorTitle',
        type: 'string',
        required: false,
        description: 'Author job title or company',
      },
      {
        name: 'avatarSrc',
        type: 'image',
        required: false,
        description: 'Author avatar image',
      },
      {
        name: 'backgroundColor',
        type: 'color',
        required: false,
        description: 'Background color',
        default: '#f8f9fa',
      },
    ],
  },
  CallToAction: {
    name: 'Call to Action',
    description: 'CTA with animated button',
    category: 'marketing',
    thumbnail: '/api/placeholder/400/225',
    defaultDuration: 4,
    props: [
      {
        name: 'headline',
        type: 'string',
        required: true,
        description: 'Main headline',
      },
      {
        name: 'subheadline',
        type: 'string',
        required: false,
        description: 'Supporting text',
      },
      {
        name: 'buttonText',
        type: 'string',
        required: true,
        description: 'CTA button text',
      },
      {
        name: 'backgroundColor',
        type: 'color',
        required: false,
        description: 'Background color',
        default: '#6366f1',
      },
      {
        name: 'accentColor',
        type: 'color',
        required: false,
        description: 'Text and button color',
        default: '#ffffff',
      },
    ],
  },
  ProductShowcase: {
    name: 'Product Showcase',
    description: 'Product image with features and pricing',
    category: 'marketing',
    thumbnail: '/api/placeholder/400/225',
    defaultDuration: 6,
    props: [
      {
        name: 'productImage',
        type: 'image',
        required: true,
        description: 'Product image URL',
      },
      {
        name: 'productName',
        type: 'string',
        required: true,
        description: 'Product name',
      },
      {
        name: 'features',
        type: 'array',
        required: true,
        description: 'List of features (strings)',
      },
      {
        name: 'price',
        type: 'string',
        required: false,
        description: 'Price display',
      },
      {
        name: 'backgroundColor',
        type: 'color',
        required: false,
        description: 'Background color',
        default: '#ffffff',
      },
    ],
  },
  Countdown: {
    name: 'Countdown Timer',
    description: 'Animated countdown to a date',
    category: 'social',
    thumbnail: '/api/placeholder/400/225',
    defaultDuration: 10,
    props: [
      {
        name: 'targetDate',
        type: 'string',
        required: true,
        description: 'Target date (ISO string)',
      },
      {
        name: 'title',
        type: 'string',
        required: false,
        description: 'Title above countdown',
        default: 'Coming Soon',
      },
      {
        name: 'backgroundColor',
        type: 'color',
        required: false,
        description: 'Background color',
        default: '#1a1a2e',
      },
    ],
  },
  ProgressBar: {
    name: 'Progress Bar',
    description: 'Animated progress indicator',
    category: 'basic',
    thumbnail: '/api/placeholder/400/225',
    defaultDuration: 3,
    props: [
      {
        name: 'progress',
        type: 'number',
        required: true,
        description: 'Progress percentage (0-100)',
      },
      {
        name: 'label',
        type: 'string',
        required: false,
        description: 'Label above progress bar',
      },
      {
        name: 'color',
        type: 'color',
        required: false,
        description: 'Progress bar color',
        default: '#6366f1',
      },
    ],
  },
  IntroOutroVideo: {
    name: 'Intro/Outro Video',
    description: 'Logo reveal followed by title slide',
    category: 'full',
    thumbnail: '/api/placeholder/400/225',
    defaultDuration: 5,
    props: [
      {
        name: 'logoSrc',
        type: 'image',
        required: true,
        description: 'Logo image URL',
      },
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Main title',
      },
      {
        name: 'subtitle',
        type: 'string',
        required: false,
        description: 'Optional subtitle',
      },
      {
        name: 'backgroundColor',
        type: 'color',
        required: false,
        description: 'Background color',
        default: '#1a1a2e',
      },
    ],
  },
  SlideshowVideo: {
    name: 'Slideshow Video',
    description: 'Multiple slides with transitions',
    category: 'full',
    thumbnail: '/api/placeholder/400/225',
    defaultDuration: 30,
    props: [
      {
        name: 'slides',
        type: 'array',
        required: true,
        description:
          'Array of slide objects: { type: "text"|"image", content: {...}, duration: number }',
      },
      {
        name: 'transitionDuration',
        type: 'number',
        required: false,
        description: 'Transition duration in seconds',
        default: 0.5,
      },
    ],
  },
  PromoVideo: {
    name: 'Promotional Video',
    description: 'Complete promo with logo, features, testimonial, and CTA',
    category: 'full',
    thumbnail: '/api/placeholder/400/225',
    defaultDuration: 16,
    props: [
      {
        name: 'logoSrc',
        type: 'image',
        required: true,
        description: 'Logo image URL',
      },
      {
        name: 'headline',
        type: 'string',
        required: true,
        description: 'Main headline',
      },
      {
        name: 'features',
        type: 'array',
        required: true,
        description: 'List of feature strings',
      },
      {
        name: 'testimonial',
        type: 'object',
        required: false,
        description: '{ quote: string, author: string, title?: string }',
      },
      {
        name: 'cta',
        type: 'object',
        required: true,
        description: '{ headline: string, buttonText: string }',
      },
      {
        name: 'backgroundColor',
        type: 'color',
        required: false,
        description: 'Background color',
        default: '#1a1a2e',
      },
    ],
  },
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const compositionId = searchParams.get('id')
    const category = searchParams.get('category')

    // Get specific composition details
    if (compositionId) {
      const meta = compositionMeta[compositionId]
      if (!meta) {
        return NextResponse.json(
          { error: 'Composition not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        composition: {
          id: compositionId,
          ...meta,
          previewProps: remotionService.getCompositionPreviewProps(compositionId),
          recommendedSettings: remotionService.getRecommendedSettings(compositionId),
        },
      })
    }

    // List all compositions
    let compositions = Object.entries(compositionMeta).map(([id, meta]) => ({
      id,
      name: meta.name,
      description: meta.description,
      category: meta.category,
      thumbnail: meta.thumbnail,
      defaultDuration: meta.defaultDuration,
    }))

    // Filter by category if provided
    if (category) {
      compositions = compositions.filter((c) => c.category === category)
    }

    // Group by category
    const grouped = compositions.reduce(
      (acc, comp) => {
        if (!acc[comp.category]) acc[comp.category] = []
        acc[comp.category].push(comp)
        return acc
      },
      {} as Record<string, typeof compositions>
    )

    return NextResponse.json({
      success: true,
      compositions,
      grouped,
      categories: ['basic', 'social', 'marketing', 'presentation', 'full'],
    })
  } catch (error) {
    console.error('Get compositions error:', error)
    return NextResponse.json(
      { error: 'Failed to get compositions' },
      { status: 500 }
    )
  }
}
