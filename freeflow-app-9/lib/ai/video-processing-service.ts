import { VideoAnalysisData } from '@/lib/types/ai'

export async function processVideoWithAI(
  videoId: string,
  videoUrl: string
): Promise<VideoAnalysisData> {
  try {
    // Call the API endpoint for video analysis
    const response = await fetch('/api/video/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        videoId,
        videoUrl
      })
    })

    if (!response.ok) {
      throw new Error('Failed to analyze video')
    }

    const analysisData = await response.json()

    // Transform API response to VideoAnalysisData format
    return {
      engagement: analysisData.engagement || 0,
      clarity: analysisData.clarity || 0,
      pacing: analysisData.pacing || 0,
      tags: analysisData.tags || [],
      recommendations: analysisData.recommendations || [],
      volume: analysisData.volume || 0,
      noiseLevel: analysisData.noiseLevel || 0,
      contentQuality: analysisData.contentQuality || 0,
      effectiveness: analysisData.effectiveness || 0,
      audioLevel: analysisData.audioLevel || 0,
      recordingDuration: analysisData.recordingDuration || 0,
      videoUrl
    }
  } catch (error) {
    console.error('Error processing video with AI:', error)
    throw error
  }
} 