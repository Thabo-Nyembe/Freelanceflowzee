'use client'

/**
 * Visual Workflow Builder
 *
 * A drag-and-drop workflow builder using Reaflow for visual node-based editing.
 * Supports triggers, actions, conditions, and branching.
 */

import React, { useState, useCallback, useRef } from 'react'
import { Canvas, Node, Edge, Port, MarkerArrow, Label, CanvasRef, NodeData, EdgeData, PortData, addNodeAndEdge, removeNode, upsertNode, hasLink } from 'reaflow'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label as FormLabel } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Play,
  Save,
  Plus,
  Trash2,
  Settings,
  Zap,
  Clock,
  Webhook,
  Mail,
  Bell,
  GitBranch,
  Timer,
  Database,
  Globe,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Node Types
export type WorkflowNodeType =
  | 'trigger-manual'
  | 'trigger-schedule'
  | 'trigger-webhook'
  | 'trigger-event'
  | 'action-email'
  | 'action-notification'
  | 'action-task'
  | 'action-record'
  | 'action-api'
  | 'action-delay'
  | 'condition'
  | 'end'

// Node Configuration
interface WorkflowNodeConfig {
  type: WorkflowNodeType
  label: string
  icon: React.ReactNode
  color: string
  category: 'trigger' | 'action' | 'logic'
  description: string
  ports: { input: boolean; output: boolean; outputCount?: number }
  configFields: ConfigField[]
}

interface ConfigField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'email' | 'cron' | 'json'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  defaultValue?: any
}

// Node Configurations
const nodeConfigs: Record<WorkflowNodeType, WorkflowNodeConfig> = {
  'trigger-manual': {
    type: 'trigger-manual',
    label: 'Manual Trigger',
    icon: <Play className="h-4 w-4" />,
    color: '#10B981',
    category: 'trigger',
    description: 'Start workflow manually',
    ports: { input: false, output: true },
    configFields: []
  },
  'trigger-schedule': {
    type: 'trigger-schedule',
    label: 'Schedule',
    icon: <Clock className="h-4 w-4" />,
    color: '#3B82F6',
    category: 'trigger',
    description: 'Run on a schedule',
    ports: { input: false, output: true },
    configFields: [
      { name: 'frequency', label: 'Frequency', type: 'select', required: true, options: [
        { value: 'hourly', label: 'Every Hour' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'cron', label: 'Custom (Cron)' }
      ]},
      { name: 'time', label: 'Time', type: 'text', placeholder: '09:00' },
      { name: 'cron', label: 'Cron Expression', type: 'cron', placeholder: '0 9 * * *' },
      { name: 'timezone', label: 'Timezone', type: 'select', options: [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'Eastern Time' },
        { value: 'America/Los_Angeles', label: 'Pacific Time' },
        { value: 'Europe/London', label: 'London' }
      ]}
    ]
  },
  'trigger-webhook': {
    type: 'trigger-webhook',
    label: 'Webhook',
    icon: <Webhook className="h-4 w-4" />,
    color: '#8B5CF6',
    category: 'trigger',
    description: 'Triggered by HTTP request',
    ports: { input: false, output: true },
    configFields: [
      { name: 'method', label: 'HTTP Method', type: 'select', options: [
        { value: 'POST', label: 'POST' },
        { value: 'GET', label: 'GET' },
        { value: 'PUT', label: 'PUT' }
      ]},
      { name: 'path', label: 'Webhook Path', type: 'text', placeholder: '/my-webhook' },
      { name: 'secret', label: 'Secret (Optional)', type: 'text' }
    ]
  },
  'trigger-event': {
    type: 'trigger-event',
    label: 'Event Trigger',
    icon: <Zap className="h-4 w-4" />,
    color: '#F59E0B',
    category: 'trigger',
    description: 'React to system events',
    ports: { input: false, output: true },
    configFields: [
      { name: 'eventType', label: 'Event Type', type: 'select', options: [
        { value: 'client.created', label: 'Client Created' },
        { value: 'project.completed', label: 'Project Completed' },
        { value: 'invoice.paid', label: 'Invoice Paid' },
        { value: 'task.overdue', label: 'Task Overdue' },
        { value: 'file.uploaded', label: 'File Uploaded' }
      ]},
      { name: 'filters', label: 'Filters (JSON)', type: 'json', placeholder: '{"status": "active"}' }
    ]
  },
  'action-email': {
    type: 'action-email',
    label: 'Send Email',
    icon: <Mail className="h-4 w-4" />,
    color: '#EC4899',
    category: 'action',
    description: 'Send an email',
    ports: { input: true, output: true },
    configFields: [
      { name: 'to', label: 'To', type: 'text', required: true, placeholder: 'recipient@example.com' },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'body', label: 'Email Body', type: 'textarea', required: true },
      { name: 'template', label: 'Template', type: 'select', options: [
        { value: 'default', label: 'Default' },
        { value: 'welcome', label: 'Welcome Email' },
        { value: 'reminder', label: 'Reminder' },
        { value: 'invoice', label: 'Invoice' }
      ]}
    ]
  },
  'action-notification': {
    type: 'action-notification',
    label: 'Send Notification',
    icon: <Bell className="h-4 w-4" />,
    color: '#06B6D4',
    category: 'action',
    description: 'Send in-app notification',
    ports: { input: true, output: true },
    configFields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'message', label: 'Message', type: 'textarea', required: true },
      { name: 'priority', label: 'Priority', type: 'select', options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
      ]},
      { name: 'channels', label: 'Channels', type: 'select', options: [
        { value: 'app', label: 'In-App' },
        { value: 'email', label: 'Email' },
        { value: 'sms', label: 'SMS' }
      ]}
    ]
  },
  'action-task': {
    type: 'action-task',
    label: 'Create Task',
    icon: <FileText className="h-4 w-4" />,
    color: '#84CC16',
    category: 'action',
    description: 'Create a new task',
    ports: { input: true, output: true },
    configFields: [
      { name: 'title', label: 'Task Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'assignee', label: 'Assignee', type: 'text', placeholder: '{{trigger.userId}}' },
      { name: 'priority', label: 'Priority', type: 'select', options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
      ]},
      { name: 'dueDate', label: 'Due Date', type: 'text', placeholder: '+7 days' }
    ]
  },
  'action-record': {
    type: 'action-record',
    label: 'Update Record',
    icon: <Database className="h-4 w-4" />,
    color: '#F97316',
    category: 'action',
    description: 'Update database record',
    ports: { input: true, output: true },
    configFields: [
      { name: 'entity', label: 'Entity', type: 'select', required: true, options: [
        { value: 'clients', label: 'Clients' },
        { value: 'projects', label: 'Projects' },
        { value: 'invoices', label: 'Invoices' },
        { value: 'tasks', label: 'Tasks' }
      ]},
      { name: 'recordId', label: 'Record ID', type: 'text', required: true, placeholder: '{{trigger.recordId}}' },
      { name: 'fields', label: 'Fields to Update (JSON)', type: 'json', required: true }
    ]
  },
  'action-api': {
    type: 'action-api',
    label: 'API Call',
    icon: <Globe className="h-4 w-4" />,
    color: '#6366F1',
    category: 'action',
    description: 'Make external API call',
    ports: { input: true, output: true },
    configFields: [
      { name: 'url', label: 'URL', type: 'text', required: true, placeholder: 'https://api.example.com/endpoint' },
      { name: 'method', label: 'Method', type: 'select', required: true, options: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'DELETE', label: 'DELETE' },
        { value: 'PATCH', label: 'PATCH' }
      ]},
      { name: 'headers', label: 'Headers (JSON)', type: 'json' },
      { name: 'body', label: 'Body (JSON)', type: 'json' }
    ]
  },
  'action-delay': {
    type: 'action-delay',
    label: 'Delay',
    icon: <Timer className="h-4 w-4" />,
    color: '#78716C',
    category: 'action',
    description: 'Wait before next action',
    ports: { input: true, output: true },
    configFields: [
      { name: 'duration', label: 'Duration', type: 'number', required: true, defaultValue: 5 },
      { name: 'unit', label: 'Unit', type: 'select', required: true, options: [
        { value: 'seconds', label: 'Seconds' },
        { value: 'minutes', label: 'Minutes' },
        { value: 'hours', label: 'Hours' },
        { value: 'days', label: 'Days' }
      ]}
    ]
  },
  'condition': {
    type: 'condition',
    label: 'Condition',
    icon: <GitBranch className="h-4 w-4" />,
    color: '#EAB308',
    category: 'logic',
    description: 'Branch based on conditions',
    ports: { input: true, output: true, outputCount: 2 },
    configFields: [
      { name: 'field', label: 'Field', type: 'text', required: true, placeholder: '{{trigger.status}}' },
      { name: 'operator', label: 'Operator', type: 'select', required: true, options: [
        { value: 'equals', label: 'Equals' },
        { value: 'not-equals', label: 'Not Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'greater', label: 'Greater Than' },
        { value: 'less', label: 'Less Than' },
        { value: 'exists', label: 'Exists' }
      ]},
      { name: 'value', label: 'Value', type: 'text', placeholder: 'Compare value' }
    ]
  },
  'end': {
    type: 'end',
    label: 'End',
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: '#22C55E',
    category: 'logic',
    description: 'End of workflow',
    ports: { input: true, output: false },
    configFields: []
  }
}

// Extended node data
interface WorkflowNodeData extends NodeData {
  nodeType: WorkflowNodeType
  config: Record<string, any>
  ports?: PortData[]
}

interface WorkflowEdgeData extends EdgeData {
  label?: string
}

interface VisualWorkflowBuilderProps {
  workflowId?: string
  initialNodes?: WorkflowNodeData[]
  initialEdges?: WorkflowEdgeData[]
  onSave?: (nodes: WorkflowNodeData[], edges: WorkflowEdgeData[]) => void
  onTest?: (nodes: WorkflowNodeData[], edges: WorkflowEdgeData[]) => void
  readOnly?: boolean
}

export function VisualWorkflowBuilder({
  workflowId,
  initialNodes = [],
  initialEdges = [],
  onSave,
  onTest,
  readOnly = false
}: VisualWorkflowBuilderProps) {
  const canvasRef = useRef<CanvasRef | null>(null)
  const [nodes, setNodes] = useState<WorkflowNodeData[]>(initialNodes.length > 0 ? initialNodes : [
    {
      id: 'trigger-1',
      text: 'Manual Trigger',
      nodeType: 'trigger-manual',
      config: {},
      width: 200,
      height: 80,
      ports: [
        { id: 'trigger-1-out', width: 12, height: 12, side: 'SOUTH' as const }
      ]
    }
  ])
  const [edges, setEdges] = useState<WorkflowEdgeData[]>(initialEdges)
  const [selectedNode, setSelectedNode] = useState<WorkflowNodeData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [history, setHistory] = useState<{ nodes: WorkflowNodeData[]; edges: WorkflowEdgeData[] }[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Generate unique ID
  const generateId = useCallback(() => `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, [])

  // Add to history
  const addToHistory = useCallback((newNodes: WorkflowNodeData[], newEdges: WorkflowEdgeData[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ nodes: newNodes, edges: newEdges })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setNodes(prevState.nodes)
      setEdges(prevState.edges)
      setHistoryIndex(historyIndex - 1)
    }
  }, [history, historyIndex])

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
      setHistoryIndex(historyIndex + 1)
    }
  }, [history, historyIndex])

  // Add node
  const addNode = useCallback((nodeType: WorkflowNodeType) => {
    const config = nodeConfigs[nodeType]
    const id = generateId()

    const ports: PortData[] = []
    if (config.ports.input) {
      ports.push({ id: `${id}-in`, width: 12, height: 12, side: 'NORTH' as const })
    }
    if (config.ports.output) {
      if (config.ports.outputCount && config.ports.outputCount > 1) {
        ports.push({ id: `${id}-out-true`, width: 12, height: 12, side: 'SOUTH' as const })
        ports.push({ id: `${id}-out-false`, width: 12, height: 12, side: 'EAST' as const })
      } else {
        ports.push({ id: `${id}-out`, width: 12, height: 12, side: 'SOUTH' as const })
      }
    }

    const newNode: WorkflowNodeData = {
      id,
      text: config.label,
      nodeType,
      config: {},
      width: nodeType === 'condition' ? 180 : 200,
      height: 80,
      ports
    }

    const newNodes = [...nodes, newNode]
    setNodes(newNodes)
    addToHistory(newNodes, edges)
  }, [nodes, edges, generateId, addToHistory])

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    const result = removeNode(nodes, edges, nodeId)
    setNodes(result.nodes as WorkflowNodeData[])
    setEdges(result.edges as WorkflowEdgeData[])
    addToHistory(result.nodes as WorkflowNodeData[], result.edges as WorkflowEdgeData[])
    setSelectedNode(null)
  }, [nodes, edges, addToHistory])

  // Update node config
  const updateNodeConfig = useCallback((nodeId: string, configUpdates: Record<string, any>) => {
    const newNodes = nodes.map(node =>
      node.id === nodeId
        ? { ...node, config: { ...node.config, ...configUpdates } }
        : node
    )
    setNodes(newNodes)
    addToHistory(newNodes, edges)
  }, [nodes, edges, addToHistory])

  // Handle node link
  const handleNodeLink = useCallback((event: any, fromNode: NodeData, toNode: NodeData, fromPort?: PortData, toPort?: PortData) => {
    if (hasLink(edges, fromNode, toNode)) return

    const newEdge: WorkflowEdgeData = {
      id: `${fromNode.id}-${toNode.id}`,
      from: fromNode.id,
      to: toNode.id,
      fromPort: fromPort?.id,
      toPort: toPort?.id
    }

    const newEdges = [...edges, newEdge]
    setEdges(newEdges)
    addToHistory(nodes, newEdges)
  }, [nodes, edges, addToHistory])

  // Save workflow
  const handleSave = useCallback(async () => {
    if (!onSave) return
    setIsSaving(true)
    try {
      await onSave(nodes, edges)
    } finally {
      setIsSaving(false)
    }
  }, [nodes, edges, onSave])

  // Test workflow
  const handleTest = useCallback(async () => {
    if (!onTest) return
    setIsTesting(true)
    try {
      await onTest(nodes, edges)
    } finally {
      setIsTesting(false)
    }
  }, [nodes, edges, onTest])

  // Render node content
  const renderNodeContent = (nodeData: WorkflowNodeData) => {
    const config = nodeConfigs[nodeData.nodeType]
    return (
      <div
        className="flex flex-col items-center justify-center h-full px-3 py-2 cursor-pointer select-none"
        onClick={() => !readOnly && setSelectedNode(nodeData)}
      >
        <div
          className="flex items-center gap-2 text-white"
          style={{ color: config.color }}
        >
          {config.icon}
          <span className="font-medium text-sm">{nodeData.text}</span>
        </div>
        {nodeData.config && Object.keys(nodeData.config).length > 0 && (
          <div className="text-xs text-gray-500 mt-1 truncate max-w-[180px]">
            {Object.values(nodeData.config)[0] as string}
          </div>
        )}
      </div>
    )
  }

  // Node palette by category
  const nodesByCategory = {
    trigger: Object.values(nodeConfigs).filter(n => n.category === 'trigger'),
    action: Object.values(nodeConfigs).filter(n => n.category === 'action'),
    logic: Object.values(nodeConfigs).filter(n => n.category === 'logic')
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Node Palette */}
      {!readOnly && (
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 overflow-y-auto">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">Add Nodes</h3>

          <Tabs defaultValue="trigger" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="trigger" className="text-xs">Triggers</TabsTrigger>
              <TabsTrigger value="action" className="text-xs">Actions</TabsTrigger>
              <TabsTrigger value="logic" className="text-xs">Logic</TabsTrigger>
            </TabsList>

            {Object.entries(nodesByCategory).map(([category, categoryNodes]) => (
              <TabsContent key={category} value={category} className="space-y-2 mt-0">
                {categoryNodes.map(config => (
                  <button
                    key={config.type}
                    onClick={() => addNode(config.type)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: config.color }}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{config.label}</div>
                      <div className="text-xs text-gray-500">{config.description}</div>
                    </div>
                  </button>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative">
        {/* Toolbar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0 || readOnly}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1 || readOnly}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => canvasRef.current?.fitCanvas?.()}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              {nodes.length} nodes
            </Badge>
            <Badge variant="outline" className="gap-1">
              {edges.length} connections
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={isTesting || readOnly}
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Test
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || readOnly}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>

        {/* Reaflow Canvas */}
        <div className="h-full pt-16">
          {typeof window !== 'undefined' && (
            <Canvas
              ref={canvasRef}
              nodes={nodes}
              edges={edges}
              zoom={zoom}
              onZoomChange={setZoom}
              direction="DOWN"
              layoutOptions={{
                'elk.algorithm': 'layered',
                'elk.direction': 'DOWN',
                'elk.spacing.nodeNode': '80',
                'elk.layered.spacing.nodeNodeBetweenLayers': '100'
              }}
              node={(nodeProps) => (
                <Node
                  {...nodeProps}
                  style={{
                    fill: 'white',
                    stroke: nodeConfigs[(nodeProps.properties as WorkflowNodeData).nodeType]?.color || '#CBD5E1',
                    strokeWidth: selectedNode?.id === nodeProps.id ? 2 : 1,
                    rx: 8,
                    ry: 8
                  }}
                  label={
                    <Label
                      style={{ fill: 'transparent' }}
                    />
                  }
                  port={
                    <Port
                      style={{
                        fill: '#6366F1',
                        stroke: 'white',
                        strokeWidth: 2
                      }}
                      rx={6}
                      ry={6}
                    />
                  }
                >
                  {(event) => renderNodeContent(event.node as WorkflowNodeData)}
                </Node>
              )}
              edge={
                <Edge
                  style={{
                    stroke: '#94A3B8',
                    strokeWidth: 2
                  }}
                />
              }
              arrow={
                <MarkerArrow
                  style={{
                    fill: '#94A3B8'
                  }}
                />
              }
              onNodeLinkCheck={(event, from, to) => {
                // Prevent linking to triggers
                const toNodeType = (to as WorkflowNodeData).nodeType
                if (toNodeType.startsWith('trigger-')) return false

                // Prevent linking from end nodes
                const fromNodeType = (from as WorkflowNodeData).nodeType
                if (fromNodeType === 'end') return false

                // Prevent duplicate links
                return !hasLink(edges, from, to)
              }}
              onNodeLink={handleNodeLink}
            />
          )}
        </div>
      </div>

      {/* Node Configuration Panel */}
      {selectedNode && !readOnly && (
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: nodeConfigs[selectedNode.nodeType]?.color }}
                >
                  {nodeConfigs[selectedNode.nodeType]?.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {nodeConfigs[selectedNode.nodeType]?.label}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {nodeConfigs[selectedNode.nodeType]?.description}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="p-4">
            <div className="space-y-4">
              {/* Node Label */}
              <div className="space-y-2">
                <FormLabel>Label</FormLabel>
                <Input
                  value={selectedNode.text || ''}
                  onChange={(e) => {
                    const newNodes = nodes.map(n =>
                      n.id === selectedNode.id ? { ...n, text: e.target.value } : n
                    )
                    setNodes(newNodes)
                    setSelectedNode({ ...selectedNode, text: e.target.value })
                  }}
                />
              </div>

              {/* Config Fields */}
              {nodeConfigs[selectedNode.nodeType]?.configFields.map(field => (
                <div key={field.name} className="space-y-2">
                  <FormLabel>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </FormLabel>

                  {field.type === 'select' ? (
                    <Select
                      value={selectedNode.config?.[field.name] || ''}
                      onValueChange={(value) => {
                        updateNodeConfig(selectedNode.id, { [field.name]: value })
                        setSelectedNode({
                          ...selectedNode,
                          config: { ...selectedNode.config, [field.name]: value }
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'textarea' || field.type === 'json' ? (
                    <Textarea
                      value={selectedNode.config?.[field.name] || ''}
                      onChange={(e) => {
                        updateNodeConfig(selectedNode.id, { [field.name]: e.target.value })
                        setSelectedNode({
                          ...selectedNode,
                          config: { ...selectedNode.config, [field.name]: e.target.value }
                        })
                      }}
                      placeholder={field.placeholder}
                      rows={field.type === 'json' ? 4 : 3}
                      className={field.type === 'json' ? 'font-mono text-sm' : ''}
                    />
                  ) : (
                    <Input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={selectedNode.config?.[field.name] || ''}
                      onChange={(e) => {
                        const value = field.type === 'number' ? Number(e.target.value) : e.target.value
                        updateNodeConfig(selectedNode.id, { [field.name]: value })
                        setSelectedNode({
                          ...selectedNode,
                          config: { ...selectedNode.config, [field.name]: value }
                        })
                      }}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}

              {/* Delete Node */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => deleteNode(selectedNode.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Node
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

export default VisualWorkflowBuilder
