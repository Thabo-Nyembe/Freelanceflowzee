/**
 * AI Service Configuration
 * Handles OpenAI integration for video transcription and content analysis
 */

import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Anthropic from '@anthropic-ai/sdk'

// Initialize AI clients
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// AI Model configurations
export const AI_MODELS = {
  openai: {
    chat: 'gpt-4-turbo-preview',
    vision: 'gpt-4-vision-preview',
    embedding: 'text-embedding-3-small',
    whisper: 'whisper-1',
  },
  google: {
    chat: 'gemini-pro',
    vision: 'gemini-pro-vision',
  },
  anthropic: {
    chat: 'claude-3-opus-20240229',
  },
}

// Feature-specific configurations
export const AI_FEATURES = {
  videoAnalysis: {
    provider: 'openai',
    model: AI_MODELS.openai.vision,
    maxDuration: 300, // 5 minutes
    chunkSize: 60, // 1 minute chunks
  },
  transcription: {
    provider: 'openai',
    model: AI_MODELS.openai.whisper,
    languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'ja', 'ko', 'zh'],
  },
  contentAnalysis: {
    provider: 'anthropic',
    model: AI_MODELS.anthropic.chat,
    features: ['quality', 'engagement', 'clarity', 'pacing'],
  },
  insights: {
    provider: 'google',
    model: AI_MODELS.google.chat,
    analysisTypes: ['technical', 'presentation', 'content', 'audience'],
  },
}

// Rate limiting configuration
export const RATE_LIMITS = {
  videoAnalysis: {
    tokensPerMinute: 100000,
    requestsPerMinute: 50,
  },
  transcription: {
    minutesPerHour: 60,
    requestsPerMinute: 30,
  },
  contentAnalysis: {
    tokensPerMinute: 80000,
    requestsPerMinute: 40,
  },
  insights: {
    tokensPerMinute: 60000,
    requestsPerMinute: 30,
  },
}

// Error messages
export const AI_ERROR_MESSAGES = {
  rateLimitExceeded: 'Rate limit exceeded. Please try again later.',
  invalidInput: 'Invalid input provided. Please check your request.',
  processingError: 'Error processing your request. Please try again.',
  unsupportedLanguage: 'The specified language is not supported.',
  videoTooLong: 'Video duration exceeds the maximum allowed length.',
  missingApiKey: process.env.API_KEY || 'demo-key',
}

// Prompt templates
export const PROMPT_TEMPLATES = {
  videoAnalysis: `Analyze the following video content:
- Assess overall quality and production value
- Evaluate audience engagement factors
- Check content clarity and structure
- Review pacing and timing
- Identify key topics and themes
- Generate relevant tags
- Provide specific improvement recommendations`,

  contentInsights: `Generate insights for the following content:
- Identify main strengths and weaknesses
- Analyze presentation style and delivery
- Evaluate technical aspects
- Assess audience engagement
- Provide actionable recommendations
- Suggest optimization strategies`,

  chapterGeneration: `Generate chapters for the following video:
- Identify major topic transitions
- Create clear and concise titles
- Include timestamp information
- Add brief summaries
- Extract key terms and concepts
- Maintain logical flow and structure`,
}

// Export configuration object
export const aiConfig = {
  models: AI_MODELS,
  features: AI_FEATURES,
  rateLimits: RATE_LIMITS,
  errorMessages: AI_ERROR_MESSAGES,
  promptTemplates: PROMPT_TEMPLATES,
}

export interface AIConfig {
  openai: {
    apiKey: string;
    model: {
      transcription: string;
      analysis: string;
      tagging: string;
    };
    maxTokens: {
      analysis: number;
      tagging: number;
    };
  };
  features: {
    transcription: boolean;
    contentAnalysis: boolean;
    smartTagging: boolean;
    languageDetection: boolean;
  };
  transcription: {
    supportedFormats: string[];
    maxFileSizeMB: number;
    languages: string[];
    chunkSizeSeconds: number;
  };
}

export const AI_CONFIG: AIConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: {
      transcription: 'whisper-1',
      analysis: 'gpt-4-turbo-preview',
      tagging: 'gpt-3.5-turbo'
    },
    maxTokens: {
      analysis: 4000,
      tagging: 1000
    }
  },
  features: {
    transcription: true,
    contentAnalysis: true,
    smartTagging: true,
    languageDetection: true
  },
  transcription: {
    supportedFormats: ['mp3', 'mp4', 'm4a', 'wav', 'webm'],
    maxFileSizeMB: 25, // OpenAI Whisper limit
    languages: [
      'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh',
      'ar', 'hi', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi'
    ],
    chunkSizeSeconds: 300 // 5 minutes per chunk
  }
};

export const AI_PROMPTS = {
  contentAnalysis: `
Analyze the following video transcription and provide insights in JSON format:

{
  "summary": "Brief 2-3 sentence summary of the video content",
  "mainTopics": ["topic1", "topic2", "topic3"],
  "category": "education|tutorial|presentation|demo|review|entertainment|business|other",
  "difficulty": "beginner|intermediate|advanced",
  "targetAudience": "developers|designers|marketers|business|general|other",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "actionItems": ["action1", "action2"],
  "sentiment": "positive|neutral|negative",
  "language": "en|es|fr|etc",
  "estimatedWatchTime": "X minutes",
  "contentType": "tutorial|presentation|demo|interview|webinar|course|other"
}

Transcription:
`,

  smartTagging: `
Generate relevant tags for this video based on its transcription and metadata. 
Return a JSON array of 8-15 tags that would help users discover this content.
Focus on: topics, technologies, skills, industries, and content type.

Example format:
["javascript", "web development", "tutorial", "react", "frontend", "programming", "beginner-friendly"]

Consider these categories:
- Technologies & Tools
- Skills & Concepts  
- Industries & Domains
- Content Types
- Difficulty Levels
- Target Audiences

Transcription and Metadata:
`,

  titleSuggestions: `
Suggest 5 compelling video titles based on the transcription and current title.
Make them engaging, SEO-friendly, and accurately descriptive.
Return as JSON array of strings.

Current title: "{currentTitle}"
Transcription preview:
`,

  chapterGeneration: `
Based on this video transcription, generate meaningful chapters with timestamps.
Identify natural breaks, topic changes, and key sections.

Return JSON format:
{
  "chapters": [
    {
      "title": "Chapter Title",
      "startTime": 0,
      "endTime": 180,
      "description": "Brief description of what's covered"
    }
  ]
}

Transcription with timestamps:
`
};

// Validation functions
export function validateAIConfig(): boolean {
  if (!AI_CONFIG.openai.apiKey) {
    console.warn('OpenAI API key not configured');
    return false;
  }
  return true;
}

export function isTranscriptionEnabled(): boolean {
  return AI_CONFIG.features.transcription && validateAIConfig();
}

export function isContentAnalysisEnabled(): boolean {
  return AI_CONFIG.features.contentAnalysis && validateAIConfig();
}

export function isSmartTaggingEnabled(): boolean {
  return AI_CONFIG.features.smartTagging && validateAIConfig();
}

// Helper functions
export function formatTranscriptionChunk(text: string, startTime: number, endTime: number) {
  return {
    text: text.trim(),
    startTime,
    endTime,
    duration: endTime - startTime
  };
}

export function validateFileForTranscription(filename: string, sizeMB: number): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (!extension || !AI_CONFIG.transcription.supportedFormats.includes(extension)) {
    return false;
  }
  
  if (sizeMB > AI_CONFIG.transcription.maxFileSizeMB) {
    return false;
  }
  
  return true;
} 