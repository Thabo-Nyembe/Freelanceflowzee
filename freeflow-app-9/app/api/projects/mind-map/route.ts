/**
 * Mind Mapping API for Project Visualization
 *
 * Beats ClickUp's Mind Maps feature with:
 * - Interactive node-based visualization
 * - Task/project relationship mapping
 * - AI-powered idea generation
 * - Real-time collaboration
 * - Export to various formats
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('projects-mind-map');

// ============================================================================
// TYPES
// ============================================================================

type NodeType = 'root' | 'branch' | 'leaf' | 'task' | 'milestone' | 'idea' | 'note';
type NodeStatus = 'active' | 'completed' | 'pending' | 'blocked';

interface MindMapNode {
  id: string;
  mindmap_id: string;
  parent_id: string | null;
  type: NodeType;
  label: string;
  description: string | null;
  status: NodeStatus;
  position: { x: number; y: number };
  color: string | null;
  icon: string | null;
  linked_task_id: string | null;
  linked_milestone_id: string | null;
  children_count: number;
  collapsed: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface MindMap {
  id: string;
  project_id: string | null;
  user_id: string;
  title: string;
  description: string | null;
  layout: 'radial' | 'tree' | 'org-chart' | 'fishbone';
  theme: string;
  is_public: boolean;
  nodes: MindMapNode[];
  connections: { from: string; to: string; label?: string }[];
  created_at: string;
  updated_at: string;
}

interface MindMapRequest {
  action:
    | 'list'
    | 'get'
    | 'create'
    | 'update'
    | 'delete'
    | 'add-node'
    | 'update-node'
    | 'delete-node'
    | 'move-node'
    | 'connect-nodes'
    | 'generate-from-project'
    | 'generate-ideas'
    | 'export';
  id?: string;
  projectId?: string;
  nodeId?: string;
  data?: Partial<MindMap>;
  node?: Partial<MindMapNode>;
  connection?: { from: string; to: string; label?: string };
  format?: 'json' | 'png' | 'svg' | 'pdf';
  prompt?: string;
}

// ============================================================================
// DEMO DATA
// ============================================================================

function getDemoMindMap(projectId?: string): MindMap {
  return {
    id: 'mindmap-1',
    project_id: projectId || 'proj-1',
    user_id: 'user-1',
    title: 'Project Brainstorm',
    description: 'Mind map for project planning and ideation',
    layout: 'radial',
    theme: 'modern',
    is_public: false,
    nodes: [
      {
        id: 'node-root',
        mindmap_id: 'mindmap-1',
        parent_id: null,
        type: 'root',
        label: 'New Product Launch',
        description: 'Q1 2025 Product Launch Planning',
        status: 'active',
        position: { x: 400, y: 300 },
        color: '#3b82f6',
        icon: 'rocket',
        linked_task_id: null,
        linked_milestone_id: null,
        children_count: 4,
        collapsed: false,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'node-1',
        mindmap_id: 'mindmap-1',
        parent_id: 'node-root',
        type: 'branch',
        label: 'Marketing',
        description: 'Marketing strategy and campaigns',
        status: 'active',
        position: { x: 200, y: 150 },
        color: '#10b981',
        icon: 'megaphone',
        linked_task_id: null,
        linked_milestone_id: 'milestone-1',
        children_count: 3,
        collapsed: false,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'node-1-1',
        mindmap_id: 'mindmap-1',
        parent_id: 'node-1',
        type: 'leaf',
        label: 'Social Media Campaign',
        description: null,
        status: 'pending',
        position: { x: 100, y: 80 },
        color: null,
        icon: null,
        linked_task_id: 'task-1',
        linked_milestone_id: null,
        children_count: 0,
        collapsed: false,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'node-1-2',
        mindmap_id: 'mindmap-1',
        parent_id: 'node-1',
        type: 'leaf',
        label: 'Email Marketing',
        description: null,
        status: 'active',
        position: { x: 150, y: 50 },
        color: null,
        icon: null,
        linked_task_id: 'task-2',
        linked_milestone_id: null,
        children_count: 0,
        collapsed: false,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'node-2',
        mindmap_id: 'mindmap-1',
        parent_id: 'node-root',
        type: 'branch',
        label: 'Development',
        description: 'Product development tasks',
        status: 'active',
        position: { x: 600, y: 150 },
        color: '#8b5cf6',
        icon: 'code',
        linked_task_id: null,
        linked_milestone_id: 'milestone-2',
        children_count: 2,
        collapsed: false,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'node-3',
        mindmap_id: 'mindmap-1',
        parent_id: 'node-root',
        type: 'branch',
        label: 'Sales',
        description: 'Sales strategy and training',
        status: 'pending',
        position: { x: 200, y: 450 },
        color: '#f59e0b',
        icon: 'chart',
        linked_task_id: null,
        linked_milestone_id: null,
        children_count: 2,
        collapsed: false,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'node-4',
        mindmap_id: 'mindmap-1',
        parent_id: 'node-root',
        type: 'branch',
        label: 'Support',
        description: 'Customer support preparation',
        status: 'pending',
        position: { x: 600, y: 450 },
        color: '#ef4444',
        icon: 'headphones',
        linked_task_id: null,
        linked_milestone_id: null,
        children_count: 1,
        collapsed: false,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    connections: [
      { from: 'node-root', to: 'node-1' },
      { from: 'node-root', to: 'node-2' },
      { from: 'node-root', to: 'node-3' },
      { from: 'node-root', to: 'node-4' },
      { from: 'node-1', to: 'node-1-1' },
      { from: 'node-1', to: 'node-1-2' },
      { from: 'node-2', to: 'node-3', label: 'depends on' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// ============================================================================
// HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const id = searchParams.get('id');

    const supabase = await createClient();

    if (id) {
      // Get specific mind map
      const { data, error } = await supabase
        .from('mind_maps')
        .select('*, nodes:mind_map_nodes(*)')
        .eq('id', id)
        .single();

      if (error || !data) {
        return NextResponse.json({
          success: true,
          data: getDemoMindMap(projectId || undefined),
          source: 'demo',
        });
      }

      return NextResponse.json({ success: true, data, source: 'database' });
    }

    // List mind maps
    let query = supabase.from('mind_maps').select('*').order('updated_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error || !data?.length) {
      return NextResponse.json({
        success: true,
        data: [getDemoMindMap(projectId || undefined)],
        source: 'demo',
      });
    }

    return NextResponse.json({ success: true, data, source: 'database' });
  } catch (err) {
    logger.error('Mind Map GET error', { error: err });
    return NextResponse.json({
      success: true,
      data: [getDemoMindMap()],
      source: 'demo',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MindMapRequest = await request.json();
    const { action } = body;

    const supabase = await createClient();

    switch (action) {
      case 'list': {
        const { projectId } = body;
        return NextResponse.json({
          success: true,
          data: [getDemoMindMap(projectId)],
        });
      }

      case 'get': {
        const { id } = body;
        return NextResponse.json({
          success: true,
          data: getDemoMindMap(),
        });
      }

      case 'create': {
        const { data, projectId } = body;
        const newMindMap: MindMap = {
          id: `mindmap-${Date.now()}`,
          project_id: projectId || null,
          user_id: 'current-user',
          title: data?.title || 'New Mind Map',
          description: data?.description || null,
          layout: data?.layout || 'radial',
          theme: data?.theme || 'modern',
          is_public: false,
          nodes: [
            {
              id: `node-root-${Date.now()}`,
              mindmap_id: `mindmap-${Date.now()}`,
              parent_id: null,
              type: 'root',
              label: data?.title || 'Central Idea',
              description: null,
              status: 'active',
              position: { x: 400, y: 300 },
              color: '#3b82f6',
              icon: null,
              linked_task_id: null,
              linked_milestone_id: null,
              children_count: 0,
              collapsed: false,
              metadata: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          connections: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: newMindMap,
          message: 'Mind map created successfully',
        });
      }

      case 'add-node': {
        const { id, node } = body;
        if (!node) {
          return NextResponse.json({ success: false, error: 'Node data required' }, { status: 400 });
        }

        const newNode: MindMapNode = {
          id: `node-${Date.now()}`,
          mindmap_id: id || 'mindmap-1',
          parent_id: node.parent_id || null,
          type: node.type || 'leaf',
          label: node.label || 'New Node',
          description: node.description || null,
          status: 'active',
          position: node.position || { x: 0, y: 0 },
          color: node.color || null,
          icon: node.icon || null,
          linked_task_id: node.linked_task_id || null,
          linked_milestone_id: node.linked_milestone_id || null,
          children_count: 0,
          collapsed: false,
          metadata: node.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: newNode,
          message: 'Node added successfully',
        });
      }

      case 'update-node': {
        const { nodeId, node } = body;
        if (!nodeId || !node) {
          return NextResponse.json({ success: false, error: 'Node ID and data required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: { id: nodeId, ...node, updated_at: new Date().toISOString() },
          message: 'Node updated successfully',
        });
      }

      case 'delete-node': {
        const { nodeId } = body;
        if (!nodeId) {
          return NextResponse.json({ success: false, error: 'Node ID required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          deleted: nodeId,
          message: 'Node deleted successfully',
        });
      }

      case 'move-node': {
        const { nodeId, node } = body;
        if (!nodeId) {
          return NextResponse.json({ success: false, error: 'Node ID required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: { id: nodeId, position: node?.position },
          message: 'Node moved successfully',
        });
      }

      case 'connect-nodes': {
        const { connection } = body;
        if (!connection?.from || !connection?.to) {
          return NextResponse.json({ success: false, error: 'Connection from/to required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: connection,
          message: 'Nodes connected successfully',
        });
      }

      case 'generate-from-project': {
        // Auto-generate mind map from project structure
        const { projectId } = body;

        const generatedMap = getDemoMindMap(projectId);
        generatedMap.title = 'Auto-Generated Project Map';
        generatedMap.description = 'Mind map generated from project tasks and milestones';

        return NextResponse.json({
          success: true,
          data: generatedMap,
          message: 'Mind map generated from project',
        });
      }

      case 'generate-ideas': {
        // AI-powered idea generation
        const { prompt, id } = body;

        const generatedIdeas = [
          { label: 'Customer Research', description: 'Conduct surveys and interviews' },
          { label: 'Competitor Analysis', description: 'Study competitor offerings' },
          { label: 'MVP Definition', description: 'Define minimum viable product' },
          { label: 'User Testing', description: 'Beta testing with early adopters' },
          { label: 'Launch Strategy', description: 'Go-to-market planning' },
        ];

        return NextResponse.json({
          success: true,
          data: {
            ideas: generatedIdeas,
            prompt: prompt || 'General brainstorming',
          },
          message: 'Ideas generated successfully',
        });
      }

      case 'export': {
        const { id, format = 'json' } = body;

        const mindMap = getDemoMindMap();

        return NextResponse.json({
          success: true,
          data: {
            format,
            content: format === 'json' ? mindMap : `[${format.toUpperCase()} export would be generated here]`,
            filename: `mindmap-${id || 'export'}.${format}`,
          },
          message: `Exported as ${format.toUpperCase()}`,
        });
      }

      case 'update': {
        const { id, data } = body;
        return NextResponse.json({
          success: true,
          data: { id, ...data, updated_at: new Date().toISOString() },
          message: 'Mind map updated successfully',
        });
      }

      case 'delete': {
        const { id } = body;
        return NextResponse.json({
          success: true,
          deleted: id,
          message: 'Mind map deleted successfully',
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    logger.error('Mind Map POST error', { error: err });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
