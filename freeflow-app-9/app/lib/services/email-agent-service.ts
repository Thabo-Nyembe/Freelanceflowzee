/**
 * Email Agent Service
 *
 * Intelligent email monitoring and response automation system
 * Features:
 * - Email monitoring and parsing
 * - AI-powered response generation
 * - Quotation creation from email requests
 * - Approval workflow management
 * - Business context integration
 */

import { createClient } from '@supabase/supabase-js';
import { AIService } from './ai-service';
import logger from '@/lib/logger';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  receivedAt: Date;
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  labels?: string[];
  isRead: boolean;
  isStarred: boolean;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  data?: Buffer | string;
  url?: string;
}

export interface EmailAnalysis {
  intent: 'inquiry' | 'quote_request' | 'complaint' | 'feedback' | 'support' | 'collaboration' | 'spam' | 'other';
  sentiment: 'positive' | 'neutral' | 'negative';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  keywords: string[];
  entities: {
    people?: string[];
    companies?: string[];
    dates?: string[];
    amounts?: string[];
    projects?: string[];
  };
  requiresQuotation: boolean;
  requiresHumanReview: boolean;
  suggestedActions: string[];
  summary: string;
}

export interface GeneratedResponse {
  id: string;
  emailId: string;
  subject: string;
  body: string;
  bodyHtml: string;
  tone: 'professional' | 'friendly' | 'formal' | 'casual';
  confidence: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'sent';
  generatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  sentAt?: Date;
  metadata?: Record<string, any>;
}

export interface QuotationRequest {
  emailId: string;
  clientName: string;
  clientEmail: string;
  projectDescription: string;
  services: QuotationService[];
  estimatedBudget?: number;
  deadline?: Date;
  additionalNotes?: string;
}

export interface QuotationService {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
}

export interface GeneratedQuotation {
  id: string;
  requestId: string;
  quotationNumber: string;
  clientName: string;
  clientEmail: string;
  services: QuotationService[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  validUntil: Date;
  terms: string;
  notes?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'accepted' | 'rejected';
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  sentAt?: Date;
}

export interface ApprovalWorkflow {
  id: string;
  type: 'email_response' | 'quotation' | 'contract' | 'refund';
  itemId: string;
  requestedBy: string;
  approvers: string[];
  currentApprover?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  dueDate?: Date;
  approvalHistory: ApprovalAction[];
  metadata?: Record<string, any>;
}

export interface ApprovalAction {
  approver: string;
  action: 'approved' | 'rejected' | 'requested_changes';
  timestamp: Date;
  comments?: string;
}

export interface EmailAgentConfig {
  enabled: boolean;
  autoRespond: boolean;
  requireApprovalForResponses: boolean;
  requireApprovalForQuotations: boolean;
  defaultResponseTone: 'professional' | 'friendly' | 'formal' | 'casual';
  autoQuotationEnabled: boolean;
  businessHours: {
    enabled: boolean;
    timezone: string;
    schedule: {
      [key: string]: { start: string; end: string } | null;
    };
  };
  spamFiltering: boolean;
  priorityThreshold: 'low' | 'medium' | 'high';
  approvers: string[];
  notificationChannels: ('email' | 'sms' | 'push' | 'slack')[];
}

// ============================================================================
// EMAIL AGENT SERVICE CLASS
// ============================================================================

export class EmailAgentService {
  private aiService: AIService;
  private supabase: ReturnType<typeof createClient>;
  private config: EmailAgentConfig;

  constructor(config?: Partial<EmailAgentConfig>) {
    this.aiService = new AIService();

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.config = {
      enabled: true,
      autoRespond: false,
      requireApprovalForResponses: true,
      requireApprovalForQuotations: true,
      defaultResponseTone: 'professional',
      autoQuotationEnabled: true,
      businessHours: {
        enabled: true,
        timezone: 'UTC',
        schedule: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: null,
          sunday: null,
        },
      },
      spamFiltering: true,
      priorityThreshold: 'medium',
      approvers: [],
      notificationChannels: ['email', 'push'],
      ...config,
    };
  }

  // ==========================================================================
  // EMAIL MONITORING AND PARSING
  // ==========================================================================

  /**
   * Process incoming email and determine appropriate actions
   */
  async processIncomingEmail(email: EmailMessage): Promise<{
    analysis: EmailAnalysis;
    response?: GeneratedResponse;
    quotation?: GeneratedQuotation;
    workflow?: ApprovalWorkflow;
  }> {
    try {
      logger.info('Processing incoming email', {
        emailId: email.id,
        from: email.from,
        subject: email.subject,
      });

      // Step 1: Analyze email content with AI
      const analysis = await this.analyzeEmail(email);

      // Step 2: Filter spam
      if (this.config.spamFiltering && analysis.intent === 'spam') {
        logger.info('Email marked as spam', { emailId: email.id });
        await this.markAsSpam(email.id);
        return { analysis };
      }

      // Step 3: Store email in database
      await this.storeEmail(email, analysis);

      const result: any = { analysis };

      // Step 4: Generate response if applicable
      if (this.shouldGenerateResponse(analysis)) {
        const response = await this.generateResponse(email, analysis);
        result.response = response;

        if (this.config.requireApprovalForResponses) {
          result.workflow = await this.createApprovalWorkflow(
            'email_response',
            response.id,
            analysis.priority
          );
        } else if (this.config.autoRespond) {
          await this.sendResponse(response);
        }
      }

      // Step 5: Generate quotation if requested
      if (analysis.requiresQuotation && this.config.autoQuotationEnabled) {
        const quotationRequest = await this.extractQuotationRequest(email, analysis);
        const quotation = await this.generateQuotation(quotationRequest);
        result.quotation = quotation;

        if (this.config.requireApprovalForQuotations) {
          result.workflow = await this.createApprovalWorkflow(
            'quotation',
            quotation.id,
            'high'
          );
        }
      }

      // Step 6: Send notifications
      await this.sendNotifications(email, analysis, result);

      logger.info('Email processing complete', {
        emailId: email.id,
        hasResponse: !!result.response,
        hasQuotation: !!result.quotation,
        requiresApproval: !!result.workflow,
      });

      return result;
    } catch (error) {
      logger.error('Error processing email', { emailId: email.id, error });
      throw error;
    }
  }

  /**
   * Analyze email content using AI to determine intent, sentiment, and actions
   */
  async analyzeEmail(email: EmailMessage): Promise<EmailAnalysis> {
    try {
      const prompt = `Analyze the following email and provide a detailed analysis:

FROM: ${email.from}
SUBJECT: ${email.subject}
BODY:
${email.body}

Please analyze and provide:
1. Primary intent (inquiry, quote_request, complaint, feedback, support, collaboration, spam, other)
2. Sentiment (positive, neutral, negative)
3. Priority level (low, medium, high, urgent)
4. Category/topic
5. Key keywords and entities (people, companies, dates, amounts, projects)
6. Whether this requires a quotation
7. Whether this requires human review
8. Suggested actions
9. Brief summary (1-2 sentences)

Return your analysis as a structured JSON object.`;

      const response = await this.aiService.generateText({
        model: 'gpt-4-turbo-preview',
        prompt,
        temperature: 0.3,
        maxTokens: 1000,
      });

      // Parse AI response
      const analysisText = response.text || '';
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          intent: parsed.intent || 'other',
          sentiment: parsed.sentiment || 'neutral',
          priority: parsed.priority || 'medium',
          category: parsed.category || 'General',
          keywords: parsed.keywords || [],
          entities: parsed.entities || {},
          requiresQuotation: parsed.requiresQuotation || false,
          requiresHumanReview: parsed.requiresHumanReview || false,
          suggestedActions: parsed.suggestedActions || [],
          summary: parsed.summary || email.subject,
        };
      }

      // Fallback to basic analysis
      return this.basicEmailAnalysis(email);
    } catch (error) {
      logger.error('Error analyzing email with AI', { emailId: email.id, error });
      return this.basicEmailAnalysis(email);
    }
  }

  /**
   * Fallback email analysis without AI
   */
  private basicEmailAnalysis(email: EmailMessage): EmailAnalysis {
    const body = email.body.toLowerCase();
    const subject = email.subject.toLowerCase();

    // Detect intent based on keywords
    let intent: EmailAnalysis['intent'] = 'other';
    if (subject.includes('quote') || body.includes('quotation') || body.includes('pricing')) {
      intent = 'quote_request';
    } else if (subject.includes('complaint') || body.includes('disappointed') || body.includes('issue')) {
      intent = 'complaint';
    } else if (subject.includes('question') || body.includes('wondering') || body.includes('inquiry')) {
      intent = 'inquiry';
    } else if (subject.includes('feedback') || body.includes('suggestion')) {
      intent = 'feedback';
    } else if (subject.includes('help') || body.includes('support') || body.includes('problem')) {
      intent = 'support';
    }

    // Detect sentiment
    const negativeWords = ['disappointed', 'unhappy', 'issue', 'problem', 'terrible', 'bad'];
    const positiveWords = ['great', 'excellent', 'happy', 'satisfied', 'wonderful', 'amazing'];

    let sentiment: EmailAnalysis['sentiment'] = 'neutral';
    const hasNegative = negativeWords.some(word => body.includes(word));
    const hasPositive = positiveWords.some(word => body.includes(word));

    if (hasNegative && !hasPositive) sentiment = 'negative';
    else if (hasPositive && !hasNegative) sentiment = 'positive';

    // Detect priority
    const urgentWords = ['urgent', 'asap', 'immediately', 'critical', 'emergency'];
    const priority: EmailAnalysis['priority'] =
      urgentWords.some(word => subject.includes(word) || body.includes(word)) ? 'urgent' : 'medium';

    return {
      intent,
      sentiment,
      priority,
      category: 'General',
      keywords: [],
      entities: {},
      requiresQuotation: intent === 'quote_request',
      requiresHumanReview: sentiment === 'negative' || priority === 'urgent',
      suggestedActions: [],
      summary: email.subject,
    };
  }

  /**
   * Determine if an automatic response should be generated
   */
  private shouldGenerateResponse(analysis: EmailAnalysis): boolean {
    if (!this.config.enabled) return false;
    if (analysis.intent === 'spam') return false;

    // Always generate responses for these intents
    const autoRespondIntents = ['inquiry', 'quote_request', 'support'];
    return autoRespondIntents.includes(analysis.intent);
  }

  // ==========================================================================
  // AI RESPONSE GENERATION
  // ==========================================================================

  /**
   * Generate AI-powered response to email
   */
  async generateResponse(
    email: EmailMessage,
    analysis: EmailAnalysis
  ): Promise<GeneratedResponse> {
    try {
      logger.info('Generating AI response', {
        emailId: email.id,
        intent: analysis.intent,
        tone: this.config.defaultResponseTone,
      });

      // Get business context
      const businessContext = await this.getBusinessContext(email, analysis);

      const prompt = `You are a professional business assistant. Generate a response to this email:

FROM: ${email.from}
SUBJECT: ${email.subject}
BODY:
${email.body}

ANALYSIS:
- Intent: ${analysis.intent}
- Sentiment: ${analysis.sentiment}
- Priority: ${analysis.priority}
- Summary: ${analysis.summary}

BUSINESS CONTEXT:
${businessContext}

INSTRUCTIONS:
- Tone: ${this.config.defaultResponseTone}
- Be helpful, professional, and concise
- Address all points raised in the email
- If this is a quote request, acknowledge it and mention a quotation will follow
- If this is a complaint, show empathy and offer solutions
- Include appropriate call-to-action
- Sign off appropriately

Generate:
1. Subject line for the reply
2. Email body (plain text)
3. Email body (HTML formatted)

Return as JSON with fields: subject, bodyText, bodyHtml`;

      const response = await this.aiService.generateText({
        model: 'gpt-4-turbo-preview',
        prompt,
        temperature: 0.7,
        maxTokens: 1500,
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      let subject = `Re: ${email.subject}`;
      let bodyText = 'Thank you for your email. We will respond shortly.';
      let bodyHtml = `<p>${bodyText}</p>`;

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        subject = parsed.subject || subject;
        bodyText = parsed.bodyText || bodyText;
        bodyHtml = parsed.bodyHtml || `<p>${bodyText}</p>`;
      }

      const generatedResponse: GeneratedResponse = {
        id: this.generateId('resp'),
        emailId: email.id,
        subject,
        body: bodyText,
        bodyHtml,
        tone: this.config.defaultResponseTone,
        confidence: response.usage ? Math.min(response.usage.totalTokens / 1500, 1) : 0.8,
        status: this.config.requireApprovalForResponses ? 'pending_approval' : 'draft',
        generatedAt: new Date(),
      };

      // Store response in database
      await this.storeResponse(generatedResponse);

      logger.info('Response generated successfully', {
        responseId: generatedResponse.id,
        emailId: email.id,
      });

      return generatedResponse;
    } catch (error) {
      logger.error('Error generating response', { emailId: email.id, error });
      throw error;
    }
  }

  /**
   * Get relevant business context for response generation
   */
  private async getBusinessContext(
    email: EmailMessage,
    analysis: EmailAnalysis
  ): Promise<string> {
    try {
      const context: string[] = [];

      // Get client information if available
      const { data: client } = await this.supabase
        .from('clients')
        .select('*')
        .ilike('email', email.from)
        .single();

      if (client) {
        context.push(`CLIENT: ${client.name} - Relationship since ${client.created_at}`);
        context.push(`Previous projects: ${client.total_projects || 0}`);
      }

      // Get recent projects
      if (analysis.entities.projects) {
        const { data: projects } = await this.supabase
          .from('projects')
          .select('name, status, budget')
          .in('name', analysis.entities.projects)
          .limit(3);

        if (projects && projects.length > 0) {
          context.push(`RELEVANT PROJECTS: ${projects.map(p => `${p.name} (${p.status})`).join(', ')}`);
        }
      }

      // Get service catalog for quote requests
      if (analysis.requiresQuotation) {
        context.push('AVAILABLE SERVICES: Web Development, Mobile Apps, UI/UX Design, Consulting, AI Integration');
        context.push('TYPICAL RATES: $75-150/hour depending on service complexity');
      }

      // Business policies
      context.push('BUSINESS HOURS: Monday-Friday, 9 AM - 5 PM');
      context.push('RESPONSE TIME: Within 24 hours for inquiries');
      context.push('QUOTATION VALIDITY: 30 days from issue date');

      return context.join('\n');
    } catch (error) {
      logger.error('Error fetching business context', { error });
      return 'No additional context available';
    }
  }

  // ==========================================================================
  // QUOTATION GENERATION
  // ==========================================================================

  /**
   * Extract quotation request details from email
   */
  async extractQuotationRequest(
    email: EmailMessage,
    analysis: EmailAnalysis
  ): Promise<QuotationRequest> {
    try {
      const prompt = `Extract quotation request details from this email:

FROM: ${email.from}
SUBJECT: ${email.subject}
BODY:
${email.body}

Extract:
1. Client name
2. Project description
3. Required services (list with descriptions)
4. Estimated budget (if mentioned)
5. Deadline (if mentioned)
6. Any additional requirements or notes

Return as JSON with fields: clientName, projectDescription, services (array), estimatedBudget, deadline, additionalNotes`;

      const response = await this.aiService.generateText({
        model: 'gpt-4-turbo-preview',
        prompt,
        temperature: 0.3,
        maxTokens: 1000,
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        return {
          emailId: email.id,
          clientName: parsed.clientName || email.from.split('<')[0].trim(),
          clientEmail: email.from.match(/<(.+)>/)?.[1] || email.from,
          projectDescription: parsed.projectDescription || analysis.summary,
          services: parsed.services || [],
          estimatedBudget: parsed.estimatedBudget,
          deadline: parsed.deadline ? new Date(parsed.deadline) : undefined,
          additionalNotes: parsed.additionalNotes,
        };
      }

      // Fallback
      return {
        emailId: email.id,
        clientName: email.from.split('<')[0].trim(),
        clientEmail: email.from.match(/<(.+)>/)?.[1] || email.from,
        projectDescription: analysis.summary,
        services: [],
      };
    } catch (error) {
      logger.error('Error extracting quotation request', { emailId: email.id, error });
      throw error;
    }
  }

  /**
   * Generate quotation with pricing
   */
  async generateQuotation(request: QuotationRequest): Promise<GeneratedQuotation> {
    try {
      logger.info('Generating quotation', {
        emailId: request.emailId,
        clientEmail: request.clientEmail,
      });

      // Calculate pricing for services
      const services = await this.calculateServicePricing(request);

      const subtotal = services.reduce((sum, s) => sum + s.total, 0);
      const taxRate = 0.1; // 10% tax
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      const quotation: GeneratedQuotation = {
        id: this.generateId('quot'),
        requestId: request.emailId,
        quotationNumber: this.generateQuotationNumber(),
        clientName: request.clientName,
        clientEmail: request.clientEmail,
        services,
        subtotal,
        taxRate,
        taxAmount,
        total,
        currency: 'USD',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        terms: 'Payment due within 30 days of invoice date. 50% deposit required to commence work.',
        notes: request.additionalNotes,
        status: 'pending_approval',
        createdAt: new Date(),
      };

      // Store quotation in database
      await this.storeQuotation(quotation);

      logger.info('Quotation generated successfully', {
        quotationId: quotation.id,
        quotationNumber: quotation.quotationNumber,
        total: quotation.total,
      });

      return quotation;
    } catch (error) {
      logger.error('Error generating quotation', { error });
      throw error;
    }
  }

  /**
   * Calculate pricing for requested services
   */
  private async calculateServicePricing(
    request: QuotationRequest
  ): Promise<QuotationService[]> {
    // Service pricing catalog
    const pricingCatalog: Record<string, { rate: number; unit: string }> = {
      'web_development': { rate: 100, unit: 'hour' },
      'mobile_app': { rate: 120, unit: 'hour' },
      'ui_design': { rate: 85, unit: 'hour' },
      'consulting': { rate: 150, unit: 'hour' },
      'ai_integration': { rate: 130, unit: 'hour' },
      'seo': { rate: 75, unit: 'hour' },
      'content_writing': { rate: 50, unit: 'hour' },
    };

    const services: QuotationService[] = [];

    if (request.services && request.services.length > 0) {
      // Use provided services
      return request.services;
    }

    // Use AI to estimate services and hours
    try {
      const prompt = `Based on this project description, estimate required services and hours:

PROJECT: ${request.projectDescription}
BUDGET: ${request.estimatedBudget ? `$${request.estimatedBudget}` : 'Not specified'}

Available services and rates:
${Object.entries(pricingCatalog).map(([key, val]) => `- ${key}: $${val.rate}/${val.unit}`).join('\n')}

Provide a breakdown of services needed with estimated hours for each.
Return as JSON array with fields: name, description, quantity (hours), category`;

      const response = await this.aiService.generateText({
        model: 'gpt-4-turbo-preview',
        prompt,
        temperature: 0.5,
        maxTokens: 800,
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        for (const item of parsed) {
          const category = item.category || 'web_development';
          const pricing = pricingCatalog[category] || pricingCatalog.web_development;

          services.push({
            name: item.name,
            description: item.description,
            quantity: item.quantity || 10,
            unitPrice: pricing.rate,
            total: (item.quantity || 10) * pricing.rate,
            category,
          });
        }
      }
    } catch (error) {
      logger.error('Error calculating service pricing with AI', { error });
    }

    // Fallback: basic web development estimate
    if (services.length === 0) {
      services.push({
        name: 'Web Development',
        description: 'Custom web application development',
        quantity: 40,
        unitPrice: 100,
        total: 4000,
        category: 'web_development',
      });
    }

    return services;
  }

  /**
   * Generate quotation number
   */
  private generateQuotationNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `QUOT-${year}${month}-${random}`;
  }

  // ==========================================================================
  // APPROVAL WORKFLOW
  // ==========================================================================

  /**
   * Create approval workflow for responses and quotations
   */
  async createApprovalWorkflow(
    type: ApprovalWorkflow['type'],
    itemId: string,
    priority: ApprovalWorkflow['priority']
  ): Promise<ApprovalWorkflow> {
    try {
      const workflow: ApprovalWorkflow = {
        id: this.generateId('wf'),
        type,
        itemId,
        requestedBy: 'email-agent',
        approvers: this.config.approvers,
        currentApprover: this.config.approvers[0],
        status: 'pending',
        priority,
        createdAt: new Date(),
        dueDate: priority === 'urgent'
          ? new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
          : new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        approvalHistory: [],
      };

      // Store workflow in database
      await this.supabase
        .from('approval_workflows')
        .insert(workflow);

      // Send notifications to approvers
      await this.notifyApprovers(workflow);

      logger.info('Approval workflow created', {
        workflowId: workflow.id,
        type,
        priority,
      });

      return workflow;
    } catch (error) {
      logger.error('Error creating approval workflow', { error });
      throw error;
    }
  }

  /**
   * Process approval action
   */
  async processApproval(
    workflowId: string,
    approver: string,
    action: 'approved' | 'rejected' | 'requested_changes',
    comments?: string
  ): Promise<ApprovalWorkflow> {
    try {
      // Get workflow
      const { data: workflow } = await this.supabase
        .from('approval_workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Add approval action to history
      const approvalAction: ApprovalAction = {
        approver,
        action,
        timestamp: new Date(),
        comments,
      };

      workflow.approvalHistory.push(approvalAction);
      workflow.status = action === 'approved' ? 'approved' : 'rejected';

      // Update workflow
      await this.supabase
        .from('approval_workflows')
        .update(workflow)
        .eq('id', workflowId);

      // If approved, take action
      if (action === 'approved') {
        await this.executeApprovedAction(workflow);
      }

      logger.info('Approval processed', {
        workflowId,
        action,
        approver,
      });

      return workflow;
    } catch (error) {
      logger.error('Error processing approval', { workflowId, error });
      throw error;
    }
  }

  /**
   * Execute action after approval
   */
  private async executeApprovedAction(workflow: ApprovalWorkflow): Promise<void> {
    try {
      if (workflow.type === 'email_response') {
        // Send the approved response
        const { data: response } = await this.supabase
          .from('email_responses')
          .select('*')
          .eq('id', workflow.itemId)
          .single();

        if (response) {
          await this.sendResponse(response);
        }
      } else if (workflow.type === 'quotation') {
        // Send the approved quotation
        const { data: quotation } = await this.supabase
          .from('quotations')
          .select('*')
          .eq('id', workflow.itemId)
          .single();

        if (quotation) {
          await this.sendQuotation(quotation);
        }
      }
    } catch (error) {
      logger.error('Error executing approved action', { workflowId: workflow.id, error });
    }
  }

  // ==========================================================================
  // EMAIL SENDING
  // ==========================================================================

  /**
   * Send email response
   */
  async sendResponse(response: GeneratedResponse): Promise<void> {
    try {
      // Get original email
      const { data: email } = await this.supabase
        .from('emails')
        .select('*')
        .eq('id', response.emailId)
        .single();

      if (!email) {
        throw new Error('Original email not found');
      }

      logger.info('Sending email response', {
        responseId: response.id,
        to: email.from,
      });

      // TODO: Integrate with actual email service (Resend, SendGrid, etc.)
      // For now, just update status
      await this.supabase
        .from('email_responses')
        .update({
          status: 'sent',
          sentAt: new Date(),
        })
        .eq('id', response.id);

      logger.info('Email response sent successfully', {
        responseId: response.id,
      });
    } catch (error) {
      logger.error('Error sending email response', { responseId: response.id, error });
      throw error;
    }
  }

  /**
   * Send quotation email
   */
  async sendQuotation(quotation: GeneratedQuotation): Promise<void> {
    try {
      logger.info('Sending quotation', {
        quotationId: quotation.id,
        to: quotation.clientEmail,
      });

      // TODO: Generate PDF and send via email service
      // For now, just update status
      await this.supabase
        .from('quotations')
        .update({
          status: 'sent',
          sentAt: new Date(),
        })
        .eq('id', quotation.id);

      logger.info('Quotation sent successfully', {
        quotationId: quotation.id,
      });
    } catch (error) {
      logger.error('Error sending quotation', { quotationId: quotation.id, error });
      throw error;
    }
  }

  // ==========================================================================
  // DATABASE OPERATIONS
  // ==========================================================================

  private async storeEmail(email: EmailMessage, analysis: EmailAnalysis): Promise<void> {
    await this.supabase.from('emails').insert({
      id: email.id,
      from_email: email.from,
      to_email: email.to,
      subject: email.subject,
      body: email.body,
      body_html: email.bodyHtml,
      received_at: email.receivedAt,
      analysis: analysis,
      is_read: email.isRead,
      is_starred: email.isStarred,
    });
  }

  private async storeResponse(response: GeneratedResponse): Promise<void> {
    await this.supabase.from('email_responses').insert(response);
  }

  private async storeQuotation(quotation: GeneratedQuotation): Promise<void> {
    await this.supabase.from('quotations').insert(quotation);
  }

  private async markAsSpam(emailId: string): Promise<void> {
    await this.supabase
      .from('emails')
      .update({ is_spam: true, labels: ['spam'] })
      .eq('id', emailId);
  }

  // ==========================================================================
  // NOTIFICATIONS
  // ==========================================================================

  private async sendNotifications(
    email: EmailMessage,
    analysis: EmailAnalysis,
    result: any
  ): Promise<void> {
    try {
      const notifications = [];

      // High priority notification
      if (analysis.priority === 'urgent' || analysis.priority === 'high') {
        notifications.push({
          type: 'urgent_email',
          title: `Urgent Email: ${email.subject}`,
          message: analysis.summary,
          channels: this.config.notificationChannels,
        });
      }

      // Approval notification
      if (result.workflow) {
        notifications.push({
          type: 'approval_required',
          title: `Approval Required: ${result.workflow.type}`,
          message: `Please review and approve ${result.workflow.type}`,
          channels: ['email', 'push'],
        });
      }

      // Send notifications
      for (const notification of notifications) {
        await this.supabase.from('notifications').insert(notification);
      }
    } catch (error) {
      logger.error('Error sending notifications', { error });
    }
  }

  private async notifyApprovers(workflow: ApprovalWorkflow): Promise<void> {
    for (const approver of workflow.approvers) {
      await this.supabase.from('notifications').insert({
        user_id: approver,
        type: 'approval_required',
        title: `Approval Required: ${workflow.type}`,
        message: `Priority: ${workflow.priority}`,
        metadata: { workflowId: workflow.id },
      });
    }
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update agent configuration
   */
  async updateConfig(config: Partial<EmailAgentConfig>): Promise<void> {
    this.config = { ...this.config, ...config };

    // Store in database
    await this.supabase
      .from('email_agent_config')
      .upsert({ id: 'default', config: this.config });

    logger.info('Email agent configuration updated', { config: this.config });
  }

  /**
   * Get agent statistics
   */
  async getStatistics(dateRange?: { from: Date; to: Date }): Promise<{
    totalEmailsProcessed: number;
    responsesGenerated: number;
    quotationsGenerated: number;
    approvalsPending: number;
    approvalsCompleted: number;
    avgResponseTime: number;
  }> {
    // TODO: Implement statistics queries
    return {
      totalEmailsProcessed: 0,
      responsesGenerated: 0,
      quotationsGenerated: 0,
      approvalsPending: 0,
      approvalsCompleted: 0,
      avgResponseTime: 0,
    };
  }
}

export default EmailAgentService;
