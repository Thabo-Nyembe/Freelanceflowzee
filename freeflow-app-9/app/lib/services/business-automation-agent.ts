/**
 * Business Automation Agent
 *
 * Comprehensive AI-powered business automation system that handles:
 * - Email monitoring and automated responses
 * - Quotation and invoice generation
 * - Client follow-ups and relationship management
 * - Task scheduling and reminders
 * - Project status tracking and reporting
 * - Payment reminders and collections
 * - Meeting scheduling and calendar management
 * - Document generation (contracts, proposals)
 * - Social media post scheduling
 * - Analytics and insights generation
 */

import { EmailAgentService } from './email-agent-service';
import { AIService } from './ai-service';
import { createClient } from '@supabase/supabase-js';
import logger from '@/lib/logger';
import { getEmailService } from '@/lib/email/email-service';
import {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingReschedule
} from '@/lib/email/email-templates';

const emailService = getEmailService();

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface AutomationTask {
  id: string;
  type:
    | 'email_response'
    | 'client_followup'
    | 'invoice_reminder'
    | 'project_update'
    | 'meeting_scheduler'
    | 'document_generation'
    | 'social_media_post'
    | 'data_analysis'
    | 'report_generation'
    | 'payment_collection'
    | 'booking_management'
    | 'booking_reminder'
    | 'booking_confirmation';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor?: Date;
  executedAt?: Date;
  completedAt?: Date;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  retryCount: number;
  maxRetries: number;
  createdBy: string;
  metadata?: Record<string, any>;
}

export interface BookingRequest {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceType: string;
  preferredDate?: Date;
  preferredTime?: string;
  duration?: number;
  numberOfPeople?: number;
  specialRequests?: string;
  source: 'email' | 'web' | 'phone' | 'sms' | 'whatsapp';
}

export interface Booking {
  id: string;
  bookingNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceType: string;
  serviceDuration: number;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  price: number;
  currency: string;
  depositRequired?: number;
  depositPaid?: boolean;
  staffMember?: string;
  location?: string;
  resources?: string[];
  notes?: string;
  remindersSent: ('24h' | '1h' | '15m')[];
  createdAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface AvailabilitySlot {
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
  staffMember?: string;
  resource?: string;
}

export interface BookingRules {
  businessHours: {
    [key: string]: { start: string; end: string; breaks?: { start: string; end: string }[] } | null;
  };
  bufferTime: number; // minutes between bookings
  advanceBookingDays: number; // how far in advance can book
  minAdvanceHours: number; // minimum notice required
  maxBookingsPerDay?: number;
  allowWaitlist: boolean;
  cancellationPolicy: {
    allowCancellation: boolean;
    minHoursBeforeCancellation: number;
    cancellationFee?: number;
  };
  depositPolicy?: {
    required: boolean;
    percentage?: number;
    flatAmount?: number;
  };
}

export interface ClientFollowUp {
  clientId: string;
  clientName: string;
  clientEmail: string;
  lastContactDate: Date;
  followUpReason: 'project_check' | 'payment_reminder' | 'feedback_request' | 'renewal' | 'upsell' | 'general';
  followUpMessage: string;
  suggestedActions: string[];
  status: 'draft' | 'scheduled' | 'sent' | 'responded';
}

export interface InvoiceReminder {
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  dueDate: Date;
  daysOverdue: number;
  reminderType: 'friendly' | 'firm' | 'final_notice';
  message: string;
  status: 'draft' | 'scheduled' | 'sent';
}

export interface ProjectUpdate {
  projectId: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  progress: number;
  milestones: {
    name: string;
    status: 'completed' | 'in_progress' | 'upcoming';
    completedDate?: Date;
  }[];
  nextSteps: string[];
  blockers?: string[];
  updateMessage: string;
  includeMetrics: boolean;
}

export interface MeetingScheduleRequest {
  attendees: string[];
  subject: string;
  duration: number; // minutes
  preferredDates: Date[];
  meetingType: 'consultation' | 'project_review' | 'demo' | 'sales' | 'general';
  description?: string;
  location?: string;
  virtualMeetingLink?: string;
}

export interface DocumentGenerationRequest {
  type: 'contract' | 'proposal' | 'nda' | 'sow' | 'invoice' | 'report';
  clientName: string;
  clientEmail: string;
  projectName?: string;
  templateId?: string;
  variables: Record<string, any>;
  outputFormat: 'pdf' | 'docx' | 'html';
  status: 'draft' | 'generated' | 'sent';
}

export interface SocialMediaPost {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram';
  content: string;
  media?: string[];
  hashtags?: string[];
  scheduledFor: Date;
  status: 'draft' | 'scheduled' | 'published';
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface AnalyticsInsight {
  type: 'revenue' | 'clients' | 'projects' | 'performance' | 'trends';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  data: Record<string, any>;
  insights: string[];
  recommendations: string[];
  generatedAt: Date;
}

export interface AgentConfiguration {
  enabled: boolean;
  automationRules: AutomationRule[];
  businessHours: {
    timezone: string;
    schedule: Record<string, { start: string; end: string } | null>;
  };
  notifications: {
    channels: ('email' | 'sms' | 'push' | 'slack')[];
    urgentOnly: boolean;
  };
  aiSettings: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    type: 'schedule' | 'event' | 'condition';
    schedule?: string; // cron expression
    event?: string;
    condition?: string;
  };
  actions: {
    type: string;
    config: Record<string, any>;
  }[];
}

// ============================================================================
// BUSINESS AUTOMATION AGENT CLASS
// ============================================================================

export class BusinessAutomationAgent {
  private emailAgent: EmailAgentService;
  private aiService: AIService;
  private supabase: ReturnType<typeof createClient>;
  private config: AgentConfiguration;
  private intervals: NodeJS.Timeout[] = []; // Store intervals for cleanup

  constructor(config?: Partial<AgentConfiguration>) {
    this.emailAgent = new EmailAgentService();
    this.aiService = new AIService();

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.config = {
      enabled: true,
      automationRules: [],
      businessHours: {
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
      notifications: {
        channels: ['email', 'push'],
        urgentOnly: false,
      },
      aiSettings: {
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        maxTokens: 2000,
      },
      ...config,
    };
  }

  // ==========================================================================
  // CLIENT FOLLOW-UP AUTOMATION
  // ==========================================================================

  /**
   * Generate personalized follow-up messages for clients
   */
  async generateClientFollowUp(
    clientId: string,
    reason: ClientFollowUp['followUpReason']
  ): Promise<ClientFollowUp> {
    try {
      logger.info('Generating client follow-up', { clientId, reason });

      // Get client data
      const { data: client } = await this.supabase
        .from('clients')
        .select('*, projects(*), invoices(*)')
        .eq('id', clientId)
        .single();

      if (!client) {
        throw new Error('Client not found');
      }

      // Get last contact
      const { data: lastContact } = await this.supabase
        .from('emails')
        .select('*')
        .or(`from_email.eq.${client.email},to_email.eq.${client.email}`)
        .order('received_at', { ascending: false })
        .limit(1)
        .single();

      const lastContactDate = lastContact ? new Date(lastContact.received_at) : new Date(client.created_at);

      // Generate personalized follow-up message using AI
      const prompt = `Generate a personalized follow-up email for a client:

CLIENT: ${client.name}
EMAIL: ${client.email}
RELATIONSHIP SINCE: ${new Date(client.created_at).toLocaleDateString()}
LAST CONTACT: ${lastContactDate.toLocaleDateString()}
TOTAL PROJECTS: ${client.projects?.length || 0}
ACTIVE PROJECTS: ${client.projects?.filter((p: any) => p.status === 'active').length || 0}
OUTSTANDING INVOICES: ${client.invoices?.filter((i: any) => i.status !== 'paid').length || 0}

FOLLOW-UP REASON: ${reason}

Generate a warm, professional follow-up email that:
1. References our relationship history
2. Addresses the specific reason for follow-up
3. Provides value or helpful information
4. Includes a clear call-to-action
5. Maintains a friendly but professional tone

Also suggest 2-3 specific actions we should take.

Return as JSON with fields: subject, message, suggestedActions (array)`;

      const response = await this.aiService.generateText({
        model: this.config.aiSettings.model,
        prompt,
        temperature: 0.7,
        maxTokens: 1000,
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      let message = 'Hi! Just checking in...';
      let suggestedActions: string[] = ['Schedule a call', 'Send project update'];

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        message = parsed.message || message;
        suggestedActions = parsed.suggestedActions || suggestedActions;
      }

      const followUp: ClientFollowUp = {
        clientId,
        clientName: client.name,
        clientEmail: client.email,
        lastContactDate,
        followUpReason: reason,
        followUpMessage: message,
        suggestedActions,
        status: 'draft',
      };

      // Store follow-up
      await this.supabase.from('client_followups').insert(followUp);

      logger.info('Client follow-up generated', { clientId, reason });

      return followUp;
    } catch (error) {
      logger.error('Error generating client follow-up', { clientId, error });
      throw error;
    }
  }

  /**
   * Automatically identify clients needing follow-up
   */
  async identifyClientsNeedingFollowUp(): Promise<ClientFollowUp[]> {
    try {
      logger.info('Identifying clients needing follow-up');

      const followUps: ClientFollowUp[] = [];

      // Get all active clients
      const { data: clients } = await this.supabase
        .from('clients')
        .select('*, projects(*), invoices(*), emails(*)')
        .eq('status', 'active');

      if (!clients) return [];

      for (const client of clients) {
        // Check for various follow-up scenarios
        const scenarios = [];

        // 1. No contact in 30+ days
        const lastEmail = client.emails?.[0];
        if (!lastEmail || this.daysSince(new Date(lastEmail.received_at)) > 30) {
          scenarios.push('general');
        }

        // 2. Overdue invoices
        const overdueInvoices = client.invoices?.filter(
          (inv: any) => inv.status !== 'paid' && new Date(inv.due_date) < new Date()
        );
        if (overdueInvoices && overdueInvoices.length > 0) {
          scenarios.push('payment_reminder');
        }

        // 3. Project completion follow-up
        const recentlyCompleted = client.projects?.filter(
          (proj: any) =>
            proj.status === 'completed' &&
            this.daysSince(new Date(proj.completed_at)) <= 7
        );
        if (recentlyCompleted && recentlyCompleted.length > 0) {
          scenarios.push('feedback_request');
        }

        // 4. Project check-in
        const activeProjects = client.projects?.filter((p: any) => p.status === 'active');
        if (activeProjects && activeProjects.length > 0) {
          scenarios.push('project_check');
        }

        // Generate follow-ups for identified scenarios
        for (const scenario of scenarios) {
          const followUp = await this.generateClientFollowUp(client.id, scenario as any);
          followUps.push(followUp);
        }
      }

      logger.info('Identified clients needing follow-up', { count: followUps.length });

      return followUps;
    } catch (error) {
      logger.error('Error identifying clients needing follow-up', { error });
      return [];
    }
  }

  // ==========================================================================
  // INVOICE REMINDERS
  // ==========================================================================

  /**
   * Generate payment reminder for overdue invoice
   */
  async generateInvoiceReminder(invoiceId: string): Promise<InvoiceReminder> {
    try {
      logger.info('Generating invoice reminder', { invoiceId });

      // Get invoice data
      const { data: invoice } = await this.supabase
        .from('invoices')
        .select('*, client:clients(*)')
        .eq('id', invoiceId)
        .single();

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const daysOverdue = this.daysSince(new Date(invoice.due_date));

      // Determine reminder type based on days overdue
      let reminderType: InvoiceReminder['reminderType'] = 'friendly';
      if (daysOverdue > 30) {
        reminderType = 'final_notice';
      } else if (daysOverdue > 14) {
        reminderType = 'firm';
      }

      // Generate appropriate message using AI
      const prompt = `Generate a payment reminder email for an overdue invoice:

INVOICE NUMBER: ${invoice.invoice_number}
AMOUNT: ${invoice.currency} ${invoice.total}
DUE DATE: ${new Date(invoice.due_date).toLocaleDateString()}
DAYS OVERDUE: ${daysOverdue}
CLIENT: ${invoice.client.name}
REMINDER TYPE: ${reminderType}

Generate an email that:
1. ${reminderType === 'friendly' ? 'Politely reminds about the overdue payment' : ''}
2. ${reminderType === 'firm' ? 'Firmly requests immediate payment' : ''}
3. ${reminderType === 'final_notice' ? 'Issues a final notice with consequences' : ''}
4. Maintains professionalism
5. Provides payment options
6. Includes invoice details

Return as JSON with fields: subject, message`;

      const response = await this.aiService.generateText({
        model: this.config.aiSettings.model,
        prompt,
        temperature: 0.6,
        maxTokens: 800,
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      let message = `Your invoice ${invoice.invoice_number} is overdue. Please remit payment at your earliest convenience.`;

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        message = parsed.message || message;
      }

      const reminder: InvoiceReminder = {
        invoiceId,
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.client.name,
        clientEmail: invoice.client.email,
        amount: invoice.total,
        currency: invoice.currency,
        dueDate: new Date(invoice.due_date),
        daysOverdue,
        reminderType,
        message,
        status: 'draft',
      };

      // Store reminder
      await this.supabase.from('invoice_reminders').insert(reminder);

      logger.info('Invoice reminder generated', { invoiceId, reminderType });

      return reminder;
    } catch (error) {
      logger.error('Error generating invoice reminder', { invoiceId, error });
      throw error;
    }
  }

  /**
   * Check for overdue invoices and send reminders
   */
  async processOverdueInvoices(): Promise<InvoiceReminder[]> {
    try {
      logger.info('Processing overdue invoices');

      const { data: overdueInvoices } = await this.supabase
        .from('invoices')
        .select('*')
        .neq('status', 'paid')
        .lt('due_date', new Date().toISOString());

      if (!overdueInvoices || overdueInvoices.length === 0) {
        logger.info('No overdue invoices found');
        return [];
      }

      const reminders: InvoiceReminder[] = [];

      for (const invoice of overdueInvoices) {
        const reminder = await this.generateInvoiceReminder(invoice.id);
        reminders.push(reminder);
      }

      logger.info('Overdue invoice reminders generated', { count: reminders.length });

      return reminders;
    } catch (error) {
      logger.error('Error processing overdue invoices', { error });
      return [];
    }
  }

  // ==========================================================================
  // PROJECT STATUS UPDATES
  // ==========================================================================

  /**
   * Generate project status update for client
   */
  async generateProjectUpdate(projectId: string): Promise<ProjectUpdate> {
    try {
      logger.info('Generating project update', { projectId });

      // Get project data
      const { data: project } = await this.supabase
        .from('projects')
        .select('*, client:clients(*), tasks(*), milestones(*)')
        .eq('id', projectId)
        .single();

      if (!project) {
        throw new Error('Project not found');
      }

      // Calculate progress
      const totalTasks = project.tasks?.length || 0;
      const completedTasks = project.tasks?.filter((t: any) => t.status === 'completed').length || 0;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Prepare milestone data
      const milestones = (project.milestones || []).map((m: any) => ({
        name: m.name,
        status: m.status,
        completedDate: m.completed_at ? new Date(m.completed_at) : undefined,
      }));

      // Identify blockers
      const blockers = project.tasks
        ?.filter((t: any) => t.status === 'blocked')
        .map((t: any) => t.blocker_reason) || [];

      // Generate update message using AI
      const prompt = `Generate a professional project status update for a client:

PROJECT: ${project.name}
CLIENT: ${project.client.name}
PROGRESS: ${progress}%
COMPLETED TASKS: ${completedTasks}/${totalTasks}
MILESTONES: ${milestones.length} total, ${milestones.filter(m => m.status === 'completed').length} completed
BLOCKERS: ${blockers.length > 0 ? blockers.join(', ') : 'None'}
BUDGET USED: ${project.budget_used || 0}/${project.budget || 0}

Generate an update email that:
1. Summarizes current progress
2. Highlights completed milestones
3. Outlines next steps
4. Addresses any blockers professionally
5. Sets expectations for next update
6. Maintains positive, confident tone

Return as JSON with fields: message, nextSteps (array), summary`;

      const response = await this.aiService.generateText({
        model: this.config.aiSettings.model,
        prompt,
        temperature: 0.7,
        maxTokens: 1000,
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      let updateMessage = `Project is ${progress}% complete.`;
      let nextSteps: string[] = ['Continue development', 'Schedule review'];

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        updateMessage = parsed.message || updateMessage;
        nextSteps = parsed.nextSteps || nextSteps;
      }

      const projectUpdate: ProjectUpdate = {
        projectId,
        projectName: project.name,
        clientName: project.client.name,
        clientEmail: project.client.email,
        progress,
        milestones,
        nextSteps,
        blockers: blockers.length > 0 ? blockers : undefined,
        updateMessage,
        includeMetrics: true,
      };

      // Store update
      await this.supabase.from('project_updates').insert(projectUpdate);

      logger.info('Project update generated', { projectId, progress });

      return projectUpdate;
    } catch (error) {
      logger.error('Error generating project update', { projectId, error });
      throw error;
    }
  }

  /**
   * Send weekly project updates for active projects
   */
  async sendWeeklyProjectUpdates(): Promise<ProjectUpdate[]> {
    try {
      logger.info('Sending weekly project updates');

      const { data: activeProjects } = await this.supabase
        .from('projects')
        .select('*')
        .eq('status', 'active');

      if (!activeProjects || activeProjects.length === 0) {
        return [];
      }

      const updates: ProjectUpdate[] = [];

      for (const project of activeProjects) {
        const update = await this.generateProjectUpdate(project.id);
        updates.push(update);

        // Send project update email
        if (project.client_email) {
          try {
            await emailService.send({
              to: project.client_email,
              subject: `Weekly Update: ${project.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #3B82F6;">Project Update</h2>
                  <h3>${project.title}</h3>
                  <p><strong>Status:</strong> ${update.status}</p>
                  <p><strong>Progress:</strong> ${update.progress}%</p>
                  <p>${update.summary}</p>
                  <h4>Recent Activities:</h4>
                  <ul>
                    ${update.activities.slice(0, 5).map((a: any) => `<li>${a.description}</li>`).join('')}
                  </ul>
                  <p style="margin-top: 20px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/project/${project.id}"
                       style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                      View Full Project
                    </a>
                  </p>
                </div>
              `,
              text: `Project Update: ${project.title}\nStatus: ${update.status}\nProgress: ${update.progress}%\n${update.summary}`,
              tags: ['project-update', 'weekly-update']
            });
            logger.info('Project update email sent', { projectId: project.id });
          } catch (emailError) {
            logger.error('Failed to send project update email', { projectId: project.id, error: emailError });
          }
        }
      }

      logger.info('Weekly project updates sent', { count: updates.length });

      return updates;
    } catch (error) {
      logger.error('Error sending weekly project updates', { error });
      return [];
    }
  }

  // ==========================================================================
  // MEETING SCHEDULING
  // ==========================================================================

  /**
   * Find available meeting slots and send scheduling options
   */
  async scheduleMeeting(request: MeetingScheduleRequest): Promise<{
    availableSlots: Date[];
    message: string;
  }> {
    try {
      logger.info('Scheduling meeting', { subject: request.subject });

      // Get calendar events to find conflicts
      const { data: events } = await this.supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time');

      // Find available slots (simplified logic)
      const availableSlots: Date[] = [];

      for (const preferredDate of request.preferredDates) {
        const hasConflict = events?.some((event: any) => {
          const eventStart = new Date(event.start_time);
          const eventEnd = new Date(event.end_time);
          return preferredDate >= eventStart && preferredDate <= eventEnd;
        });

        if (!hasConflict) {
          availableSlots.push(preferredDate);
        }
      }

      // Generate scheduling message
      const prompt = `Generate a professional meeting scheduling email:

SUBJECT: ${request.subject}
TYPE: ${request.meetingType}
DURATION: ${request.duration} minutes
AVAILABLE SLOTS: ${availableSlots.map(s => s.toLocaleString()).join(', ')}
ATTENDEES: ${request.attendees.length}

Generate an email that:
1. Proposes the meeting
2. Lists available time slots
3. Explains the meeting purpose
4. Provides meeting details (virtual link, location)
5. Requests confirmation

Return as JSON with field: message`;

      const response = await this.aiService.generateText({
        model: this.config.aiSettings.model,
        prompt,
        temperature: 0.7,
        maxTokens: 600,
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      let message = 'Let\'s schedule a meeting. Please confirm your availability.';

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        message = parsed.message || message;
      }

      logger.info('Meeting scheduling prepared', {
        availableSlots: availableSlots.length,
      });

      return {
        availableSlots,
        message,
      };
    } catch (error) {
      logger.error('Error scheduling meeting', { error });
      throw error;
    }
  }

  // ==========================================================================
  // ANALYTICS AND INSIGHTS
  // ==========================================================================

  /**
   * Generate business insights and analytics
   */
  async generateBusinessInsights(
    type: AnalyticsInsight['type'],
    period: AnalyticsInsight['period']
  ): Promise<AnalyticsInsight> {
    try {
      logger.info('Generating business insights', { type, period });

      // Fetch relevant data based on type and period
      const startDate = this.getPeriodStartDate(period);

      let data: Record<string, any> = {};

      if (type === 'revenue') {
        const { data: invoices } = await this.supabase
          .from('invoices')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .eq('status', 'paid');

        data = {
          totalRevenue: invoices?.reduce((sum, inv) => sum + inv.total, 0) || 0,
          invoiceCount: invoices?.length || 0,
          averageInvoice: invoices?.length ? data.totalRevenue / invoices.length : 0,
        };
      } else if (type === 'clients') {
        const { data: clients } = await this.supabase
          .from('clients')
          .select('*')
          .gte('created_at', startDate.toISOString());

        data = {
          newClients: clients?.length || 0,
          totalActive: clients?.filter(c => c.status === 'active').length || 0,
        };
      } else if (type === 'projects') {
        const { data: projects } = await this.supabase
          .from('projects')
          .select('*')
          .gte('created_at', startDate.toISOString());

        data = {
          totalProjects: projects?.length || 0,
          active: projects?.filter(p => p.status === 'active').length || 0,
          completed: projects?.filter(p => p.status === 'completed').length || 0,
        };
      }

      // Generate AI insights
      const prompt = `Analyze this business data and provide insights:

TYPE: ${type}
PERIOD: ${period}
DATA: ${JSON.stringify(data, null, 2)}

Provide:
1. 3-5 key insights about the data
2. 2-3 actionable recommendations
3. Trends or patterns observed

Return as JSON with fields: insights (array), recommendations (array)`;

      const response = await this.aiService.generateText({
        model: this.config.aiSettings.model,
        prompt,
        temperature: 0.7,
        maxTokens: 800,
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      let insights: string[] = ['Data analysis in progress'];
      let recommendations: string[] = ['Continue monitoring'];

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        insights = parsed.insights || insights;
        recommendations = parsed.recommendations || recommendations;
      }

      const analyticsInsight: AnalyticsInsight = {
        type,
        period,
        data,
        insights,
        recommendations,
        generatedAt: new Date(),
      };

      // Store insights
      await this.supabase.from('analytics_insights').insert(analyticsInsight);

      logger.info('Business insights generated', { type, period });

      return analyticsInsight;
    } catch (error) {
      logger.error('Error generating business insights', { error });
      throw error;
    }
  }

  // ==========================================================================
  // TASK EXECUTION ENGINE
  // ==========================================================================

  /**
   * Execute an automation task
   */
  async executeTask(task: AutomationTask): Promise<AutomationTask> {
    try {
      logger.info('Executing automation task', { taskId: task.id, type: task.type });

      task.status = 'processing';
      task.executedAt = new Date();

      let output: Record<string, any> = {};

      switch (task.type) {
        case 'client_followup':
          const followUp = await this.generateClientFollowUp(
            task.input.clientId,
            task.input.reason
          );
          output = { followUp };
          break;

        case 'invoice_reminder':
          const reminder = await this.generateInvoiceReminder(task.input.invoiceId);
          output = { reminder };
          break;

        case 'project_update':
          const update = await this.generateProjectUpdate(task.input.projectId);
          output = { update };
          break;

        case 'data_analysis':
          const insights = await this.generateBusinessInsights(
            task.input.type,
            task.input.period
          );
          output = { insights };
          break;

        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      task.status = 'completed';
      task.completedAt = new Date();
      task.output = output;

      // Update task in database
      await this.supabase
        .from('automation_tasks')
        .update(task)
        .eq('id', task.id);

      logger.info('Automation task completed', { taskId: task.id, type: task.type });

      return task;
    } catch (error: any) {
      logger.error('Error executing automation task', { taskId: task.id, error });

      task.status = 'failed';
      task.error = error.message;
      task.retryCount++;

      await this.supabase
        .from('automation_tasks')
        .update(task)
        .eq('id', task.id);

      // Retry if under max retries
      if (task.retryCount < task.maxRetries) {
        logger.info('Scheduling task retry', { taskId: task.id, retryCount: task.retryCount });
        // Schedule retry with exponential backoff
        setTimeout(() => this.executeTask(task), task.retryCount * 60000);
      }

      return task;
    }
  }

  /**
   * Process pending automation tasks
   */
  async processPendingTasks(): Promise<void> {
    try {
      logger.info('Processing pending automation tasks');

      const { data: tasks } = await this.supabase
        .from('automation_tasks')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false });

      if (!tasks || tasks.length === 0) {
        logger.info('No pending tasks to process');
        return;
      }

      logger.info('Found pending tasks', { count: tasks.length });

      // Execute tasks in parallel (with concurrency limit)
      const concurrencyLimit = 5;
      for (let i = 0; i < tasks.length; i += concurrencyLimit) {
        const batch = tasks.slice(i, i + concurrencyLimit);
        await Promise.all(batch.map(task => this.executeTask(task)));
      }

      logger.info('Pending tasks processed');
    } catch (error) {
      logger.error('Error processing pending tasks', { error });
    }
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  private daysSince(date: Date): number {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private getPeriodStartDate(period: AnalyticsInsight['period']): Date {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.setDate(now.getDate() - 1));
      case 'weekly':
        return new Date(now.setDate(now.getDate() - 7));
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'quarterly':
        return new Date(now.setMonth(now.getMonth() - 3));
      case 'yearly':
        return new Date(now.setFullYear(now.getFullYear() - 1));
    }
  }

  // ==========================================================================
  // BOOKING AUTOMATION
  // ==========================================================================

  /**
   * Process booking request from email or other source
   */
  async processBookingRequest(request: BookingRequest): Promise<{
    availableSlots: AvailabilitySlot[];
    suggestedBooking?: Booking;
    message: string;
  }> {
    try {
      logger.info('Processing booking request', {
        client: request.clientEmail,
        service: request.serviceType,
      });

      // Get service details and pricing
      const service = await this.getServiceDetails(request.serviceType);

      // Find available slots
      const availableSlots = await this.findAvailableSlots({
        serviceType: request.serviceType,
        duration: request.duration || service.defaultDuration,
        preferredDate: request.preferredDate,
        numberOfPeople: request.numberOfPeople,
      });

      if (availableSlots.length === 0) {
        return {
          availableSlots: [],
          message: this.generateNoAvailabilityMessage(request),
        };
      }

      // Generate response message with AI
      const prompt = `Generate a friendly booking response email:

CLIENT: ${request.clientName}
SERVICE REQUESTED: ${request.serviceType}
PREFERRED DATE: ${request.preferredDate ? request.preferredDate.toLocaleDateString() : 'Not specified'}
AVAILABLE SLOTS: ${availableSlots.slice(0, 3).map(s => `${s.date.toLocaleDateString()} at ${s.startTime}`).join(', ')}
DURATION: ${service.defaultDuration} minutes
PRICE: $${service.price}

Generate a warm, professional email that:
1. Acknowledges their booking request
2. Presents the available time slots
3. Includes pricing and what's included
4. Provides clear next steps to confirm
5. Mentions any special requirements or preparation

Return as JSON with field: message`;

      const response = await this.aiService.generateText({
        model: this.config.aiSettings.model,
        prompt,
        temperature: 0.7,
        maxTokens: 600,
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      let message = `Hi ${request.clientName}! We have availability for ${request.serviceType}. Here are some options: ${availableSlots.slice(0, 3).map(s => `${s.date.toLocaleDateString()} at ${s.startTime}`).join(', ')}. Please reply to confirm your preferred time!`;

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        message = parsed.message || message;
      }

      // Create suggested booking for most convenient slot
      const suggestedBooking = await this.createBookingSuggestion(
        request,
        availableSlots[0],
        service
      );

      logger.info('Booking request processed', {
        availableSlots: availableSlots.length,
      });

      return {
        availableSlots,
        suggestedBooking,
        message,
      };
    } catch (error) {
      logger.error('Error processing booking request', { error });
      throw error;
    }
  }

  /**
   * Find available time slots for booking
   */
  async findAvailableSlots(params: {
    serviceType: string;
    duration: number;
    preferredDate?: Date;
    numberOfPeople?: number;
  }): Promise<AvailabilitySlot[]> {
    try {
      const { serviceType, duration, preferredDate } = params;

      // Get booking rules
      const rules = await this.getBookingRules(serviceType);

      // Generate date range to check
      const startDate = preferredDate || new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (rules.advanceBookingDays || 30));

      const availableSlots: AvailabilitySlot[] = [];

      // Check each day in range
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const businessHours = rules.businessHours[dayName];

        if (!businessHours) continue; // Closed this day

        // Get existing bookings for this day
        const { data: existingBookings } = await this.supabase
          .from('bookings')
          .select('*')
          .eq('service_type', serviceType)
          .gte('start_time', new Date(d.setHours(0, 0, 0, 0)).toISOString())
          .lt('start_time', new Date(d.setHours(23, 59, 59, 999)).toISOString())
          .neq('status', 'cancelled');

        // Generate time slots for this day
        const daySlots = this.generateTimeSlotsForDay(
          d,
          businessHours,
          duration,
          rules.bufferTime,
          existingBookings || []
        );

        availableSlots.push(...daySlots);
      }

      logger.info('Found available slots', { count: availableSlots.length });

      return availableSlots.slice(0, 10); // Return top 10 slots
    } catch (error) {
      logger.error('Error finding available slots', { error });
      return [];
    }
  }

  /**
   * Generate time slots for a specific day
   */
  private generateTimeSlotsForDay(
    date: Date,
    businessHours: { start: string; end: string; breaks?: { start: string; end: string }[] },
    duration: number,
    bufferTime: number,
    existingBookings: any[]
  ): AvailabilitySlot[] {
    const slots: AvailabilitySlot[] = [];

    const [startHour, startMin] = businessHours.start.split(':').map(Number);
    const [endHour, endMin] = businessHours.end.split(':').map(Number);

    const currentTime = new Date(date);
    currentTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMin, 0, 0);

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      if (slotEnd > endTime) break;

      // Check if slot conflicts with existing booking
      const hasConflict = existingBookings.some((booking) => {
        const bookingStart = new Date(booking.start_time);
        const bookingEnd = new Date(booking.end_time);
        return currentTime < bookingEnd && slotEnd > bookingStart;
      });

      // Check if slot is in break time
      const inBreak = businessHours.breaks?.some((breakTime) => {
        const [breakStartH, breakStartM] = breakTime.start.split(':').map(Number);
        const [breakEndH, breakEndM] = breakTime.end.split(':').map(Number);

        const breakStart = new Date(date);
        breakStart.setHours(breakStartH, breakStartM, 0, 0);

        const breakEnd = new Date(date);
        breakEnd.setHours(breakEndH, breakEndM, 0, 0);

        return currentTime < breakEnd && slotEnd > breakStart;
      });

      if (!hasConflict && !inBreak) {
        slots.push({
          date: new Date(currentTime),
          startTime: currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          endTime: slotEnd.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          available: true,
        });
      }

      // Move to next slot (duration + buffer)
      currentTime.setMinutes(currentTime.getMinutes() + duration + bufferTime);
    }

    return slots;
  }

  /**
   * Create a booking from confirmed request
   */
  async createBooking(
    request: BookingRequest,
    slot: AvailabilitySlot,
    autoConfirm: boolean = false
  ): Promise<Booking> {
    try {
      logger.info('Creating booking', {
        client: request.clientEmail,
        slot: slot.startTime,
      });

      const service = await this.getServiceDetails(request.serviceType);

      const booking: Booking = {
        id: this.generateId('book'),
        bookingNumber: this.generateBookingNumber(),
        clientName: request.clientName,
        clientEmail: request.clientEmail,
        clientPhone: request.clientPhone,
        serviceType: request.serviceType,
        serviceDuration: request.duration || service.defaultDuration,
        startTime: slot.date,
        endTime: new Date(slot.date.getTime() + (request.duration || service.defaultDuration) * 60000),
        status: autoConfirm ? 'confirmed' : 'pending',
        price: service.price,
        currency: 'USD',
        remindersSent: [],
        createdAt: new Date(),
        notes: request.specialRequests,
      };

      // Store booking
      await this.supabase.from('bookings').insert(booking);

      // Send confirmation email
      await this.sendBookingConfirmation(booking);

      // Schedule reminders
      await this.scheduleBookingReminders(booking);

      logger.info('Booking created successfully', {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
      });

      return booking;
    } catch (error) {
      logger.error('Error creating booking', { error });
      throw error;
    }
  }

  /**
   * Send booking confirmation email
   */
  private async sendBookingConfirmation(booking: Booking): Promise<void> {
    try {
      const prompt = `Generate a professional booking confirmation email:

BOOKING NUMBER: ${booking.bookingNumber}
CLIENT: ${booking.clientName}
SERVICE: ${booking.serviceType}
DATE: ${booking.startTime.toLocaleDateString()}
TIME: ${booking.startTime.toLocaleTimeString()}
DURATION: ${booking.serviceDuration} minutes
PRICE: ${booking.currency} ${booking.price}

Include:
1. Warm confirmation message
2. Booking details (formatted nicely)
3. What to expect/prepare
4. Cancellation policy
5. Contact information for questions
6. Add to calendar link

Return as JSON with fields: subject, message`;

      const response = await this.aiService.generateText({
        model: this.config.aiSettings.model,
        prompt,
        temperature: 0.7,
        maxTokens: 800,
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      let subject = `Booking Confirmation - ${booking.bookingNumber}`;
      let message = `Your booking is confirmed! See you on ${booking.startTime.toLocaleDateString()}`;

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        subject = parsed.subject || subject;
        message = parsed.message || message;
      }

      // Send booking confirmation email
      try {
        const startTime = new Date(booking.startTime);
        await sendBookingConfirmation({
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          bookingTitle: booking.serviceType,
          bookingDate: startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          bookingTime: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          duration: `${booking.serviceDuration} minutes`,
          meetingUrl: booking.videoCallUrl,
          hostName: 'Your Service Provider',
          notes: booking.specialRequests
        });
        logger.info('Booking confirmation email sent', { bookingId: booking.id });
      } catch (emailError) {
        logger.error('Failed to send booking confirmation email', { bookingId: booking.id, error: emailError });
      }
    } catch (error) {
      logger.error('Error sending booking confirmation', { error });
    }
  }

  /**
   * Schedule automatic reminders for booking
   */
  private async scheduleBookingReminders(booking: Booking): Promise<void> {
    try {
      const startTime = new Date(booking.startTime);

      // 24-hour reminder
      const reminder24h = new Date(startTime);
      reminder24h.setHours(reminder24h.getHours() - 24);

      await this.supabase.from('automation_tasks').insert({
        type: 'booking_reminder',
        status: 'pending',
        priority: 'medium',
        scheduled_for: reminder24h.toISOString(),
        input: { bookingId: booking.id, type: '24h' },
        retry_count: 0,
        max_retries: 3,
        created_by: 'system',
      });

      // 1-hour reminder
      const reminder1h = new Date(startTime);
      reminder1h.setHours(reminder1h.getHours() - 1);

      await this.supabase.from('automation_tasks').insert({
        type: 'booking_reminder',
        status: 'pending',
        priority: 'high',
        scheduled_for: reminder1h.toISOString(),
        input: { bookingId: booking.id, type: '1h' },
        retry_count: 0,
        max_retries: 3,
        created_by: 'system',
      });

      logger.info('Booking reminders scheduled', { bookingId: booking.id });
    } catch (error) {
      logger.error('Error scheduling booking reminders', { error });
    }
  }

  /**
   * Send booking reminder
   */
  async sendBookingReminder(bookingId: string, type: '24h' | '1h' | '15m'): Promise<void> {
    try {
      const { data: booking } = await this.supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (!booking || booking.status === 'cancelled') {
        return;
      }

      let message = '';
      let subject = '';

      switch (type) {
        case '24h':
          subject = `Reminder: ${booking.service_type} Tomorrow`;
          message = `Hi ${booking.client_name}! Reminder: You have a ${booking.service_type} appointment tomorrow at ${new Date(booking.start_time).toLocaleTimeString()}. Reply CONFIRM or RESCHEDULE.`;
          break;
        case '1h':
          subject = `Starting Soon: ${booking.service_type} in 1 Hour`;
          message = `Hi ${booking.client_name}! Your ${booking.service_type} appointment starts in 1 hour. See you soon!`;
          break;
        case '15m':
          subject = `Starting Now: ${booking.service_type} in 15 Minutes`;
          message = `Your appointment starts in 15 minutes! ${booking.location || 'See booking details for location.'}`;
          break;
      }

      // Send reminder email
      if (booking.client_email) {
        try {
          await emailService.send({
            to: booking.client_email,
            subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3B82F6;">Appointment Reminder</h2>
                <p>${message}</p>
                <p><strong>Service:</strong> ${booking.service_type}</p>
                <p><strong>Date:</strong> ${new Date(booking.start_time).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${new Date(booking.start_time).toLocaleTimeString()}</p>
                ${booking.location ? `<p><strong>Location:</strong> ${booking.location}</p>` : ''}
                ${booking.video_call_url ? `<p><a href="${booking.video_call_url}" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Video Call</a></p>` : ''}
              </div>
            `,
            text: message,
            tags: ['booking-reminder', type]
          });
          logger.info('Booking reminder email sent', { bookingId, type });
        } catch (emailError) {
          logger.error('Failed to send booking reminder email', { bookingId, type, error: emailError });
        }
      }
      logger.info('Booking reminder sent', { bookingId, type });

      // Update reminders sent
      const remindersSent = [...booking.reminders_sent, type];
      await this.supabase
        .from('bookings')
        .update({ reminders_sent: remindersSent })
        .eq('id', bookingId);
    } catch (error) {
      logger.error('Error sending booking reminder', { bookingId, error });
    }
  }

  /**
   * Handle booking cancellation or rescheduling
   */
  async handleBookingChange(
    bookingId: string,
    action: 'cancel' | 'reschedule',
    newSlot?: AvailabilitySlot
  ): Promise<Booking> {
    try {
      const { data: booking } = await this.supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (action === 'cancel') {
        // Check cancellation policy
        const hoursUntilBooking = (new Date(booking.start_time).getTime() - Date.now()) / (1000 * 60 * 60);

        const rules = await this.getBookingRules(booking.service_type);

        if (hoursUntilBooking < rules.cancellationPolicy.minHoursBeforeCancellation) {
          throw new Error(`Cancellation requires ${rules.cancellationPolicy.minHoursBeforeCancellation} hours notice`);
        }

        // Cancel booking
        await this.supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        logger.info('Booking cancelled', { bookingId });

        // Send cancellation email
        if (booking.client_email) {
          try {
            const startTime = new Date(booking.start_time);
            await sendBookingCancellation({
              clientName: booking.client_name,
              clientEmail: booking.client_email,
              bookingTitle: booking.service_type,
              originalDate: startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
              originalTime: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              cancelledBy: 'client',
              reason: 'Cancelled by request',
              rescheduleUrl: `${process.env.NEXT_PUBLIC_APP_URL}/book`
            });
            logger.info('Booking cancellation email sent', { bookingId });
          } catch (emailError) {
            logger.error('Failed to send booking cancellation email', { bookingId, error: emailError });
          }
        }
      } else if (action === 'reschedule' && newSlot) {
        // Store original time for email
        const originalStartTime = new Date(booking.start_time);

        // Update booking with new time
        const newEndTime = new Date(newSlot.date);
        newEndTime.setMinutes(newEndTime.getMinutes() + booking.service_duration);

        await this.supabase
          .from('bookings')
          .update({
            start_time: newSlot.date.toISOString(),
            end_time: newEndTime.toISOString(),
          })
          .eq('id', bookingId);

        logger.info('Booking rescheduled', { bookingId, newTime: newSlot.startTime });

        // Send rescheduling email
        if (booking.client_email) {
          try {
            await sendBookingReschedule({
              clientName: booking.client_name,
              clientEmail: booking.client_email,
              bookingTitle: booking.service_type,
              originalDate: originalStartTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
              originalTime: originalStartTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              newDate: newSlot.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
              newTime: newSlot.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              duration: `${booking.service_duration} minutes`,
              meetingUrl: booking.video_call_url,
              hostName: 'Your Service Provider'
            });
            logger.info('Booking reschedule email sent', { bookingId });
          } catch (emailError) {
            logger.error('Failed to send booking reschedule email', { bookingId, error: emailError });
          }
        }
      }

      const { data: updatedBooking } = await this.supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      return updatedBooking;
    } catch (error) {
      logger.error('Error handling booking change', { bookingId, action, error });
      throw error;
    }
  }

  // ==========================================================================
  // BOOKING UTILITIES
  // ==========================================================================

  private async getServiceDetails(serviceType: string): Promise<any> {
    try {
      // First try to fetch from booking_services table (by name or slug)
      const { data: bookingService, error: bookingError } = await this.supabase
        .from('booking_services')
        .select('*')
        .or(`name.ilike.%${serviceType}%,slug.ilike.%${serviceType}%`)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (bookingService && !bookingError) {
        return {
          id: bookingService.id,
          name: bookingService.name,
          defaultDuration: bookingService.duration || 60,
          price: bookingService.price || 100,
          description: bookingService.description || `${serviceType} service`,
          currency: bookingService.currency || 'USD',
          bufferBefore: bookingService.buffer_before || 0,
          bufferAfter: bookingService.buffer_after || 15,
          maxAttendees: bookingService.max_attendees || 1,
          locationType: bookingService.location_type || 'in_person',
          requiresApproval: bookingService.requires_approval || false,
          allowCancellation: bookingService.allow_cancellation !== false,
          cancellationHours: bookingService.cancellation_hours || 24,
          depositAmount: bookingService.deposit_amount,
          depositPercentage: bookingService.deposit_percentage,
          metadata: bookingService.metadata || {},
        };
      }

      // Fallback: try to fetch from service_listings table
      const { data: serviceListing, error: listingError } = await this.supabase
        .from('service_listings')
        .select('*, packages')
        .or(`title.ilike.%${serviceType}%,slug.ilike.%${serviceType}%`)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (serviceListing && !listingError) {
        // Extract first package pricing if available
        const packages = serviceListing.packages || [];
        const basicPackage = packages.find((p: any) => p.name === 'Basic') || packages[0];

        return {
          id: serviceListing.id,
          name: serviceListing.title,
          defaultDuration: basicPackage?.delivery_days ? basicPackage.delivery_days * 60 : 60,
          price: basicPackage?.price || 100,
          description: serviceListing.description || `${serviceType} service`,
          currency: 'USD',
          packages: packages,
          metadata: {},
        };
      }

      // Return default values if service not found in database
      logger.warn('Service not found in database, using defaults', { serviceType });
      return {
        name: serviceType,
        defaultDuration: 60,
        price: 100,
        description: `${serviceType} service`,
        currency: 'USD',
      };
    } catch (error) {
      logger.error('Error fetching service details', { serviceType, error });
      // Return default values on error
      return {
        name: serviceType,
        defaultDuration: 60,
        price: 100,
        description: `${serviceType} service`,
        currency: 'USD',
      };
    }
  }

  private async getBookingRules(serviceType: string): Promise<BookingRules> {
    try {
      // First get the service to find the user_id (service provider)
      const { data: service } = await this.supabase
        .from('booking_services')
        .select('user_id, buffer_after, allow_cancellation, cancellation_hours, deposit_amount, deposit_percentage')
        .or(`name.ilike.%${serviceType}%,slug.ilike.%${serviceType}%`)
        .eq('is_active', true)
        .limit(1)
        .single();

      // Get booking settings for the service provider
      let bookingSettings = null;
      if (service?.user_id) {
        const { data: settings } = await this.supabase
          .from('booking_settings')
          .select('*')
          .eq('user_id', service.user_id)
          .single();
        bookingSettings = settings;
      }

      // Get availability schedules if available
      let availabilityData: any[] = [];
      if (service?.user_id) {
        const { data: availability } = await this.supabase
          .from('booking_availability')
          .select('*')
          .eq('user_id', service.user_id)
          .eq('is_available', true)
          .order('day_of_week');
        availabilityData = availability || [];
      }

      // Build business hours from availability data or settings
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const businessHours: BookingRules['businessHours'] = {
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null,
      };

      if (availabilityData.length > 0) {
        // Build from booking_availability table
        for (const slot of availabilityData) {
          if (slot.day_of_week !== null && slot.day_of_week >= 0 && slot.day_of_week <= 6) {
            const dayName = dayNames[slot.day_of_week];
            businessHours[dayName] = {
              start: slot.start_time?.substring(0, 5) || '09:00',
              end: slot.end_time?.substring(0, 5) || '17:00',
            };
          }
        }
      } else if (bookingSettings) {
        // Build from booking_settings table
        const startTime = bookingSettings.business_hours_start?.substring(0, 5) || '09:00';
        const endTime = bookingSettings.business_hours_end?.substring(0, 5) || '17:00';
        const workingDays = bookingSettings.working_days || [1, 2, 3, 4, 5]; // Monday-Friday

        for (const dayIndex of workingDays) {
          if (dayIndex >= 0 && dayIndex <= 6) {
            const dayName = dayNames[dayIndex];
            businessHours[dayName] = {
              start: startTime,
              end: endTime,
              breaks: [{ start: '12:00', end: '13:00' }], // Default lunch break
            };
          }
        }
      } else {
        // Use default business hours (Monday-Friday, 9-5)
        for (let i = 1; i <= 5; i++) {
          const dayName = dayNames[i];
          businessHours[dayName] = {
            start: '09:00',
            end: '17:00',
            breaks: [{ start: '12:00', end: '13:00' }],
          };
        }
      }

      // Build the booking rules from fetched data
      const bufferTime = service?.buffer_after || bookingSettings?.buffer_time || 15;
      const advanceBookingDays = bookingSettings?.advance_booking_days || 30;
      const allowCancellation = service?.allow_cancellation !== false;
      const cancellationHours = service?.cancellation_hours || 24;

      // Deposit policy
      let depositPolicy: BookingRules['depositPolicy'] = undefined;
      if (bookingSettings?.require_deposit || service?.deposit_amount || service?.deposit_percentage) {
        depositPolicy = {
          required: true,
          percentage: service?.deposit_percentage || bookingSettings?.deposit_percentage,
          flatAmount: service?.deposit_amount,
        };
      }

      return {
        businessHours,
        bufferTime,
        advanceBookingDays,
        minAdvanceHours: cancellationHours, // Use cancellation hours as minimum advance notice
        allowWaitlist: true,
        cancellationPolicy: {
          allowCancellation,
          minHoursBeforeCancellation: cancellationHours,
          cancellationFee: 0,
        },
        depositPolicy,
      };
    } catch (error) {
      logger.error('Error fetching booking rules', { serviceType, error });
      // Return default booking rules on error
      return {
        businessHours: {
          monday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
          tuesday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
          wednesday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
          thursday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
          friday: { start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
          saturday: null,
          sunday: null,
        },
        bufferTime: 15,
        advanceBookingDays: 30,
        minAdvanceHours: 24,
        allowWaitlist: true,
        cancellationPolicy: {
          allowCancellation: true,
          minHoursBeforeCancellation: 24,
          cancellationFee: 0,
        },
      };
    }
  }

  private generateBookingNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BOOK-${year}${month}-${random}`;
  }

  private async createBookingSuggestion(
    request: BookingRequest,
    slot: AvailabilitySlot,
    service: any
  ): Promise<Booking> {
    return {
      id: this.generateId('book'),
      bookingNumber: this.generateBookingNumber(),
      clientName: request.clientName,
      clientEmail: request.clientEmail,
      clientPhone: request.clientPhone,
      serviceType: request.serviceType,
      serviceDuration: request.duration || service.defaultDuration,
      startTime: slot.date,
      endTime: new Date(slot.date.getTime() + (request.duration || service.defaultDuration) * 60000),
      status: 'pending',
      price: service.price,
      currency: 'USD',
      remindersSent: [],
      createdAt: new Date(),
      notes: request.specialRequests,
    };
  }

  private generateNoAvailabilityMessage(request: BookingRequest): string {
    return `Thank you for your interest in ${request.serviceType}! Unfortunately, we don't have availability for your preferred dates. Would you like to:
1. Check our availability for alternative dates
2. Join our waitlist
3. Contact us directly to discuss options

Please let us know how we can help!`;
  }

  /**
   * Start the automation agent (continuous processing)
   */
  async start(): Promise<void> {
    if (!this.config.enabled) {
      logger.warn('Business automation agent is disabled');
      return;
    }

    logger.info('Starting business automation agent');

    // Clear any existing intervals before starting new ones
    this.stop();

    // Process tasks every minute
    this.intervals.push(
      setInterval(() => {
        this.processPendingTasks();
      }, 60000)
    );

    // Daily tasks
    this.intervals.push(
      setInterval(() => {
        this.identifyClientsNeedingFollowUp();
        this.processOverdueInvoices();
      }, 24 * 60 * 60 * 1000)
    );

    // Weekly tasks
    this.intervals.push(
      setInterval(() => {
        this.sendWeeklyProjectUpdates();
      }, 7 * 24 * 60 * 60 * 1000)
    );

    logger.info('Business automation agent started');
  }

  /**
   * Stop all running intervals - call this when shutting down
   */
  stop(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    logger.info('Business automation agent stopped');
  }
}

export default BusinessAutomationAgent;
