/**
 * Kazi Workflows - Pre-built Templates
 *
 * Ready-to-use workflow templates that can be customized and deployed.
 * Each template is a complete, functional workflow configuration.
 */

import type { KaziAction, KaziTriggerConfig } from './kazi-workflow-service'

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: 'sales' | 'marketing' | 'operations' | 'finance' | 'support' | 'hr' | 'custom'
  icon: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTimeSaved: string
  trigger_type: 'manual' | 'schedule' | 'webhook' | 'event' | 'form' | 'record-change'
  trigger_config: KaziTriggerConfig
  actions: Omit<KaziAction, 'id'>[]
  tags: string[]
  preview: string[]
}

// Generate unique action ID
const actionId = () => `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // ============================================
  // SALES TEMPLATES
  // ============================================
  {
    id: 'template-new-client-onboarding',
    name: 'New Client Onboarding',
    description: 'Automatically welcome new clients with a personalized email, create onboarding tasks, and notify your team.',
    category: 'sales',
    icon: 'UserPlus',
    difficulty: 'beginner',
    estimatedTimeSaved: '2 hours/client',
    trigger_type: 'event',
    trigger_config: {
      event: {
        type: 'client.created',
        source: 'clients',
        filters: {}
      }
    },
    actions: [
      {
        type: 'email',
        name: 'Send Welcome Email',
        position: 1,
        config: {
          to: '{{trigger.email}}',
          subject: 'Welcome to {{company_name}}! Let\'s get started',
          body: `<h2>Welcome aboard, {{trigger.name}}!</h2>
<p>We're thrilled to have you as a client. Here's what happens next:</p>
<ol>
  <li>We'll schedule a kickoff call within 24 hours</li>
  <li>You'll receive access to your client portal</li>
  <li>Your dedicated account manager will reach out</li>
</ol>
<p>If you have any questions, feel free to reply to this email.</p>
<p>Best regards,<br>The Team</p>`,
          template: 'welcome'
        }
      },
      {
        type: 'create-task',
        name: 'Create Kickoff Call Task',
        position: 2,
        config: {
          title: 'Schedule kickoff call with {{trigger.name}}',
          description: 'New client onboarding - schedule initial discovery call to understand their needs and set expectations.',
          priority: 'high',
          dueDate: '+1 day'
        }
      },
      {
        type: 'create-task',
        name: 'Create Portal Access Task',
        position: 3,
        config: {
          title: 'Set up client portal for {{trigger.name}}',
          description: 'Create client portal account and send login credentials.',
          priority: 'medium',
          dueDate: '+2 days'
        }
      },
      {
        type: 'notification',
        name: 'Notify Team',
        position: 4,
        config: {
          title: 'New Client Added',
          message: '{{trigger.name}} ({{trigger.company}}) has been added as a new client. Kickoff tasks have been created.',
          priority: 'medium',
          channels: ['app']
        }
      }
    ],
    tags: ['popular', 'client', 'onboarding', 'email'],
    preview: ['Welcome Email', 'Kickoff Task', 'Portal Setup', 'Team Notification']
  },

  {
    id: 'template-lead-follow-up',
    name: 'Lead Follow-up Sequence',
    description: 'Automated follow-up emails for leads that haven\'t responded, with escalating urgency.',
    category: 'sales',
    icon: 'Target',
    difficulty: 'intermediate',
    estimatedTimeSaved: '3 hours/week',
    trigger_type: 'schedule',
    trigger_config: {
      schedule: {
        frequency: 'daily',
        time: '09:00',
        timezone: 'UTC'
      }
    },
    actions: [
      {
        type: 'api-call',
        name: 'Fetch Stale Leads',
        position: 1,
        config: {
          url: '/api/leads/stale',
          method: 'GET',
          headers: {}
        }
      },
      {
        type: 'condition',
        name: 'Check if Leads Found',
        position: 2,
        config: {
          field: 'action_api-call.data.length',
          operator: 'greater',
          value: 0,
          ifTrue: 'email',
          ifFalse: 'end'
        }
      },
      {
        type: 'email',
        name: 'Send Follow-up Email',
        position: 3,
        config: {
          to: '{{lead.email}}',
          subject: 'Quick follow-up: Did you have any questions?',
          body: `<p>Hi {{lead.name}},</p>
<p>I wanted to follow up on our previous conversation. I understand you're busy, but I wanted to make sure you had all the information you needed.</p>
<p>Would you have 15 minutes this week for a quick call? I'd love to answer any questions you might have.</p>
<p>Best,<br>{{user.name}}</p>`,
          template: 'follow-up'
        }
      },
      {
        type: 'update-record',
        name: 'Update Lead Status',
        position: 4,
        config: {
          entity: 'leads',
          recordId: '{{lead.id}}',
          fields: {
            last_follow_up: '{{now}}',
            follow_up_count: '{{lead.follow_up_count + 1}}'
          }
        }
      }
    ],
    tags: ['leads', 'follow-up', 'email', 'automation'],
    preview: ['Fetch Leads', 'Check Status', 'Send Email', 'Update Record']
  },

  // ============================================
  // FINANCE TEMPLATES
  // ============================================
  {
    id: 'template-invoice-reminder',
    name: 'Invoice Payment Reminder',
    description: 'Automatically send payment reminders for invoices approaching or past their due date.',
    category: 'finance',
    icon: 'Receipt',
    difficulty: 'beginner',
    estimatedTimeSaved: '5 hours/month',
    trigger_type: 'schedule',
    trigger_config: {
      schedule: {
        frequency: 'daily',
        time: '10:00',
        timezone: 'UTC'
      }
    },
    actions: [
      {
        type: 'api-call',
        name: 'Fetch Due Invoices',
        position: 1,
        config: {
          url: '/api/invoices/due',
          method: 'GET',
          headers: {}
        }
      },
      {
        type: 'condition',
        name: 'Check Overdue Status',
        position: 2,
        config: {
          field: 'invoice.days_overdue',
          operator: 'greater',
          value: 0,
          ifTrue: 'urgent-email',
          ifFalse: 'gentle-email'
        }
      },
      {
        type: 'email',
        name: 'Send Gentle Reminder',
        position: 3,
        config: {
          to: '{{invoice.client_email}}',
          subject: 'Friendly reminder: Invoice #{{invoice.number}} due soon',
          body: `<p>Hi {{invoice.client_name}},</p>
<p>This is a friendly reminder that invoice #{{invoice.number}} for {{invoice.amount}} is due on {{invoice.due_date}}.</p>
<p>If you've already sent payment, please disregard this email. Otherwise, you can pay online through your client portal.</p>
<p>Thanks for your business!</p>`,
          template: 'invoice-reminder'
        }
      },
      {
        type: 'email',
        name: 'Send Urgent Reminder',
        position: 4,
        config: {
          to: '{{invoice.client_email}}',
          subject: 'Action Required: Invoice #{{invoice.number}} is overdue',
          body: `<p>Hi {{invoice.client_name}},</p>
<p>Invoice #{{invoice.number}} for {{invoice.amount}} is now {{invoice.days_overdue}} days overdue.</p>
<p>Please process this payment at your earliest convenience to avoid any service interruptions.</p>
<p>If you're experiencing any issues or need to discuss payment terms, please don't hesitate to reach out.</p>`,
          template: 'invoice-urgent'
        }
      },
      {
        type: 'update-record',
        name: 'Log Reminder Sent',
        position: 5,
        config: {
          entity: 'invoice_reminders',
          recordId: 'new',
          fields: {
            invoice_id: '{{invoice.id}}',
            sent_at: '{{now}}',
            reminder_type: '{{invoice.days_overdue > 0 ? "urgent" : "gentle"}}'
          }
        }
      }
    ],
    tags: ['invoice', 'payment', 'reminder', 'email'],
    preview: ['Check Due Invoices', 'Determine Urgency', 'Send Reminder', 'Log Activity']
  },

  {
    id: 'template-expense-approval',
    name: 'Expense Approval Workflow',
    description: 'Route expense requests for approval based on amount thresholds.',
    category: 'finance',
    icon: 'DollarSign',
    difficulty: 'intermediate',
    estimatedTimeSaved: '4 hours/week',
    trigger_type: 'event',
    trigger_config: {
      event: {
        type: 'expense.submitted',
        source: 'expenses',
        filters: {}
      }
    },
    actions: [
      {
        type: 'condition',
        name: 'Check Amount Threshold',
        position: 1,
        config: {
          field: 'trigger.amount',
          operator: 'greater',
          value: 500,
          ifTrue: 'manager-approval',
          ifFalse: 'auto-approve'
        }
      },
      {
        type: 'notification',
        name: 'Request Manager Approval',
        position: 2,
        config: {
          title: 'Expense Approval Required',
          message: '{{trigger.employee_name}} submitted an expense of ${{trigger.amount}} for "{{trigger.description}}". Please review and approve.',
          priority: 'high',
          recipientId: '{{trigger.manager_id}}',
          channels: ['app', 'email']
        }
      },
      {
        type: 'update-record',
        name: 'Auto-Approve Small Expense',
        position: 3,
        config: {
          entity: 'expenses',
          recordId: '{{trigger.id}}',
          fields: {
            status: 'approved',
            approved_at: '{{now}}',
            approved_by: 'system',
            approval_note: 'Auto-approved (under $500 threshold)'
          }
        }
      },
      {
        type: 'notification',
        name: 'Notify Employee of Approval',
        position: 4,
        config: {
          title: 'Expense Approved',
          message: 'Your expense request for ${{trigger.amount}} has been automatically approved.',
          priority: 'low',
          recipientId: '{{trigger.employee_id}}',
          channels: ['app']
        }
      }
    ],
    tags: ['expense', 'approval', 'finance', 'workflow'],
    preview: ['Check Amount', 'Route Approval', 'Update Status', 'Notify']
  },

  // ============================================
  // OPERATIONS TEMPLATES
  // ============================================
  {
    id: 'template-project-kickoff',
    name: 'Project Kickoff Automation',
    description: 'Set up a new project with all necessary tasks, folders, and team notifications.',
    category: 'operations',
    icon: 'FolderOpen',
    difficulty: 'intermediate',
    estimatedTimeSaved: '1 hour/project',
    trigger_type: 'event',
    trigger_config: {
      event: {
        type: 'project.created',
        source: 'projects',
        filters: {}
      }
    },
    actions: [
      {
        type: 'create-task',
        name: 'Create Planning Task',
        position: 1,
        config: {
          title: 'Project Planning: {{trigger.title}}',
          description: 'Create project plan, define milestones, and allocate resources.',
          priority: 'high',
          projectId: '{{trigger.id}}',
          dueDate: '+3 days'
        }
      },
      {
        type: 'create-task',
        name: 'Create Kickoff Meeting Task',
        position: 2,
        config: {
          title: 'Schedule Kickoff Meeting',
          description: 'Schedule and conduct project kickoff meeting with all stakeholders.',
          priority: 'high',
          projectId: '{{trigger.id}}',
          dueDate: '+5 days'
        }
      },
      {
        type: 'create-task',
        name: 'Create Requirements Task',
        position: 3,
        config: {
          title: 'Gather Requirements',
          description: 'Document all project requirements and get client sign-off.',
          priority: 'medium',
          projectId: '{{trigger.id}}',
          dueDate: '+7 days'
        }
      },
      {
        type: 'notification',
        name: 'Notify Project Team',
        position: 4,
        config: {
          title: 'New Project Started',
          message: 'Project "{{trigger.title}}" has been created. Initial tasks have been set up. Please review the project plan.',
          priority: 'high',
          channels: ['app', 'email']
        }
      },
      {
        type: 'email',
        name: 'Send Client Welcome',
        position: 5,
        config: {
          to: '{{trigger.client_email}}',
          subject: 'Your project "{{trigger.title}}" is underway!',
          body: `<p>Hi {{trigger.client_name}},</p>
<p>Great news! We've officially started work on your project.</p>
<p><strong>Project:</strong> {{trigger.title}}<br>
<strong>Start Date:</strong> {{trigger.start_date}}<br>
<strong>Estimated Completion:</strong> {{trigger.end_date}}</p>
<p>We'll be scheduling a kickoff meeting shortly. In the meantime, if you have any questions or additional requirements, please don't hesitate to reach out.</p>
<p>We're excited to work with you!</p>`,
          template: 'project-welcome'
        }
      }
    ],
    tags: ['project', 'kickoff', 'tasks', 'popular'],
    preview: ['Create Tasks', 'Team Notification', 'Client Email']
  },

  {
    id: 'template-milestone-completion',
    name: 'Milestone Completion Notification',
    description: 'Notify stakeholders when project milestones are completed and update project status.',
    category: 'operations',
    icon: 'Flag',
    difficulty: 'beginner',
    estimatedTimeSaved: '30 min/milestone',
    trigger_type: 'event',
    trigger_config: {
      event: {
        type: 'milestone.completed',
        source: 'milestones',
        filters: {}
      }
    },
    actions: [
      {
        type: 'email',
        name: 'Notify Client',
        position: 1,
        config: {
          to: '{{trigger.client_email}}',
          subject: 'Milestone Completed: {{trigger.milestone_name}}',
          body: `<p>Hi {{trigger.client_name}},</p>
<p>We're pleased to inform you that we've completed a key milestone on your project!</p>
<p><strong>Milestone:</strong> {{trigger.milestone_name}}<br>
<strong>Project:</strong> {{trigger.project_title}}<br>
<strong>Completed:</strong> {{now | date}}</p>
<p>Here's what this means for your project: {{trigger.milestone_description}}</p>
<p>The next milestone is: {{trigger.next_milestone_name}}</p>
<p>If you have any questions, please let us know.</p>`,
          template: 'milestone'
        }
      },
      {
        type: 'notification',
        name: 'Notify Team',
        position: 2,
        config: {
          title: 'Milestone Completed!',
          message: '"{{trigger.milestone_name}}" for project "{{trigger.project_title}}" has been marked as complete.',
          priority: 'medium',
          channels: ['app']
        }
      },
      {
        type: 'update-record',
        name: 'Update Project Progress',
        position: 3,
        config: {
          entity: 'projects',
          recordId: '{{trigger.project_id}}',
          fields: {
            progress: '{{trigger.new_progress}}',
            last_milestone_at: '{{now}}'
          }
        }
      }
    ],
    tags: ['milestone', 'notification', 'project'],
    preview: ['Client Email', 'Team Notification', 'Update Progress']
  },

  // ============================================
  // SUPPORT TEMPLATES
  // ============================================
  {
    id: 'template-ticket-escalation',
    name: 'Support Ticket Escalation',
    description: 'Automatically escalate support tickets that have been open too long.',
    category: 'support',
    icon: 'AlertTriangle',
    difficulty: 'intermediate',
    estimatedTimeSaved: '2 hours/day',
    trigger_type: 'schedule',
    trigger_config: {
      schedule: {
        frequency: 'hourly',
        timezone: 'UTC'
      }
    },
    actions: [
      {
        type: 'api-call',
        name: 'Fetch Old Tickets',
        position: 1,
        config: {
          url: '/api/tickets/stale',
          method: 'GET',
          headers: {}
        }
      },
      {
        type: 'condition',
        name: 'Check Priority Level',
        position: 2,
        config: {
          field: 'ticket.priority',
          operator: 'equals',
          value: 'high',
          ifTrue: 'urgent-escalation',
          ifFalse: 'normal-escalation'
        }
      },
      {
        type: 'notification',
        name: 'Urgent Escalation',
        position: 3,
        config: {
          title: 'URGENT: Ticket Requires Immediate Attention',
          message: 'High-priority ticket #{{ticket.id}} from {{ticket.customer_name}} has been open for {{ticket.hours_open}} hours without resolution.',
          priority: 'high',
          recipientId: '{{ticket.manager_id}}',
          channels: ['app', 'email', 'sms']
        }
      },
      {
        type: 'notification',
        name: 'Normal Escalation',
        position: 4,
        config: {
          title: 'Ticket Escalation Notice',
          message: 'Ticket #{{ticket.id}} has been open for {{ticket.hours_open}} hours. Please review and take action.',
          priority: 'medium',
          recipientId: '{{ticket.assigned_to}}',
          channels: ['app', 'email']
        }
      },
      {
        type: 'update-record',
        name: 'Update Ticket Status',
        position: 5,
        config: {
          entity: 'tickets',
          recordId: '{{ticket.id}}',
          fields: {
            escalated: true,
            escalated_at: '{{now}}',
            escalation_level: '{{ticket.escalation_level + 1}}'
          }
        }
      }
    ],
    tags: ['support', 'escalation', 'tickets', 'sla'],
    preview: ['Check Tickets', 'Determine Priority', 'Send Alerts', 'Update Status']
  },

  {
    id: 'template-customer-feedback',
    name: 'Customer Feedback Collection',
    description: 'Automatically request feedback after project completion or ticket resolution.',
    category: 'support',
    icon: 'MessageSquare',
    difficulty: 'beginner',
    estimatedTimeSaved: '1 hour/week',
    trigger_type: 'event',
    trigger_config: {
      event: {
        type: 'project.completed',
        source: 'projects',
        filters: {}
      }
    },
    actions: [
      {
        type: 'delay',
        name: 'Wait Before Sending',
        position: 1,
        config: {
          duration: 1,
          unit: 'days'
        }
      },
      {
        type: 'email',
        name: 'Request Feedback',
        position: 2,
        config: {
          to: '{{trigger.client_email}}',
          subject: 'How did we do? We\'d love your feedback',
          body: `<p>Hi {{trigger.client_name}},</p>
<p>Now that your project "{{trigger.title}}" is complete, we'd love to hear about your experience working with us.</p>
<p>Your feedback helps us improve and serve you better in the future.</p>
<p><a href="{{feedback_url}}">Click here to share your feedback</a> (takes just 2 minutes)</p>
<p>Thank you for your business!</p>`,
          template: 'feedback-request'
        }
      },
      {
        type: 'create-task',
        name: 'Follow Up Task',
        position: 3,
        config: {
          title: 'Follow up on feedback from {{trigger.client_name}}',
          description: 'Check if feedback was received. If not, send a personal follow-up.',
          priority: 'low',
          dueDate: '+5 days'
        }
      }
    ],
    tags: ['feedback', 'customer', 'survey'],
    preview: ['Wait Period', 'Send Request', 'Create Follow-up']
  },

  // ============================================
  // MARKETING TEMPLATES
  // ============================================
  {
    id: 'template-newsletter-automation',
    name: 'Weekly Newsletter',
    description: 'Compile and send a weekly newsletter with recent updates and content.',
    category: 'marketing',
    icon: 'Newspaper',
    difficulty: 'intermediate',
    estimatedTimeSaved: '3 hours/week',
    trigger_type: 'schedule',
    trigger_config: {
      schedule: {
        frequency: 'weekly',
        cron: '0 9 * * 1',
        timezone: 'UTC'
      }
    },
    actions: [
      {
        type: 'api-call',
        name: 'Fetch Recent Content',
        position: 1,
        config: {
          url: '/api/content/recent',
          method: 'GET',
          headers: {}
        }
      },
      {
        type: 'api-call',
        name: 'Get Newsletter Subscribers',
        position: 2,
        config: {
          url: '/api/subscribers/active',
          method: 'GET',
          headers: {}
        }
      },
      {
        type: 'email',
        name: 'Send Newsletter',
        position: 3,
        config: {
          to: '{{subscribers}}',
          subject: 'Your Weekly Update from {{company_name}}',
          body: `<h1>This Week at {{company_name}}</h1>
{{#each content}}
<h3>{{this.title}}</h3>
<p>{{this.excerpt}}</p>
<a href="{{this.url}}">Read more</a>
{{/each}}`,
          template: 'newsletter'
        }
      },
      {
        type: 'update-record',
        name: 'Log Newsletter Sent',
        position: 4,
        config: {
          entity: 'newsletter_logs',
          recordId: 'new',
          fields: {
            sent_at: '{{now}}',
            recipient_count: '{{subscribers.length}}',
            content_ids: '{{content.map(c => c.id)}}'
          }
        }
      }
    ],
    tags: ['newsletter', 'email', 'marketing', 'weekly'],
    preview: ['Fetch Content', 'Get Subscribers', 'Send Newsletter', 'Log Activity']
  },

  // ============================================
  // HR TEMPLATES
  // ============================================
  {
    id: 'template-employee-onboarding',
    name: 'Employee Onboarding',
    description: 'Streamline new employee onboarding with automated tasks and notifications.',
    category: 'hr',
    icon: 'Users',
    difficulty: 'advanced',
    estimatedTimeSaved: '4 hours/employee',
    trigger_type: 'event',
    trigger_config: {
      event: {
        type: 'employee.created',
        source: 'employees',
        filters: {}
      }
    },
    actions: [
      {
        type: 'email',
        name: 'Send Welcome Email',
        position: 1,
        config: {
          to: '{{trigger.email}}',
          subject: 'Welcome to the team, {{trigger.first_name}}!',
          body: `<p>Hi {{trigger.first_name}},</p>
<p>We're so excited to have you join our team! Here's some important information for your first day:</p>
<ul>
  <li><strong>Start Date:</strong> {{trigger.start_date}}</li>
  <li><strong>Manager:</strong> {{trigger.manager_name}}</li>
  <li><strong>Department:</strong> {{trigger.department}}</li>
</ul>
<p>Before your first day, please:</p>
<ol>
  <li>Complete the attached paperwork</li>
  <li>Review the employee handbook</li>
  <li>Set up your email account</li>
</ol>
<p>We can't wait to see you!</p>`,
          template: 'employee-welcome'
        }
      },
      {
        type: 'create-task',
        name: 'IT Setup Task',
        position: 2,
        config: {
          title: 'Set up workstation for {{trigger.first_name}} {{trigger.last_name}}',
          description: 'Prepare laptop, accounts, and access permissions for new employee starting {{trigger.start_date}}.',
          priority: 'high',
          assignee: '{{it_admin_id}}',
          dueDate: '{{trigger.start_date - 2 days}}'
        }
      },
      {
        type: 'create-task',
        name: 'HR Paperwork Task',
        position: 3,
        config: {
          title: 'Complete HR paperwork for {{trigger.first_name}}',
          description: 'Ensure all required documents are collected and filed.',
          priority: 'high',
          assignee: '{{hr_admin_id}}',
          dueDate: '{{trigger.start_date}}'
        }
      },
      {
        type: 'notification',
        name: 'Notify Manager',
        position: 4,
        config: {
          title: 'New Team Member Joining',
          message: '{{trigger.first_name}} {{trigger.last_name}} is joining your team on {{trigger.start_date}}. Onboarding tasks have been created.',
          priority: 'medium',
          recipientId: '{{trigger.manager_id}}',
          channels: ['app', 'email']
        }
      },
      {
        type: 'create-task',
        name: 'Create Buddy Assignment',
        position: 5,
        config: {
          title: 'Assign onboarding buddy for {{trigger.first_name}}',
          description: 'Assign a team member to help {{trigger.first_name}} get acquainted with the team and processes.',
          priority: 'medium',
          assignee: '{{trigger.manager_id}}',
          dueDate: '{{trigger.start_date - 1 day}}'
        }
      }
    ],
    tags: ['hr', 'onboarding', 'employee', 'tasks'],
    preview: ['Welcome Email', 'IT Setup', 'HR Tasks', 'Manager Notification', 'Buddy Assignment']
  },

  // ============================================
  // CUSTOM/UTILITY TEMPLATES
  // ============================================
  {
    id: 'template-data-backup',
    name: 'Automated Data Export',
    description: 'Regularly export and backup important data to external storage.',
    category: 'operations',
    icon: 'Database',
    difficulty: 'advanced',
    estimatedTimeSaved: '2 hours/week',
    trigger_type: 'schedule',
    trigger_config: {
      schedule: {
        frequency: 'daily',
        time: '02:00',
        timezone: 'UTC'
      }
    },
    actions: [
      {
        type: 'api-call',
        name: 'Export Projects Data',
        position: 1,
        config: {
          url: '/api/export/projects',
          method: 'POST',
          headers: {},
          body: { format: 'json', include_archived: false }
        }
      },
      {
        type: 'api-call',
        name: 'Export Clients Data',
        position: 2,
        config: {
          url: '/api/export/clients',
          method: 'POST',
          headers: {},
          body: { format: 'json' }
        }
      },
      {
        type: 'api-call',
        name: 'Upload to Storage',
        position: 3,
        config: {
          url: '{{backup_storage_url}}',
          method: 'PUT',
          headers: { 'Authorization': 'Bearer {{storage_api_key}}' },
          body: '{{export_data}}'
        }
      },
      {
        type: 'notification',
        name: 'Backup Confirmation',
        position: 4,
        config: {
          title: 'Daily Backup Complete',
          message: 'Data backup completed successfully at {{now}}.',
          priority: 'low',
          channels: ['app']
        }
      }
    ],
    tags: ['backup', 'data', 'export', 'scheduled'],
    preview: ['Export Projects', 'Export Clients', 'Upload', 'Confirm']
  },

  {
    id: 'template-webhook-integration',
    name: 'External Webhook Handler',
    description: 'Process incoming webhooks from external services and take action.',
    category: 'custom',
    icon: 'Webhook',
    difficulty: 'advanced',
    estimatedTimeSaved: 'Varies',
    trigger_type: 'webhook',
    trigger_config: {
      webhook: {
        path: '/webhooks/external',
        method: 'POST',
        secret: '{{WEBHOOK_SECRET}}'
      }
    },
    actions: [
      {
        type: 'condition',
        name: 'Check Event Type',
        position: 1,
        config: {
          field: 'trigger.event_type',
          operator: 'equals',
          value: 'payment.received',
          ifTrue: 'process-payment',
          ifFalse: 'log-event'
        }
      },
      {
        type: 'update-record',
        name: 'Process Payment',
        position: 2,
        config: {
          entity: 'invoices',
          recordId: '{{trigger.invoice_id}}',
          fields: {
            status: 'paid',
            paid_at: '{{now}}',
            payment_method: '{{trigger.payment_method}}'
          }
        }
      },
      {
        type: 'notification',
        name: 'Payment Notification',
        position: 3,
        config: {
          title: 'Payment Received',
          message: 'Invoice #{{trigger.invoice_number}} has been paid (${{trigger.amount}}).',
          priority: 'medium',
          channels: ['app']
        }
      }
    ],
    tags: ['webhook', 'integration', 'api', 'advanced'],
    preview: ['Check Event', 'Process Payment', 'Send Notification']
  }
]

// Template categories with metadata
export const TEMPLATE_CATEGORIES = {
  sales: {
    label: 'Sales',
    description: 'Automate sales processes and client management',
    icon: 'TrendingUp',
    color: 'emerald'
  },
  marketing: {
    label: 'Marketing',
    description: 'Streamline marketing campaigns and communications',
    icon: 'Megaphone',
    color: 'pink'
  },
  operations: {
    label: 'Operations',
    description: 'Optimize project and task management',
    icon: 'Settings',
    color: 'blue'
  },
  finance: {
    label: 'Finance',
    description: 'Automate invoicing and expense management',
    icon: 'DollarSign',
    color: 'amber'
  },
  support: {
    label: 'Support',
    description: 'Improve customer support efficiency',
    icon: 'Headphones',
    color: 'cyan'
  },
  hr: {
    label: 'HR',
    description: 'Streamline HR and employee management',
    icon: 'Users',
    color: 'violet'
  },
  custom: {
    label: 'Custom',
    description: 'Flexible templates for custom workflows',
    icon: 'Wrench',
    color: 'gray'
  }
}

// Get templates by category
export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(t => t.category === category)
}

// Get popular templates
export function getPopularTemplates(limit: number = 6): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES
    .filter(t => t.tags.includes('popular'))
    .slice(0, limit)
}

// Search templates
export function searchTemplates(query: string): WorkflowTemplate[] {
  const lowerQuery = query.toLowerCase()
  return WORKFLOW_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.includes(lowerQuery))
  )
}
