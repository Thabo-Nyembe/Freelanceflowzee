/**
 * AI Service Configuration
 * Handles OpenAI integration for video transcription and content analysis
 */

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