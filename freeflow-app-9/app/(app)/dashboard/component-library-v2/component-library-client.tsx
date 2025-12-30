'use client'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Search, Code2, Eye, Palette, Settings, Box, Layers, Grid3X3, List,
  ChevronRight, Copy, Check, ExternalLink, Accessibility, Smartphone,
  Monitor, Moon, Sun, Play, Pause, RotateCcw, Download, Heart, MessageSquare,
  GitBranch, FileCode, Zap, Shield, Puzzle, BookOpen, Terminal, Figma,
  Github, Plus, Filter, CheckCircle, AlertTriangle, XCircle, Paintbrush,
  Type, Image, LayoutGrid, History, RefreshCw, Package, Sparkles, FileText,
  Key, Webhook, Database, Trash2, Lock, Bell, Mail, Globe, Link2,
  Upload, AlertOctagon
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// Type definitions
interface ComponentDoc {
  id: string
  name: string
  displayName: string
  description: string
  category: ComponentCategory
  subcategory: string
  status: ComponentStatus
  version: string
  author: { name: string; avatar: string }
  props: PropDefinition[]
  variants: Variant[]
  examples: Example[]
  accessibility: AccessibilityInfo
  metrics: ComponentMetrics
  tags: string[]
}

interface PropDefinition {
  name: string
  type: string
  required: boolean
  defaultValue?: string
  description: string
  control: 'text' | 'boolean' | 'select' | 'number' | 'color'
  options?: string[]
}

interface Variant {
  id: string
  name: string
  description: string
  props: Record<string, any>
}

interface Example {
  id: string
  title: string
  description: string
  code: string
  language: 'tsx' | 'jsx' | 'html'
}

interface AccessibilityInfo {
  level: 'AAA' | 'AA' | 'A' | 'None'
  score: number
  features: string[]
  issues: { severity: 'error' | 'warning' | 'info'; message: string; wcag: string }[]
}

interface ComponentMetrics {
  downloads: number
  usage: number
  stars: number
  issues: number
  bundleSize: string
  gzippedSize: string
}

interface DesignToken {
  id: string
  name: string
  category: 'color' | 'spacing' | 'typography' | 'shadow' | 'radius' | 'animation'
  value: string
  cssVar: string
  description: string
}

interface IconItem {
  id: string
  name: string
  category: string
  tags: string[]
  usage: number
}

interface ChangelogEntry {
  id: string
  version: string
  date: string
  type: 'major' | 'minor' | 'patch'
  changes: { type: 'added' | 'changed' | 'fixed' | 'deprecated'; description: string }[]
}

type ComponentCategory = 'layout' | 'navigation' | 'forms' | 'data-display' | 'feedback' | 'buttons' | 'overlays' | 'inputs'
type ComponentStatus = 'stable' | 'beta' | 'experimental' | 'deprecated'

// Mock data
const mockComponents: ComponentDoc[] = [
  {
    id: 'btn-1', name: 'Button', displayName: 'Button',
    description: 'A versatile button component with multiple variants, sizes, and states.',
    category: 'buttons', subcategory: 'Actions', status: 'stable', version: '2.4.0',
    author: { name: 'Design System Team', avatar: 'DS' },
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'", required: false, defaultValue: "'primary'", description: 'Visual style variant', control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'] },
      { name: 'size', type: "'sm' | 'md' | 'lg' | 'icon'", required: false, defaultValue: "'md'", description: 'Button size', control: 'select', options: ['sm', 'md', 'lg', 'icon'] },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Disabled state', control: 'boolean' },
      { name: 'loading', type: 'boolean', required: false, defaultValue: 'false', description: 'Loading spinner', control: 'boolean' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Button content', control: 'text' },
    ],
    variants: [
      { id: 'v-1', name: 'Primary', description: 'Default primary', props: { variant: 'primary', children: 'Primary' } },
      { id: 'v-2', name: 'Secondary', description: 'Secondary style', props: { variant: 'secondary', children: 'Secondary' } },
      { id: 'v-3', name: 'Outline', description: 'Outlined style', props: { variant: 'outline', children: 'Outline' } },
      { id: 'v-4', name: 'Ghost', description: 'Minimal style', props: { variant: 'ghost', children: 'Ghost' } },
      { id: 'v-5', name: 'Destructive', description: 'Danger style', props: { variant: 'destructive', children: 'Delete' } },
    ],
    examples: [
      { id: 'e-1', title: 'Basic Usage', description: 'Simple button', code: '<Button variant="primary">Click me</Button>', language: 'tsx' },
      { id: 'e-2', title: 'With Icons', description: 'Button with icon', code: '<Button leftIcon={<Plus />}>Add Item</Button>', language: 'tsx' },
    ],
    accessibility: { level: 'AAA', score: 98, features: ['Keyboard navigation', 'Screen reader support', 'Focus indicators'], issues: [] },
    metrics: { downloads: 125000, usage: 89000, stars: 1240, issues: 3, bundleSize: '4.2 KB', gzippedSize: '1.8 KB' },
    tags: ['button', 'action', 'interactive']
  },
  {
    id: 'input-1', name: 'Input', displayName: 'Text Input',
    description: 'A flexible text input component with validation and icons.',
    category: 'inputs', subcategory: 'Form Controls', status: 'stable', version: '3.1.0',
    author: { name: 'Form Team', avatar: 'FT' },
    props: [
      { name: 'type', type: "'text' | 'email' | 'password' | 'number'", required: false, defaultValue: "'text'", description: 'Input type', control: 'select', options: ['text', 'email', 'password', 'number'] },
      { name: 'placeholder', type: 'string', required: false, description: 'Placeholder text', control: 'text' },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Disabled state', control: 'boolean' },
      { name: 'error', type: 'string', required: false, description: 'Error message', control: 'text' },
    ],
    variants: [
      { id: 'v-1', name: 'Default', description: 'Default input', props: { placeholder: 'Enter text...' } },
      { id: 'v-2', name: 'With Error', description: 'Error state', props: { error: 'Required field' } },
      { id: 'v-3', name: 'Disabled', description: 'Disabled state', props: { disabled: true, value: 'Cannot edit' } },
    ],
    examples: [
      { id: 'e-1', title: 'Basic Usage', description: 'Simple text input', code: '<Input placeholder="Enter your name" />', language: 'tsx' },
    ],
    accessibility: { level: 'AA', score: 92, features: ['Label association', 'Error announcements'], issues: [{ severity: 'warning', message: 'Consider aria-describedby for errors', wcag: '1.3.1' }] },
    metrics: { downloads: 98000, usage: 76000, stars: 890, issues: 5, bundleSize: '3.1 KB', gzippedSize: '1.4 KB' },
    tags: ['input', 'form', 'text']
  },
  {
    id: 'card-1', name: 'Card', displayName: 'Card',
    description: 'A container component for grouping related content.',
    category: 'layout', subcategory: 'Containers', status: 'stable', version: '2.0.0',
    author: { name: 'Layout Team', avatar: 'LT' },
    props: [
      { name: 'variant', type: "'default' | 'outlined' | 'elevated'", required: false, defaultValue: "'default'", description: 'Card style', control: 'select', options: ['default', 'outlined', 'elevated'] },
      { name: 'hoverable', type: 'boolean', required: false, defaultValue: 'false', description: 'Hover effects', control: 'boolean' },
    ],
    variants: [
      { id: 'v-1', name: 'Default', description: 'Basic card', props: { children: 'Card content' } },
      { id: 'v-2', name: 'Elevated', description: 'With shadow', props: { variant: 'elevated' } },
    ],
    examples: [
      { id: 'e-1', title: 'Basic Card', description: 'Simple card', code: '<Card><CardHeader>Title</CardHeader><CardContent>Content</CardContent></Card>', language: 'tsx' },
    ],
    accessibility: { level: 'AA', score: 95, features: ['Semantic HTML', 'Proper heading hierarchy'], issues: [] },
    metrics: { downloads: 145000, usage: 112000, stars: 1560, issues: 2, bundleSize: '2.8 KB', gzippedSize: '1.2 KB' },
    tags: ['card', 'container', 'layout']
  },
  {
    id: 'modal-1', name: 'Modal', displayName: 'Modal Dialog',
    description: 'An accessible modal dialog with customizable backdrop and focus management.',
    category: 'overlays', subcategory: 'Dialogs', status: 'stable', version: '4.2.0',
    author: { name: 'Overlay Team', avatar: 'OT' },
    props: [
      { name: 'open', type: 'boolean', required: true, description: 'Control visibility', control: 'boolean' },
      { name: 'onClose', type: '() => void', required: true, description: 'Close handler', control: 'text' },
      { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", required: false, defaultValue: "'md'", description: 'Modal size', control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    ],
    variants: [
      { id: 'v-1', name: 'Default', description: 'Standard modal', props: { open: true, size: 'md' } },
      { id: 'v-2', name: 'Large', description: 'Large modal', props: { open: true, size: 'lg' } },
    ],
    examples: [
      { id: 'e-1', title: 'Basic Modal', description: 'Simple modal', code: '<Modal open={isOpen} onClose={() => setIsOpen(false)}>Content</Modal>', language: 'tsx' },
    ],
    accessibility: { level: 'AAA', score: 100, features: ['Focus trap', 'Escape key', 'ARIA roles', 'Screen reader announcements'], issues: [] },
    metrics: { downloads: 87000, usage: 65000, stars: 920, issues: 1, bundleSize: '6.5 KB', gzippedSize: '2.8 KB' },
    tags: ['modal', 'dialog', 'overlay']
  },
  {
    id: 'table-1', name: 'DataTable', displayName: 'Data Table',
    description: 'A powerful data table with sorting, filtering, and pagination.',
    category: 'data-display', subcategory: 'Tables', status: 'beta', version: '1.5.0-beta',
    author: { name: 'Data Team', avatar: 'DT' },
    props: [
      { name: 'data', type: 'T[]', required: true, description: 'Table data', control: 'text' },
      { name: 'columns', type: 'Column<T>[]', required: true, description: 'Column definitions', control: 'text' },
      { name: 'sortable', type: 'boolean', required: false, defaultValue: 'true', description: 'Enable sorting', control: 'boolean' },
      { name: 'pagination', type: 'boolean', required: false, defaultValue: 'true', description: 'Enable pagination', control: 'boolean' },
    ],
    variants: [
      { id: 'v-1', name: 'Basic', description: 'Simple table', props: { sortable: false, pagination: false } },
      { id: 'v-2', name: 'Full Featured', description: 'All features', props: { sortable: true, pagination: true } },
    ],
    examples: [
      { id: 'e-1', title: 'Basic Table', description: 'Simple data table', code: '<DataTable data={users} columns={columns} />', language: 'tsx' },
    ],
    accessibility: { level: 'AA', score: 88, features: ['Keyboard navigation', 'Screen reader support'], issues: [{ severity: 'info', message: 'Consider row announcements', wcag: '4.1.2' }] },
    metrics: { downloads: 45000, usage: 32000, stars: 560, issues: 12, bundleSize: '18.2 KB', gzippedSize: '6.4 KB' },
    tags: ['table', 'data', 'grid']
  },
  {
    id: 'toast-1', name: 'Toast', displayName: 'Toast Notification',
    description: 'A lightweight notification component for brief messages.',
    category: 'feedback', subcategory: 'Notifications', status: 'experimental', version: '0.9.0',
    author: { name: 'Feedback Team', avatar: 'FB' },
    props: [
      { name: 'type', type: "'success' | 'error' | 'warning' | 'info'", required: false, defaultValue: "'info'", description: 'Toast type', control: 'select', options: ['success', 'error', 'warning', 'info'] },
      { name: 'message', type: 'string', required: true, description: 'Toast message', control: 'text' },
      { name: 'duration', type: 'number', required: false, defaultValue: '5000', description: 'Auto-dismiss duration', control: 'number' },
    ],
    variants: [
      { id: 'v-1', name: 'Success', description: 'Success toast', props: { type: 'success', message: 'Saved!' } },
      { id: 'v-2', name: 'Error', description: 'Error toast', props: { type: 'error', message: 'Error occurred' } },
    ],
    examples: [
      { id: 'e-1', title: 'Using Toast', description: 'Show notification', code: 'toast.success("Changes saved!")', language: 'tsx' },
    ],
    accessibility: { level: 'A', score: 75, features: ['ARIA live regions'], issues: [{ severity: 'warning', message: 'Ensure sufficient display time', wcag: '2.2.1' }] },
    metrics: { downloads: 23000, usage: 18000, stars: 340, issues: 8, bundleSize: '3.8 KB', gzippedSize: '1.6 KB' },
    tags: ['toast', 'notification', 'alert']
  }
]

const categories = [
  { id: 'buttons', name: 'Buttons', icon: Box, count: 8 },
  { id: 'inputs', name: 'Inputs', icon: FileCode, count: 12 },
  { id: 'layout', name: 'Layout', icon: Layers, count: 15 },
  { id: 'navigation', name: 'Navigation', icon: ChevronRight, count: 9 },
  { id: 'data-display', name: 'Data Display', icon: Grid3X3, count: 11 },
  { id: 'feedback', name: 'Feedback', icon: MessageSquare, count: 7 },
  { id: 'overlays', name: 'Overlays', icon: Layers, count: 6 },
  { id: 'forms', name: 'Forms', icon: FileCode, count: 14 }
]

const mockTokens: DesignToken[] = [
  { id: 't1', name: 'Primary', category: 'color', value: '#7c3aed', cssVar: '--color-primary', description: 'Primary brand color' },
  { id: 't2', name: 'Secondary', category: 'color', value: '#a855f7', cssVar: '--color-secondary', description: 'Secondary brand color' },
  { id: 't3', name: 'Success', category: 'color', value: '#10b981', cssVar: '--color-success', description: 'Success state color' },
  { id: 't4', name: 'Error', category: 'color', value: '#ef4444', cssVar: '--color-error', description: 'Error state color' },
  { id: 't5', name: 'Warning', category: 'color', value: '#f59e0b', cssVar: '--color-warning', description: 'Warning state color' },
  { id: 't6', name: 'Spacing XS', category: 'spacing', value: '4px', cssVar: '--spacing-xs', description: 'Extra small spacing' },
  { id: 't7', name: 'Spacing SM', category: 'spacing', value: '8px', cssVar: '--spacing-sm', description: 'Small spacing' },
  { id: 't8', name: 'Spacing MD', category: 'spacing', value: '16px', cssVar: '--spacing-md', description: 'Medium spacing' },
  { id: 't9', name: 'Spacing LG', category: 'spacing', value: '24px', cssVar: '--spacing-lg', description: 'Large spacing' },
  { id: 't10', name: 'Spacing XL', category: 'spacing', value: '32px', cssVar: '--spacing-xl', description: 'Extra large spacing' },
  { id: 't11', name: 'Font SM', category: 'typography', value: '14px', cssVar: '--font-size-sm', description: 'Small text size' },
  { id: 't12', name: 'Font MD', category: 'typography', value: '16px', cssVar: '--font-size-md', description: 'Medium text size' },
  { id: 't13', name: 'Font LG', category: 'typography', value: '18px', cssVar: '--font-size-lg', description: 'Large text size' },
  { id: 't14', name: 'Radius SM', category: 'radius', value: '4px', cssVar: '--radius-sm', description: 'Small border radius' },
  { id: 't15', name: 'Radius MD', category: 'radius', value: '8px', cssVar: '--radius-md', description: 'Medium border radius' },
  { id: 't16', name: 'Radius LG', category: 'radius', value: '12px', cssVar: '--radius-lg', description: 'Large border radius' },
  { id: 't17', name: 'Shadow SM', category: 'shadow', value: '0 1px 2px rgba(0,0,0,0.05)', cssVar: '--shadow-sm', description: 'Small shadow' },
  { id: 't18', name: 'Shadow MD', category: 'shadow', value: '0 4px 6px rgba(0,0,0,0.1)', cssVar: '--shadow-md', description: 'Medium shadow' }
]

const mockIcons: IconItem[] = [
  { id: 'i1', name: 'Plus', category: 'Actions', tags: ['add', 'create', 'new'], usage: 12500 },
  { id: 'i2', name: 'Trash', category: 'Actions', tags: ['delete', 'remove'], usage: 8900 },
  { id: 'i3', name: 'Edit', category: 'Actions', tags: ['modify', 'change'], usage: 11200 },
  { id: 'i4', name: 'Search', category: 'Actions', tags: ['find', 'lookup'], usage: 15600 },
  { id: 'i5', name: 'Settings', category: 'System', tags: ['config', 'preferences'], usage: 9800 },
  { id: 'i6', name: 'User', category: 'People', tags: ['person', 'account'], usage: 14300 },
  { id: 'i7', name: 'Home', category: 'Navigation', tags: ['house', 'main'], usage: 18200 },
  { id: 'i8', name: 'Menu', category: 'Navigation', tags: ['hamburger', 'nav'], usage: 16700 },
  { id: 'i9', name: 'Close', category: 'Actions', tags: ['x', 'dismiss'], usage: 21000 },
  { id: 'i10', name: 'Check', category: 'Status', tags: ['done', 'complete'], usage: 19500 },
  { id: 'i11', name: 'Alert', category: 'Status', tags: ['warning', 'attention'], usage: 7600 },
  { id: 'i12', name: 'Info', category: 'Status', tags: ['information', 'help'], usage: 8400 }
]

const mockChangelog: ChangelogEntry[] = [
  { id: 'c1', version: '2.5.0', date: '2025-01-20', type: 'minor', changes: [
    { type: 'added', description: 'New DataTable component with virtual scrolling' },
    { type: 'added', description: 'Toast notification system' },
    { type: 'changed', description: 'Improved Button loading animation' },
    { type: 'fixed', description: 'Modal focus trap edge case' }
  ]},
  { id: 'c2', version: '2.4.2', date: '2025-01-15', type: 'patch', changes: [
    { type: 'fixed', description: 'Input error message display' },
    { type: 'fixed', description: 'Card hover animation jitter' }
  ]},
  { id: 'c3', version: '2.4.1', date: '2025-01-10', type: 'patch', changes: [
    { type: 'fixed', description: 'Select dropdown positioning' },
    { type: 'fixed', description: 'Checkbox alignment issues' }
  ]},
  { id: 'c4', version: '2.4.0', date: '2025-01-05', type: 'minor', changes: [
    { type: 'added', description: 'New Select component' },
    { type: 'added', description: 'Slider component' },
    { type: 'changed', description: 'Updated color tokens' },
    { type: 'deprecated', description: 'Legacy dropdown component' }
  ]},
  { id: 'c5', version: '2.0.0', date: '2024-12-01', type: 'major', changes: [
    { type: 'added', description: 'Complete component redesign' },
    { type: 'added', description: 'Dark mode support' },
    { type: 'changed', description: 'New design token system' },
    { type: 'changed', description: 'Updated prop APIs (breaking)' }
  ]}
]

// Enhanced Component Library Mock Data
const mockComponentLibAIInsights = [
  { id: '1', type: 'success' as const, title: 'Component Usage', description: 'Button and Card components used in 89% of pages. Well-designed system!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
  { id: '2', type: 'info' as const, title: 'New Components', description: '5 new components added this month. Documentation 100% complete.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Updates' },
  { id: '3', type: 'warning' as const, title: 'Deprecated', description: '3 components marked deprecated. Migration guide available.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Maintenance' },
]

const mockComponentLibCollaborators = [
  { id: '1', name: 'Design Lead', avatar: '/avatars/design.jpg', status: 'online' as const, role: 'Design System', lastActive: 'Now' },
  { id: '2', name: 'Frontend Dev', avatar: '/avatars/frontend.jpg', status: 'online' as const, role: 'Development', lastActive: '3m ago' },
  { id: '3', name: 'UX Writer', avatar: '/avatars/ux.jpg', status: 'away' as const, role: 'Documentation', lastActive: '20m ago' },
]

const mockComponentLibPredictions = [
  { id: '1', label: 'Components', current: 87, target: 100, predicted: 95, confidence: 85, trend: 'up' as const },
  { id: '2', label: 'Coverage', current: 94, target: 100, predicted: 98, confidence: 82, trend: 'up' as const },
  { id: '3', label: 'Adoption', current: 78, target: 90, predicted: 85, confidence: 78, trend: 'up' as const },
]

const mockComponentLibActivities = [
  { id: '1', user: 'Design Lead', action: 'published', target: 'new DatePicker component', timestamp: '15m ago', type: 'success' as const },
  { id: '2', user: 'Frontend Dev', action: 'updated', target: 'Button accessibility', timestamp: '1h ago', type: 'info' as const },
  { id: '3', user: 'UX Writer', action: 'added', target: 'usage guidelines for Modal', timestamp: '2h ago', type: 'info' as const },
]

const mockComponentLibQuickActions = [
  { id: '1', label: 'New Component', icon: 'Plus', shortcut: 'N', action: () => console.log('New component') },
  { id: '2', label: 'Browse', icon: 'Layers', shortcut: 'B', action: () => console.log('Browse') },
  { id: '3', label: 'Playground', icon: 'Play', shortcut: 'P', action: () => console.log('Playground') },
  { id: '4', label: 'Docs', icon: 'BookOpen', shortcut: 'D', action: () => console.log('Docs') },
]

export default function ComponentLibraryClient() {
  const [activeTab, setActiveTab] = useState('components')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedComponent, setSelectedComponent] = useState<ComponentDoc | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [tokenCategory, setTokenCategory] = useState<string>('all')
  const [iconSearch, setIconSearch] = useState('')
  const [settingsTab, setSettingsTab] = useState('display')

  const filteredComponents = useMemo(() => {
    let filtered = [...mockComponents]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query) || c.tags.some(t => t.includes(query)))
    }
    if (selectedCategory !== 'all') filtered = filtered.filter(c => c.category === selectedCategory)
    if (statusFilter !== 'all') filtered = filtered.filter(c => c.status === statusFilter)
    return filtered
  }, [searchQuery, selectedCategory, statusFilter])

  const filteredTokens = useMemo(() => {
    if (tokenCategory === 'all') return mockTokens
    return mockTokens.filter(t => t.category === tokenCategory)
  }, [tokenCategory])

  const filteredIcons = useMemo(() => {
    if (!iconSearch) return mockIcons
    return mockIcons.filter(i => i.name.toLowerCase().includes(iconSearch.toLowerCase()) || i.tags.some(t => t.includes(iconSearch.toLowerCase())))
  }, [iconSearch])

  const getStatusColor = (status: ComponentStatus) => {
    const colors: Record<ComponentStatus, string> = {
      stable: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
      beta: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
      experimental: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
      deprecated: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
    }
    return colors[status]
  }

  const getAccessibilityColor = (level: string) => {
    const colors: Record<string, string> = {
      AAA: 'text-emerald-600 bg-emerald-100', AA: 'text-blue-600 bg-blue-100', A: 'text-amber-600 bg-amber-100', None: 'text-red-600 bg-red-100'
    }
    return colors[level] || 'text-gray-600 bg-gray-100'
  }

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Toast handlers for unconnected buttons
  const handleCreateComponent = () => {
    toast.info('Create Component', { description: 'Opening component builder...' })
  }
  const handleCopyCode = (componentName: string) => {
    toast.success('Copied', { description: `${componentName} code copied to clipboard` })
  }
  const handlePreviewComponent = (componentName: string) => {
    toast.info('Preview', { description: `Previewing ${componentName}...` })
  }
  const handleExportComponent = (componentName: string) => {
    toast.success('Exporting', { description: `Exporting ${componentName}...` })
  }
  const handleOpenFigma = () => {
    toast.info('Figma', { description: 'Opening Figma design kit...' })
  }
  const handleOpenGitHub = () => {
    toast.info('GitHub', { description: 'Opening GitHub repository...' })
  }
  const handleOpenDocs = (docType: string) => {
    toast.info('Documentation', { description: `Opening ${docType}...` })
  }
  const handleDownload = (item: string) => {
    toast.success('Download Started', { description: `Downloading ${item}...` })
  }
  const handleConnect = (toolName: string) => {
    toast.info('Connect', { description: `Connecting to ${toolName}...` })
  }
  const handleAddWebhook = () => {
    toast.info('Add Webhook', { description: 'Opening webhook configuration...' })
  }
  const handleViewApiKey = () => {
    toast.info('API Key', { description: 'Revealing API key...' })
  }
  const handleCopyApiKey = () => {
    toast.success('Copied', { description: 'API key copied to clipboard' })
  }
  const handleRegenerateApiKey = () => {
    toast.warning('Regenerate API Key', { description: 'Are you sure? This will invalidate the current key.' })
  }
  const handleViewNpm = () => {
    toast.info('NPM', { description: 'Opening NPM package page...' })
  }
  const handleClearCache = () => {
    toast.success('Cache Cleared', { description: 'Component cache has been cleared' })
  }
  const handleViewAccessLogs = () => {
    toast.info('Access Logs', { description: 'Opening access logs...' })
  }
  const handleDangerAction = (action: string) => {
    toast.error('Danger Zone', { description: `${action} requires confirmation` })
  }

  // Key metrics for header
  const keyMetrics = [
    { label: 'Components', value: mockComponents.length * 12, icon: Puzzle, gradient: 'from-violet-500 to-purple-500' },
    { label: 'Categories', value: categories.length, icon: LayoutGrid, gradient: 'from-purple-500 to-fuchsia-500' },
    { label: 'Design Tokens', value: mockTokens.length, icon: Paintbrush, gradient: 'from-fuchsia-500 to-pink-500' },
    { label: 'Icons', value: mockIcons.length * 20, icon: Sparkles, gradient: 'from-pink-500 to-rose-500' },
    { label: 'A11y Score', value: '98%', icon: Accessibility, gradient: 'from-emerald-500 to-green-500' },
    { label: 'Downloads', value: '1.2M', icon: Download, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Stars', value: '5.4K', icon: Heart, gradient: 'from-amber-500 to-orange-500' },
    { label: 'Contributors', value: 42, icon: MessageSquare, gradient: 'from-cyan-500 to-teal-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Puzzle className="h-10 w-10" />
                  <Badge className="bg-white/20 text-white border-0">Storybook Level</Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2">Component Library</h1>
                <p className="text-white/80">Production-ready UI components • Design tokens • Documentation</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={handleOpenFigma}>
                  <Figma className="h-4 w-4 mr-2" />
                  Figma Kit
                </Button>
                <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={handleOpenGitHub}>
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
                <Button className="bg-white text-purple-600 hover:bg-purple-50" onClick={handleCreateComponent}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Component
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-2xl mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search components, tokens, icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-white border-0 shadow-lg rounded-xl text-gray-900"
              />
            </div>

            {/* 8 Gradient Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {keyMetrics.map((metric, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.gradient}`}>
                      <metric.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-xl font-bold">{metric.value}</div>
                  <div className="text-xs text-white/70">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border h-auto flex-wrap">
            <TabsTrigger value="components" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Puzzle className="h-4 w-4 mr-2" />
              Components
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="playground" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Play className="h-4 w-4 mr-2" />
              Playground
            </TabsTrigger>
            <TabsTrigger value="tokens" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Paintbrush className="h-4 w-4 mr-2" />
              Tokens
            </TabsTrigger>
            <TabsTrigger value="icons" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Icons
            </TabsTrigger>
            <TabsTrigger value="docs" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <BookOpen className="h-4 w-4 mr-2" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="changelog" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <History className="h-4 w-4 mr-2" />
              Changelog
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('all')} className={selectedCategory === 'all' ? 'bg-violet-600' : ''}>
                  All Components
                </Button>
                {categories.map(cat => (
                  <Button key={cat.id} variant={selectedCategory === cat.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat.id)} className={selectedCategory === cat.id ? 'bg-violet-600' : ''}>
                    <cat.icon className="h-3 w-3 mr-1" />
                    {cat.name} ({cat.count})
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-violet-100 text-violet-700' : 'bg-white dark:bg-gray-800'}`}>
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-violet-100 text-violet-700' : 'bg-white dark:bg-gray-800'}`}>
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredComponents.map(comp => (
                <Card key={comp.id} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => setSelectedComponent(comp)}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg text-white">
                          <Puzzle className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold group-hover:text-violet-600 transition-colors">{comp.displayName}</h3>
                          <p className="text-xs text-gray-500">{comp.category} / {comp.subcategory}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(comp.status)}>{comp.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{comp.description}</p>
                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Download className="h-3 w-3" />{(comp.metrics.downloads / 1000).toFixed(0)}K</span>
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{comp.metrics.stars}</span>
                      <span className="flex items-center gap-1"><Box className="h-3 w-3" />{comp.metrics.bundleSize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getAccessibilityColor(comp.accessibility.level)}`}>
                        <Accessibility className="h-3 w-3 mr-1" />{comp.accessibility.level}
                      </Badge>
                      <span className="text-xs text-gray-500">v{comp.version}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(cat => (
                <Card key={cat.id} className="cursor-pointer hover:shadow-md hover:border-violet-300 transition-all" onClick={() => { setSelectedCategory(cat.id); setActiveTab('components') }}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-3 text-violet-600">
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold">{cat.name}</h3>
                    <p className="text-sm text-gray-500">{cat.count} components</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Playground Tab */}
          <TabsContent value="playground" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Play className="h-12 w-12 text-violet-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Interactive Playground</h3>
                <p className="text-gray-500 mb-4">Select a component to start experimenting with props and variants</p>
                <Button className="bg-violet-600" onClick={() => setActiveTab('components')}>Browse Components</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Design Tokens</h2>
                <p className="text-gray-500">Consistent design values across your application</p>
              </div>
              <div className="flex items-center gap-2">
                {['all', 'color', 'spacing', 'typography', 'radius', 'shadow'].map(cat => (
                  <Button key={cat} variant={tokenCategory === cat ? 'default' : 'outline'} size="sm" onClick={() => setTokenCategory(cat)} className={tokenCategory === cat ? 'bg-violet-600' : ''}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTokens.map(token => (
                <Card key={token.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {token.category === 'color' && (
                        <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: token.value }}></div>
                      )}
                      {token.category !== 'color' && (
                        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                          <Type className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold">{token.name}</h4>
                        <code className="text-xs text-gray-500">{token.cssVar}</code>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{token.description}</p>
                    <div className="flex items-center justify-between">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{token.value}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(token.cssVar, token.id)}>
                        {copiedCode === token.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Icons Tab */}
          <TabsContent value="icons" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Icon Library</h2>
                <p className="text-gray-500">{mockIcons.length * 20} icons available</p>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search icons..." value={iconSearch} onChange={(e) => setIconSearch(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {filteredIcons.map(icon => (
                <Card key={icon.id} className="cursor-pointer hover:shadow-md hover:border-violet-300 transition-all group">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-2 group-hover:bg-violet-100 transition-colors">
                      <Box className="h-6 w-6 text-gray-600 group-hover:text-violet-600" />
                    </div>
                    <p className="text-sm font-medium truncate">{icon.name}</p>
                    <p className="text-xs text-gray-500">{icon.category}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Docs Tab */}
          <TabsContent value="docs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Quick start guide for using the component library</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Installation</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <code>npm install @kazi/ui-components</code>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Usage</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{`import { Button, Card, Input } from '@kazi/ui-components'

export default function App() {
  return (
    <Card>
      <Input placeholder="Enter text..." />
      <Button variant="primary">Submit</Button>
    </Card>
  )
}`}</pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleOpenDocs('API Reference')}>
                      <FileText className="h-4 w-4 mr-2" />
                      API Reference
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleOpenDocs('Theming Guide')}>
                      <Paintbrush className="h-4 w-4 mr-2" />
                      Theming Guide
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleOpenDocs('Accessibility Guide')}>
                      <Accessibility className="h-4 w-4 mr-2" />
                      Accessibility
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleOpenDocs('Migration Guide')}>
                      <Package className="h-4 w-4 mr-2" />
                      Migration Guide
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={handleOpenFigma}>
                      <Figma className="h-4 w-4 mr-2" />
                      Figma Design Kit
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleOpenGitHub}>
                      <Github className="h-4 w-4 mr-2" />
                      GitHub Repository
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Changelog Tab */}
          <TabsContent value="changelog" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Changelog</h2>
                <p className="text-gray-500">Track all library updates and changes</p>
              </div>
              <Button variant="outline" onClick={() => handleDownload('all changelog entries')}>
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>

            <div className="space-y-6">
              {mockChangelog.map(entry => (
                <Card key={entry.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className={entry.type === 'major' ? 'bg-red-100 text-red-700' : entry.type === 'minor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                        v{entry.version}
                      </Badge>
                      <span className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</span>
                      <Badge variant="outline">{entry.type}</Badge>
                    </div>
                    <div className="space-y-2">
                      {entry.changes.map((change, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Badge className={`text-xs ${change.type === 'added' ? 'bg-emerald-100 text-emerald-700' : change.type === 'changed' ? 'bg-blue-100 text-blue-700' : change.type === 'fixed' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                            {change.type}
                          </Badge>
                          <span className="text-sm text-gray-600">{change.description}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Tabs value={settingsTab} onValueChange={setSettingsTab}>
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="display" className="gap-2">
                  <Palette className="w-4 h-4" />
                  Display
                </TabsTrigger>
                <TabsTrigger value="components" className="gap-2">
                  <Puzzle className="w-4 h-4" />
                  Components
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2">
                  <Code2 className="w-4 h-4" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="publishing" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Publishing
                </TabsTrigger>
                <TabsTrigger value="advanced" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* Display Settings */}
              <TabsContent value="display" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-violet-600" />
                        Theme Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Dark Mode</Label>
                          <p className="text-sm text-gray-500">Enable dark theme</p>
                        </div>
                        <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">System Theme</Label>
                          <p className="text-sm text-gray-500">Follow system preference</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Accent Color</Label>
                        <div className="flex gap-2">
                          {['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map((color) => (
                            <button
                              key={color}
                              className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Font Size</Label>
                        <Select defaultValue="medium">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5 text-violet-600" />
                        UI Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Compact View</Label>
                          <p className="text-sm text-gray-500">Reduce spacing in components</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Accessibility Info</Label>
                          <p className="text-sm text-gray-500">Display a11y badges on components</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Status Badges</Label>
                          <p className="text-sm text-gray-500">Display stable/beta/experimental</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Animations</Label>
                          <p className="text-sm text-gray-500">Enable UI animations</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Default View Mode</Label>
                        <Select defaultValue="grid">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">Grid View</SelectItem>
                            <SelectItem value="list">List View</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-violet-600" />
                        Preview Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Auto-preview on Hover</Label>
                          <p className="text-sm text-gray-500">Show component preview</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Props Panel</Label>
                          <p className="text-sm text-gray-500">Display editable props</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Preview Background</Label>
                        <Select defaultValue="checkered">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="checkered">Checkered</SelectItem>
                            <SelectItem value="white">White</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="transparent">Transparent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-violet-600" />
                        Responsive Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Device Frames</Label>
                          <p className="text-sm text-gray-500">Display device mockups</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Default Viewport</Label>
                        <Select defaultValue="desktop">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mobile">Mobile (375px)</SelectItem>
                            <SelectItem value="tablet">Tablet (768px)</SelectItem>
                            <SelectItem value="desktop">Desktop (1280px)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Breakpoints</Label>
                          <p className="text-sm text-gray-500">Display breakpoint indicators</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Components Settings */}
              <TabsContent value="components" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Puzzle className="h-5 w-5 text-violet-600" />
                        Component Defaults
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Default Button Variant</Label>
                        <Select defaultValue="primary">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                            <SelectItem value="ghost">Ghost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Default Size</Label>
                        <Select defaultValue="md">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sm">Small</SelectItem>
                            <SelectItem value="md">Medium</SelectItem>
                            <SelectItem value="lg">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Enable Loading States</Label>
                          <p className="text-sm text-gray-500">Show loading spinners</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Auto-focus First Input</Label>
                          <p className="text-sm text-gray-500">Focus forms automatically</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Accessibility className="h-5 w-5 text-violet-600" />
                        Accessibility
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Focus Indicators</Label>
                          <p className="text-sm text-gray-500">Enhanced focus rings</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Reduce Motion</Label>
                          <p className="text-sm text-gray-500">Minimize animations</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">High Contrast</Label>
                          <p className="text-sm text-gray-500">Increase color contrast</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">WCAG Target</Label>
                        <Select defaultValue="aa">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="a">Level A</SelectItem>
                            <SelectItem value="aa">Level AA (Recommended)</SelectItem>
                            <SelectItem value="aaa">Level AAA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-violet-600" />
                        Variants & States
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show All Variants</Label>
                          <p className="text-sm text-gray-500">Display every variant</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show State Examples</Label>
                          <p className="text-sm text-gray-500">Hover, focus, disabled states</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Interactive States</Label>
                          <p className="text-sm text-gray-500">Enable state interaction</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Paintbrush className="h-5 w-5 text-violet-600" />
                        Design Tokens
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Token Names</Label>
                          <p className="text-sm text-gray-500">Display CSS variable names</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Raw Values</Label>
                          <p className="text-sm text-gray-500">Display computed values</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Token Format</Label>
                        <Select defaultValue="css">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="css">CSS Variables</SelectItem>
                            <SelectItem value="scss">SCSS Variables</SelectItem>
                            <SelectItem value="js">JavaScript</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Code Settings */}
              <TabsContent value="code" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code2 className="h-5 w-5 text-violet-600" />
                        Code Display
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Default Language</Label>
                        <Select defaultValue="tsx">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tsx">TypeScript (TSX)</SelectItem>
                            <SelectItem value="jsx">JavaScript (JSX)</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                            <SelectItem value="vue">Vue</SelectItem>
                            <SelectItem value="svelte">Svelte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Line Numbers</Label>
                          <p className="text-sm text-gray-500">In code examples</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Syntax Highlighting</Label>
                          <p className="text-sm text-gray-500">Colorize code blocks</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Word Wrap</Label>
                          <p className="text-sm text-gray-500">Wrap long lines</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-violet-600" />
                        Editor Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Theme</Label>
                        <Select defaultValue="dark">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dark">Dark (Monokai)</SelectItem>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="github">GitHub</SelectItem>
                            <SelectItem value="dracula">Dracula</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Font Family</Label>
                        <Select defaultValue="fira">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fira">Fira Code</SelectItem>
                            <SelectItem value="jetbrains">JetBrains Mono</SelectItem>
                            <SelectItem value="source">Source Code Pro</SelectItem>
                            <SelectItem value="monaco">Monaco</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Font Size</Label>
                        <Select defaultValue="14">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12px</SelectItem>
                            <SelectItem value="14">14px</SelectItem>
                            <SelectItem value="16">16px</SelectItem>
                            <SelectItem value="18">18px</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileCode className="h-5 w-5 text-violet-600" />
                        Code Generation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Include Imports</Label>
                          <p className="text-sm text-gray-500">Add import statements</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Include Types</Label>
                          <p className="text-sm text-gray-500">Add TypeScript types</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Minify Output</Label>
                          <p className="text-sm text-gray-500">Compact code output</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Quote Style</Label>
                        <Select defaultValue="single">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single quotes</SelectItem>
                            <SelectItem value="double">Double quotes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Copy className="h-5 w-5 text-violet-600" />
                        Clipboard
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Copy on Click</Label>
                          <p className="text-sm text-gray-500">Click code to copy</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Show Copy Feedback</Label>
                          <p className="text-sm text-gray-500">Animate copy button</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Copy Notification</Label>
                          <p className="text-sm text-gray-500">Toast on successful copy</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Integrations Settings */}
              <TabsContent value="integrations" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-violet-600" />
                        Connected Tools
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { name: 'Figma', status: 'connected', icon: '🎨', desc: 'Design system sync' },
                          { name: 'GitHub', status: 'connected', icon: '🐙', desc: 'Repository integration' },
                          { name: 'Storybook', status: 'connected', icon: '📕', desc: 'Component docs' },
                          { name: 'Chromatic', status: 'not_connected', icon: '🎭', desc: 'Visual testing' },
                          { name: 'Slack', status: 'not_connected', icon: '#', desc: 'Team notifications' },
                          { name: 'Jira', status: 'not_connected', icon: '📋', desc: 'Issue tracking' }
                        ].map((tool, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xl">
                                {tool.icon}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{tool.name}</p>
                                <p className="text-xs text-gray-500">{tool.desc}</p>
                              </div>
                            </div>
                            {tool.status === 'connected' ? (
                              <Badge className="bg-green-100 text-green-700">Connected</Badge>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => handleConnect(tool.name)}>Connect</Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="h-5 w-5 text-violet-600" />
                        Webhooks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Component Update Webhook</span>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </div>
                        <code className="text-xs text-gray-500">https://api.yourapp.com/webhooks/components</code>
                      </div>
                      <Button variant="outline" className="w-full" onClick={handleAddWebhook}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Webhook
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-violet-600" />
                        API Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">API Key</Label>
                        <div className="flex gap-2">
                          <Input value="cl_live_xxxxxxxxxxxxxxxxxxxxx" readOnly className="flex-1 font-mono text-sm" type="password" />
                          <Button variant="outline" size="icon" onClick={handleViewApiKey}><Eye className="h-4 w-4" /></Button>
                          <Button variant="outline" size="icon" onClick={handleCopyApiKey}><Copy className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Keep your API key secret. Never expose it in client-side code.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full" onClick={handleRegenerateApiKey}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate API Key
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Publishing Settings */}
              <TabsContent value="publishing" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-violet-600" />
                        NPM Package
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <code>npm install @kazi/ui-components@latest</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopyCode('npm install command')}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleViewNpm}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on NPM
                        </Button>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>Latest:</strong> v2.5.0 • Published 2 days ago
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5 text-violet-600" />
                        Versioning
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Version Bump</Label>
                        <Select defaultValue="minor">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patch">Patch (x.x.1)</SelectItem>
                            <SelectItem value="minor">Minor (x.1.0)</SelectItem>
                            <SelectItem value="major">Major (1.0.0)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Auto-generate Changelog</Label>
                          <p className="text-sm text-gray-500">From commits</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Pre-release Tags</Label>
                          <p className="text-sm text-gray-500">Alpha/Beta releases</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-violet-600" />
                        Export Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleExportComponent('Tokens as CSS')}>
                          <Download className="h-6 w-6" />
                          <span>Export Tokens as CSS</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleExportComponent('Tokens as JSON')}>
                          <Download className="h-6 w-6" />
                          <span>Export Tokens as JSON</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleExportComponent('Icons as SVG')}>
                          <Download className="h-6 w-6" />
                          <span>Export Icons as SVG</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleExportComponent('Components')}>
                          <Download className="h-6 w-6" />
                          <span>Export Components</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleExportComponent('Documentation')}>
                          <Download className="h-6 w-6" />
                          <span>Export Documentation</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleExportComponent('Full Library')}>
                          <Download className="h-6 w-6" />
                          <span>Export Full Library</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-violet-600" />
                        Cache & Storage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Cache Size</span>
                          <span className="text-sm text-gray-500">24.5 MB</span>
                        </div>
                        <Progress value={35} className="h-2" />
                      </div>
                      <Button variant="outline" className="w-full" onClick={handleClearCache}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Clear Cache
                      </Button>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Enable Caching</Label>
                          <p className="text-sm text-gray-500">Cache component data</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Cache Duration</Label>
                        <Select defaultValue="1day">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1hour">1 hour</SelectItem>
                            <SelectItem value="1day">1 day</SelectItem>
                            <SelectItem value="1week">1 week</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-violet-600" />
                        Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Component Updates</Label>
                          <p className="text-sm text-gray-500">When components are updated</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Breaking Changes</Label>
                          <p className="text-sm text-gray-500">Alert on breaking changes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">New Features</Label>
                          <p className="text-sm text-gray-500">New component announcements</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Weekly Digest</Label>
                          <p className="text-sm text-gray-500">Weekly library summary</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-violet-600" />
                        Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">API Rate Limiting</Label>
                          <p className="text-sm text-gray-500">Limit API requests</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Rate Limit</Label>
                        <Select defaultValue="1000">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="100">100 requests/hour</SelectItem>
                            <SelectItem value="500">500 requests/hour</SelectItem>
                            <SelectItem value="1000">1000 requests/hour</SelectItem>
                            <SelectItem value="unlimited">Unlimited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" className="w-full" onClick={handleViewAccessLogs}>
                        <History className="h-4 w-4 mr-2" />
                        View Access Logs
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 dark:border-red-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertOctagon className="h-5 w-5" />
                        Danger Zone
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          These actions are irreversible. Please proceed with caution.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDangerAction('Delete All Components')}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Components
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDangerAction('Reset All Settings')}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset All Settings
                      </Button>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDangerAction('Disable Component Library')}>
                        <Lock className="h-4 w-4 mr-2" />
                        Disable Component Library
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockComponentLibAIInsights}
              title="Component Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockComponentLibCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockComponentLibPredictions}
              title="Library Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockComponentLibActivities}
            title="Library Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockComponentLibQuickActions}
            variant="grid"
          />
        </div>

        {/* Component Detail Dialog */}
        {selectedComponent && (
          <Dialog open={!!selectedComponent} onOpenChange={() => setSelectedComponent(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
                    <Puzzle className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-2xl">{selectedComponent.displayName}</DialogTitle>
                      <Badge className={getStatusColor(selectedComponent.status)}>{selectedComponent.status}</Badge>
                    </div>
                    <p className="text-gray-500 mt-1">v{selectedComponent.version} by {selectedComponent.author.name}</p>
                  </div>
                </div>
              </DialogHeader>
              <ScrollArea className="h-[600px]">
                <Tabs defaultValue="preview" className="p-4">
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="props">Props</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="accessibility">A11y</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview" className="mt-4 space-y-4">
                    <div className="border rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b">
                        <span className="text-sm font-medium">Preview</span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setDarkMode(!darkMode)}>
                            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className={`p-12 flex items-center justify-center min-h-[150px] ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                        <div className="text-center text-gray-400">
                          <Eye className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Component preview</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{selectedComponent.description}</p>
                    <div className="grid grid-cols-4 gap-4">
                      <Card><CardContent className="p-4 text-center"><Download className="h-5 w-5 mx-auto text-blue-500 mb-1" /><div className="font-bold">{(selectedComponent.metrics.downloads / 1000).toFixed(0)}K</div><div className="text-xs text-gray-500">Downloads</div></CardContent></Card>
                      <Card><CardContent className="p-4 text-center"><Heart className="h-5 w-5 mx-auto text-red-500 mb-1" /><div className="font-bold">{selectedComponent.metrics.stars}</div><div className="text-xs text-gray-500">Stars</div></CardContent></Card>
                      <Card><CardContent className="p-4 text-center"><Box className="h-5 w-5 mx-auto text-purple-500 mb-1" /><div className="font-bold">{selectedComponent.metrics.bundleSize}</div><div className="text-xs text-gray-500">Bundle</div></CardContent></Card>
                      <Card><CardContent className="p-4 text-center"><Accessibility className="h-5 w-5 mx-auto text-emerald-500 mb-1" /><div className="font-bold">{selectedComponent.accessibility.score}%</div><div className="text-xs text-gray-500">A11y</div></CardContent></Card>
                    </div>
                  </TabsContent>
                  <TabsContent value="props" className="mt-4">
                    <table className="w-full text-sm border rounded-lg overflow-hidden">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium">Prop</th>
                          <th className="text-left px-4 py-3 font-medium">Type</th>
                          <th className="text-left px-4 py-3 font-medium">Default</th>
                          <th className="text-left px-4 py-3 font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedComponent.props.map((prop, idx) => (
                          <tr key={prop.name} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                            <td className="px-4 py-3"><code className="text-violet-600">{prop.name}</code>{prop.required && <span className="text-red-500 ml-1">*</span>}</td>
                            <td className="px-4 py-3"><code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{prop.type}</code></td>
                            <td className="px-4 py-3 text-gray-500">{prop.defaultValue || '-'}</td>
                            <td className="px-4 py-3 text-gray-600">{prop.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TabsContent>
                  <TabsContent value="code" className="mt-4 space-y-4">
                    {selectedComponent.examples.map(ex => (
                      <div key={ex.id} className="border rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b">
                          <div>
                            <span className="font-medium">{ex.title}</span>
                            <p className="text-xs text-gray-500">{ex.description}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ex.code, ex.id)}>
                            {copiedCode === ex.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                        <pre className="p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto"><code>{ex.code}</code></pre>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="accessibility" className="mt-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`px-4 py-2 rounded-lg font-bold text-lg ${getAccessibilityColor(selectedComponent.accessibility.level)}`}>WCAG {selectedComponent.accessibility.level}</div>
                      <div><div className="font-semibold">Score: {selectedComponent.accessibility.score}%</div><p className="text-sm text-gray-500">Accessibility compliance</p></div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Features</h4>
                      <div className="flex flex-wrap gap-2">{selectedComponent.accessibility.features.map((f, i) => (<Badge key={i} variant="outline" className="text-emerald-600 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />{f}</Badge>))}</div>
                    </div>
                    {selectedComponent.accessibility.issues.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Issues</h4>
                        <div className="space-y-2">{selectedComponent.accessibility.issues.map((issue, i) => (<div key={i} className={`p-3 rounded-lg flex items-start gap-3 ${issue.severity === 'error' ? 'bg-red-50' : issue.severity === 'warning' ? 'bg-amber-50' : 'bg-blue-50'}`}><AlertTriangle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${issue.severity === 'error' ? 'text-red-500' : issue.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'}`} /><div><p className="text-sm">{issue.message}</p><p className="text-xs text-gray-500 mt-1">WCAG {issue.wcag}</p></div></div>))}</div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
