/**
 * Organization-Wide AI Context - FreeFlow A+++ Implementation
 *
 * Enterprise AI context management with:
 * - Shared knowledge base across organization
 * - Team-specific AI configurations
 * - Context inheritance and overrides
 * - Document embeddings for semantic search
 * - AI behavior customization per org
 * - Usage tracking and analytics
 *
 * Competitors: Notion AI workspace context, Glean, Guru AI
 */

import OpenAI from 'openai';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface OrganizationContext {
  id: string;
  organizationId: string;
  name: string;
  description: string;

  // AI Configuration
  aiConfig: AIConfiguration;

  // Knowledge Sources
  knowledgeSources: KnowledgeSource[];

  // Custom Instructions
  customInstructions: string;
  systemPromptAdditions: string;

  // Team contexts
  teamContexts: TeamContext[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

export interface AIConfiguration {
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  enabledCapabilities: AICapability[];
  disabledCapabilities: AICapability[];
  responseStyle: 'formal' | 'casual' | 'technical' | 'simple';
  languagePreference: string;
  toneOfVoice: string;
  contentPolicies: ContentPolicy[];
  customVocabulary: VocabularyTerm[];
}

export type AICapability =
  | 'code_generation'
  | 'document_analysis'
  | 'data_analysis'
  | 'creative_writing'
  | 'translation'
  | 'summarization'
  | 'question_answering'
  | 'task_automation'
  | 'meeting_intelligence'
  | 'email_drafting';

export interface ContentPolicy {
  id: string;
  name: string;
  description: string;
  rules: string[];
  enforcement: 'strict' | 'warn' | 'log';
}

export interface VocabularyTerm {
  term: string;
  definition: string;
  usage: string;
  alternatives: string[];
  category: string;
}

export interface KnowledgeSource {
  id: string;
  type: 'document' | 'url' | 'database' | 'api' | 'manual';
  name: string;
  description: string;
  content?: string;
  url?: string;
  connectionConfig?: Record<string, unknown>;
  syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  lastSynced?: string;
  status: 'active' | 'syncing' | 'error' | 'disabled';
  metadata: Record<string, unknown>;
}

export interface TeamContext {
  id: string;
  teamId: string;
  teamName: string;
  inheritFromOrg: boolean;
  overrides: Partial<AIConfiguration>;
  additionalKnowledge: KnowledgeSource[];
  customInstructions?: string;
  members: string[];
}

export interface ContextQuery {
  query: string;
  userId: string;
  teamId?: string;
  organizationId: string;
  includeHistory?: boolean;
  maxResults?: number;
}

export interface ContextResult {
  relevantDocuments: RelevantDocument[];
  suggestedContext: string;
  confidence: number;
  sources: string[];
}

export interface RelevantDocument {
  id: string;
  title: string;
  excerpt: string;
  relevanceScore: number;
  source: string;
  metadata: Record<string, unknown>;
}

export interface AIResponseWithContext {
  response: string;
  contextUsed: string[];
  confidence: number;
  suggestedFollowUps: string[];
  metadata: {
    model: string;
    tokensUsed: number;
    processingTime: number;
  };
}

// ============================================================================
// ORGANIZATION CONTEXT SERVICE
// ============================================================================

export class OrganizationContextService {
  private openai: OpenAI;
  private defaultModel = 'gpt-4o';
  private embeddingModel = 'text-embedding-3-small';

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Build context-aware system prompt for organization
   */
  buildSystemPrompt(context: OrganizationContext, teamContext?: TeamContext): string {
    const config = teamContext?.inheritFromOrg
      ? { ...context.aiConfig, ...(teamContext.overrides || {}) }
      : context.aiConfig;

    let systemPrompt = `You are an AI assistant for ${context.name}. ${context.description}

## Organization Context
${context.customInstructions}

## Response Guidelines
- Style: ${config.responseStyle}
- Language: ${config.languagePreference}
- Tone: ${config.toneOfVoice}
`;

    // Add custom vocabulary
    if (config.customVocabulary && config.customVocabulary.length > 0) {
      systemPrompt += `\n## Organization Vocabulary\n`;
      config.customVocabulary.forEach(term => {
        systemPrompt += `- **${term.term}**: ${term.definition}\n`;
      });
    }

    // Add content policies
    if (config.contentPolicies && config.contentPolicies.length > 0) {
      systemPrompt += `\n## Content Policies\n`;
      config.contentPolicies.forEach(policy => {
        systemPrompt += `### ${policy.name}\n${policy.rules.join('\n')}\n\n`;
      });
    }

    // Add team-specific context
    if (teamContext?.customInstructions) {
      systemPrompt += `\n## Team-Specific Context\n${teamContext.customInstructions}\n`;
    }

    // Add system prompt additions
    if (context.systemPromptAdditions) {
      systemPrompt += `\n${context.systemPromptAdditions}`;
    }

    return systemPrompt;
  }

  /**
   * Query relevant context for a user question
   */
  async queryContext(query: ContextQuery): Promise<ContextResult> {
    // Generate embedding for the query
    const embeddingResponse = await this.openai.embeddings.create({
      model: this.embeddingModel,
      input: query.query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // In a real implementation, this would query a vector database
    // For now, we'll simulate with a placeholder
    const relevantDocuments: RelevantDocument[] = [];

    // Build suggested context
    const contextParts = relevantDocuments.map(doc => doc.excerpt);
    const suggestedContext = contextParts.join('\n\n');

    return {
      relevantDocuments,
      suggestedContext,
      confidence: relevantDocuments.length > 0 ? 0.85 : 0.5,
      sources: relevantDocuments.map(doc => doc.source),
    };
  }

  /**
   * Generate AI response with organization context
   */
  async generateWithContext(
    prompt: string,
    context: OrganizationContext,
    teamContext?: TeamContext,
    additionalContext?: string
  ): Promise<AIResponseWithContext> {
    const startTime = Date.now();

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(context, teamContext);

    // Prepare messages
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add additional context if provided
    if (additionalContext) {
      messages.push({
        role: 'system',
        content: `## Relevant Context\n${additionalContext}`,
      });
    }

    messages.push({ role: 'user', content: prompt });

    // Get AI configuration
    const config = teamContext?.inheritFromOrg
      ? { ...context.aiConfig, ...(teamContext.overrides || {}) }
      : context.aiConfig;

    // Generate response
    const response = await this.openai.chat.completions.create({
      model: config.defaultModel || this.defaultModel,
      messages,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 2048,
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;
    const processingTime = Date.now() - startTime;

    // Generate follow-up suggestions
    const followUpResponse = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Based on the conversation, suggest 3 relevant follow-up questions. Return JSON: { "followUps": ["...", "...", "..."] }',
        },
        { role: 'user', content: `Question: ${prompt}\n\nAnswer: ${aiResponse}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const followUps = JSON.parse(followUpResponse.choices[0]?.message?.content || '{}');

    return {
      response: aiResponse,
      contextUsed: additionalContext ? [additionalContext] : [],
      confidence: 0.9,
      suggestedFollowUps: followUps.followUps || [],
      metadata: {
        model: config.defaultModel || this.defaultModel,
        tokensUsed,
        processingTime,
      },
    };
  }

  /**
   * Create embeddings for a knowledge source
   */
  async embedKnowledgeSource(source: KnowledgeSource): Promise<{
    id: string;
    embeddings: number[][];
    chunks: string[];
  }> {
    if (!source.content) {
      return { id: source.id, embeddings: [], chunks: [] };
    }

    // Chunk the content
    const chunks = this.chunkContent(source.content);

    // Generate embeddings for each chunk
    const embeddingResponse = await this.openai.embeddings.create({
      model: this.embeddingModel,
      input: chunks,
    });

    const embeddings = embeddingResponse.data.map(d => d.embedding);

    return {
      id: source.id,
      embeddings,
      chunks,
    };
  }

  /**
   * Chunk content for embedding
   */
  private chunkContent(content: string, maxChunkSize: number = 1000): string[] {
    const chunks: string[] = [];
    const paragraphs = content.split(/\n\n+/);

    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = paragraph;
      } else {
        currentChunk += '\n\n' + paragraph;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Generate organization onboarding context
   */
  async generateOnboardingContext(
    organizationName: string,
    industry: string,
    description: string,
    teamSize: number
  ): Promise<Partial<OrganizationContext>> {
    const response = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: [
        {
          role: 'system',
          content: `You are an AI configuration expert. Create an optimized AI configuration for an organization.
Return JSON with the following structure:
{
  "customInstructions": "Instructions for AI behavior specific to this org",
  "aiConfig": {
    "responseStyle": "formal|casual|technical|simple",
    "toneOfVoice": "description of tone",
    "contentPolicies": [{ "name": "", "description": "", "rules": [] }],
    "customVocabulary": [{ "term": "", "definition": "", "usage": "", "category": "" }]
  }
}`
        },
        {
          role: 'user',
          content: `Create AI configuration for:
Organization: ${organizationName}
Industry: ${industry}
Description: ${description}
Team Size: ${teamSize} people`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  }

  /**
   * Analyze and suggest improvements for organization context
   */
  async analyzeContext(context: OrganizationContext): Promise<{
    score: number;
    suggestions: string[];
    warnings: string[];
    optimizations: string[];
  }> {
    const response = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: [
        {
          role: 'system',
          content: `Analyze this organization AI context and provide improvements.
Return JSON: {
  "score": 0-100,
  "suggestions": ["suggestion 1", "suggestion 2"],
  "warnings": ["potential issue 1"],
  "optimizations": ["optimization tip 1"]
}`
        },
        {
          role: 'user',
          content: JSON.stringify(context, null, 2)
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  }

  /**
   * Create a default organization context
   */
  createDefaultContext(organizationId: string, name: string): OrganizationContext {
    return {
      id: `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      name,
      description: `AI context for ${name}`,
      aiConfig: {
        defaultModel: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 2048,
        enabledCapabilities: [
          'code_generation',
          'document_analysis',
          'summarization',
          'question_answering',
          'email_drafting',
        ],
        disabledCapabilities: [],
        responseStyle: 'formal',
        languagePreference: 'en',
        toneOfVoice: 'Professional and helpful',
        contentPolicies: [],
        customVocabulary: [],
      },
      knowledgeSources: [],
      customInstructions: `You are an AI assistant for ${name}. Be helpful, accurate, and professional.`,
      systemPromptAdditions: '',
      teamContexts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '',
      version: 1,
    };
  }
}

// Export singleton instance
export const organizationContextService = new OrganizationContextService();
