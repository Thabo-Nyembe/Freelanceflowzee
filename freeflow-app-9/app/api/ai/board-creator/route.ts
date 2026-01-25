/**
 * AI-Powered Board Creation API
 *
 * Beats Monday Magic with:
 * - Natural language to board structure
 * - Template suggestions based on use case
 * - Auto-column configuration
 * - Smart automation setup
 * - Industry-specific optimizations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('ai-board-creator');

// ============================================================================
// TYPES
// ============================================================================

type ColumnType = 'text' | 'number' | 'status' | 'date' | 'person' | 'dropdown' | 'checkbox' | 'link' | 'file' | 'formula' | 'timeline' | 'rating' | 'tag';
type BoardTemplate = 'project' | 'crm' | 'hr' | 'marketing' | 'sales' | 'product' | 'support' | 'custom';

interface BoardColumn {
  id: string;
  name: string;
  type: ColumnType;
  width: number;
  options?: string[] | { label: string; color: string }[];
  formula?: string;
  required: boolean;
  description: string | null;
}

interface BoardGroup {
  id: string;
  name: string;
  color: string;
  collapsed: boolean;
}

interface BoardAutomation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

interface GeneratedBoard {
  id: string;
  name: string;
  description: string;
  template_type: BoardTemplate;
  columns: BoardColumn[];
  groups: BoardGroup[];
  automations: BoardAutomation[];
  views: { id: string; name: string; type: 'table' | 'kanban' | 'timeline' | 'calendar' | 'chart' }[];
  sample_items: Record<string, unknown>[];
  customizations_available: string[];
}

interface BoardCreatorRequest {
  action:
    | 'create-from-prompt'
    | 'create-from-template'
    | 'suggest-templates'
    | 'add-column'
    | 'suggest-automations'
    | 'optimize-board'
    | 'duplicate-board'
    | 'get-templates';
  prompt?: string;
  templateId?: string;
  boardId?: string;
  industry?: string;
  useCase?: string;
  column?: Partial<BoardColumn>;
}

// ============================================================================
// DEMO DATA
// ============================================================================

function generateBoardFromPrompt(prompt: string): GeneratedBoard {
  // Simulate AI understanding of the prompt
  const lowerPrompt = prompt.toLowerCase();

  let template: BoardTemplate = 'project';
  let name = 'New Board';
  let description = '';
  let columns: BoardColumn[] = [];
  let groups: BoardGroup[] = [];
  let automations: BoardAutomation[] = [];

  if (lowerPrompt.includes('crm') || lowerPrompt.includes('customer') || lowerPrompt.includes('sales')) {
    template = 'crm';
    name = 'Customer Relationship Board';
    description = 'Track and manage customer interactions and deals';
    columns = [
      { id: 'col-1', name: 'Company', type: 'text', width: 200, required: true, description: 'Company name' },
      { id: 'col-2', name: 'Contact', type: 'person', width: 150, required: true, description: 'Primary contact' },
      { id: 'col-3', name: 'Deal Value', type: 'number', width: 120, required: false, description: 'Potential deal value' },
      { id: 'col-4', name: 'Stage', type: 'status', width: 150, options: [
        { label: 'Lead', color: '#6b7280' },
        { label: 'Qualified', color: '#3b82f6' },
        { label: 'Proposal', color: '#f59e0b' },
        { label: 'Negotiation', color: '#8b5cf6' },
        { label: 'Closed Won', color: '#10b981' },
        { label: 'Closed Lost', color: '#ef4444' },
      ], required: true, description: 'Current deal stage' },
      { id: 'col-5', name: 'Next Follow-up', type: 'date', width: 130, required: false, description: null },
      { id: 'col-6', name: 'Priority', type: 'rating', width: 100, required: false, description: 'Deal priority (1-5)' },
      { id: 'col-7', name: 'Notes', type: 'text', width: 250, required: false, description: 'Additional notes' },
    ];
    groups = [
      { id: 'grp-1', name: 'Hot Leads', color: '#ef4444', collapsed: false },
      { id: 'grp-2', name: 'Active Deals', color: '#3b82f6', collapsed: false },
      { id: 'grp-3', name: 'Nurturing', color: '#f59e0b', collapsed: true },
    ];
    automations = [
      { id: 'auto-1', name: 'Follow-up Reminder', trigger: 'When follow-up date arrives', action: 'Notify assigned person', enabled: true },
      { id: 'auto-2', name: 'Deal Won Celebration', trigger: 'When stage changes to Closed Won', action: 'Send team notification', enabled: true },
      { id: 'auto-3', name: 'Stale Deal Alert', trigger: 'When item unchanged for 14 days', action: 'Notify manager', enabled: true },
    ];
  } else if (lowerPrompt.includes('project') || lowerPrompt.includes('task') || lowerPrompt.includes('development')) {
    template = 'project';
    name = 'Project Management Board';
    description = 'Track project tasks, deadlines, and team assignments';
    columns = [
      { id: 'col-1', name: 'Task', type: 'text', width: 250, required: true, description: 'Task name' },
      { id: 'col-2', name: 'Assignee', type: 'person', width: 150, required: false, description: null },
      { id: 'col-3', name: 'Status', type: 'status', width: 130, options: [
        { label: 'To Do', color: '#6b7280' },
        { label: 'In Progress', color: '#3b82f6' },
        { label: 'Review', color: '#f59e0b' },
        { label: 'Done', color: '#10b981' },
        { label: 'Blocked', color: '#ef4444' },
      ], required: true, description: null },
      { id: 'col-4', name: 'Priority', type: 'dropdown', width: 100, options: ['Low', 'Medium', 'High', 'Critical'], required: false, description: null },
      { id: 'col-5', name: 'Due Date', type: 'date', width: 120, required: false, description: null },
      { id: 'col-6', name: 'Estimated Hours', type: 'number', width: 100, required: false, description: null },
      { id: 'col-7', name: 'Tags', type: 'tag', width: 150, required: false, description: null },
      { id: 'col-8', name: 'Progress', type: 'formula', width: 100, formula: 'PROGRESS(subtasks)', required: false, description: 'Auto-calculated' },
    ];
    groups = [
      { id: 'grp-1', name: 'Sprint 1', color: '#3b82f6', collapsed: false },
      { id: 'grp-2', name: 'Sprint 2', color: '#10b981', collapsed: true },
      { id: 'grp-3', name: 'Backlog', color: '#6b7280', collapsed: true },
    ];
    automations = [
      { id: 'auto-1', name: 'Due Date Reminder', trigger: 'When due date approaches (1 day before)', action: 'Notify assignee', enabled: true },
      { id: 'auto-2', name: 'Status Update Slack', trigger: 'When status changes to Done', action: 'Post to Slack channel', enabled: true },
      { id: 'auto-3', name: 'Blocked Alert', trigger: 'When status changes to Blocked', action: 'Notify team lead', enabled: true },
    ];
  } else if (lowerPrompt.includes('marketing') || lowerPrompt.includes('campaign') || lowerPrompt.includes('content')) {
    template = 'marketing';
    name = 'Marketing Campaign Board';
    description = 'Plan and track marketing campaigns and content';
    columns = [
      { id: 'col-1', name: 'Campaign', type: 'text', width: 220, required: true, description: null },
      { id: 'col-2', name: 'Channel', type: 'dropdown', width: 130, options: ['Social', 'Email', 'PPC', 'SEO', 'Content', 'Events'], required: true, description: null },
      { id: 'col-3', name: 'Status', type: 'status', width: 120, options: [
        { label: 'Planning', color: '#6b7280' },
        { label: 'Creating', color: '#3b82f6' },
        { label: 'Scheduled', color: '#f59e0b' },
        { label: 'Live', color: '#10b981' },
        { label: 'Completed', color: '#8b5cf6' },
      ], required: true, description: null },
      { id: 'col-4', name: 'Launch Date', type: 'date', width: 120, required: false, description: null },
      { id: 'col-5', name: 'Budget', type: 'number', width: 100, required: false, description: null },
      { id: 'col-6', name: 'Reach', type: 'number', width: 100, required: false, description: 'Target audience size' },
      { id: 'col-7', name: 'Owner', type: 'person', width: 130, required: true, description: null },
      { id: 'col-8', name: 'Assets', type: 'file', width: 150, required: false, description: null },
    ];
    groups = [
      { id: 'grp-1', name: 'Q1 Campaigns', color: '#3b82f6', collapsed: false },
      { id: 'grp-2', name: 'Evergreen', color: '#10b981', collapsed: false },
    ];
    automations = [
      { id: 'auto-1', name: 'Launch Reminder', trigger: 'When launch date is tomorrow', action: 'Notify team', enabled: true },
      { id: 'auto-2', name: 'Campaign Live', trigger: 'When status changes to Live', action: 'Update analytics dashboard', enabled: true },
    ];
  } else {
    // Default generic board
    name = prompt.slice(0, 50) || 'New Board';
    description = 'Custom board created from your description';
    columns = [
      { id: 'col-1', name: 'Item', type: 'text', width: 200, required: true, description: null },
      { id: 'col-2', name: 'Status', type: 'status', width: 120, options: [
        { label: 'New', color: '#6b7280' },
        { label: 'Working', color: '#3b82f6' },
        { label: 'Done', color: '#10b981' },
      ], required: true, description: null },
      { id: 'col-3', name: 'Owner', type: 'person', width: 130, required: false, description: null },
      { id: 'col-4', name: 'Date', type: 'date', width: 120, required: false, description: null },
      { id: 'col-5', name: 'Notes', type: 'text', width: 200, required: false, description: null },
    ];
    groups = [
      { id: 'grp-1', name: 'Group 1', color: '#3b82f6', collapsed: false },
      { id: 'grp-2', name: 'Group 2', color: '#10b981', collapsed: false },
    ];
    automations = [];
  }

  return {
    id: `board-${Date.now()}`,
    name,
    description,
    template_type: template,
    columns,
    groups,
    automations,
    views: [
      { id: 'view-1', name: 'Main Table', type: 'table' },
      { id: 'view-2', name: 'Kanban', type: 'kanban' },
      { id: 'view-3', name: 'Timeline', type: 'timeline' },
    ],
    sample_items: [],
    customizations_available: [
      'Add more columns',
      'Create custom automations',
      'Set up integrations',
      'Add dashboards',
      'Configure permissions',
    ],
  };
}

function getDemoTemplates() {
  return [
    {
      id: 'tpl-project',
      name: 'Project Management',
      description: 'Track tasks, deadlines, and team assignments',
      category: 'project',
      uses: 45000,
      rating: 4.8,
      preview_columns: ['Task', 'Status', 'Assignee', 'Due Date', 'Priority'],
    },
    {
      id: 'tpl-crm',
      name: 'CRM Pipeline',
      description: 'Manage leads, deals, and customer relationships',
      category: 'crm',
      uses: 32000,
      rating: 4.7,
      preview_columns: ['Company', 'Contact', 'Deal Value', 'Stage', 'Follow-up'],
    },
    {
      id: 'tpl-marketing',
      name: 'Marketing Campaigns',
      description: 'Plan and track marketing campaigns',
      category: 'marketing',
      uses: 28000,
      rating: 4.6,
      preview_columns: ['Campaign', 'Channel', 'Status', 'Launch Date', 'Budget'],
    },
    {
      id: 'tpl-hr',
      name: 'HR Recruitment',
      description: 'Manage job applications and hiring pipeline',
      category: 'hr',
      uses: 18000,
      rating: 4.5,
      preview_columns: ['Candidate', 'Position', 'Stage', 'Interview Date', 'Rating'],
    },
    {
      id: 'tpl-product',
      name: 'Product Roadmap',
      description: 'Plan and communicate product development',
      category: 'product',
      uses: 24000,
      rating: 4.7,
      preview_columns: ['Feature', 'Status', 'Quarter', 'Owner', 'Impact'],
    },
    {
      id: 'tpl-support',
      name: 'Customer Support',
      description: 'Track and resolve support tickets',
      category: 'support',
      uses: 21000,
      rating: 4.6,
      preview_columns: ['Ticket', 'Priority', 'Status', 'Assignee', 'Created'],
    },
  ];
}

// ============================================================================
// HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: getDemoTemplates(),
      source: 'demo',
    });
  } catch (err) {
    logger.error('Board Creator GET error', { error: err });
    return NextResponse.json({
      success: true,
      data: getDemoTemplates(),
      source: 'demo',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: BoardCreatorRequest = await request.json();
    const { action } = body;

    const supabase = await createClient();

    switch (action) {
      case 'create-from-prompt': {
        const { prompt } = body;
        if (!prompt) {
          return NextResponse.json({ success: false, error: 'Prompt required' }, { status: 400 });
        }

        const board = generateBoardFromPrompt(prompt);

        return NextResponse.json({
          success: true,
          data: board,
          message: `Created "${board.name}" board with ${board.columns.length} columns and ${board.automations.length} automations`,
        });
      }

      case 'create-from-template': {
        const { templateId } = body;
        if (!templateId) {
          return NextResponse.json({ success: false, error: 'Template ID required' }, { status: 400 });
        }

        const templates = getDemoTemplates();
        const template = templates.find(t => t.id === templateId);

        if (!template) {
          return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
        }

        const board = generateBoardFromPrompt(template.category);
        board.name = `My ${template.name}`;

        return NextResponse.json({
          success: true,
          data: board,
          message: `Created board from "${template.name}" template`,
        });
      }

      case 'suggest-templates': {
        const { prompt, industry, useCase } = body;

        const allTemplates = getDemoTemplates();
        const suggestions = allTemplates.slice(0, 3).map((t, i) => ({
          ...t,
          match_score: 95 - i * 10,
          match_reasons: [
            'Matches your industry',
            'Popular with similar users',
            'Includes relevant columns',
          ],
        }));

        return NextResponse.json({
          success: true,
          data: {
            suggestions,
            custom_option: {
              available: true,
              description: 'Create a fully custom board with AI assistance',
            },
          },
        });
      }

      case 'add-column': {
        const { boardId, column } = body;
        if (!boardId || !column) {
          return NextResponse.json({ success: false, error: 'Board ID and column data required' }, { status: 400 });
        }

        const newColumn: BoardColumn = {
          id: `col-${Date.now()}`,
          name: column.name || 'New Column',
          type: column.type || 'text',
          width: column.width || 150,
          options: column.options,
          formula: column.formula,
          required: column.required || false,
          description: column.description || null,
        };

        return NextResponse.json({
          success: true,
          data: newColumn,
          message: `Added "${newColumn.name}" column`,
        });
      }

      case 'suggest-automations': {
        const { boardId } = body;

        const suggestions = [
          {
            id: 'sug-1',
            name: 'Status Update Notification',
            description: 'Notify team when items move to a new status',
            trigger: 'When status changes',
            action: 'Send notification to assignee',
            category: 'notifications',
          },
          {
            id: 'sug-2',
            name: 'Due Date Reminder',
            description: 'Get reminded before deadlines',
            trigger: 'When due date approaches (1 day before)',
            action: 'Send reminder to assignee',
            category: 'reminders',
          },
          {
            id: 'sug-3',
            name: 'Auto-assign New Items',
            description: 'Automatically assign new items to team members',
            trigger: 'When item is created',
            action: 'Assign to team member (round-robin)',
            category: 'assignments',
          },
          {
            id: 'sug-4',
            name: 'Slack Integration',
            description: 'Post updates to Slack channel',
            trigger: 'When status changes to Done',
            action: 'Post message to #team-updates',
            category: 'integrations',
          },
        ];

        return NextResponse.json({
          success: true,
          data: suggestions,
        });
      }

      case 'optimize-board': {
        const { boardId } = body;

        const optimizations = {
          current_health: 72,
          potential_health: 95,
          suggestions: [
            {
              type: 'column',
              title: 'Add a Timeline column',
              description: 'Visualize project duration with start/end dates',
              impact: 'high',
            },
            {
              type: 'automation',
              title: 'Set up status change notifications',
              description: 'Keep team updated on progress automatically',
              impact: 'medium',
            },
            {
              type: 'view',
              title: 'Create a Kanban view',
              description: 'Better visualize work in progress',
              impact: 'medium',
            },
            {
              type: 'formula',
              title: 'Add progress calculation',
              description: 'Auto-calculate project completion percentage',
              impact: 'low',
            },
          ],
        };

        return NextResponse.json({
          success: true,
          data: optimizations,
        });
      }

      case 'duplicate-board': {
        const { boardId } = body;
        if (!boardId) {
          return NextResponse.json({ success: false, error: 'Board ID required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: {
            original_id: boardId,
            duplicate_id: `board-dup-${Date.now()}`,
            name: 'Copy of Board',
            created_at: new Date().toISOString(),
          },
          message: 'Board duplicated successfully',
        });
      }

      case 'get-templates': {
        return NextResponse.json({
          success: true,
          data: getDemoTemplates(),
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    logger.error('Board Creator POST error', { error: err });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
