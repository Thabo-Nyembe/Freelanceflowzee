import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-GenerateTitle')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert copywriter. Your task is to generate a compelling, short title for a video based on its transcript. The title should be engaging and accurately reflect the content.',
        },
        {
          role: 'user',
          content: `Generate a title for a video with the following transcript:\n\n${transcript}`,
        },
      ],
      max_tokens: 20,
      temperature: 0.7,
    });

    const title = response.choices[0].message.content?.trim();

    return NextResponse.json({ title });
  } catch (error) {
    logger.error('Error generating title', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ error: 'Failed to generate title' }, { status: 500 });
  }
} 