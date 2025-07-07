import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export interface DesignRequest {
  prompt: string
  style: string
  industry?: string
  colorScheme?: string
  targetAudience?: string
}

export interface DesignResponse {
  concept: string
  colorPalette: string[]
  typography: string
  layout: string
  components: string[]
  score: number
}

export async function generateDesignConcept(request: DesignRequest): Promise<DesignResponse> {
  const prompt = `As an expert UI/UX designer and brand strategist, create a comprehensive design concept for:
  
  **Prompt**: ${request.prompt}
  **Style**: ${request.style}
  **Industry**: ${request.industry || 'General'}
  **Color Scheme**: ${request.colorScheme || 'Flexible'}
  **Target Audience**: ${request.targetAudience || 'General'}
  
  Please provide a detailed response in JSON format with the following structure:
  {
    "concept": "Brief description of the design concept",
    "colorPalette": ["#color1", "#color2", "#color3"],
    "typography": "Typography recommendations",
    "layout": "Layout structure description",
    "components": ["component1", "component2", "component3"],
    "score": 85
  }`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        concept: parsed.concept || 'Modern, clean design concept',
        colorPalette: parsed.colorPalette || ['#3B82F6', '#10B981', '#F59E0B'],
        typography: parsed.typography || 'Clean, modern typography',
        layout: parsed.layout || 'Responsive grid layout',
        components: parsed.components || ['Header', 'Content', 'Footer'],
        score: parsed.score || 85
      }
    }
    
    // Fallback response
    return {
      concept: 'Modern, clean design concept based on your requirements',
      colorPalette: ['#3B82F6', '#10B981', '#F59E0B'],
      typography: 'Clean, modern typography with good readability',
      layout: 'Responsive grid layout with clear hierarchy',
      components: ['Header', 'Navigation', 'Content Area', 'Footer'],
      score: 85
    }
  } catch (error) {
    console.error('Error generating design concept:', error)
    
    // Return fallback response
    return {
      concept: 'Modern, clean design concept',
      colorPalette: ['#3B82F6', '#10B981', '#F59E0B'],
      typography: 'Clean, modern typography',
      layout: 'Responsive grid layout',
      components: ['Header', 'Content', 'Footer'],
      score: 80
    }
  }
}
