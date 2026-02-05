import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('tax-education-lessons')

/**
 * GET /api/tax/education/lessons/[id]
 * Get a specific tax education lesson by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { id } = await params

    // Import lessons (in real app, this would be from database)
    const { GET: getLessons } = await import('../route')
    const lessonsResponse = await getLessons(request)
    const lessonsData = await lessonsResponse.json()

    const lesson = lessonsData.data.find((l: any) => l.id === id)

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    return NextResponse.json({ data: lesson })
  } catch (error) {
    logger.error('Tax education lesson GET error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
