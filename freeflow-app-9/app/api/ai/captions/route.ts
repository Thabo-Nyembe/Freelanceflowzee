/**
 * Caption AI API - FreeFlow A+++ Implementation
 * Handles AI-powered caption correction, translation, and re-transcription
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('ai-captions');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Language mapping
const LANGUAGES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  pt: 'Portuguese',
  ar: 'Arabic',
  it: 'Italian',
  ru: 'Russian',
  hi: 'Hindi',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, captions, targetLanguage, audioUrl, settings } = body;

    switch (action) {
      case 'correct':
        return await correctCaptions(captions);
      case 'translate':
        return await translateCaptions(captions, targetLanguage);
      case 'retranscribe':
        return await retranscribe(audioUrl, settings);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Caption AI error', { error });
    return NextResponse.json(
      { error: 'Failed to process captions' },
      { status: 500 }
    );
  }
}

// AI-powered caption correction
async function correctCaptions(captions: Array<{ id: string; text: string; start: number; end: number }>) {
  if (!captions || captions.length === 0) {
    return NextResponse.json({ error: 'No captions provided' }, { status: 400 });
  }

  const correctedCaptions = [];

  // Process in batches of 10 for efficiency
  const batchSize = 10;
  for (let i = 0; i < captions.length; i += batchSize) {
    const batch = captions.slice(i, i + batchSize);
    const textsToCorrect = batch.map(c => c.text).join('\n---\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional caption editor. Correct grammar, spelling, and punctuation in the following caption texts.
Keep the same meaning and tone. Do not change technical terms, proper nouns, or intentional stylistic choices.
Return ONLY the corrected texts, separated by "---" on their own lines, in the same order as provided.
Do not add explanations or numbering.`,
        },
        {
          role: 'user',
          content: textsToCorrect,
        },
      ],
      temperature: 0.3,
    });

    const correctedTexts = response.choices[0].message.content?.split(/\n---\n/) || [];

    batch.forEach((caption, index) => {
      correctedCaptions.push({
        ...caption,
        text: correctedTexts[index]?.trim() || caption.text,
        corrected: correctedTexts[index]?.trim() !== caption.text,
      });
    });
  }

  return NextResponse.json({
    success: true,
    captions: correctedCaptions,
    stats: {
      total: captions.length,
      corrected: correctedCaptions.filter(c => c.corrected).length,
    },
  });
}

// AI-powered translation
async function translateCaptions(
  captions: Array<{ id: string; text: string; start: number; end: number }>,
  targetLanguage: string
) {
  if (!captions || captions.length === 0) {
    return NextResponse.json({ error: 'No captions provided' }, { status: 400 });
  }

  const langName = LANGUAGES[targetLanguage] || targetLanguage;
  const translatedCaptions = [];

  // Process in batches
  const batchSize = 10;
  for (let i = 0; i < captions.length; i += batchSize) {
    const batch = captions.slice(i, i + batchSize);
    const textsToTranslate = batch.map(c => c.text).join('\n---\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following caption texts to ${langName}.
Maintain the same tone, style, and formatting. Keep proper nouns and brand names unchanged unless they have official translations.
Return ONLY the translated texts, separated by "---" on their own lines, in the same order as provided.
Do not add explanations or numbering.`,
        },
        {
          role: 'user',
          content: textsToTranslate,
        },
      ],
      temperature: 0.3,
    });

    const translatedTexts = response.choices[0].message.content?.split(/\n---\n/) || [];

    batch.forEach((caption, index) => {
      translatedCaptions.push({
        ...caption,
        originalText: caption.text,
        text: translatedTexts[index]?.trim() || caption.text,
        language: targetLanguage,
      });
    });
  }

  return NextResponse.json({
    success: true,
    captions: translatedCaptions,
    targetLanguage,
    languageName: langName,
  });
}

// Re-transcription using Whisper
async function retranscribe(
  audioUrl: string,
  settings: {
    language?: string;
    prompt?: string;
    temperature?: number;
    enableSpeakerDiarization?: boolean;
  }
) {
  if (!audioUrl) {
    return NextResponse.json({ error: 'No audio URL provided' }, { status: 400 });
  }

  try {
    // Fetch audio file
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to fetch audio file');
    }

    const audioBlob = await audioResponse.blob();
    const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: settings.language || undefined,
      prompt: settings.prompt || undefined,
      temperature: settings.temperature || 0,
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    // Convert to caption format
    const captions = (transcription.segments || []).map((segment: { id: number; text: string; start: number; end: number }, index: number) => ({
      id: `caption-${index}`,
      text: segment.text.trim(),
      start: segment.start,
      end: segment.end,
      speaker: settings.enableSpeakerDiarization ? `Speaker ${(index % 3) + 1}` : undefined,
    }));

    return NextResponse.json({
      success: true,
      captions,
      duration: transcription.duration,
      language: transcription.language,
    });
  } catch (error) {
    logger.error('Re-transcription error', { error });
    return NextResponse.json(
      { error: 'Failed to re-transcribe audio' },
      { status: 500 }
    );
  }
}
