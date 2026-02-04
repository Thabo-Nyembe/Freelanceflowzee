import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createSimpleLogger } from '@/lib/simple-logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createSimpleLogger('API-VoiceSynthesis')

interface VoiceSynthesisRequest {
  provider: 'openai' | 'elevenlabs' | 'azure'
  text?: string
  input?: string
  voice: string
  voice_id?: string
  language?: string
  speed?: number
  rate?: string
  pitch?: number
  style?: number
  response_format?: string
  output_format?: string
  voice_settings?: {
    stability: number
    similarity_boost: number
    style: number
    use_speaker_boost: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: VoiceSynthesisRequest = await request.json()
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.replace('Bearer ', '')

    switch (body.provider) {
      case 'openai':
        return await handleOpenAITTS(body, apiKey)
      case 'elevenlabs':
        return await handleElevenLabsTTS(body, apiKey)
      case 'azure':
        return await handleAzureTTS(body, apiKey)
      default:
        return NextResponse.json(
          { error: 'Unsupported provider' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Voice synthesis API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleOpenAITTS(body: VoiceSynthesisRequest, apiKey: string) {
  try {
    const openai = new OpenAI({ apiKey })

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: body.voice,
      input: body.input || body.text || '',
      response_format: body.response_format || 'mp3',
      speed: body.speed || 1.0
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    logger.error('OpenAI TTS error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      voice: body.voice,
      speed: body.speed
    });
    return NextResponse.json(
      { error: `OpenAI TTS failed: ${error.message}` },
      { status: 500 }
    )
  }
}

async function handleElevenLabsTTS(body: VoiceSynthesisRequest, apiKey: string) {
  try {
    const voiceId = body.voice_id || body.voice
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: body.text || body.input || '',
        voice_settings: body.voice_settings || {
          stability: 0.5,
          similarity_boost: 0.75,
          style: body.style || 0.0,
          use_speaker_boost: true
        },
        output_format: body.output_format || 'mp3_44100_128'
      })
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    logger.error('ElevenLabs TTS error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      voiceId: body.voice_id || body.voice,
      outputFormat: body.output_format
    });
    return NextResponse.json(
      { error: `ElevenLabs TTS failed: ${error.message}` },
      { status: 500 }
    )
  }
}

async function handleAzureTTS(body: VoiceSynthesisRequest, apiKey: string) {
  try {
    // Extract region and subscription key from the API key
    // Expected format: "region:subscriptionKey"
    const [region, subscriptionKey] = apiKey.split(':')

    if (!region || !subscriptionKey) {
      throw new Error('Azure API key must be in format "region:subscriptionKey"')
    }

    const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${body.language || 'en-US'}">
        <voice name="${body.voice}">
          <prosody rate="${body.rate || 'medium'}" pitch="${body.pitch ? (body.pitch > 0 ? '+' : '') + body.pitch + 'Hz' : 'medium'}">
            ${body.text || body.input || ''}
          </prosody>
        </voice>
      </speak>
    `

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': body.output_format || 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'KAZI-TTS'
      },
      body: ssml
    })

    if (!response.ok) {
      throw new Error(`Azure Speech API error: ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    logger.error('Azure TTS error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      voice: body.voice,
      language: body.language
    });
    return NextResponse.json(
      { error: `Azure TTS failed: ${error.message}` },
      { status: 500 }
    )
  }
}

// GET endpoint for voice model information
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider')

  const voiceModels = {
    openai: [
      { id: 'alloy', name: 'Alloy', description: 'Neutral and versatile voice' },
      { id: 'echo', name: 'Echo', description: 'Clear and professional male voice' },
      { id: 'fable', name: 'Fable', description: 'Storytelling and narrative voice' },
      { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative male voice' },
      { id: 'nova', name: 'Nova', description: 'Natural and expressive female voice' },
      { id: 'shimmer', name: 'Shimmer', description: 'Warm and engaging female voice' }
    ],
    elevenlabs: [
      { id: 'rachel', name: 'Rachel', description: 'Professional female voice' },
      { id: 'domi', name: 'Domi', description: 'Confident female voice' },
      { id: 'bella', name: 'Bella', description: 'Friendly female voice' },
      { id: 'antoni', name: 'Antoni', description: 'Professional male voice' },
      { id: 'elli', name: 'Elli', description: 'Expressive female voice' },
      { id: 'josh', name: 'Josh', description: 'Casual male voice' }
    ],
    azure: [
      { id: 'en-US-AriaNeural', name: 'Aria', description: 'Professional female voice' },
      { id: 'en-US-JennyNeural', name: 'Jenny', description: 'Friendly female voice' },
      { id: 'en-US-GuyNeural', name: 'Guy', description: 'Professional male voice' },
      { id: 'en-US-DavisNeural', name: 'Davis', description: 'Confident male voice' }
    ]
  }

  if (provider && voiceModels[provider as keyof typeof voiceModels]) {
    return NextResponse.json({
      provider,
      voices: voiceModels[provider as keyof typeof voiceModels]
    })
  }

  return NextResponse.json({
    providers: Object.keys(voiceModels),
    models: voiceModels
  })
}