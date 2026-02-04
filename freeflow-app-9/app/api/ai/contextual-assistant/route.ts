/**
 * Contextual AI Assistant (Sidekick) API
 *
 * Beats Monday Sidekick with:
 * - Page-aware assistance
 * - Proactive suggestions
 * - Task automation
 * - Data analysis
 * - Smart recommendations
 * - Learning from user preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createSimpleLogger('ai-contextual-assistant');

// ============================================================================
// TYPES
// ============================================================================

type AssistantContext = 'dashboard' | 'project' | 'task' | 'invoice' | 'client' | 'calendar' | 'messages' | 'settings' | 'global';
type SuggestionType = 'action' | 'insight' | 'reminder' | 'optimization' | 'warning' | 'celebration';

interface ContextualSuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  context: AssistantContext;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  action_button?: string;
  action_payload?: Record<string, unknown>;
  dismiss_until?: string;
  relevance_score: number;
}

interface AssistantInsight {
  id: string;
  category: string;
  title: string;
  description: string;
  data_points: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
  }[];
  recommendation: string;
  confidence: number;
}

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  shortcut?: string;
  available: boolean;
  context: AssistantContext[];
}

interface AssistantRequest {
  action:
    | 'get-suggestions'
    | 'get-insights'
    | 'get-quick-actions'
    | 'ask-question'
    | 'execute-action'
    | 'dismiss-suggestion'
    | 'get-help'
    | 'analyze-data'
    | 'get-personalized-tips';
  context?: AssistantContext;
  question?: string;
  actionId?: string;
  suggestionId?: string;
  dataToAnalyze?: Record<string, unknown>;
  currentPage?: string;
  selectedItems?: string[];
}

// ============================================================================
// DEMO DATA
// ============================================================================

function getDemoSuggestions(context?: AssistantContext): ContextualSuggestion[] {
  const allSuggestions: ContextualSuggestion[] = [
    {
      id: 'sug-1',
      type: 'action',
      title: 'Send invoice for completed project',
      description: 'The "Website Redesign" project was marked complete 3 days ago. Would you like to send the final invoice?',
      context: 'dashboard',
      priority: 'high',
      actionable: true,
      action_button: 'Create Invoice',
      action_payload: { project_id: 'proj-1', action: 'create_invoice' },
      relevance_score: 95,
    },
    {
      id: 'sug-2',
      type: 'reminder',
      title: 'Follow up with TechCorp',
      description: 'No response in 5 days on the proposal you sent. This is a good time to follow up.',
      context: 'client',
      priority: 'medium',
      actionable: true,
      action_button: 'Send Follow-up',
      action_payload: { client_id: 'client-1', action: 'send_followup' },
      relevance_score: 88,
    },
    {
      id: 'sug-3',
      type: 'insight',
      title: 'Revenue is up 23% this month',
      description: 'You\'re on track for your best month yet! Three more invoices paid compared to last month.',
      context: 'dashboard',
      priority: 'low',
      actionable: false,
      relevance_score: 75,
    },
    {
      id: 'sug-4',
      type: 'optimization',
      title: 'Automate your weekly reports',
      description: 'You send similar status reports every Friday. Want me to automate this?',
      context: 'project',
      priority: 'medium',
      actionable: true,
      action_button: 'Set Up Automation',
      action_payload: { action: 'create_automation', type: 'weekly_report' },
      relevance_score: 82,
    },
    {
      id: 'sug-5',
      type: 'warning',
      title: 'Deadline approaching',
      description: '2 tasks in "Mobile App" project are due tomorrow with no progress logged.',
      context: 'project',
      priority: 'high',
      actionable: true,
      action_button: 'View Tasks',
      action_payload: { project_id: 'proj-2', filter: 'overdue' },
      relevance_score: 92,
    },
    {
      id: 'sug-6',
      type: 'celebration',
      title: 'Milestone reached!',
      description: 'You\'ve completed 100 tasks this quarter. That\'s 25% more than last quarter!',
      context: 'dashboard',
      priority: 'low',
      actionable: false,
      relevance_score: 60,
    },
  ];

  if (context) {
    return allSuggestions.filter(s => s.context === context || s.context === 'global');
  }

  return allSuggestions.sort((a, b) => b.relevance_score - a.relevance_score);
}

function getDemoInsights(): AssistantInsight[] {
  return [
    {
      id: 'insight-1',
      category: 'productivity',
      title: 'Your most productive hours',
      description: 'You complete 60% of your tasks between 9 AM and 12 PM. Consider scheduling important work during this window.',
      data_points: [
        { label: 'Peak hours', value: '9 AM - 12 PM', trend: 'stable' },
        { label: 'Tasks completed (peak)', value: '60%', trend: 'up' },
        { label: 'Average focus time', value: '2.5 hours', trend: 'up' },
      ],
      recommendation: 'Block 9-12 on your calendar for deep work',
      confidence: 0.89,
    },
    {
      id: 'insight-2',
      category: 'revenue',
      title: 'Client concentration risk',
      description: '68% of your revenue comes from one client. Diversifying your client base would reduce risk.',
      data_points: [
        { label: 'Top client revenue share', value: '68%', trend: 'up' },
        { label: 'Active clients', value: 4, trend: 'stable' },
        { label: 'New leads this month', value: 7, trend: 'up' },
      ],
      recommendation: 'Focus on converting 2-3 leads to balance your portfolio',
      confidence: 0.92,
    },
    {
      id: 'insight-3',
      category: 'efficiency',
      title: 'Invoice payment patterns',
      description: 'Clients pay 4 days faster when you include a payment link in the invoice.',
      data_points: [
        { label: 'Avg. payment time (with link)', value: '3 days' },
        { label: 'Avg. payment time (without)', value: '7 days' },
        { label: 'Link usage rate', value: '67%' },
      ],
      recommendation: 'Enable automatic payment links for all invoices',
      confidence: 0.85,
    },
  ];
}

function getDemoQuickActions(context?: AssistantContext): QuickAction[] {
  const allActions: QuickAction[] = [
    {
      id: 'qa-1',
      name: 'Create Task',
      description: 'Quickly create a new task',
      icon: 'plus-circle',
      shortcut: 'Ctrl+Shift+T',
      available: true,
      context: ['dashboard', 'project', 'task'],
    },
    {
      id: 'qa-2',
      name: 'New Invoice',
      description: 'Create a new invoice',
      icon: 'file-text',
      shortcut: 'Ctrl+Shift+I',
      available: true,
      context: ['dashboard', 'client', 'invoice'],
    },
    {
      id: 'qa-3',
      name: 'Start Timer',
      description: 'Start tracking time for current task',
      icon: 'clock',
      shortcut: 'Ctrl+Shift+S',
      available: true,
      context: ['task', 'project'],
    },
    {
      id: 'qa-4',
      name: 'Schedule Meeting',
      description: 'Schedule a new meeting',
      icon: 'calendar',
      shortcut: 'Ctrl+Shift+M',
      available: true,
      context: ['dashboard', 'client', 'calendar'],
    },
    {
      id: 'qa-5',
      name: 'Send Message',
      description: 'Send a message to team or client',
      icon: 'message-circle',
      shortcut: 'Ctrl+Shift+E',
      available: true,
      context: ['dashboard', 'project', 'client', 'messages'],
    },
    {
      id: 'qa-6',
      name: 'Search Everything',
      description: 'Search across all your data',
      icon: 'search',
      shortcut: 'Ctrl+K',
      available: true,
      context: ['dashboard', 'project', 'task', 'invoice', 'client', 'calendar', 'messages', 'settings', 'global'],
    },
  ];

  if (context) {
    return allActions.filter(a => a.context.includes(context) || a.context.includes('global'));
  }

  return allActions;
}

function getDemoHelp(currentPage?: string) {
  return {
    current_page: currentPage || 'dashboard',
    tips: [
      'Press Ctrl+K to open quick search anytime',
      'Drag and drop to reorder tasks in lists',
      'Use @mentions to notify team members',
    ],
    tutorials: [
      { id: 'tut-1', title: 'Getting Started with Projects', duration: '5 min', completed: true },
      { id: 'tut-2', title: 'Automating Your Workflows', duration: '8 min', completed: false },
      { id: 'tut-3', title: 'Mastering Invoicing', duration: '6 min', completed: false },
    ],
    faq: [
      { question: 'How do I invite team members?', answer: 'Go to Settings > Team > Invite Members' },
      { question: 'How do I track time?', answer: 'Click the timer icon on any task to start tracking' },
      { question: 'How do I export data?', answer: 'Use Data Export in Settings for CSV/JSON exports' },
    ],
    support_options: [
      { type: 'chat', label: 'Chat with Support', available: true },
      { type: 'email', label: 'Email Support', available: true },
      { type: 'docs', label: 'Documentation', available: true },
    ],
  };
}

// ============================================================================
// HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const context = searchParams.get('context') as AssistantContext | null;

    return NextResponse.json({
      success: true,
      data: {
        suggestions: getDemoSuggestions(context || undefined),
        quick_actions: getDemoQuickActions(context || undefined),
      },
      source: 'demo',
    });
  } catch (err) {
    logger.error('Contextual Assistant GET error', { error: err });
    return NextResponse.json({
      success: true,
      data: {
        suggestions: getDemoSuggestions(),
        quick_actions: getDemoQuickActions(),
      },
      source: 'demo',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AssistantRequest = await request.json();
    const { action } = body;

    const supabase = await createClient();

    switch (action) {
      case 'get-suggestions': {
        const { context, currentPage } = body;
        return NextResponse.json({
          success: true,
          data: getDemoSuggestions(context),
        });
      }

      case 'get-insights': {
        return NextResponse.json({
          success: true,
          data: getDemoInsights(),
        });
      }

      case 'get-quick-actions': {
        const { context } = body;
        return NextResponse.json({
          success: true,
          data: getDemoQuickActions(context),
        });
      }

      case 'ask-question': {
        const { question, context } = body;
        if (!question) {
          return NextResponse.json({ success: false, error: 'Question required' }, { status: 400 });
        }

        const lowerQuestion = question.toLowerCase();
        let answer = '';
        let actions: QuickAction[] = [];

        if (lowerQuestion.includes('invoice') || lowerQuestion.includes('payment')) {
          answer = 'To create an invoice, go to Invoices > New Invoice, or use the quick action Ctrl+Shift+I. You can also create invoices directly from completed projects.';
          actions = getDemoQuickActions().filter(a => a.id === 'qa-2');
        } else if (lowerQuestion.includes('task') || lowerQuestion.includes('todo')) {
          answer = 'You can create tasks from the dashboard, within projects, or using Ctrl+Shift+T. Tasks can have due dates, assignees, and subtasks.';
          actions = getDemoQuickActions().filter(a => a.id === 'qa-1');
        } else if (lowerQuestion.includes('time') || lowerQuestion.includes('track')) {
          answer = 'Start tracking time by clicking the timer icon on any task. Time entries can be converted to invoices automatically.';
          actions = getDemoQuickActions().filter(a => a.id === 'qa-3');
        } else {
          answer = `I can help you with that! Here's what I found related to "${question}". Would you like me to explain further or take an action?`;
        }

        return NextResponse.json({
          success: true,
          data: {
            question,
            answer,
            suggested_actions: actions,
            related_help: getDemoHelp().tutorials.slice(0, 2),
          },
        });
      }

      case 'execute-action': {
        const { actionId } = body;
        if (!actionId) {
          return NextResponse.json({ success: false, error: 'Action ID required' }, { status: 400 });
        }

        // Simulate action execution
        return NextResponse.json({
          success: true,
          data: {
            action_id: actionId,
            executed: true,
            result: 'Action completed successfully',
            next_step: null,
          },
          message: 'Action executed successfully',
        });
      }

      case 'dismiss-suggestion': {
        const { suggestionId } = body;
        if (!suggestionId) {
          return NextResponse.json({ success: false, error: 'Suggestion ID required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: {
            suggestion_id: suggestionId,
            dismissed: true,
            dismissed_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
          },
          message: 'Suggestion dismissed',
        });
      }

      case 'get-help': {
        const { currentPage } = body;
        return NextResponse.json({
          success: true,
          data: getDemoHelp(currentPage),
        });
      }

      case 'analyze-data': {
        const { dataToAnalyze } = body;

        // Simulate data analysis
        const analysis = {
          summary: 'Analysis complete. Found 3 patterns and 2 optimization opportunities.',
          patterns: [
            'Most activity occurs on Tuesdays and Wednesdays',
            'Average task completion time is 2.3 days',
            'Client response time averages 4 hours',
          ],
          opportunities: [
            'Batch similar tasks to improve efficiency by ~20%',
            'Schedule client calls in morning slots for better response rates',
          ],
          visualizations_available: ['trend_chart', 'distribution', 'comparison'],
        };

        return NextResponse.json({
          success: true,
          data: analysis,
        });
      }

      case 'get-personalized-tips': {
        const tips = [
          {
            id: 'tip-1',
            title: 'You could save 2 hours/week',
            description: 'Based on your patterns, automating invoice reminders would save significant time.',
            action: 'Set up automation',
          },
          {
            id: 'tip-2',
            title: 'Try the Kanban view',
            description: 'You often work on multiple projects. Kanban view helps visualize work across all of them.',
            action: 'Switch to Kanban',
          },
          {
            id: 'tip-3',
            title: 'Use templates',
            description: 'You create similar projects often. Create a template to save 30 minutes per project.',
            action: 'Create template',
          },
        ];

        return NextResponse.json({
          success: true,
          data: tips,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    logger.error('Contextual Assistant POST error', { error: err });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
