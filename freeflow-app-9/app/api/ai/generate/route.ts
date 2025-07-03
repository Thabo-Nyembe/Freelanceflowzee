import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { aiConfig } from '@/app/config/ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = await createClient()

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Auth error: ', error)
      return new NextResponse('Authentication error', { status: 401 })
    }

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { prompt, type } = await request.json()

    if (!prompt || !type) {
      return new NextResponse('Prompt and type are required', { status: 400 })
    }

    if (!aiConfig.features.generate.supportedTypes.includes(type)) {
      return new NextResponse('Unsupported content type', { status: 400 })
    }

    if (type === 'image') {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
      })

      if (!response.data || response.data.length === 0) {
        throw new Error('No image data received')
      }

      const imageUrl = response.data[0].url
      if (!imageUrl) {
        throw new Error('No image URL received')
      }

      return NextResponse.json({
        content: imageUrl,
        model: 'dall-e-3',
      })
    } else {
      const response = await openai.chat.completions.create({
        model: aiConfig.models.generate,
        messages: [
          {
            role: 'system',
            content: type === 'code'
              ? 'You are a code generator. Provide only the code without any explanation.'
              : 'You are a creative content generator. Generate high-quality content based on the prompt.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: aiConfig.modelSettings.temperature,
        max_tokens: aiConfig.modelSettings.maxTokens,
        top_p: aiConfig.modelSettings.topP,
        presence_penalty: aiConfig.modelSettings.presencePenalty,
        frequency_penalty: aiConfig.modelSettings.frequencyPenalty,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content received')
      }

      return NextResponse.json({
        content,
        model: aiConfig.models.generate,
      })
    }
  } catch (error) {
    console.error('Error: ', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}