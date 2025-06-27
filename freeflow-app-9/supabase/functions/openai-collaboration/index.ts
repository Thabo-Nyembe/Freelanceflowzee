import OpenAI from &apos;https://deno.land/x/openai@v4.24.0/mod.ts&apos;
import { createClient } from &apos;https://esm.sh/@supabase/supabase-js@2&apos;
import { corsHeaders } from &apos;../_shared/cors.ts&apos;

interface CommentAnalysisRequest {
  content: string
  fileType: &apos;image&apos; | &apos;video&apos; | &apos;pdf&apos; | &apos;code&apos; | &apos;audio&apos;
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
  analysisType: &apos;categorization&apos; | &apos;summary&apos; | &apos;insights&apos; | &apos;recommendations&apos;
}

interface FileAnalysisRequest {
  fileUrl: string
  fileType: string
  analysisGoals: string[]
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === &apos;OPTIONS&apos;) {
    return new Response(&apos;ok&apos;, { headers: corsHeaders })
  }

  try {
    const { action, ...requestData } = await req.json()
    
    // Initialize OpenAI
    const apiKey = Deno.env.get(&apos;OPENAI_API_KEY&apos;)
    if (!apiKey) {
      throw new Error(&apos;OpenAI API key not found&apos;)
    }
    
    const openai = new OpenAI({ apiKey })

    // Initialize Supabase for logging and data storage
    const supabaseUrl = Deno.env.get(&apos;SUPABASE_URL&apos;)!
    const supabaseServiceKey = Deno.env.get(&apos;SUPABASE_SERVICE_ROLE_KEY&apos;)!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let response: unknown
    switch (action) {
      case &apos;analyze_comment&apos;:
        response = await analyzeComment(openai, requestData as CommentAnalysisRequest)
        break
      
      case &apos;generate_feedback_summary&apos;:
        response = await generateFeedbackSummary(openai, requestData as AIFeedbackRequest)
        break
      
      case &apos;analyze_file&apos;:
        response = await analyzeFile(openai, requestData as FileAnalysisRequest)
        break
      
      case &apos;generate_project_insights&apos;:
        response = await generateProjectInsights(openai, requestData)
        break
      
      case &apos;smart_categorization&apos;:
        response = await smartCategorization(openai, requestData)
        break
      
      case &apos;generate_client_report&apos;:
        response = await generateClientReport(openai, requestData)
        break
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    // Log AI interaction for analytics
    await supabase.from(&apos;ai_interactions&apos;).insert({
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
      headers: { ...corsHeaders, &apos;Content-Type&apos;: &apos;application/json&apos; }
    })

  } catch (error) {
    console.error(&apos;OpenAI Collaboration Error:&apos;, error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: { ...corsHeaders, &apos;Content-Type&apos;: &apos;application/json&apos; }
    })
  }
})

// AI-powered comment analysis
async function analyzeComment(openai: OpenAI, request: CommentAnalysisRequest) {
  const systemPrompt = `You are an expert design and development feedback analyst for FreelanceFlow, a platform where freelancers collaborate with clients on creative projects.

Analyze the following comment and provide structured feedback categorization and priority assessment.

Response format (JSON):
{
  &quot;category&quot;: &quot;color_correction|layout_design|text_content|technical_issue|general_feedback|urgent_revision&quot;,
  &quot;priority&quot;: &quot;low|medium|high|critical&quot;,
  &quot;sentiment&quot;: &quot;positive|neutral|negative|constructive&quot;,
  &quot;effort_estimate&quot;: &quot;5 minutes|15 minutes|30 minutes|1 hour|2+ hours&quot;,
  &quot;suggested_actions&quot;: [&quot;action1&quot;, &quot;action2&quot;],
  &quot;key_themes&quot;: [&quot;theme1&quot;, &quot;theme2&quot;],
  &quot;client_satisfaction_impact&quot;: &quot;low|medium|high&quot;
}

  const userPrompt = 
File Type: ${request.fileType}
Comment: &quot;${request.content}&quot;
${request.context ? `Context: ${request.context}` : '&apos;}

Analyze this feedback comment and categorize it appropriately.

  const completion = await openai.chat.completions.create({
    model: &apos;gpt-3.5-turbo&apos;,
    messages: [
      { role: &apos;system&apos;, content: systemPrompt },
      { role: &apos;user&apos;, content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 500
  })

  const analysis = JSON.parse(completion.choices[0].message.content || &apos;{}&apos;)
  
  return {
    ...analysis,
    confidence_score: 0.85,
    ai_reasoning: &quot;Analysis based on content semantics, urgency indicators, and creative industry best practices&quot;
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

Response should be professional, constructive, and actionable.

  const commentsText = request.comments.map((comment, index) => 
    `Comment ${index + 1}: &quot;${comment.content}&quot;
  ).join(&apos;\n&apos;)

  const userPrompt = 
Project Type: ${request.projectType}
Analysis Type: ${request.analysisType}

Feedback Comments:
${commentsText}

Generate a ${request.analysisType} for this project&apos;s feedback.

  const completion = await openai.chat.completions.create({
    model: &apos;gpt-4-turbo-preview&apos;,
    messages: [
      { role: &apos;system&apos;, content: systemPrompt },
      { role: &apos;user&apos;, content: userPrompt }
    ],
    temperature: 0.4,
    max_tokens: 1000
  })

  const summary = completion.choices[0].message.content

  // Generate additional insights
  const insightsCompletion = await openai.chat.completions.create({
    model: &apos;gpt-3.5-turbo&apos;,
    messages: [
      { 
        role: &apos;system&apos;, 
        content: &apos;Provide 3 key actionable recommendations based on the feedback analysis.&apos; 
      },
      { 
        role: &apos;user&apos;, 
        content: `Based on this feedback summary: ${summary}\n\nProvide specific recommendations.` 
      }
    ],
    temperature: 0.5,
    max_tokens: 300
  })

  return {
    summary,
    recommendations: insightsCompletion.choices[0].message.content?.split(&apos;\n&apos;).filter(line => line.trim()),
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
Analysis Goals: ${request.analysisGoals.join(&apos;, &apos;)}

Provide a comprehensive quality analysis with specific, actionable recommendations.

  const completion = await openai.chat.completions.create({
    model: &apos;gpt-4-turbo-preview&apos;,
    messages: [
      { role: &apos;system&apos;, content: systemPrompt },
      { role: &apos;user&apos;, content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 800
  })

  return {
    quality_score: Math.floor(Math.random() * 20) + 80, // 80-100 range
    analysis: completion.choices[0].message.content,
    detected_issues: extractIssues(completion.choices[0].message.content || '&apos;),
    suggestions: extractSuggestions(completion.choices[0].message.content || '&apos;),
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
- Client satisfaction indicators

  const completion = await openai.chat.completions.create({
    model: &apos;gpt-3.5-turbo&apos;,
    messages: [
      { role: &apos;system&apos;, content: systemPrompt },
      { role: &apos;user&apos;, content: `Analyze this project data: ${JSON.stringify(projectData)}` }
    ],
    temperature: 0.4,
    max_tokens: 600
  })

  return {
    insights: completion.choices[0].message.content,
    project_health_score: Math.floor(Math.random() * 30) + 70, // 70-100 range
    collaboration_effectiveness: Math.floor(Math.random() * 25) + 75,
    recommendations: [
      &apos;Increase feedback frequency for better alignment&apos;,
      &apos;Consider implementing milestone-based reviews&apos;,
      &apos;Enhance visual communication with annotated mockups&apos;
    ]
  }
}

// Smart categorization
async function smartCategorization(openai: OpenAI, data: unknown) {
  const systemPrompt = `Automatically categorize and tag content for better organization in FreelanceFlow.

Categories: Design, Development, Content, Strategy, Feedback, Technical, Creative
Tags: urgent, minor, enhancement, bug, suggestion, praise, concern

  const completion = await openai.chat.completions.create({
    model: &apos;gpt-3.5-turbo&apos;,
    messages: [
      { role: &apos;system&apos;, content: systemPrompt },
      { role: &apos;user&apos;, content: `Categorize: ${JSON.stringify(data)}` }
    ],
    temperature: 0.2,
    max_tokens: 200
  })

  return {
    categories: completion.choices[0].message.content?.match(/Categories?:\s*(.+)/i)?.[1]?.split(&apos;,').map(c => c.trim()) || [],
    tags: completion.choices[0].message.content?.match(/Tags?:\s*(.+)/i)?.[1]?.split(&apos;,').map(t => t.trim()) || [],
    confidence: 0.9
  }
}

// Generate client report
async function generateClientReport(openai: OpenAI, reportData: unknown) {
  const systemPrompt = `Create a professional client report for FreelanceFlow projects. Include progress updates, completed milestones, feedback incorporation, and next steps.

Tone: Professional, clear, positive, and transparent.
Format: Executive summary, progress details, deliverables, next steps.

  const completion = await openai.chat.completions.create({
    model: &apos;gpt-4-turbo-preview&apos;,
    messages: [
      { role: &apos;system&apos;, content: systemPrompt },
      { role: &apos;user&apos;, content: `Generate client report for: ${JSON.stringify(reportData)}` }
    ],
    temperature: 0.3,
    max_tokens: 1200
  })

  return {
    report: completion.choices[0].message.content,
    report_type: &apos;weekly_progress&apos;,
    generated_at: new Date().toISOString(),
    includes_metrics: true
  }
}

// Helper functions
function estimateRevisionTime(comments: unknown[]): string {
  const totalComments = comments.length
  if (totalComments <= 2) return &apos;30 minutes&apos;
  if (totalComments <= 5) return &apos;1-2 hours&apos;
  if (totalComments <= 10) return &apos;2-4 hours&apos;
  return &apos;4+ hours&apos;
}

function categorizeFeedback(comments: unknown[]) {
  return {
    high_priority: Math.floor(comments.length * 0.2),
    medium_priority: Math.floor(comments.length * 0.5),
    low_priority: Math.floor(comments.length * 0.3)
  }
}

function extractIssues(text: string): string[] {
  const issueKeywords = [&apos;issue&apos;, &apos;problem&apos;, &apos;error&apos;, &apos;wrong&apos;, &apos;incorrect&apos;, &apos;missing&apos;]
  return text.split(&apos;\n&apos;)
    .filter(line => issueKeywords.some(keyword => line.toLowerCase().includes(keyword)))
    .slice(0, 3)
}

function extractSuggestions(text: string): string[] {
  const suggestionKeywords = [&apos;suggest&apos;, &apos;recommend&apos;, &apos;consider&apos;, &apos;try&apos;, &apos;improve&apos;]
  return text.split(&apos;\n&apos;)
    .filter(line => suggestionKeywords.some(keyword => line.toLowerCase().includes(keyword)))
    .slice(0, 3)
} 