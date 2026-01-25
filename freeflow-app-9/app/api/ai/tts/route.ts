/**
 * Text-to-Speech API
 *
 * POST /api/ai/tts - Convert text to speech using OpenAI TTS
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ai-tts')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest): Promise<NextResponse> {
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

    const body = await request.json()
    const {
      text,
      voice = 'nova',
      speed = 1.0,
      model = 'tts-1-hd',
      format = 'mp3',
    } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Validate voice
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
    if (!validVoices.includes(voice)) {
      return NextResponse.json(
        { error: `Invalid voice. Must be one of: ${validVoices.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate speed
    if (speed < 0.25 || speed > 4.0) {
      return NextResponse.json(
        { error: 'Speed must be between 0.25 and 4.0' },
        { status: 400 }
      )
    }

    // Validate model
    const validModels = ['tts-1', 'tts-1-hd']
    if (!validModels.includes(model)) {
      return NextResponse.json(
        { error: `Invalid model. Must be one of: ${validModels.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate speech
    const mp3 = await openai.audio.speech.create({
      model,
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
      speed,
      response_format: format as 'mp3' | 'opus' | 'aac' | 'flac',
    })

    const audioBuffer = Buffer.from(await mp3.arrayBuffer())

    // Determine content type
    const contentTypes: Record<string, string> = {
      mp3: 'audio/mpeg',
      opus: 'audio/opus',
      aac: 'audio/aac',
      flac: 'audio/flac',
    }

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': contentTypes[format] || 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    })
  } catch (error) {
    logger.error('TTS error', { error })
    return NextResponse.json(
      { error: 'Text-to-speech failed' },
      { status: 500 }
    )
  }
}
