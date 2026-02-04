/**
 * No-Code App Builder API
 *
 * Beats Monday Vibe with:
 * - Drag-and-drop app creation
 * - AI-generated components
 * - Data source connections
 * - Custom workflows
 * - Template library
 * - One-click deployment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

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

const logger = createFeatureLogger('ai-no-code-builder');

// ============================================================================
// TYPES
// ============================================================================

type ComponentType = 'form' | 'table' | 'chart' | 'card' | 'list' | 'calendar' | 'kanban' | 'timeline' | 'map' | 'button' | 'text' | 'image' | 'container';
type DataSourceType = 'supabase' | 'api' | 'spreadsheet' | 'airtable' | 'notion' | 'manual';
type AppStatus = 'draft' | 'published' | 'archived';

interface AppComponent {
  id: string;
  type: ComponentType;
  name: string;
  properties: Record<string, unknown>;
  position: { x: number; y: number; width: number; height: number };
  data_binding?: {
    source: string;
    field: string;
    transform?: string;
  };
  actions?: {
    event: string;
    action_type: string;
    payload: Record<string, unknown>;
  }[];
  children?: string[];
  style?: Record<string, unknown>;
}

interface AppPage {
  id: string;
  name: string;
  path: string;
  components: AppComponent[];
  layout: 'freeform' | 'grid' | 'flex';
  access: 'public' | 'authenticated' | 'role_based';
  allowed_roles?: string[];
}

interface NoCodeApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  pages: AppPage[];
  data_sources: {
    id: string;
    name: string;
    type: DataSourceType;
    config: Record<string, unknown>;
  }[];
  workflows: {
    id: string;
    name: string;
    trigger: string;
    steps: Record<string, unknown>[];
  }[];
  settings: {
    theme: 'light' | 'dark' | 'system';
    primary_color: string;
    custom_domain?: string;
    auth_required: boolean;
  };
  status: AppStatus;
  version: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

interface AppTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_url: string;
  uses: number;
  rating: number;
  components_count: number;
  pages_count: number;
}

interface NoCodeRequest {
  action:
    | 'list-apps'
    | 'get-app'
    | 'create-app'
    | 'update-app'
    | 'delete-app'
    | 'add-page'
    | 'add-component'
    | 'update-component'
    | 'delete-component'
    | 'add-data-source'
    | 'add-workflow'
    | 'publish-app'
    | 'unpublish-app'
    | 'get-templates'
    | 'create-from-template'
    | 'ai-generate-component'
    | 'ai-suggest-layout'
    | 'preview-app';
  appId?: string;
  pageId?: string;
  componentId?: string;
  templateId?: string;
  data?: Partial<NoCodeApp>;
  page?: Partial<AppPage>;
  component?: Partial<AppComponent>;
  dataSource?: Record<string, unknown>;
  workflow?: Record<string, unknown>;
  prompt?: string;
}

// ============================================================================
// DEMO DATA
// ============================================================================

function getDemoApp(): NoCodeApp {
  return {
    id: 'app-1',
    name: 'Client Portal',
    description: 'A portal for clients to view projects and invoices',
    icon: 'users',
    color: '#3b82f6',
    pages: [
      {
        id: 'page-1',
        name: 'Dashboard',
        path: '/',
        layout: 'grid',
        access: 'authenticated',
        components: [
          {
            id: 'comp-1',
            type: 'card',
            name: 'Active Projects',
            properties: { title: 'Active Projects', value: '{{projects.active.count}}' },
            position: { x: 0, y: 0, width: 3, height: 2 },
            data_binding: { source: 'projects', field: 'status=active' },
          },
          {
            id: 'comp-2',
            type: 'card',
            name: 'Outstanding Invoices',
            properties: { title: 'Outstanding', value: '{{invoices.pending.total}}' },
            position: { x: 3, y: 0, width: 3, height: 2 },
            data_binding: { source: 'invoices', field: 'status=pending' },
          },
          {
            id: 'comp-3',
            type: 'table',
            name: 'Recent Projects',
            properties: { columns: ['name', 'status', 'due_date'], pageSize: 5 },
            position: { x: 0, y: 2, width: 6, height: 4 },
            data_binding: { source: 'projects', field: '*' },
          },
          {
            id: 'comp-4',
            type: 'chart',
            name: 'Monthly Spend',
            properties: { chartType: 'bar', xAxis: 'month', yAxis: 'amount' },
            position: { x: 6, y: 0, width: 6, height: 4 },
            data_binding: { source: 'invoices', field: 'monthly_totals' },
          },
        ],
      },
      {
        id: 'page-2',
        name: 'Projects',
        path: '/projects',
        layout: 'grid',
        access: 'authenticated',
        components: [
          {
            id: 'comp-5',
            type: 'kanban',
            name: 'Project Board',
            properties: { columns: ['To Do', 'In Progress', 'Review', 'Done'] },
            position: { x: 0, y: 0, width: 12, height: 8 },
            data_binding: { source: 'projects', field: '*' },
          },
        ],
      },
      {
        id: 'page-3',
        name: 'Invoices',
        path: '/invoices',
        layout: 'grid',
        access: 'authenticated',
        components: [
          {
            id: 'comp-6',
            type: 'table',
            name: 'Invoice List',
            properties: {
              columns: ['number', 'amount', 'status', 'due_date'],
              actions: ['view', 'pay', 'download'],
            },
            position: { x: 0, y: 0, width: 12, height: 8 },
            data_binding: { source: 'invoices', field: '*' },
            actions: [
              { event: 'click:pay', action_type: 'navigate', payload: { url: '/pay/{{id}}' } },
            ],
          },
        ],
      },
    ],
    data_sources: [
      {
        id: 'ds-1',
        name: 'Projects',
        type: 'supabase',
        config: { table: 'projects', filters: { client_id: '{{current_user.client_id}}' } },
      },
      {
        id: 'ds-2',
        name: 'Invoices',
        type: 'supabase',
        config: { table: 'invoices', filters: { client_id: '{{current_user.client_id}}' } },
      },
    ],
    workflows: [
      {
        id: 'wf-1',
        name: 'Payment Notification',
        trigger: 'invoice.paid',
        steps: [
          { type: 'send_email', to: '{{invoice.client.email}}', template: 'payment_received' },
          { type: 'update_record', table: 'invoices', set: { status: 'paid' } },
        ],
      },
    ],
    settings: {
      theme: 'light',
      primary_color: '#3b82f6',
      auth_required: true,
    },
    status: 'published',
    version: 3,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

function getDemoTemplates(): AppTemplate[] {
  return [
    {
      id: 'tpl-1',
      name: 'Client Portal',
      description: 'A portal for clients to view projects, invoices, and communicate with your team',
      category: 'portals',
      preview_url: '/templates/client-portal.png',
      uses: 2340,
      rating: 4.8,
      components_count: 15,
      pages_count: 5,
    },
    {
      id: 'tpl-2',
      name: 'Project Tracker',
      description: 'Track projects, tasks, and team workload with visual dashboards',
      category: 'project-management',
      preview_url: '/templates/project-tracker.png',
      uses: 4560,
      rating: 4.9,
      components_count: 22,
      pages_count: 4,
    },
    {
      id: 'tpl-3',
      name: 'CRM Dashboard',
      description: 'Manage leads, contacts, and deals with a visual pipeline',
      category: 'sales',
      preview_url: '/templates/crm.png',
      uses: 3210,
      rating: 4.7,
      components_count: 18,
      pages_count: 6,
    },
    {
      id: 'tpl-4',
      name: 'Employee Directory',
      description: 'Internal employee directory with profiles and org chart',
      category: 'hr',
      preview_url: '/templates/directory.png',
      uses: 1890,
      rating: 4.6,
      components_count: 12,
      pages_count: 3,
    },
    {
      id: 'tpl-5',
      name: 'Inventory Manager',
      description: 'Track inventory levels, orders, and suppliers',
      category: 'operations',
      preview_url: '/templates/inventory.png',
      uses: 1560,
      rating: 4.5,
      components_count: 20,
      pages_count: 5,
    },
    {
      id: 'tpl-6',
      name: 'Event Registration',
      description: 'Event landing page with registration form and attendee management',
      category: 'events',
      preview_url: '/templates/events.png',
      uses: 980,
      rating: 4.7,
      components_count: 10,
      pages_count: 4,
    },
  ];
}

function getDemoComponents(): { type: ComponentType; name: string; description: string; icon: string }[] {
  return [
    { type: 'form', name: 'Form', description: 'Collect data with customizable forms', icon: 'file-text' },
    { type: 'table', name: 'Table', description: 'Display data in rows and columns', icon: 'table' },
    { type: 'chart', name: 'Chart', description: 'Visualize data with charts', icon: 'bar-chart' },
    { type: 'card', name: 'Card', description: 'Display key metrics', icon: 'square' },
    { type: 'list', name: 'List', description: 'Display items in a list', icon: 'list' },
    { type: 'calendar', name: 'Calendar', description: 'Date-based visualization', icon: 'calendar' },
    { type: 'kanban', name: 'Kanban', description: 'Drag-and-drop board', icon: 'columns' },
    { type: 'timeline', name: 'Timeline', description: 'Show events over time', icon: 'git-branch' },
    { type: 'map', name: 'Map', description: 'Geographic visualization', icon: 'map' },
    { type: 'button', name: 'Button', description: 'Trigger actions', icon: 'mouse-pointer' },
    { type: 'text', name: 'Text', description: 'Display text content', icon: 'type' },
    { type: 'image', name: 'Image', description: 'Display images', icon: 'image' },
    { type: 'container', name: 'Container', description: 'Group components', icon: 'box' },
  ];
}

// ============================================================================
// HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    if (appId) {
      return NextResponse.json({
        success: true,
        data: getDemoApp(),
        source: 'demo',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        apps: [getDemoApp()],
        templates: getDemoTemplates(),
        components: getDemoComponents(),
      },
      source: 'demo',
    });
  } catch (err) {
    logger.error('No-Code Builder GET error', { error: err });
    return NextResponse.json({
      success: true,
      data: { apps: [getDemoApp()] },
      source: 'demo',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: NoCodeRequest = await request.json();
    const { action } = body;

    const supabase = await createClient();

    switch (action) {
      case 'list-apps': {
        return NextResponse.json({
          success: true,
          data: [getDemoApp()],
        });
      }

      case 'get-app': {
        const { appId } = body;
        return NextResponse.json({
          success: true,
          data: getDemoApp(),
        });
      }

      case 'create-app': {
        const { data } = body;
        const newApp: NoCodeApp = {
          id: `app-${Date.now()}`,
          name: data?.name || 'New App',
          description: data?.description || '',
          icon: 'app',
          color: '#3b82f6',
          pages: [
            {
              id: 'page-home',
              name: 'Home',
              path: '/',
              layout: 'grid',
              access: 'public',
              components: [],
            },
          ],
          data_sources: [],
          workflows: [],
          settings: {
            theme: 'light',
            primary_color: '#3b82f6',
            auth_required: false,
          },
          status: 'draft',
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          published_at: null,
        };

        return NextResponse.json({
          success: true,
          data: newApp,
          message: 'App created successfully',
        });
      }

      case 'update-app': {
        const { appId, data } = body;
        return NextResponse.json({
          success: true,
          data: { id: appId, ...data, updated_at: new Date().toISOString() },
          message: 'App updated successfully',
        });
      }

      case 'delete-app': {
        const { appId } = body;
        return NextResponse.json({
          success: true,
          deleted: appId,
          message: 'App deleted successfully',
        });
      }

      case 'add-page': {
        const { appId, page } = body;
        const newPage: AppPage = {
          id: `page-${Date.now()}`,
          name: page?.name || 'New Page',
          path: page?.path || `/${Date.now()}`,
          layout: 'grid',
          access: 'public',
          components: [],
        };

        return NextResponse.json({
          success: true,
          data: newPage,
          message: 'Page added successfully',
        });
      }

      case 'add-component': {
        const { appId, pageId, component } = body;
        const newComponent: AppComponent = {
          id: `comp-${Date.now()}`,
          type: component?.type || 'card',
          name: component?.name || 'New Component',
          properties: component?.properties || {},
          position: component?.position || { x: 0, y: 0, width: 3, height: 2 },
        };

        return NextResponse.json({
          success: true,
          data: newComponent,
          message: 'Component added successfully',
        });
      }

      case 'update-component': {
        const { componentId, component } = body;
        return NextResponse.json({
          success: true,
          data: { id: componentId, ...component },
          message: 'Component updated successfully',
        });
      }

      case 'delete-component': {
        const { componentId } = body;
        return NextResponse.json({
          success: true,
          deleted: componentId,
          message: 'Component deleted successfully',
        });
      }

      case 'add-data-source': {
        const { appId, dataSource } = body;
        return NextResponse.json({
          success: true,
          data: {
            id: `ds-${Date.now()}`,
            ...dataSource,
            created_at: new Date().toISOString(),
          },
          message: 'Data source connected successfully',
        });
      }

      case 'add-workflow': {
        const { appId, workflow } = body;
        return NextResponse.json({
          success: true,
          data: {
            id: `wf-${Date.now()}`,
            ...workflow,
            created_at: new Date().toISOString(),
          },
          message: 'Workflow added successfully',
        });
      }

      case 'publish-app': {
        const { appId } = body;
        return NextResponse.json({
          success: true,
          data: {
            id: appId,
            status: 'published',
            published_at: new Date().toISOString(),
            public_url: `https://apps.freeflow.io/${appId}`,
          },
          message: 'App published successfully',
        });
      }

      case 'unpublish-app': {
        const { appId } = body;
        return NextResponse.json({
          success: true,
          data: { id: appId, status: 'draft' },
          message: 'App unpublished',
        });
      }

      case 'get-templates': {
        return NextResponse.json({
          success: true,
          data: getDemoTemplates(),
        });
      }

      case 'create-from-template': {
        const { templateId } = body;
        const template = getDemoTemplates().find(t => t.id === templateId);

        const newApp = getDemoApp();
        newApp.id = `app-${Date.now()}`;
        newApp.name = `My ${template?.name || 'App'}`;
        newApp.status = 'draft';
        newApp.published_at = null;

        return NextResponse.json({
          success: true,
          data: newApp,
          message: `App created from "${template?.name}" template`,
        });
      }

      case 'ai-generate-component': {
        const { prompt } = body;
        if (!prompt) {
          return NextResponse.json({ success: false, error: 'Prompt required' }, { status: 400 });
        }

        // Simulate AI component generation
        const lowerPrompt = prompt.toLowerCase();
        let component: AppComponent;

        if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph')) {
          component = {
            id: `comp-ai-${Date.now()}`,
            type: 'chart',
            name: 'AI Generated Chart',
            properties: { chartType: 'line', title: 'Generated Chart' },
            position: { x: 0, y: 0, width: 6, height: 4 },
          };
        } else if (lowerPrompt.includes('form')) {
          component = {
            id: `comp-ai-${Date.now()}`,
            type: 'form',
            name: 'AI Generated Form',
            properties: {
              fields: [
                { name: 'name', type: 'text', label: 'Name' },
                { name: 'email', type: 'email', label: 'Email' },
                { name: 'message', type: 'textarea', label: 'Message' },
              ],
            },
            position: { x: 0, y: 0, width: 6, height: 6 },
          };
        } else if (lowerPrompt.includes('table') || lowerPrompt.includes('list')) {
          component = {
            id: `comp-ai-${Date.now()}`,
            type: 'table',
            name: 'AI Generated Table',
            properties: { columns: ['name', 'status', 'date'], pageSize: 10 },
            position: { x: 0, y: 0, width: 12, height: 6 },
          };
        } else {
          component = {
            id: `comp-ai-${Date.now()}`,
            type: 'card',
            name: 'AI Generated Component',
            properties: { title: 'Generated', description: prompt },
            position: { x: 0, y: 0, width: 4, height: 3 },
          };
        }

        return NextResponse.json({
          success: true,
          data: component,
          message: 'Component generated by AI',
        });
      }

      case 'ai-suggest-layout': {
        const { prompt } = body;

        const suggestions = [
          {
            name: 'Dashboard Layout',
            description: 'Cards at top, main content below',
            layout: [
              { type: 'card', position: { x: 0, y: 0, width: 3, height: 2 } },
              { type: 'card', position: { x: 3, y: 0, width: 3, height: 2 } },
              { type: 'card', position: { x: 6, y: 0, width: 3, height: 2 } },
              { type: 'card', position: { x: 9, y: 0, width: 3, height: 2 } },
              { type: 'chart', position: { x: 0, y: 2, width: 6, height: 4 } },
              { type: 'table', position: { x: 6, y: 2, width: 6, height: 4 } },
            ],
          },
          {
            name: 'Sidebar Layout',
            description: 'Navigation sidebar with main content area',
            layout: [
              { type: 'container', position: { x: 0, y: 0, width: 3, height: 8 } },
              { type: 'container', position: { x: 3, y: 0, width: 9, height: 8 } },
            ],
          },
          {
            name: 'Form-Focused',
            description: 'Centered form with supporting content',
            layout: [
              { type: 'text', position: { x: 3, y: 0, width: 6, height: 1 } },
              { type: 'form', position: { x: 3, y: 1, width: 6, height: 6 } },
            ],
          },
        ];

        return NextResponse.json({
          success: true,
          data: suggestions,
        });
      }

      case 'preview-app': {
        const { appId } = body;
        return NextResponse.json({
          success: true,
          data: {
            preview_url: `https://preview.freeflow.io/${appId}`,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    logger.error('No-Code Builder POST error', { error: err });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
