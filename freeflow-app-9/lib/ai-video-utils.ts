/**
 * AI Video Generation Utilities
 * Templates, helpers, and mock data for AI video generation
 */

import {
  VideoTemplate,
  VideoStyle,
  VideoFormat,
  AIPromptSuggestion,
  VoiceOption,
  MusicTrack
} from './ai-video-types'

// Video Templates Library
export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Highlight your product with stunning visuals and smooth transitions',
    style: 'professional',
    format: 'landscape',
    duration: 30,
    thumbnail: '/templates/product-showcase.jpg',
    premium: false,
    tags: ['product', 'commercial', 'marketing'],
    features: ['3D animations', 'Product focus', 'Call-to-action'],
    scenes: 4,
    musicIncluded: true,
    voiceoverIncluded: true
  },
  {
    id: 'social-media-reel',
    name: 'Social Media Reel',
    description: 'Vertical video optimized for Instagram, TikTok, and YouTube Shorts',
    style: 'social-media',
    format: 'portrait',
    duration: 15,
    thumbnail: '/templates/social-reel.jpg',
    premium: false,
    tags: ['social', 'viral', 'trending'],
    features: ['Fast-paced', 'Captions', 'Trending music'],
    scenes: 5,
    musicIncluded: true,
    voiceoverIncluded: false
  },
  {
    id: 'explainer-video',
    name: 'Explainer Video',
    description: 'Educational content with clear messaging and engaging visuals',
    style: 'explainer',
    format: 'landscape',
    duration: 90,
    thumbnail: '/templates/explainer.jpg',
    premium: true,
    tags: ['education', 'tutorial', 'informative'],
    features: ['Animated graphics', 'Step-by-step', 'Professional voiceover'],
    scenes: 6,
    musicIncluded: true,
    voiceoverIncluded: true
  },
  {
    id: 'cinematic-intro',
    name: 'Cinematic Intro',
    description: 'Hollywood-style intro with dramatic effects and music',
    style: 'cinematic',
    format: 'widescreen',
    duration: 20,
    thumbnail: '/templates/cinematic.jpg',
    premium: true,
    tags: ['intro', 'cinematic', 'professional'],
    features: ['Cinematic effects', 'Epic music', 'Logo reveal'],
    scenes: 3,
    musicIncluded: true,
    voiceoverIncluded: false
  },
  {
    id: 'testimonial',
    name: 'Customer Testimonial',
    description: 'Build trust with authentic customer stories',
    style: 'professional',
    format: 'landscape',
    duration: 45,
    thumbnail: '/templates/testimonial.jpg',
    premium: false,
    tags: ['testimonial', 'social-proof', 'marketing'],
    features: ['Interview style', 'B-roll footage', 'Subtle music'],
    scenes: 4,
    musicIncluded: true,
    voiceoverIncluded: true
  },
  {
    id: 'tutorial',
    name: 'Tutorial Video',
    description: 'Step-by-step guide with screen recording and annotations',
    style: 'tutorial',
    format: 'landscape',
    duration: 120,
    thumbnail: '/templates/tutorial.jpg',
    premium: false,
    tags: ['tutorial', 'education', 'how-to'],
    features: ['Screen recording', 'Annotations', 'Chapter markers'],
    scenes: 8,
    musicIncluded: true,
    voiceoverIncluded: true
  },
  {
    id: 'ad-campaign',
    name: 'Advertisement',
    description: 'High-impact commercial for products or services',
    style: 'advertisement',
    format: 'square',
    duration: 30,
    thumbnail: '/templates/ad.jpg',
    premium: true,
    tags: ['ad', 'commercial', 'marketing'],
    features: ['Attention-grabbing', 'CTA overlay', 'Brand focused'],
    scenes: 5,
    musicIncluded: true,
    voiceoverIncluded: true
  },
  {
    id: 'animated-story',
    name: 'Animated Story',
    description: 'Engaging animated narrative with characters and motion graphics',
    style: 'animated',
    format: 'landscape',
    duration: 60,
    thumbnail: '/templates/animated.jpg',
    premium: true,
    tags: ['animation', 'story', 'creative'],
    features: ['Character animation', 'Motion graphics', 'Storytelling'],
    scenes: 6,
    musicIncluded: true,
    voiceoverIncluded: true
  }
]

// AI Prompt Suggestions
export const PROMPT_SUGGESTIONS: AIPromptSuggestion[] = [
  {
    id: 'tech-product',
    category: 'Product Launch',
    prompt: 'A sleek smartphone floating in space with glowing particles, rotating slowly to reveal its features, premium lighting',
    style: 'cinematic',
    estimatedDuration: 15,
    complexity: 'moderate',
    tags: ['tech', 'product', 'premium']
  },
  {
    id: 'nature-scene',
    category: 'Nature & Travel',
    prompt: 'Aerial view of a pristine beach at sunset, waves gently rolling, palm trees swaying, golden hour lighting',
    style: 'cinematic',
    estimatedDuration: 20,
    complexity: 'simple',
    tags: ['nature', 'travel', 'relaxing']
  },
  {
    id: 'food-showcase',
    category: 'Food & Beverage',
    prompt: 'Close-up of a gourmet burger being assembled, fresh ingredients falling in slow motion, professional food photography style',
    style: 'professional',
    estimatedDuration: 10,
    complexity: 'moderate',
    tags: ['food', 'culinary', 'appetizing']
  },
  {
    id: 'fitness-motivation',
    category: 'Fitness & Sports',
    prompt: 'Athlete running at sunrise, dynamic camera angles, inspirational atmosphere, sweat glistening, determined expression',
    style: 'cinematic',
    estimatedDuration: 30,
    complexity: 'complex',
    tags: ['fitness', 'motivation', 'sports']
  },
  {
    id: 'app-demo',
    category: 'App Showcase',
    prompt: 'Modern smartphone app interface, smooth transitions between screens, vibrant colors, user-friendly design',
    style: 'professional',
    estimatedDuration: 25,
    complexity: 'moderate',
    tags: ['app', 'ui', 'technology']
  },
  {
    id: 'real-estate',
    category: 'Real Estate',
    prompt: 'Luxury modern home interior, slow camera glide through spacious rooms, natural lighting, high-end finishes',
    style: 'professional',
    estimatedDuration: 40,
    complexity: 'complex',
    tags: ['real-estate', 'luxury', 'interior']
  }
]

// Voice Options
export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'voice-professional-male',
    name: 'James',
    language: 'English (US)',
    gender: 'male',
    accent: 'American',
    style: 'professional',
    sample: '/audio/james-sample.mp3',
    premium: false
  },
  {
    id: 'voice-professional-female',
    name: 'Sarah',
    language: 'English (US)',
    gender: 'female',
    accent: 'American',
    style: 'professional',
    sample: '/audio/sarah-sample.mp3',
    premium: false
  },
  {
    id: 'voice-casual-male',
    name: 'Mike',
    language: 'English (US)',
    gender: 'male',
    accent: 'American',
    style: 'casual',
    sample: '/audio/mike-sample.mp3',
    premium: false
  },
  {
    id: 'voice-energetic-female',
    name: 'Emma',
    language: 'English (UK)',
    gender: 'female',
    accent: 'British',
    style: 'energetic',
    sample: '/audio/emma-sample.mp3',
    premium: true
  },
  {
    id: 'voice-calm-male',
    name: 'David',
    language: 'English (UK)',
    gender: 'male',
    accent: 'British',
    style: 'calm',
    sample: '/audio/david-sample.mp3',
    premium: true
  }
]

// Music Library
export const MUSIC_LIBRARY: MusicTrack[] = [
  {
    id: 'upbeat-corporate',
    title: 'Corporate Success',
    artist: 'AudioPro',
    genre: 'Corporate',
    mood: 'Uplifting',
    duration: 120,
    tempo: 128,
    preview: '/music/corporate-success.mp3',
    premium: false,
    tags: ['corporate', 'professional', 'motivating']
  },
  {
    id: 'cinematic-epic',
    title: 'Epic Journey',
    artist: 'SoundCraft',
    genre: 'Cinematic',
    mood: 'Epic',
    duration: 180,
    tempo: 90,
    preview: '/music/epic-journey.mp3',
    premium: true,
    tags: ['cinematic', 'dramatic', 'powerful']
  },
  {
    id: 'upbeat-pop',
    title: 'Summer Vibes',
    artist: 'TrendyBeats',
    genre: 'Pop',
    mood: 'Happy',
    duration: 90,
    tempo: 140,
    preview: '/music/summer-vibes.mp3',
    premium: false,
    tags: ['pop', 'upbeat', 'energetic']
  },
  {
    id: 'ambient-calm',
    title: 'Peaceful Mind',
    artist: 'Zen Audio',
    genre: 'Ambient',
    mood: 'Calm',
    duration: 240,
    tempo: 60,
    preview: '/music/peaceful-mind.mp3',
    premium: true,
    tags: ['ambient', 'relaxing', 'meditation']
  }
]

// Video Format Specifications
export const VIDEO_FORMATS = {
  landscape: { width: 1920, height: 1080, aspectRatio: '16:9', label: 'Landscape (YouTube, Website)' },
  portrait: { width: 1080, height: 1920, aspectRatio: '9:16', label: 'Portrait (TikTok, Instagram)' },
  square: { width: 1080, height: 1080, aspectRatio: '1:1', label: 'Square (Instagram Feed)' },
  widescreen: { width: 2560, height: 1080, aspectRatio: '21:9', label: 'Widescreen (Cinematic)' },
  'vertical-story': { width: 1080, height: 1920, aspectRatio: '9:16', label: 'Stories (Instagram, Facebook)' }
} as const

// Video Quality Settings
export const QUALITY_SETTINGS = {
  draft: { bitrate: '2M', label: 'Draft (Fast Preview)', resolution: '720p' },
  standard: { bitrate: '5M', label: 'Standard (1080p)', resolution: '1080p' },
  hd: { bitrate: '10M', label: 'HD (High Quality)', resolution: '1080p' },
  '4k': { bitrate: '20M', label: '4K (Ultra HD)', resolution: '2160p' }
} as const

/**
 * Estimate video generation time based on complexity
 */
export function estimateGenerationTime(
  duration: number,
  quality: string,
  complexity: 'simple' | 'moderate' | 'complex'
): string {
  const baseTime = duration * 2 // Base: 2 seconds per video second

  const qualityMultiplier = {
    draft: 0.5,
    standard: 1,
    hd: 1.5,
    '4k': 3
  }[quality] || 1

  const complexityMultiplier = {
    simple: 1,
    moderate: 1.5,
    complex: 2.5
  }[complexity]

  const totalSeconds = baseTime * qualityMultiplier * complexityMultiplier

  if (totalSeconds < 60) {
    return `${Math.round(totalSeconds)}s`
  } else if (totalSeconds < 3600) {
    return `${Math.round(totalSeconds / 60)}min`
  } else {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.round((totalSeconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
}

/**
 * Get recommended settings based on use case
 */
export function getRecommendedSettings(style: VideoStyle) {
  const recommendations = {
    cinematic: {
      format: 'widescreen' as VideoFormat,
      quality: 'hd',
      fps: 24,
      music: 'cinematic-epic'
    },
    professional: {
      format: 'landscape' as VideoFormat,
      quality: 'hd',
      fps: 30,
      music: 'upbeat-corporate'
    },
    'social-media': {
      format: 'portrait' as VideoFormat,
      quality: 'standard',
      fps: 30,
      music: 'upbeat-pop'
    },
    advertisement: {
      format: 'square' as VideoFormat,
      quality: 'hd',
      fps: 30,
      music: 'upbeat-corporate'
    },
    tutorial: {
      format: 'landscape' as VideoFormat,
      quality: 'standard',
      fps: 30,
      music: 'ambient-calm'
    }
  }

  return recommendations[style] || recommendations.professional
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

/**
 * Format duration in seconds to readable time
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  } else {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
}
