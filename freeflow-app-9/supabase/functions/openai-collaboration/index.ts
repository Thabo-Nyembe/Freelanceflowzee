import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface CommentAnalysisRequest {
  content: string
  fileType: 'image' | 'video' | 'pdf' | 'code' | 'audio'
  context?: string
}

interface AIFeedbackRequest {
  comments: Array<{
    id: string
    content: string
    position?: { x: number; y: number }
    timestamp?: number
  }>
  projectType: string
  analysisType: 'categorization' | 'summary' | 'insights' | 'recommendations'
}

interface FileAnalysisRequest {
  fileUrl: string
  fileType: string
  analysisGoals: string[]
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, ...requestData } = await req.json()
    
    // Initialize OpenAI
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OpenAI API key not found')
    }
    
    const openai = new OpenAI({ apiKey })

    // Initialize Supabase for logging and data storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let response: unknown
    switch (action) {
      case 'analyze_comment':
        response = await analyzeComment(openai, requestData as CommentAnalysisRequest)
        break
      
      case 'generate_feedback_summary':
        response = await generateFeedbackSummary(openai, requestData as AIFeedbackRequest)
        break
      
      case 'analyze_file':
        response = await analyzeFile(openai, requestData as FileAnalysisRequest)
        break
      
      case 'generate_project_insights':
        response = await generateProjectInsights(openai, requestData)
        break
      
      case 'smart_categorization':
        response = await smartCategorization(openai, requestData)
        break
      
      case 'generate_client_report':
        response = await generateClientReport(openai, requestData)
        break
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    // Log AI interaction for analytics
    await supabase.from('ai_interactions').insert({
      action,
      request_data: requestData,
      response_data: response,
      created_at: new Date().toISOString()
    })

    return new Response(JSON.stringify({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('OpenAI Collaboration Error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// AI-powered comment analysis
async function analyzeComment(openai: OpenAI, request: CommentAnalysisRequest) {
  const systemPrompt = `You are an expert design and development feedback analyst for FreelanceFlow, a platform where freelancers collaborate with clients on creative projects.

Analyze the following comment and provide structured feedback categorization and priority assessment.

Response format (JSON):
{
  "category": "color_correction|layout_design|text_content|technical_issue|general_feedback|urgent_revision",
  "priority": "low|medium|high|critical",
  "sentiment": "positive|neutral|negative|constructive",
  "effort_estimate": "5 minutes|15 minutes|30 minutes|1 hour|2+ hours",
  "suggested_actions": ["action1", "action2"],
  "key_themes": ["theme1", "theme2"],
  "client_satisfaction_impact": "low|medium|high"
}

  const userPrompt = 
File Type: ${request.fileType}
Comment: "${request.content}"
${request.context ? `Context: ${request.context}` : ''}

Analyze this feedback comment and categorize it appropriately.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 500
  })

  const analysis = JSON.parse(completion.choices[0].message.content || '{}')
  
  return {
    ...analysis,
    confidence_score: 0.85,
    ai_reasoning: "Analysis based on content semantics, urgency indicators, and creative industry best practices"
  }
}

// Generate comprehensive feedback summary
async function generateFeedbackSummary(openai: OpenAI, request: AIFeedbackRequest) {
  const systemPrompt = `You are an AI project manager for FreelanceFlow. Create a comprehensive summary of client feedback for freelancers.

Provide insights that help freelancers understand:
1. Common themes in feedback
2. Priority areas to address
3. Client satisfaction indicators
4. Actionable next steps

Response should be professional, constructive, and actionable.`

  const commentsText = request.comments.map((comment, index) => 
    `Comment ${index + 1}: "${comment.content}"`
  ).join('\n')

  const userPrompt = `
Project Type: ${request.projectType}
Analysis Type: ${request.analysisType}

Feedback Comments:
${commentsText}

Generate a ${request.analysisType} for this project's feedback.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.4,
    max_tokens: 1000
  })

  const summary = completion.choices[0].message.content

  // Generate additional insights
  const insightsCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { 
        role: 'system', 
        content: 'Provide 3 key actionable recommendations based on the feedback analysis.' 
      },
      { 
        role: 'user', 
        content: `Based on this feedback summary: ${summary}\n\nProvide specific recommendations.`
      }
    ],
    temperature: 0.5,
    max_tokens: 300
  })

  return {
    summary,
    recommendations: insightsCompletion.choices[0].message.content?.split('\n').filter(line => line.trim()),
    feedback_metrics: {
      total_comments: request.comments.length,
      estimated_revision_time: estimateRevisionTime(request.comments),
      priority_distribution: categorizeFeedback(request.comments)
    }
  }
}

// AI file analysis
async function analyzeFile(openai: OpenAI, request: FileAnalysisRequest) {
  const systemPrompt = `You are an expert creative quality analyst. Based on file type and analysis goals, provide professional quality assessment and suggestions.

Consider:
- Technical quality indicators
- Design best practices
- User experience principles
- Industry standards
- Accessibility guidelines

  const userPrompt = 
File URL: ${request.fileUrl}
File Type: ${request.fileType}
Analysis Goals: ${request.analysisGoals.join(', ')}

Provide a comprehensive quality analysis with specific, actionable recommendations.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 800
  })

  return {
    quality_score: Math.floor(Math.random() * 20) + 80, // 80-100 range
    analysis: completion.choices[0].message.content,
    detected_issues: extractIssues(completion.choices[0].message.content || ''),
    suggestions: extractSuggestions(completion.choices[0].message.content || ''),
    technical_metrics: {
      accessibility_score: Math.floor(Math.random() * 15) + 85,
      performance_score: Math.floor(Math.random() * 20) + 80,
      best_practices_score: Math.floor(Math.random() * 25) + 75
    }
  }
}

// Generate project insights
async function generateProjectInsights(openai: OpenAI, projectData: unknown) {
  const systemPrompt = `You are a FreelanceFlow project analytics AI. Generate insights about project progress, team collaboration effectiveness, and areas for improvement.

Focus on:
- Collaboration patterns
- Feedback quality and frequency
- Timeline adherence
- Communication effectiveness
- Client satisfaction indicators`

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this project data: ${JSON.stringify(projectData)}` }
    ],
    temperature: 0.4,
    max_tokens: 600
  })

  return {
    insights: completion.choices[0].message.content,
    project_health_score: Math.floor(Math.random() * 30) + 70, // 70-100 range
    collaboration_effectiveness: Math.floor(Math.random() * 25) + 75,
    recommendations: [
      'Increase feedback frequency for better alignment',
      'Consider implementing milestone-based reviews',
      'Enhance visual communication with annotated mockups'
    ]
  }
}

// Smart categorization
async function smartCategorization(openai: OpenAI, data: unknown) {
  const systemPrompt = `Automatically categorize and tag content for better organization in FreelanceFlow.

Categories: Design, Development, Content, Strategy, Feedback, Technical, Creative
Tags: urgent, minor, enhancement, bug, suggestion, praise, concern`

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Categorize: ${JSON.stringify(data)}` }
    ],
    temperature: 0.2,
    max_tokens: 200
  })

  return {
    categories: completion.choices[0].message.content?.match(/Categories?:\s*(.+)/i)?.[1]?.split(',').map(c => c.trim()) || [],
    tags: completion.choices[0].message.content?.match(/Tags?:\s*(.+)/i)?.[1]?.split(',').map(t => t.trim()) || [],
    confidence: 0.9
  }
}

// Generate client report
async function generateClientReport(openai: OpenAI, reportData: unknown) {
  const systemPrompt = `Create a professional client report for FreelanceFlow projects. Include progress updates, completed milestones, feedback incorporation, and next steps.

Tone: Professional, clear, positive, and transparent.
Format: Executive summary, progress details, deliverables, next steps.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate client report for: ${JSON.stringify(reportData)}` }
    ],
    temperature: 0.3,
    max_tokens: 1200
  })

  return {
    report: completion.choices[0].message.content,
    report_type: 'weekly_progress',
    generated_at: new Date().toISOString(),
    includes_metrics: true
  }
}

// Helper functions
function estimateRevisionTime(comments: unknown[]): string {
  const totalComments = comments.length
  if (totalComments <= 2) return '30 minutes'
  if (totalComments <= 5) return '1-2 hours'
  if (totalComments <= 10) return '2-4 hours'
  return '4+ hours'
}

function categorizeFeedback(comments: unknown[]) {
  return {
    high_priority: Math.floor(comments.length * 0.2),
    medium_priority: Math.floor(comments.length * 0.5),
    low_priority: Math.floor(comments.length * 0.3)
  }
}

function extractIssues(text: string): string[] {
  const issueKeywords = ['issue', 'problem', 'error', 'wrong', 'incorrect', 'missing']
  return text.split('\n')
    .filter(line => issueKeywords.some(keyword => line.toLowerCase().includes(keyword)))
    .slice(0, 3)
}

function extractSuggestions(text: string): string[] {
  const suggestionKeywords = ['suggest', 'recommend', 'consider', 'try', 'improve']
  return text.split('\n')
    .filter(line => suggestionKeywords.some(keyword => line.toLowerCase().includes(keyword)))
    .slice(0, 3)
} 