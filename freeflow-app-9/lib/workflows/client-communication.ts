import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ClientCommunication')

// Types
export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'condition'
  event?: string
  schedule?: string // cron format
  condition?: (data: any) => boolean
}

export interface WorkflowAction {
  type: 'email' | 'notification' | 'sms' | 'slack' | 'webhook'
  template: string
  recipient: string
  data: Record<string, any>
  delay?: number // minutes
}

export interface Workflow {
  id: string
  name: string
  description: string
  enabled: boolean
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  conditions?: WorkflowCondition[]
}

export interface WorkflowCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
  value: any
}

export interface CommunicationSequence {
  id: string
  name: string
  description: string
  trigger: string
  steps: SequenceStep[]
}

export interface SequenceStep {
  day: number
  type: 'email' | 'notification' | 'check_in' | 'survey' | 'reminder'
  template: string
  action?: string
  condition?: (client: any) => boolean
}

// ============================================================================
// WELCOME SEQUENCE (NEW CLIENTS)
// ============================================================================

export const welcomeSequence: CommunicationSequence = {
  id: 'welcome-sequence',
  name: 'New Client Welcome',
  description: 'Onboard and educate new clients about the platform',
  trigger: 'client.created',
  steps: [
    {
      day: 0,
      type: 'email',
      template: 'welcome',
      action: 'send_credentials',
    },
    {
      day: 0,
      type: 'notification',
      template: 'welcome_dashboard',
      action: 'highlight_key_features'
    },
    {
      day: 1,
      type: 'notification',
      template: 'onboarding_reminder',
      action: 'prompt_tour_start',
      condition: (client) => !client.hasCompletedTour
    },
    {
      day: 3,
      type: 'email',
      template: 'feature_discovery',
      action: 'highlight_key_features'
    },
    {
      day: 7,
      type: 'check_in',
      template: 'satisfaction_survey',
      action: 'collect_feedback'
    },
    {
      day: 14,
      type: 'email',
      template: 'tips_and_best_practices',
      action: 'educational_content'
    },
    {
      day: 30,
      type: 'check_in',
      template: 'first_month_review',
      action: 'schedule_call'
    }
  ]
}

// ============================================================================
// PROJECT MILESTONE WORKFLOWS
// ============================================================================

export const milestoneWorkflows = {
  projectStart: {
    immediate: [
      {
        type: 'email' as const,
        template: 'project_kickoff',
        subject: 'Welcome to Your New Project!',
        content: {
          greeting: 'Your project has started!',
          sections: ['Meet your team', 'Timeline overview', 'Next steps']
        }
      },
      {
        type: 'notification' as const,
        template: 'project_dashboard',
        title: 'Project Started',
        message: 'Track progress, communicate with your team, and approve deliverables'
      }
    ],
    day1: [
      {
        type: 'email' as const,
        template: 'how_to_track_progress',
        subject: 'How to Track Your Project Progress'
      },
      {
        type: 'notification' as const,
        template: 'communication_best_practices',
        title: 'Communication Tips',
        message: 'Learn how to effectively communicate with your team'
      }
    ]
  },

  milestone25: {
    immediate: [
      {
        type: 'email' as const,
        template: 'milestone_25',
        subject: '🎉 25% Complete - Review Your Progress',
        content: {
          progress: 25,
          message: "You're off to a great start!",
          actions: ['Review deliverables', 'Provide feedback', 'Approve to continue']
        }
      },
      {
        type: 'notification' as const,
        template: 'milestone_update',
        title: 'Quarter Complete!',
        message: 'Review deliverables and provide feedback'
      }
    ]
  },

  milestone50: {
    immediate: [
      {
        type: 'email' as const,
        template: 'milestone_50',
        subject: '🚀 Halfway There! Mid-Project Check-in',
        content: {
          progress: 50,
          message: "You're halfway to completion!",
          actions: ['Review progress', 'Adjust timeline if needed', 'Provide mid-point feedback']
        }
      },
      {
        type: 'check_in' as const,
        template: 'mid_project_survey',
        title: 'Quick Mid-Project Survey',
        questions: [
          'How satisfied are you so far?',
          'Is the project meeting your expectations?',
          'Any concerns we should address?'
        ]
      }
    ]
  },

  milestone75: {
    immediate: [
      {
        type: 'email' as const,
        template: 'milestone_75',
        subject: '⚡ 75% Complete - Final Review Coming Soon',
        content: {
          progress: 75,
          message: "Almost there! Final deliverables coming soon.",
          actions: ['Prepare final feedback', 'Review remaining milestones', 'Schedule final call']
        }
      },
      {
        type: 'notification' as const,
        template: 'prepare_final_review',
        title: 'Prepare for Final Review',
        message: 'Get ready to review final deliverables'
      }
    ]
  },

  projectComplete: {
    immediate: [
      {
        type: 'email' as const,
        template: 'project_delivered',
        subject: '🎊 Project Delivered! Review & Approve',
        content: {
          message: 'Your project is complete and ready for final approval!',
          actions: ['Review deliverables', 'Approve or request revisions', 'Release escrow payment']
        }
      },
      {
        type: 'notification' as const,
        template: 'project_complete',
        title: 'Project Delivered',
        message: 'Review and approve your completed project'
      }
    ],
    day3: [
      {
        type: 'email' as const,
        template: 'satisfaction_followup',
        subject: 'How Was Your Experience?',
        action: 'collect_satisfaction_rating'
      },
      {
        type: 'survey' as const,
        template: 'nps_survey',
        questions: [
          'How likely are you to recommend us?',
          'What did we do well?',
          'What could we improve?'
        ]
      }
    ],
    day7: [
      {
        type: 'email' as const,
        template: 'next_project_planning',
        subject: 'Ready for Your Next Project?',
        content: {
          message: 'Start planning your next project with exclusive returning client benefits',
          benefits: ['10% discount', 'Priority scheduling', 'Same team available']
        }
      },
      {
        type: 'email' as const,
        template: 'referral_incentive',
        subject: 'Refer a Friend, Get $500',
        action: 'promote_referral_program'
      }
    ]
  }
}

// ============================================================================
// HEALTH SCORE-BASED TRIGGERS
// ============================================================================

export const healthScoreTriggers = {
  scoreDrop: {
    threshold: -10,
    actions: [
      {
        type: 'notification' as const,
        target: 'account_manager',
        template: 'health_score_alert',
        priority: 'high',
        message: 'Client health score dropped by 10+ points'
      },
      {
        type: 'email' as const,
        target: 'client',
        template: 'how_can_we_improve',
        subject: 'How Can We Improve Your Experience?',
        delay: 60 // 1 hour delay
      }
    ]
  },

  inactivity: {
    days: 14,
    actions: [
      {
        type: 'email' as const,
        template: 'we_miss_you',
        subject: 'We Miss You! 👋',
        content: {
          message: "It's been a while since we've seen you",
          actions: ['View your projects', 'Schedule a call', 'Get support']
        }
      },
      {
        type: 'notification' as const,
        template: 'reengagement',
        title: 'Come Back and Save 15%',
        message: 'Special offer for returning clients'
      }
    ]
  },

  paymentDelay: {
    days: 3,
    actions: [
      {
        type: 'email' as const,
        template: 'payment_reminder',
        subject: 'Friendly Payment Reminder',
        tone: 'gentle'
      },
      {
        type: 'notification' as const,
        template: 'payment_due',
        title: 'Payment Reminder',
        message: 'Outstanding invoice needs attention'
      }
    ],
    escalation: {
      days: 7,
      actions: [
        {
          type: 'notification' as const,
          target: 'account_manager',
          template: 'payment_escalation',
          priority: 'urgent'
        },
        {
          type: 'email' as const,
          target: 'client',
          template: 'payment_urgent',
          subject: 'Urgent: Payment Required',
          action: 'offer_payment_plan'
        }
      ]
    }
  },

  highSatisfaction: {
    threshold: 90,
    actions: [
      {
        type: 'email' as const,
        template: 'testimonial_request',
        subject: 'Would You Share Your Success Story?',
        content: {
          message: 'We noticed you\'re loving KAZI!',
          incentive: '$50 Amazon gift card for video testimonial'
        }
      },
      {
        type: 'email' as const,
        template: 'referral_opportunity',
        subject: 'Know Someone Who Needs Our Services?',
        delay: 10080 // 1 week delay
      }
    ]
  },

  multipleRevisions: {
    threshold: 3,
    actions: [
      {
        type: 'notification' as const,
        target: 'account_manager',
        template: 'quality_concern',
        priority: 'high',
        message: 'Client requesting multiple revisions'
      },
      {
        type: 'email' as const,
        target: 'client',
        template: 'clarify_requirements',
        subject: 'Let\'s Get This Perfect for You',
        action: 'schedule_requirements_call'
      }
    ]
  }
}

// ============================================================================
// RENEWAL & RETENTION CAMPAIGNS
// ============================================================================

export const renewalWorkflow = {
  day90BeforeEnd: {
    type: 'email' as const,
    template: 'early_renewal_offer',
    subject: 'Early Renewal: Save 10%',
    content: {
      message: 'Renew early and save 10% on your next contract',
      discount: 0.10,
      validUntil: 'contract_end_minus_60',
      benefits: [
        'Lock in current pricing',
        '10% discount',
        'Priority support continuation',
        'No service interruption'
      ]
    }
  },

  day60BeforeEnd: {
    type: 'email' as const,
    template: 'value_reminder',
    subject: 'Your KAZI Success Story',
    content: {
      message: 'Look at everything you\'ve accomplished with KAZI',
      include: [
        'Total projects completed',
        'ROI calculation',
        'Time saved',
        'Value received',
        'Success metrics'
      ],
      cta: 'Continue Your Success - Renew Today'
    }
  },

  day30BeforeEnd: {
    type: 'email' as const,
    template: 'personal_outreach',
    subject: 'Let\'s Discuss Your Renewal',
    from: 'account_manager',
    content: {
      message: 'I\'d love to personally discuss your renewal and future needs',
      action: 'schedule_renewal_call',
      offer: 'Custom package based on your growth'
    }
  },

  day14BeforeEnd: {
    type: 'email' as const,
    template: 'urgent_renewal',
    subject: '⚠️ Your Contract Expires in 2 Weeks',
    priority: 'high',
    content: {
      message: 'Don\'t lose access to your ongoing projects and data',
      urgency: true,
      actions: ['Renew now', 'Schedule call', 'Request custom quote']
    }
  },

  dayOfExpiry: {
    type: 'email' as const,
    template: 'last_chance',
    subject: '🚨 Last Chance: Contract Expires Today',
    priority: 'urgent',
    content: {
      message: 'Your contract expires today. Renew to avoid service interruption',
      offer: 'Special last-minute renewal offer'
    }
  },

  day7AfterExpiry: {
    type: 'email' as const,
    template: 'winback',
    subject: 'We Want You Back! Special Offer Inside',
    content: {
      message: 'We miss working with you. Here\'s a special offer to come back',
      offer: {
        discount: 0.20,
        duration: '30 days',
        bonus: 'First project 50% off'
      }
    }
  }
}

// ============================================================================
// WORKFLOW ENGINE
// ============================================================================

export class CommunicationWorkflowEngine {
  private workflows: Workflow[] = []
  private activeSequences: Map<string, any> = new Map()

  constructor() {
    logger.info('Communication Workflow Engine initialized')
  }

  /**
   * Register a new workflow
   */
  registerWorkflow(workflow: Workflow) {
    this.workflows.push(workflow)
    logger.info('Workflow registered', {
      workflowId: workflow.id,
      name: workflow.name,
      enabled: workflow.enabled
    })
  }

  /**
   * Start a communication sequence for a client
   */
  async startSequence(
    sequenceId: string,
    clientId: string,
    clientData: any
  ): Promise<void> {
    logger.info('Starting communication sequence', {
      sequenceId,
      clientId
    })

    // Get the sequence
    const sequence = this.getSequence(sequenceId)
    if (!sequence) {
      logger.error('Sequence not found', { sequenceId })
      return
    }

    // Store active sequence
    const sequenceKey = `${clientId}:${sequenceId}`
    this.activeSequences.set(sequenceKey, {
      clientId,
      sequenceId,
      startedAt: new Date(),
      currentStep: 0,
      clientData
    })

    // Execute immediate steps (day 0)
    await this.executeSequenceSteps(sequence, clientId, clientData, 0)

    // Schedule future steps
    this.scheduleFutureSteps(sequence, clientId, clientData)
  }

  /**
   * Get sequence by ID
   */
  private getSequence(sequenceId: string): CommunicationSequence | null {
    // In production, fetch from database
    const sequences: Record<string, CommunicationSequence> = {
      'welcome-sequence': welcomeSequence
    }
    return sequences[sequenceId] || null
  }

  /**
   * Execute steps for a specific day
   */
  private async executeSequenceSteps(
    sequence: CommunicationSequence,
    clientId: string,
    clientData: any,
    day: number
  ): Promise<void> {
    const steps = sequence.steps.filter(s => s.day === day)

    for (const step of steps) {
      // Check condition if present
      if (step.condition && !step.condition(clientData)) {
        logger.debug('Step condition not met, skipping', {
          sequenceId: sequence.id,
          day,
          type: step.type
        })
        continue
      }

      await this.executeStep(step, clientId, clientData)
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    step: SequenceStep,
    clientId: string,
    clientData: any
  ): Promise<void> {
    logger.info('Executing communication step', {
      clientId,
      type: step.type,
      template: step.template,
      day: step.day
    })

    switch (step.type) {
      case 'email':
        await this.sendEmail(clientId, step.template, clientData)
        break
      case 'notification':
        await this.sendNotification(clientId, step.template, clientData)
        break
      case 'check_in':
        await this.scheduleCheckIn(clientId, step.template, clientData)
        break
      case 'survey':
        await this.sendSurvey(clientId, step.template, clientData)
        break
      case 'reminder':
        await this.sendReminder(clientId, step.template, clientData)
        break
    }
  }

  /**
   * Schedule future steps
   */
  private scheduleFutureSteps(
    sequence: CommunicationSequence,
    clientId: string,
    clientData: any
  ): void {
    const futureSteps = sequence.steps.filter(s => s.day > 0)

    for (const step of futureSteps) {
      const delayMs = step.day * 24 * 60 * 60 * 1000 // Convert days to milliseconds

      setTimeout(async () => {
        await this.executeStep(step, clientId, clientData)
      }, delayMs)

      logger.debug('Scheduled future step', {
        clientId,
        day: step.day,
        type: step.type,
        delayMs
      })
    }
  }

  /**
   * Send email
   */
  private async sendEmail(
    clientId: string,
    template: string,
    data: any
  ): Promise<void> {
    // In production, integrate with email service (SendGrid, Postmark, etc.)
    logger.info('Sending email', { clientId, template })

    // Mock implementation
    console.log(`[EMAIL] To: ${data.email}`)
    console.log(`[EMAIL] Template: ${template}`)
    console.log(`[EMAIL] Data:`, data)
  }

  /**
   * Send in-app notification
   */
  private async sendNotification(
    clientId: string,
    template: string,
    data: any
  ): Promise<void> {
    logger.info('Sending notification', { clientId, template })

    // In production, store in database and trigger real-time update
    console.log(`[NOTIFICATION] To: ${clientId}`)
    console.log(`[NOTIFICATION] Template: ${template}`)
  }

  /**
   * Schedule check-in
   */
  private async scheduleCheckIn(
    clientId: string,
    template: string,
    data: any
  ): Promise<void> {
    logger.info('Scheduling check-in', { clientId, template })

    // In production, create calendar event or schedule call
    console.log(`[CHECK-IN] Client: ${clientId}`)
    console.log(`[CHECK-IN] Template: ${template}`)
  }

  /**
   * Send survey
   */
  private async sendSurvey(
    clientId: string,
    template: string,
    data: any
  ): Promise<void> {
    logger.info('Sending survey', { clientId, template })

    // In production, integrate with survey tool or create in-app survey
    console.log(`[SURVEY] To: ${clientId}`)
    console.log(`[SURVEY] Template: ${template}`)
  }

  /**
   * Send reminder
   */
  private async sendReminder(
    clientId: string,
    template: string,
    data: any
  ): Promise<void> {
    logger.info('Sending reminder', { clientId, template })

    // In production, send via preferred channel (email, SMS, notification)
    console.log(`[REMINDER] To: ${clientId}`)
    console.log(`[REMINDER] Template: ${template}`)
  }

  /**
   * Handle health score change
   */
  async handleHealthScoreChange(
    clientId: string,
    oldScore: number,
    newScore: number,
    clientData: any
  ): Promise<void> {
    const scoreDelta = newScore - oldScore

    logger.info('Health score changed', {
      clientId,
      oldScore,
      newScore,
      delta: scoreDelta
    })

    // Check for score drop trigger
    if (scoreDelta <= healthScoreTriggers.scoreDrop.threshold) {
      logger.warn('Health score drop detected', {
        clientId,
        delta: scoreDelta,
        threshold: healthScoreTriggers.scoreDrop.threshold
      })

      // Execute trigger actions
      for (const action of healthScoreTriggers.scoreDrop.actions) {
        await this.executeHealthAction(action, clientId, clientData)
      }
    }

    // Check for high satisfaction trigger
    if (newScore >= healthScoreTriggers.highSatisfaction.threshold) {
      for (const action of healthScoreTriggers.highSatisfaction.actions) {
        await this.executeHealthAction(action, clientId, clientData)
      }
    }
  }

  /**
   * Execute health-based action
   */
  private async executeHealthAction(
    action: any,
    clientId: string,
    clientData: any
  ): Promise<void> {
    // Add delay if specified
    if (action.delay) {
      await new Promise(resolve => setTimeout(resolve, action.delay * 60000))
    }

    switch (action.type) {
      case 'email':
        await this.sendEmail(clientId, action.template, clientData)
        break
      case 'notification':
        await this.sendNotification(clientId, action.template, clientData)
        break
    }
  }

  /**
   * Check for inactivity and trigger reengagement
   */
  async checkInactivity(clientId: string, lastActivityDate: Date): Promise<void> {
    const daysSinceActivity = Math.floor(
      (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceActivity >= healthScoreTriggers.inactivity.days) {
      logger.warn('Client inactivity detected', {
        clientId,
        daysSinceActivity
      })

      for (const action of healthScoreTriggers.inactivity.actions) {
        await this.executeHealthAction(action, clientId, {})
      }
    }
  }

  /**
   * Handle contract renewal timeline
   */
  async handleContractRenewal(
    clientId: string,
    contractEndDate: Date,
    clientData: any
  ): Promise<void> {
    const daysUntilEnd = Math.floor(
      (contractEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    logger.info('Checking contract renewal status', {
      clientId,
      daysUntilEnd
    })

    // Execute appropriate renewal workflow based on days remaining
    if (daysUntilEnd === 90) {
      await this.sendEmail(clientId, renewalWorkflow.day90BeforeEnd.template, clientData)
    } else if (daysUntilEnd === 60) {
      await this.sendEmail(clientId, renewalWorkflow.day60BeforeEnd.template, clientData)
    } else if (daysUntilEnd === 30) {
      await this.sendEmail(clientId, renewalWorkflow.day30BeforeEnd.template, clientData)
    } else if (daysUntilEnd === 14) {
      await this.sendEmail(clientId, renewalWorkflow.day14BeforeEnd.template, clientData)
    } else if (daysUntilEnd === 0) {
      await this.sendEmail(clientId, renewalWorkflow.dayOfExpiry.template, clientData)
    } else if (daysUntilEnd === -7) {
      await this.sendEmail(clientId, renewalWorkflow.day7AfterExpiry.template, clientData)
    }
  }
}

// Export singleton instance
export const workflowEngine = new CommunicationWorkflowEngine()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Trigger milestone workflow
 */
export async function triggerMilestoneWorkflow(
  milestone: number,
  clientId: string,
  projectData: any
): Promise<void> {
  logger.info('Triggering milestone workflow', {
    milestone,
    clientId,
    projectId: projectData.id
  })

  const milestoneKey = `milestone${milestone}` as keyof typeof milestoneWorkflows
  const workflow = milestoneWorkflows[milestoneKey]

  if (!workflow) {
    logger.warn('No workflow found for milestone', { milestone })
    return
  }

  // Execute immediate actions
  if (workflow.immediate) {
    for (const action of workflow.immediate) {
      await workflowEngine['executeStep'](
        { ...action, day: 0 },
        clientId,
        projectData
      )
    }
  }

  // Schedule delayed actions (e.g., day1, day3)
  const delayedKeys = Object.keys(workflow).filter(k => k.startsWith('day'))
  for (const key of delayedKeys) {
    const day = parseInt(key.replace('day', ''))
    const actions = (workflow as any)[key]

    setTimeout(async () => {
      for (const action of actions) {
        await workflowEngine['executeStep'](
          { ...action, day },
          clientId,
          projectData
        )
      }
    }, day * 24 * 60 * 60 * 1000)
  }
}

/**
 * Initialize workflows for a new client
 */
export async function initializeClientWorkflows(
  clientId: string,
  clientData: any
): Promise<void> {
  logger.info('Initializing workflows for new client', { clientId })

  // Start welcome sequence
  await workflowEngine.startSequence('welcome-sequence', clientId, clientData)

  // Schedule contract renewal reminders if applicable
  if (clientData.contractEnd) {
    await workflowEngine.handleContractRenewal(
      clientId,
      new Date(clientData.contractEnd),
      clientData
    )
  }
}
