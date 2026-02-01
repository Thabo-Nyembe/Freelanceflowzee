// =====================================================
// KAZI AI Service - World-Class Database-Wired AI
// Multi-model support with persistent storage
// =====================================================

import { createAdminClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// =====================================================
// Types
// =====================================================

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'openrouter';
export type AIModel =
  | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo' | 'gpt-3.5-turbo'
  | 'claude-3-opus' | 'claude-3-sonnet' | 'claude-3-haiku'
  | 'gemini-pro' | 'gemini-pro-vision'
  | 'mixtral-8x7b' | 'llama-3-70b';

export interface AIRequest {
  id?: string;
  user_id: string;
  provider: AIProvider;
  model: AIModel;
  request_type: 'chat' | 'completion' | 'analysis' | 'generation' | 'image' | 'voice';
  prompt: string;
  system_prompt?: string;
  context?: Record<string, any>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AIResponse {
  id: string;
  request_id: string;
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  provider: AIProvider;
  latency_ms: number;
  created_at: string;
}

export interface AIAnalysisResult {
  id: string;
  user_id: string;
  analysis_type: string;
  input_data: Record<string, any>;
  result: Record<string, any>;
  confidence_score?: number;
  model_used: string;
  processing_time_ms: number;
  created_at: string;
}

export interface AIGenerationResult {
  id: string;
  user_id: string;
  generation_type: 'text' | 'image' | 'code' | 'summary' | 'translation';
  input_prompt: string;
  output: string;
  model_used: string;
  tokens_used: number;
  cost_estimate: number;
  created_at: string;
}

// =====================================================
// AI Service Class
// =====================================================

class AIService {
  private static instance: AIService;
  private _supabase: ReturnType<typeof createAdminClient> | null = null;
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private google: GoogleGenerativeAI | null = null;

  private constructor() {
    this.initializeClients();
  }

  private getSupabase() {
    if (!this._supabase) {
      this._supabase = createAdminClient();
    }
    return this._supabase;
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private initializeClients(): void {
    // Initialize OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Initialize Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }

    // Initialize Google AI
    if (process.env.GOOGLE_AI_API_KEY) {
      this.google = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    }
  }

  // =====================================================
  // Core AI Methods
  // =====================================================

  async chat(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    let response: AIResponse;

    try {
      // Log request to database
      const requestRecord = await this.logRequest(request);

      // Route to appropriate provider
      switch (request.provider) {
        case 'openai':
          response = await this.chatOpenAI(request, requestRecord.id, startTime);
          break;
        case 'anthropic':
          response = await this.chatAnthropic(request, requestRecord.id, startTime);
          break;
        case 'google':
          response = await this.chatGoogle(request, requestRecord.id, startTime);
          break;
        default:
          throw new Error(`Unsupported provider: ${request.provider}`);
      }

      // Log response to database
      await this.logResponse(response);

      // Update usage tracking
      await this.updateUsageTracking(request.user_id, response);

      return response;
    } catch (error) {
      await this.logError(request, error);
      throw error;
    }
  }

  private async chatOpenAI(
    request: AIRequest,
    requestId: string,
    startTime: number
  ): Promise<AIResponse> {
    if (!this.openai) throw new Error('OpenAI client not initialized');

    const completion = await this.openai.chat.completions.create({
      model: request.model || 'gpt-4o-mini',
      messages: [
        ...(request.system_prompt ? [{ role: 'system' as const, content: request.system_prompt }] : []),
        { role: 'user' as const, content: request.prompt },
      ],
      max_tokens: request.max_tokens || 2048,
      temperature: request.temperature || 0.7,
    });

    return {
      id: crypto.randomUUID(),
      request_id: requestId,
      content: completion.choices[0]?.message?.content || '',
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens || 0,
        completion_tokens: completion.usage?.completion_tokens || 0,
        total_tokens: completion.usage?.total_tokens || 0,
      },
      model: completion.model,
      provider: 'openai',
      latency_ms: Date.now() - startTime,
      created_at: new Date().toISOString(),
    };
  }

  private async chatAnthropic(
    request: AIRequest,
    requestId: string,
    startTime: number
  ): Promise<AIResponse> {
    if (!this.anthropic) throw new Error('Anthropic client not initialized');

    const modelMap: Record<string, string> = {
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-sonnet-20240229',
      'claude-3-haiku': 'claude-3-haiku-20240307',
    };

    const message = await this.anthropic.messages.create({
      model: modelMap[request.model] || 'claude-3-haiku-20240307',
      max_tokens: request.max_tokens || 2048,
      system: request.system_prompt,
      messages: [{ role: 'user', content: request.prompt }],
    });

    const content = message.content[0];
    const textContent = content.type === 'text' ? content.text : '';

    return {
      id: crypto.randomUUID(),
      request_id: requestId,
      content: textContent,
      usage: {
        prompt_tokens: message.usage.input_tokens,
        completion_tokens: message.usage.output_tokens,
        total_tokens: message.usage.input_tokens + message.usage.output_tokens,
      },
      model: message.model,
      provider: 'anthropic',
      latency_ms: Date.now() - startTime,
      created_at: new Date().toISOString(),
    };
  }

  private async chatGoogle(
    request: AIRequest,
    requestId: string,
    startTime: number
  ): Promise<AIResponse> {
    if (!this.google) throw new Error('Google AI client not initialized');

    const model = this.google.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = request.system_prompt
      ? `${request.system_prompt}\n\n${request.prompt}`
      : request.prompt;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      id: crypto.randomUUID(),
      request_id: requestId,
      content: text,
      usage: {
        prompt_tokens: 0, // Google doesn't provide token counts in same way
        completion_tokens: 0,
        total_tokens: 0,
      },
      model: 'gemini-pro',
      provider: 'google',
      latency_ms: Date.now() - startTime,
      created_at: new Date().toISOString(),
    };
  }

  // =====================================================
  // Analysis Methods
  // =====================================================

  async analyzeContent(
    userId: string,
    analysisType: string,
    content: string,
    options: { model?: AIModel; provider?: AIProvider } = {}
  ): Promise<AIAnalysisResult> {
    const startTime = Date.now();
    const provider = options.provider || 'openai';
    const model = options.model || 'gpt-4o-mini';

    const systemPrompt = this.getAnalysisSystemPrompt(analysisType);

    const response = await this.chat({
      user_id: userId,
      provider,
      model,
      request_type: 'analysis',
      prompt: content,
      system_prompt: systemPrompt,
    });

    // Parse response as JSON if possible
    let result: Record<string, any>;
    try {
      result = JSON.parse(response.content);
    } catch {
      result = { analysis: response.content };
    }

    // Store analysis result
    const analysisResult: AIAnalysisResult = {
      id: crypto.randomUUID(),
      user_id: userId,
      analysis_type: analysisType,
      input_data: { content: content.substring(0, 500) },
      result,
      confidence_score: result.confidence,
      model_used: model,
      processing_time_ms: Date.now() - startTime,
      created_at: new Date().toISOString(),
    };

    await this.saveAnalysisResult(analysisResult);

    return analysisResult;
  }

  async analyzeSentiment(userId: string, text: string): Promise<AIAnalysisResult> {
    return this.analyzeContent(userId, 'sentiment', text);
  }

  async analyzeQuality(userId: string, content: string): Promise<AIAnalysisResult> {
    return this.analyzeContent(userId, 'quality', content);
  }

  async analyzeDesign(userId: string, description: string): Promise<AIAnalysisResult> {
    return this.analyzeContent(userId, 'design', description);
  }

  // =====================================================
  // Generation Methods
  // =====================================================

  async generateContent(
    userId: string,
    generationType: AIGenerationResult['generation_type'],
    prompt: string,
    options: { model?: AIModel; provider?: AIProvider; maxTokens?: number } = {}
  ): Promise<AIGenerationResult> {
    const startTime = Date.now();
    const provider = options.provider || 'openai';
    const model = options.model || 'gpt-4o-mini';

    const systemPrompt = this.getGenerationSystemPrompt(generationType);

    const response = await this.chat({
      user_id: userId,
      provider,
      model,
      request_type: 'generation',
      prompt,
      system_prompt: systemPrompt,
      max_tokens: options.maxTokens || 2048,
    });

    const result: AIGenerationResult = {
      id: crypto.randomUUID(),
      user_id: userId,
      generation_type: generationType,
      input_prompt: prompt,
      output: response.content,
      model_used: model,
      tokens_used: response.usage.total_tokens,
      cost_estimate: this.calculateCost(model, response.usage.total_tokens),
      created_at: new Date().toISOString(),
    };

    await this.saveGenerationResult(result);

    return result;
  }

  async generateText(userId: string, prompt: string): Promise<AIGenerationResult> {
    return this.generateContent(userId, 'text', prompt);
  }

  async generateCode(userId: string, prompt: string): Promise<AIGenerationResult> {
    return this.generateContent(userId, 'code', prompt, { model: 'gpt-4o' });
  }

  async generateSummary(userId: string, content: string): Promise<AIGenerationResult> {
    return this.generateContent(userId, 'summary', `Summarize the following:\n\n${content}`);
  }

  async translateText(userId: string, text: string, targetLanguage: string): Promise<AIGenerationResult> {
    return this.generateContent(
      userId,
      'translation',
      `Translate the following text to ${targetLanguage}:\n\n${text}`
    );
  }

  // =====================================================
  // Video AI Methods
  // =====================================================

  async generateVideoChapters(
    userId: string,
    transcript: string,
    videoDuration: number
  ): Promise<{ chapters: { title: string; startTime: number; endTime: number }[] }> {
    const response = await this.chat({
      user_id: userId,
      provider: 'openai',
      model: 'gpt-4o-mini',
      request_type: 'analysis',
      prompt: `Generate chapters for a video with duration ${videoDuration} seconds. Here's the transcript:\n\n${transcript}`,
      system_prompt: `You are a video chapter generator. Analyze the transcript and create logical chapters.
Output as JSON: { "chapters": [{ "title": "...", "startTime": seconds, "endTime": seconds }] }
Create 3-8 chapters depending on content length. Ensure chapters cover the entire video duration.`,
    });

    try {
      return JSON.parse(response.content);
    } catch {
      return { chapters: [] };
    }
  }

  async analyzeVideoContent(
    userId: string,
    transcript: string
  ): Promise<{
    topics: string[];
    sentiment: string;
    keyMoments: { time: string; description: string }[];
    suggestedTags: string[];
  }> {
    const response = await this.chat({
      user_id: userId,
      provider: 'openai',
      model: 'gpt-4o-mini',
      request_type: 'analysis',
      prompt: `Analyze this video transcript:\n\n${transcript}`,
      system_prompt: `Analyze the video content and return JSON:
{
  "topics": ["main topics discussed"],
  "sentiment": "positive/negative/neutral/mixed",
  "keyMoments": [{"time": "estimated time", "description": "what happens"}],
  "suggestedTags": ["relevant tags for SEO"]
}`,
    });

    try {
      return JSON.parse(response.content);
    } catch {
      return { topics: [], sentiment: 'neutral', keyMoments: [], suggestedTags: [] };
    }
  }

  // =====================================================
  // Business AI Methods
  // =====================================================

  async generateBusinessInsights(
    userId: string,
    data: {
      revenue?: number;
      clients?: number;
      projects?: number;
      completionRate?: number;
    }
  ): Promise<{
    insights: string[];
    recommendations: string[];
    risks: string[];
    opportunities: string[];
  }> {
    const response = await this.chat({
      user_id: userId,
      provider: 'openai',
      model: 'gpt-4o-mini',
      request_type: 'analysis',
      prompt: `Analyze this freelancer business data:\n${JSON.stringify(data, null, 2)}`,
      system_prompt: `You are a business advisor for freelancers. Analyze the data and provide:
{
  "insights": ["key observations about the business"],
  "recommendations": ["actionable advice"],
  "risks": ["potential problems to watch"],
  "opportunities": ["growth opportunities"]
}
Be specific and actionable.`,
    });

    try {
      return JSON.parse(response.content);
    } catch {
      return { insights: [], recommendations: [], risks: [], opportunities: [] };
    }
  }

  async generateGrowthPlan(
    userId: string,
    currentState: Record<string, any>,
    goals: string[]
  ): Promise<{
    plan: { phase: string; actions: string[]; timeline: string }[];
    metrics: string[];
    milestones: string[];
  }> {
    const response = await this.chat({
      user_id: userId,
      provider: 'openai',
      model: 'gpt-4o',
      request_type: 'generation',
      prompt: `Create a growth plan.\nCurrent state: ${JSON.stringify(currentState)}\nGoals: ${goals.join(', ')}`,
      system_prompt: `Create a detailed growth plan for a freelancer. Return JSON:
{
  "plan": [{"phase": "Phase name", "actions": ["specific actions"], "timeline": "duration"}],
  "metrics": ["KPIs to track"],
  "milestones": ["key achievements to aim for"]
}`,
    });

    try {
      return JSON.parse(response.content);
    } catch {
      return { plan: [], metrics: [], milestones: [] };
    }
  }

  // =====================================================
  // Database Methods
  // =====================================================

  private async logRequest(request: AIRequest): Promise<{ id: string }> {
    const { data, error } = await this.getSupabase()
      .from('ai_requests')
      .insert({
        user_id: request.user_id,
        provider: request.provider,
        model: request.model,
        request_type: request.request_type,
        prompt: request.prompt.substring(0, 5000),
        system_prompt: request.system_prompt?.substring(0, 2000),
        context: request.context,
        max_tokens: request.max_tokens,
        temperature: request.temperature,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error logging AI request:', error);
      return { id: crypto.randomUUID() };
    }

    return data;
  }

  private async logResponse(response: AIResponse): Promise<void> {
    await this.getSupabase().from('ai_responses').insert({
      request_id: response.request_id,
      content: response.content.substring(0, 10000),
      prompt_tokens: response.usage.prompt_tokens,
      completion_tokens: response.usage.completion_tokens,
      total_tokens: response.usage.total_tokens,
      model: response.model,
      provider: response.provider,
      latency_ms: response.latency_ms,
    });
  }

  private async logError(request: AIRequest, error: any): Promise<void> {
    await this.getSupabase().from('ai_errors').insert({
      user_id: request.user_id,
      provider: request.provider,
      model: request.model,
      error_message: error.message,
      error_code: error.code,
      request_data: {
        prompt: request.prompt.substring(0, 500),
        request_type: request.request_type,
      },
    });
  }

  private async updateUsageTracking(userId: string, response: AIResponse): Promise<void> {
    const cost = this.calculateCost(response.model, response.usage.total_tokens);

    // Upsert usage record for today
    const today = new Date().toISOString().split('T')[0];

    await this.getSupabase().rpc('increment_ai_usage', {
      p_user_id: userId,
      p_date: today,
      p_tokens: response.usage.total_tokens,
      p_cost: cost,
      p_requests: 1,
    });
  }

  private async saveAnalysisResult(result: AIAnalysisResult): Promise<void> {
    await this.getSupabase().from('ai_analysis_results').insert({
      id: result.id,
      user_id: result.user_id,
      analysis_type: result.analysis_type,
      input_data: result.input_data,
      result: result.result,
      confidence_score: result.confidence_score,
      model_used: result.model_used,
      processing_time_ms: result.processing_time_ms,
    });
  }

  private async saveGenerationResult(result: AIGenerationResult): Promise<void> {
    await this.getSupabase().from('ai_generation_results').insert({
      id: result.id,
      user_id: result.user_id,
      generation_type: result.generation_type,
      input_prompt: result.input_prompt.substring(0, 2000),
      output: result.output.substring(0, 10000),
      model_used: result.model_used,
      tokens_used: result.tokens_used,
      cost_estimate: result.cost_estimate,
    });
  }

  // =====================================================
  // Usage & Analytics
  // =====================================================

  async getUserUsage(userId: string, period: 'day' | 'week' | 'month' = 'month'): Promise<{
    totalTokens: number;
    totalCost: number;
    totalRequests: number;
    byProvider: Record<string, { tokens: number; cost: number; requests: number }>;
    byModel: Record<string, { tokens: number; cost: number; requests: number }>;
  }> {
    const startDate = this.getPeriodStartDate(period);

    const { data: usage } = await this.getSupabase()
      .from('ai_usage_daily')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate);

    if (!usage || usage.length === 0) {
      return {
        totalTokens: 0,
        totalCost: 0,
        totalRequests: 0,
        byProvider: {},
        byModel: {},
      };
    }

    return {
      totalTokens: usage.reduce((sum, u) => sum + u.tokens, 0),
      totalCost: usage.reduce((sum, u) => sum + u.cost, 0),
      totalRequests: usage.reduce((sum, u) => sum + u.requests, 0),
      byProvider: {},
      byModel: {},
    };
  }

  async getAIStats(userId: string): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageLatency: number;
    topModels: { model: string; count: number }[];
  }> {
    const { data: requests } = await this.getSupabase()
      .from('ai_requests')
      .select('model')
      .eq('user_id', userId);

    const { data: responses } = await this.getSupabase()
      .from('ai_responses')
      .select('total_tokens, latency_ms')
      .in('request_id', (requests || []).map(r => r.model));

    const totalTokens = (responses || []).reduce((sum, r) => sum + r.total_tokens, 0);
    const avgLatency = (responses || []).length > 0
      ? (responses || []).reduce((sum, r) => sum + r.latency_ms, 0) / (responses || []).length
      : 0;

    // Count by model
    const modelCounts: Record<string, number> = {};
    (requests || []).forEach(r => {
      modelCounts[r.model] = (modelCounts[r.model] || 0) + 1;
    });

    const topModels = Object.entries(modelCounts)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRequests: (requests || []).length,
      totalTokens,
      totalCost: this.calculateCost('gpt-4o-mini', totalTokens),
      averageLatency: Math.round(avgLatency),
      topModels,
    };
  }

  // =====================================================
  // Helper Methods
  // =====================================================

  private getAnalysisSystemPrompt(type: string): string {
    const prompts: Record<string, string> = {
      sentiment: `Analyze the sentiment of the text. Return JSON:
{ "sentiment": "positive/negative/neutral/mixed", "confidence": 0-1, "emotions": ["detected emotions"], "summary": "brief summary" }`,
      quality: `Analyze the quality of the content. Return JSON:
{ "score": 1-10, "strengths": ["..."], "weaknesses": ["..."], "suggestions": ["..."], "confidence": 0-1 }`,
      design: `Analyze the design. Return JSON:
{ "score": 1-10, "principles": {"balance": 1-10, "contrast": 1-10, "hierarchy": 1-10}, "feedback": ["..."], "suggestions": ["..."] }`,
      seo: `Analyze for SEO. Return JSON:
{ "score": 1-10, "keywords": ["..."], "improvements": ["..."], "meta_suggestions": {"title": "...", "description": "..."} }`,
    };
    return prompts[type] || 'Analyze the content and return structured JSON results.';
  }

  private getGenerationSystemPrompt(type: string): string {
    const prompts: Record<string, string> = {
      text: 'You are a professional writer. Generate high-quality, engaging content.',
      code: 'You are an expert programmer. Write clean, efficient, well-documented code.',
      summary: 'Summarize the content concisely while preserving key information.',
      translation: 'Translate accurately while preserving tone and meaning.',
    };
    return prompts[type] || 'Generate high-quality content based on the prompt.';
  }

  private calculateCost(model: string, tokens: number): number {
    const costs: Record<string, number> = {
      'gpt-4o': 0.005 / 1000,
      'gpt-4o-mini': 0.00015 / 1000,
      'gpt-4-turbo': 0.01 / 1000,
      'gpt-3.5-turbo': 0.0005 / 1000,
      'claude-3-opus': 0.015 / 1000,
      'claude-3-sonnet': 0.003 / 1000,
      'claude-3-haiku': 0.00025 / 1000,
      'gemini-pro': 0.0005 / 1000,
    };
    return tokens * (costs[model] || 0.001 / 1000);
  }

  private getPeriodStartDate(period: 'day' | 'week' | 'month'): string {
    const now = new Date();
    switch (period) {
      case 'day':
        return now.toISOString().split('T')[0];
      case 'week':
        now.setDate(now.getDate() - 7);
        return now.toISOString().split('T')[0];
      case 'month':
        now.setMonth(now.getMonth() - 1);
        return now.toISOString().split('T')[0];
    }
  }
}

// Lazy singleton getter to avoid build-time initialization
let _aiServiceInstance: AIService | null = null;
export function getAIService(): AIService {
  if (!_aiServiceInstance) {
    _aiServiceInstance = AIService.getInstance();
  }
  return _aiServiceInstance;
}

// For backwards compatibility (deprecated - use getAIService() instead)
// @deprecated
export const aiService = {
  get instance() {
    return getAIService();
  },
  chat: (request: AIRequest) => getAIService().chat(request),
  analyzeContent: (userId: string, type: string, content: string) =>
    getAIService().analyzeContent(userId, type, content),
  generateContent: (userId: string, type: AIGenerationResult['generation_type'], prompt: string) =>
    getAIService().generateContent(userId, type, prompt),
  getAIStats: (userId: string) => getAIService().getAIStats(userId),
} as unknown as AIService;

// Export convenience functions
export const chat = (request: AIRequest) => getAIService().chat(request);
export const analyzeContent = (userId: string, type: string, content: string) =>
  getAIService().analyzeContent(userId, type, content);
export const generateContent = (userId: string, type: AIGenerationResult['generation_type'], prompt: string) =>
  getAIService().generateContent(userId, type, prompt);
export const getAIStats = (userId: string) => getAIService().getAIStats(userId);
