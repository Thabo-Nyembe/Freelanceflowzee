interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

class OpenRouterService {
  private apiKey: string
  private baseUrl: string
  private defaultModel: string

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || ''
    this.baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
    this.defaultModel = process.env.OPENROUTER_MODEL || 'openrouter/auto'
  }

  async generateResponse(
    prompt: string, 
    context?: any,
    model?: string
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured')
    }

    try {
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: `You are an expert AI assistant for FreeflowZee, a freelance management platform. 
          Help users with business optimization, project management, client relationships, and productivity.
          Provide actionable, specific advice with clear next steps.
          ${context ? `Context: ${JSON.stringify(context)}` : ''}`
        },
        {
          role: 'user',
          content: prompt
        }
      ]

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'FreeflowZee AI Assistant'
        },
        body: JSON.stringify({
          model: model || this.defaultModel,
          messages,
          temperature: 0.7,
          max_tokens: 1500,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`)
      }

      const data: OpenRouterResponse = await response.json()
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenRouter')
      }

      return data.choices[0].message.content

    } catch (error) {
      console.error('OpenRouter service error:', error)
      throw error
    }
  }

  async generateBusinessInsights(businessData: any): Promise<string> {
    const prompt = `Analyze this freelance business data and provide actionable insights:
    
    Business Data:
    - Revenue: ${businessData.revenue || 'N/A'}
    - Active Projects: ${businessData.activeProjects || 'N/A'}
    - Client Count: ${businessData.clientCount || 'N/A'}
    - Monthly Hours: ${businessData.monthlyHours || 'N/A'}
    
    Provide 3-5 specific recommendations for growth and optimization.`

    return this.generateResponse(prompt, businessData)
  }

  async generateProjectSuggestions(projectData: any): Promise<string> {
    const prompt = `Given this project information, suggest optimizations:
    
    Project: ${projectData.title || 'Untitled'}
    Status: ${projectData.status || 'Unknown'}
    Budget: ${projectData.budget || 'N/A'}
    Deadline: ${projectData.deadline || 'N/A'}
    Progress: ${projectData.progress || 0}%
    
    Suggest ways to improve efficiency, meet deadlines, and maximize value.`

    return this.generateResponse(prompt, projectData)
  }

  async generateClientCommunication(
    type: 'email' | 'proposal' | 'update' | 'invoice',
    context: any
  ): Promise<string> {
    const prompts = {
      email: `Write a professional client email for: ${context.purpose || 'general communication'}`,
      proposal: `Create a project proposal for: ${context.projectTitle || 'new project'}`,
      update: `Write a project update email for: ${context.projectTitle || 'current project'}`,
      invoice: `Generate professional invoice communication for: ${context.projectTitle || 'completed work'}`
    }

    return this.generateResponse(prompts[type], context)
  }

  async generateMarketingContent(contentType: string, context: any): Promise<string> {
    const prompt = `Create ${contentType} content for a freelancer with these details:
    
    Services: ${context.services || 'general freelance services'}
    Target Audience: ${context.audience || 'small businesses'}
    Tone: ${context.tone || 'professional but friendly'}
    
    Make it engaging and conversion-focused.`

    return this.generateResponse(prompt, context)
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateResponse('Hello, please respond with "Connection successful"')
      return response.toLowerCase().includes('connection successful')
    } catch (error) {
      console.error('OpenRouter connection test failed:', error)
      return false
    }
  }

  // Get available models
  async getAvailableModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Failed to get OpenRouter models:', error)
      return []
    }
  }
}

// Create singleton instance
export const openRouterService = new OpenRouterService()

// React hook for using OpenRouter in components
export function useOpenRouter() {
  const generateResponse = async (prompt: string, context?: any) => {
    try {
      return await openRouterService.generateResponse(prompt, context)
    } catch (error) {
      console.error('OpenRouter hook error:', error)
      throw error
    }
  }

  const generateBusinessInsights = async (businessData: any) => {
    try {
      return await openRouterService.generateBusinessInsights(businessData)
    } catch (error) {
      console.error('Business insights error:', error)
      throw error
    }
  }

  return {
    generateResponse,
    generateBusinessInsights,
    generateProjectSuggestions: openRouterService.generateProjectSuggestions.bind(openRouterService),
    generateClientCommunication: openRouterService.generateClientCommunication.bind(openRouterService),
    generateMarketingContent: openRouterService.generateMarketingContent.bind(openRouterService),
    testConnection: openRouterService.testConnection.bind(openRouterService)
  }
}

export default OpenRouterService 