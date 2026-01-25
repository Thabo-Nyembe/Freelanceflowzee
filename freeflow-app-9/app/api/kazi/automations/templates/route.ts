import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('kazi-automation-templates')

// Default templates if none exist in database
const defaultTemplates = [
  {
    id: 'template-1',
    name: 'New Client Welcome',
    description: 'Send a welcome email when a new client is added',
    category: 'clients',
    icon: 'UserPlus',
    color: 'blue',
    trigger_type: 'event',
    trigger_config: { event: 'client.created' },
    actions: [{ type: 'email', config: { template: 'welcome' } }],
    tags: ['onboarding', 'clients'],
    is_verified: true
  },
  {
    id: 'template-2',
    name: 'Invoice Reminder',
    description: 'Send reminder for overdue invoices',
    category: 'billing',
    icon: 'Receipt',
    color: 'amber',
    trigger_type: 'schedule',
    trigger_config: { cron: '0 9 * * *' },
    actions: [
      { type: 'condition', config: { field: 'status', operator: 'equals', value: 'overdue' } },
      { type: 'email', config: { template: 'invoice-reminder' } }
    ],
    tags: ['invoices', 'billing'],
    is_verified: true
  },
  {
    id: 'template-3',
    name: 'Task Assignment Notification',
    description: 'Notify team member when assigned to task',
    category: 'tasks',
    icon: 'CheckSquare',
    color: 'green',
    trigger_type: 'event',
    trigger_config: { event: 'task.assigned' },
    actions: [{ type: 'notification', config: { message: 'You have been assigned a new task' } }],
    tags: ['tasks', 'notifications'],
    is_verified: true
  },
  {
    id: 'template-4',
    name: 'Project Completion',
    description: 'Update status and notify client when project is complete',
    category: 'projects',
    icon: 'FolderCheck',
    color: 'purple',
    trigger_type: 'event',
    trigger_config: { event: 'project.completed' },
    actions: [
      { type: 'update-status', config: { status: 'delivered' } },
      { type: 'email', config: { template: 'project-complete' } }
    ],
    tags: ['projects', 'clients'],
    is_verified: true
  },
  {
    id: 'template-5',
    name: 'Daily Standup Reminder',
    description: 'Send daily standup reminder to team',
    category: 'team',
    icon: 'Clock',
    color: 'indigo',
    trigger_type: 'schedule',
    trigger_config: { cron: '0 9 * * 1-5' },
    actions: [{ type: 'slack-message', config: { channel: '#general', message: 'Time for daily standup!' } }],
    tags: ['team', 'meetings'],
    is_verified: true
  },
  {
    id: 'template-6',
    name: 'Weekly Report',
    description: 'Generate and send weekly progress report',
    category: 'reports',
    icon: 'BarChart',
    color: 'teal',
    trigger_type: 'schedule',
    trigger_config: { cron: '0 18 * * 5' },
    actions: [
      { type: 'api-call', config: { action: 'generate-report' } },
      { type: 'email', config: { template: 'weekly-report' } }
    ],
    tags: ['reports', 'analytics'],
    is_verified: true
  }
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Try to get templates from workflow_templates table
    let query = supabase
      .from('workflow_templates')
      .select('*')
      .eq('is_active', true)
      .order('run_count', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching templates', { error })
      // Return default templates on error
      return NextResponse.json({ data: defaultTemplates })
    }

    // If no templates in DB, return defaults
    if (!data || data.length === 0) {
      let templates = defaultTemplates
      if (category) {
        templates = templates.filter(t => t.category === category)
      }
      return NextResponse.json({ data: templates })
    }

    // Transform DB data to API format
    const transformedData = data.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category || 'general',
      icon: (template.trigger_config as Record<string, unknown>)?.icon || 'Zap',
      color: (template.trigger_config as Record<string, unknown>)?.color || 'blue',
      trigger_type: template.trigger_type || 'manual',
      trigger_config: template.trigger_config || {},
      actions: template.actions || [],
      tags: template.tags || [],
      usage_count: template.run_count || 0,
      is_verified: true
    }))

    return NextResponse.json({ data: transformedData })
  } catch (error) {
    logger.error('Error in GET /api/kazi/automations/templates', { error })
    // Return default templates on error
    return NextResponse.json({ data: defaultTemplates })
  }
}
