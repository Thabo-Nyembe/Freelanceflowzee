/**
 * OpenAI Service Client
 * Handles transcription, content analysis, and smart tagging
 */

import OpenAI from 'openai';
import { AI_CONFIG, AI_PROMPTS, isTranscriptionEnabled, isContentAnalysisEnabled } from './config';

// Types
export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  segments?: TranscriptionSegment[];
}

export interface TranscriptionSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface ContentAnalysis {
  summary: string;
  mainTopics: string[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetAudience: string;
  keyInsights: string[];
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  language: string;
  estimatedWatchTime: string;
  contentType: string;
}

export interface SmartTags {
  tags: string[];
  confidence: number;
  categories: {
    technologies: string[];
    skills: string[];
    industries: string[];
    contentTypes: string[];
  };
}

export interface VideoChapter {
  title: string;
  startTime: number;
  endTime?: number;
  description: string;
}

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!AI_CONFIG.openai.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    openaiClient = new OpenAI({
      apiKey: AI_CONFIG.openai.apiKey,
    });
  }
  
  return openaiClient;
}

/**
 * Transcribe audio from video using OpenAI Whisper
 */
export async function transcribeVideo(audioFile: File | Buffer, options: {
    language?: string;
    prompt?: string;
    response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
    temperature?: number;
  } = {}): Promise<TranscriptionResult> {
  if (!isTranscriptionEnabled()) {
    throw new Error('Transcription service not available');
  }

  try {
    const client = getOpenAIClient();
    
    // Convert Buffer to File-like object if necessary
    let fileToUpload: unknown;
    if (audioFile instanceof Buffer) {
      fileToUpload = new File([audioFile], 'audio.mp3', { type: 'audio/mpeg' });
    } else {
      fileToUpload = audioFile;
    }

    const transcription = await client.audio.transcriptions.create({
      file: fileToUpload,
      model: AI_CONFIG.openai.model.transcription,
      language: options.language,
      prompt: options.prompt,
      response_format: options.response_format || 'verbose_json',
      temperature: options.temperature || 0,
    });

    // Handle different response formats
    if (typeof transcription === 'string') {
      return { text: transcription };
    }

    // Cast to any to access extended properties from verbose_json
    const verboseTranscription = transcription as any;

    return {
      text: verboseTranscription.text,
      language: verboseTranscription.language,
      duration: verboseTranscription.duration,
      segments: verboseTranscription.segments as TranscriptionSegment[],
    };

  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Analyze video content using GPT
 */
export async function analyzeVideoContent(transcription: string, metadata: {
    title?: string;
    description?: string;
    duration?: number;
  } = {}): Promise<ContentAnalysis> {
  if (!isContentAnalysisEnabled()) {
    throw new Error('Content analysis service not available');
  }

  try {
    const client = getOpenAIClient();
    
    const prompt = `${AI_PROMPTS.contentAnalysis}
    
Video Title: ${metadata.title || 'N/A'}
Video Description: ${metadata.description || 'N/A'}
Video Duration: ${metadata.duration ? `${Math.round(metadata.duration / 60)} minutes` : 'N/A'}

${transcription}`;

    const response = await client.chat.completions.create({
      model: AI_CONFIG.openai.model.analysis,
      messages: [
        {
          role: 'system',
          content: 'You are an expert video content analyst. Analyze video content and provide structured insights in valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: AI_CONFIG.openai.maxTokens.analysis,
      temperature: 0.3,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No analysis result received');
    }

    // Parse JSON response
    try {
      const analysis = JSON.parse(result) as ContentAnalysis;
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', result);
      throw new Error('Invalid analysis response format');
    }

  } catch (error) {
    console.error('Content analysis error:', error);
    throw new Error(`Content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate smart tags for video
 */
export async function generateSmartTags(transcription: string, metadata: {
    title?: string;
    description?: string;
    category?: string;
  } = {}): Promise<string[]> {
  if (!isContentAnalysisEnabled()) {
    throw new Error('Smart tagging service not available');
  }

  try {
    const client = getOpenAIClient();
    
    const prompt = `${AI_PROMPTS.smartTagging}

Title: ${metadata.title || 'N/A'}
Description: ${metadata.description || 'N/A'}
Category: ${metadata.category || 'N/A'}

Transcription:
${transcription.slice(0, 3000)}...`; // Limit transcription length

    const response = await client.chat.completions.create({
      model: AI_CONFIG.openai.model.tagging,
      messages: [
        {
          role: 'system',
          content: 'You are an expert content tagger. Generate relevant, discoverable tags for video content. Return only valid JSON array.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: AI_CONFIG.openai.maxTokens.tagging,
      temperature: 0.4,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No tagging result received');
    }

    // Parse JSON response
    try {
      const tags = JSON.parse(result) as string[];
      return tags.filter(tag => tag && typeof tag === 'string').slice(0, 15);
    } catch (parseError) {
      console.error('Failed to parse tags JSON:', result);
      throw new Error('Invalid tagging response format');
    }

  } catch (error) {
    console.error('Smart tagging error:', error);
    throw new Error(`Smart tagging failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate video chapters from transcription
 */
export async function generateVideoChapters(transcription: string, duration: number): Promise<VideoChapter[]> {
  if (!isContentAnalysisEnabled()) {
    throw new Error('Chapter generation service not available');
  }

  try {
    const client = getOpenAIClient();
    
    const prompt = `${AI_PROMPTS.chapterGeneration}

Video Duration: ${Math.round(duration / 60)} minutes (${duration} seconds)

${transcription}`;

    const response = await client.chat.completions.create({
      model: AI_CONFIG.openai.model.analysis,
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating video chapters. Analyze the transcription and create meaningful chapter breaks. Return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: AI_CONFIG.openai.maxTokens.analysis,
      temperature: 0.2,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No chapter generation result received');
    }

    // Parse JSON response
    try {
      const parsed = JSON.parse(result);
      return parsed.chapters as VideoChapter[];
    } catch (parseError) {
      console.error('Failed to parse chapters JSON:', result);
      throw new Error('Invalid chapter generation response format');
    }

  } catch (error) {
    console.error('Chapter generation error:', error);
    throw new Error(`Chapter generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate title suggestions
 */
export async function generateTitleSuggestions(transcription: string, currentTitle: string): Promise<string[]> {
  if (!isContentAnalysisEnabled()) {
    throw new Error('Title suggestion service not available');
  }

  try {
    const client = getOpenAIClient();
    
    const prompt = AI_PROMPTS.titleSuggestions
      .replace('{currentTitle}', currentTitle) + 
      `\n\n${transcription.slice(0, 2000)}...`;

    const response = await client.chat.completions.create({
      model: AI_CONFIG.openai.model.tagging,
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating engaging video titles. Generate compelling, SEO-friendly titles. Return only valid JSON array.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No title suggestions received');
    }

    // Parse JSON response
    try {
      const titles = JSON.parse(result) as string[];
      return titles.filter(title => title && typeof title === 'string').slice(0, 5);
    } catch (parseError) {
      console.error('Failed to parse titles JSON:', result);
      throw new Error('Invalid title suggestions response format');
    }

  } catch (error) {
    console.error('Title suggestion error:', error);
    throw new Error(`Title suggestions failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Health check for AI services
 */
export async function healthCheck(): Promise<{
  transcription: boolean;
  contentAnalysis: boolean;
  smartTagging: boolean;
  error?: string;
}> {
  try {
    const client = getOpenAIClient();
    
    // Simple test call to verify API access
    await client.models.list();
    
    return {
      transcription: isTranscriptionEnabled(),
      contentAnalysis: isContentAnalysisEnabled(),
      smartTagging: isContentAnalysisEnabled(),
    };
  } catch (error) {
    return {
      transcription: false,
      contentAnalysis: false,
      smartTagging: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 