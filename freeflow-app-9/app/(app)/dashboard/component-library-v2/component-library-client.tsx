'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { useUIComponents, UIComponent, UIComponentStats } from '@/lib/hooks/use-ui-components'
import { createUIComponent, deleteUIComponent, publishComponent, deprecateComponent, setBetaComponent } from '@/app/actions/ui-components'
import { Search, Code2, Eye, Palette, Settings2, Box, Layers, Grid3X3, List, ChevronRight, Copy, Check, ExternalLink, Accessibility, Smartphone, Monitor, Moon, Sun, Play, Pause, RotateCcw, Download, Heart, MessageSquare, GitBranch, FileCode, Zap, Shield, Puzzle, BookOpen, Terminal, Figma, Github, Plus, Filter, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

// Storybook Level Types
interface ComponentDoc {
  id: string
  name: string
  displayName: string
  description: string
  category: ComponentCategory
  subcategory: string
  framework: Framework
  status: ComponentStatus
  version: string
  author: Author
  props: PropDefinition[]
  variants: Variant[]
  examples: Example[]
  accessibility: AccessibilityInfo
  dependencies: Dependency[]
  changelog: ChangelogEntry[]
  metrics: ComponentMetrics
  figmaUrl?: string
  githubUrl?: string
  tags: string[]
  relatedComponents: string[]
}

interface PropDefinition {
  name: string
  type: string
  required: boolean
  defaultValue?: string
  description: string
  options?: string[]
  control: 'text' | 'boolean' | 'select' | 'number' | 'color' | 'object'
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
  issues: AccessibilityIssue[]
}

interface AccessibilityIssue {
  severity: 'error' | 'warning' | 'info'
  message: string
  wcag: string
}

interface Dependency {
  name: string
  version: string
  type: 'peer' | 'dev' | 'prod'
}

interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
  breaking?: boolean
}

interface ComponentMetrics {
  downloads: number
  usage: number
  stars: number
  issues: number
  bundleSize: string
  gzippedSize: string
}

interface Author {
  name: string
  avatar: string
  github?: string
}

type ComponentCategory = 'layout' | 'navigation' | 'forms' | 'data-display' | 'feedback' | 'media' | 'buttons' | 'overlays' | 'inputs' | 'typography'
type ComponentStatus = 'stable' | 'beta' | 'experimental' | 'deprecated'
type Framework = 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla'

interface ComponentLibraryClientProps {
  initialComponents: UIComponent[]
  initialStats: UIComponentStats
}

// Mock Data - Storybook Level
const mockComponents: ComponentDoc[] = [
  {
    id: 'btn-1',
    name: 'Button',
    displayName: 'Button',
    description: 'A versatile button component with multiple variants, sizes, and states. Supports icons, loading states, and full accessibility.',
    category: 'buttons',
    subcategory: 'Actions',
    framework: 'react',
    status: 'stable',
    version: '2.4.0',
    author: { name: 'Design System Team', avatar: 'DS', github: 'design-system' },
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'", required: false, defaultValue: "'primary'", description: 'The visual style variant of the button', options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'], control: 'select' },
      { name: 'size', type: "'sm' | 'md' | 'lg' | 'icon'", required: false, defaultValue: "'md'", description: 'The size of the button', options: ['sm', 'md', 'lg', 'icon'], control: 'select' },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Whether the button is disabled', control: 'boolean' },
      { name: 'loading', type: 'boolean', required: false, defaultValue: 'false', description: 'Shows a loading spinner', control: 'boolean' },
      { name: 'leftIcon', type: 'ReactNode', required: false, description: 'Icon to display on the left', control: 'text' },
      { name: 'rightIcon', type: 'ReactNode', required: false, description: 'Icon to display on the right', control: 'text' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Button content', control: 'text' },
      { name: 'onClick', type: '() => void', required: false, description: 'Click handler function', control: 'text' },
    ],
    variants: [
      { id: 'v-1', name: 'Primary', description: 'Default primary button', props: { variant: 'primary', children: 'Primary Button' } },
      { id: 'v-2', name: 'Secondary', description: 'Secondary style button', props: { variant: 'secondary', children: 'Secondary Button' } },
      { id: 'v-3', name: 'Outline', description: 'Outlined button style', props: { variant: 'outline', children: 'Outline Button' } },
      { id: 'v-4', name: 'Ghost', description: 'Minimal ghost button', props: { variant: 'ghost', children: 'Ghost Button' } },
      { id: 'v-5', name: 'Destructive', description: 'For dangerous actions', props: { variant: 'destructive', children: 'Delete' } },
      { id: 'v-6', name: 'Loading', description: 'Button with loading state', props: { variant: 'primary', loading: true, children: 'Loading...' } },
    ],
    examples: [
      { id: 'e-1', title: 'Basic Usage', description: 'Simple button implementation', code: '<Button variant="primary">Click me</Button>', language: 'tsx' },
      { id: 'e-2', title: 'With Icons', description: 'Button with left and right icons', code: '<Button leftIcon={<Plus />} rightIcon={<ChevronRight />}>\n  Add Item\n</Button>', language: 'tsx' },
      { id: 'e-3', title: 'Loading State', description: 'Button in loading state', code: '<Button loading disabled>\n  Submitting...\n</Button>', language: 'tsx' },
    ],
    accessibility: {
      level: 'AAA',
      score: 98,
      features: ['Keyboard navigation', 'Screen reader support', 'Focus indicators', 'ARIA labels', 'Color contrast compliant'],
      issues: []
    },
    dependencies: [
      { name: 'react', version: '>=18.0.0', type: 'peer' },
      { name: 'class-variance-authority', version: '^0.7.0', type: 'prod' },
    ],
    changelog: [
      { version: '2.4.0', date: '2024-01-15', changes: ['Added loading spinner animation', 'Improved focus states'] },
      { version: '2.3.0', date: '2024-01-01', changes: ['Added icon support', 'New ghost variant'] },
      { version: '2.0.0', date: '2023-12-01', changes: ['Complete redesign', 'Breaking: Changed variant names'], breaking: true },
    ],
    metrics: { downloads: 125000, usage: 89000, stars: 1240, issues: 3, bundleSize: '4.2 KB', gzippedSize: '1.8 KB' },
    figmaUrl: 'https://figma.com/file/xxx/button',
    githubUrl: 'https://github.com/org/ui/tree/main/button',
    tags: ['button', 'action', 'interactive', 'form'],
    relatedComponents: ['IconButton', 'ButtonGroup', 'LinkButton']
  },
  {
    id: 'input-1',
    name: 'Input',
    displayName: 'Text Input',
    description: 'A flexible text input component with validation, icons, and various states.',
    category: 'inputs',
    subcategory: 'Form Controls',
    framework: 'react',
    status: 'stable',
    version: '3.1.0',
    author: { name: 'Form Team', avatar: 'FT' },
    props: [
      { name: 'type', type: "'text' | 'email' | 'password' | 'number'", required: false, defaultValue: "'text'", description: 'Input type', control: 'select', options: ['text', 'email', 'password', 'number'] },
      { name: 'placeholder', type: 'string', required: false, description: 'Placeholder text', control: 'text' },
      { name: 'value', type: 'string', required: false, description: 'Input value', control: 'text' },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Disabled state', control: 'boolean' },
      { name: 'error', type: 'string', required: false, description: 'Error message', control: 'text' },
      { name: 'leftIcon', type: 'ReactNode', required: false, description: 'Left icon', control: 'text' },
    ],
    variants: [
      { id: 'v-1', name: 'Default', description: 'Default input', props: { placeholder: 'Enter text...' } },
      { id: 'v-2', name: 'With Error', description: 'Input with error state', props: { error: 'This field is required', value: '' } },
      { id: 'v-3', name: 'Disabled', description: 'Disabled input', props: { disabled: true, value: 'Cannot edit' } },
      { id: 'v-4', name: 'With Icon', description: 'Input with search icon', props: { leftIcon: 'search', placeholder: 'Search...' } },
    ],
    examples: [
      { id: 'e-1', title: 'Basic Usage', description: 'Simple text input', code: '<Input placeholder="Enter your name" />', language: 'tsx' },
      { id: 'e-2', title: 'With Validation', description: 'Input with error message', code: '<Input\n  value={email}\n  error={!isValid ? "Invalid email" : undefined}\n/>', language: 'tsx' },
    ],
    accessibility: {
      level: 'AA',
      score: 92,
      features: ['Label association', 'Error announcements', 'Focus management'],
      issues: [{ severity: 'warning', message: 'Consider adding aria-describedby for error messages', wcag: '1.3.1' }]
    },
    dependencies: [{ name: 'react', version: '>=18.0.0', type: 'peer' }],
    changelog: [
      { version: '3.1.0', date: '2024-01-10', changes: ['Added icon support', 'Improved error styling'] },
    ],
    metrics: { downloads: 98000, usage: 76000, stars: 890, issues: 5, bundleSize: '3.1 KB', gzippedSize: '1.4 KB' },
    tags: ['input', 'form', 'text', 'field'],
    relatedComponents: ['Textarea', 'Select', 'Checkbox']
  },
  {
    id: 'card-1',
    name: 'Card',
    displayName: 'Card',
    description: 'A container component for grouping related content with optional header, footer, and actions.',
    category: 'layout',
    subcategory: 'Containers',
    framework: 'react',
    status: 'stable',
    version: '2.0.0',
    author: { name: 'Layout Team', avatar: 'LT' },
    props: [
      { name: 'variant', type: "'default' | 'outlined' | 'elevated'", required: false, defaultValue: "'default'", description: 'Card style variant', control: 'select', options: ['default', 'outlined', 'elevated'] },
      { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", required: false, defaultValue: "'md'", description: 'Internal padding', control: 'select', options: ['none', 'sm', 'md', 'lg'] },
      { name: 'hoverable', type: 'boolean', required: false, defaultValue: 'false', description: 'Enable hover effects', control: 'boolean' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Card content', control: 'text' },
    ],
    variants: [
      { id: 'v-1', name: 'Default', description: 'Basic card', props: { children: 'Card content' } },
      { id: 'v-2', name: 'Elevated', description: 'Card with shadow', props: { variant: 'elevated', children: 'Elevated card' } },
      { id: 'v-3', name: 'Hoverable', description: 'Interactive card', props: { hoverable: true, children: 'Hover me' } },
    ],
    examples: [
      { id: 'e-1', title: 'Basic Card', description: 'Simple card usage', code: '<Card>\n  <CardHeader>Title</CardHeader>\n  <CardContent>Content here</CardContent>\n</Card>', language: 'tsx' },
    ],
    accessibility: { level: 'AA', score: 95, features: ['Semantic HTML', 'Proper heading hierarchy'], issues: [] },
    dependencies: [{ name: 'react', version: '>=18.0.0', type: 'peer' }],
    changelog: [{ version: '2.0.0', date: '2024-01-05', changes: ['New variants', 'Improved styling'] }],
    metrics: { downloads: 145000, usage: 112000, stars: 1560, issues: 2, bundleSize: '2.8 KB', gzippedSize: '1.2 KB' },
    tags: ['card', 'container', 'layout', 'panel'],
    relatedComponents: ['CardHeader', 'CardContent', 'CardFooter']
  },
  {
    id: 'modal-1',
    name: 'Modal',
    displayName: 'Modal Dialog',
    description: 'An accessible modal dialog component with customizable backdrop, animations, and focus management.',
    category: 'overlays',
    subcategory: 'Dialogs',
    framework: 'react',
    status: 'stable',
    version: '4.2.0',
    author: { name: 'Overlay Team', avatar: 'OT' },
    props: [
      { name: 'open', type: 'boolean', required: true, description: 'Control modal visibility', control: 'boolean' },
      { name: 'onClose', type: '() => void', required: true, description: 'Close handler', control: 'text' },
      { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", required: false, defaultValue: "'md'", description: 'Modal size', control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
      { name: 'closeOnBackdrop', type: 'boolean', required: false, defaultValue: 'true', description: 'Close on backdrop click', control: 'boolean' },
      { name: 'closeOnEscape', type: 'boolean', required: false, defaultValue: 'true', description: 'Close on escape key', control: 'boolean' },
    ],
    variants: [
      { id: 'v-1', name: 'Default', description: 'Standard modal', props: { open: true, size: 'md' } },
      { id: 'v-2', name: 'Large', description: 'Large modal', props: { open: true, size: 'lg' } },
      { id: 'v-3', name: 'Full Screen', description: 'Full screen modal', props: { open: true, size: 'full' } },
    ],
    examples: [
      { id: 'e-1', title: 'Basic Modal', description: 'Simple modal usage', code: '<Modal open={isOpen} onClose={() => setIsOpen(false)}>\n  <ModalHeader>Title</ModalHeader>\n  <ModalContent>Content</ModalContent>\n</Modal>', language: 'tsx' },
    ],
    accessibility: { level: 'AAA', score: 100, features: ['Focus trap', 'Escape key', 'ARIA roles', 'Screen reader announcements'], issues: [] },
    dependencies: [{ name: 'react', version: '>=18.0.0', type: 'peer' }, { name: '@radix-ui/react-dialog', version: '^1.0.0', type: 'prod' }],
    changelog: [{ version: '4.2.0', date: '2024-01-12', changes: ['Improved animations', 'Better focus management'] }],
    metrics: { downloads: 87000, usage: 65000, stars: 920, issues: 1, bundleSize: '6.5 KB', gzippedSize: '2.8 KB' },
    tags: ['modal', 'dialog', 'overlay', 'popup'],
    relatedComponents: ['AlertDialog', 'Sheet', 'Drawer']
  },
  {
    id: 'table-1',
    name: 'DataTable',
    displayName: 'Data Table',
    description: 'A powerful data table with sorting, filtering, pagination, and row selection.',
    category: 'data-display',
    subcategory: 'Tables',
    framework: 'react',
    status: 'beta',
    version: '1.5.0-beta',
    author: { name: 'Data Team', avatar: 'DT' },
    props: [
      { name: 'data', type: 'T[]', required: true, description: 'Table data array', control: 'object' },
      { name: 'columns', type: 'Column<T>[]', required: true, description: 'Column definitions', control: 'object' },
      { name: 'sortable', type: 'boolean', required: false, defaultValue: 'true', description: 'Enable sorting', control: 'boolean' },
      { name: 'selectable', type: 'boolean', required: false, defaultValue: 'false', description: 'Enable row selection', control: 'boolean' },
      { name: 'pagination', type: 'boolean', required: false, defaultValue: 'true', description: 'Enable pagination', control: 'boolean' },
    ],
    variants: [
      { id: 'v-1', name: 'Basic', description: 'Simple table', props: { sortable: false, pagination: false } },
      { id: 'v-2', name: 'Full Featured', description: 'All features enabled', props: { sortable: true, selectable: true, pagination: true } },
    ],
    examples: [
      { id: 'e-1', title: 'Basic Table', description: 'Simple data table', code: '<DataTable\n  data={users}\n  columns={columns}\n/>', language: 'tsx' },
    ],
    accessibility: { level: 'AA', score: 88, features: ['Keyboard navigation', 'Screen reader support'], issues: [{ severity: 'info', message: 'Consider adding row announcements', wcag: '4.1.2' }] },
    dependencies: [{ name: 'react', version: '>=18.0.0', type: 'peer' }, { name: '@tanstack/react-table', version: '^8.0.0', type: 'prod' }],
    changelog: [{ version: '1.5.0-beta', date: '2024-01-18', changes: ['Added virtual scrolling', 'Column resizing'] }],
    metrics: { downloads: 45000, usage: 32000, stars: 560, issues: 12, bundleSize: '18.2 KB', gzippedSize: '6.4 KB' },
    tags: ['table', 'data', 'grid', 'list'],
    relatedComponents: ['Table', 'TableRow', 'TableCell']
  },
  {
    id: 'toast-1',
    name: 'Toast',
    displayName: 'Toast Notification',
    description: 'A lightweight notification component for displaying brief messages.',
    category: 'feedback',
    subcategory: 'Notifications',
    framework: 'react',
    status: 'experimental',
    version: '0.9.0',
    author: { name: 'Feedback Team', avatar: 'FB' },
    props: [
      { name: 'type', type: "'success' | 'error' | 'warning' | 'info'", required: false, defaultValue: "'info'", description: 'Toast type', control: 'select', options: ['success', 'error', 'warning', 'info'] },
      { name: 'message', type: 'string', required: true, description: 'Toast message', control: 'text' },
      { name: 'duration', type: 'number', required: false, defaultValue: '5000', description: 'Auto-dismiss duration in ms', control: 'number' },
      { name: 'dismissible', type: 'boolean', required: false, defaultValue: 'true', description: 'Show dismiss button', control: 'boolean' },
    ],
    variants: [
      { id: 'v-1', name: 'Success', description: 'Success toast', props: { type: 'success', message: 'Operation successful!' } },
      { id: 'v-2', name: 'Error', description: 'Error toast', props: { type: 'error', message: 'Something went wrong' } },
      { id: 'v-3', name: 'Warning', description: 'Warning toast', props: { type: 'warning', message: 'Please review your input' } },
    ],
    examples: [
      { id: 'e-1', title: 'Using Toast', description: 'Show a toast notification', code: 'toast.success("Changes saved!")', language: 'tsx' },
    ],
    accessibility: { level: 'A', score: 75, features: ['ARIA live regions'], issues: [{ severity: 'warning', message: 'Ensure sufficient display time', wcag: '2.2.1' }] },
    dependencies: [{ name: 'react', version: '>=18.0.0', type: 'peer' }],
    changelog: [{ version: '0.9.0', date: '2024-01-20', changes: ['Initial experimental release'] }],
    metrics: { downloads: 23000, usage: 18000, stars: 340, issues: 8, bundleSize: '3.8 KB', gzippedSize: '1.6 KB' },
    tags: ['toast', 'notification', 'alert', 'message'],
    relatedComponents: ['Alert', 'Snackbar', 'Banner']
  }
]

const categories: { id: ComponentCategory; name: string; icon: React.ReactNode; count: number }[] = [
  { id: 'buttons', name: 'Buttons', icon: <Box className="w-4 h-4" />, count: 8 },
  { id: 'inputs', name: 'Inputs', icon: <FileCode className="w-4 h-4" />, count: 12 },
  { id: 'layout', name: 'Layout', icon: <Layers className="w-4 h-4" />, count: 15 },
  { id: 'navigation', name: 'Navigation', icon: <Puzzle className="w-4 h-4" />, count: 9 },
  { id: 'data-display', name: 'Data Display', icon: <Grid3X3 className="w-4 h-4" />, count: 11 },
  { id: 'feedback', name: 'Feedback', icon: <MessageSquare className="w-4 h-4" />, count: 7 },
  { id: 'overlays', name: 'Overlays', icon: <Layers className="w-4 h-4" />, count: 6 },
  { id: 'forms', name: 'Forms', icon: <FileCode className="w-4 h-4" />, count: 14 },
]

export default function ComponentLibraryClient({ initialComponents, initialStats }: ComponentLibraryClientProps) {
  const { components, stats } = useUIComponents(initialComponents, initialStats)
  const [activeTab, setActiveTab] = useState('components')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ComponentStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedComponent, setSelectedComponent] = useState<ComponentDoc | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeVariant, setActiveVariant] = useState<string | null>(null)

  const filteredComponents = useMemo(() => {
    let filtered = [...mockComponents]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.displayName.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tags.some(t => t.toLowerCase().includes(query))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    return filtered
  }, [searchQuery, selectedCategory, statusFilter])

  const getStatusColor = (status: ComponentStatus) => {
    const colors: Record<ComponentStatus, string> = {
      'stable': 'bg-green-100 text-green-700',
      'beta': 'bg-blue-100 text-blue-700',
      'experimental': 'bg-orange-100 text-orange-700',
      'deprecated': 'bg-red-100 text-red-700',
    }
    return colors[status]
  }

  const getStatusIcon = (status: ComponentStatus) => {
    const icons: Record<ComponentStatus, React.ReactNode> = {
      'stable': <CheckCircle className="w-3 h-3" />,
      'beta': <Zap className="w-3 h-3" />,
      'experimental': <AlertTriangle className="w-3 h-3" />,
      'deprecated': <XCircle className="w-3 h-3" />,
    }
    return icons[status]
  }

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getAccessibilityColor = (level: string) => {
    const colors: Record<string, string> = {
      'AAA': 'text-green-600 bg-green-100',
      'AA': 'text-blue-600 bg-blue-100',
      'A': 'text-yellow-600 bg-yellow-100',
      'None': 'text-red-600 bg-red-100',
    }
    return colors[level] || 'text-gray-600 bg-gray-100'
  }

  const ComponentCard = ({ component }: { component: ComponentDoc }) => (
    <Card
      className="hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-violet-300 group"
      onClick={() => setSelectedComponent(component)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg text-white">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                {component.displayName}
              </h3>
              <p className="text-xs text-gray-500">{component.category} / {component.subcategory}</p>
            </div>
          </div>
          <Badge className={getStatusColor(component.status)}>
            {getStatusIcon(component.status)}
            <span className="ml-1">{component.status}</span>
          </Badge>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{component.description}</p>

        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {(component.metrics.downloads / 1000).toFixed(0)}K
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {component.metrics.stars}
          </span>
          <span className="flex items-center gap-1">
            <Box className="w-3 h-3" />
            {component.metrics.bundleSize}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{component.framework}</Badge>
            <Badge className={`text-xs ${getAccessibilityColor(component.accessibility.level)}`}>
              <Accessibility className="w-3 h-3 mr-1" />
              {component.accessibility.level}
            </Badge>
          </div>
          <span className="text-xs text-gray-500">v{component.version}</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Puzzle className="w-8 h-8" />
                Component Library
              </h1>
              <p className="text-violet-100 mt-1">Build interfaces with our production-ready components</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-0">
                <Figma className="w-4 h-4 mr-2" />
                Figma Kit
              </Button>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-0">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Button className="bg-white text-violet-600 hover:bg-violet-50">
                <Plus className="w-4 h-4 mr-2" />
                New Component
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg bg-white border-0 shadow-lg rounded-xl text-gray-900"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-6 mt-8">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{mockComponents.length * 12}</div>
              <div className="text-violet-100 text-sm">Components</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{categories.length}</div>
              <div className="text-violet-100 text-sm">Categories</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">98%</div>
              <div className="text-violet-100 text-sm">A11y Score</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">4.9</div>
              <div className="text-violet-100 text-sm">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="components" className="gap-2">
                <Puzzle className="w-4 h-4" />
                Components
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <Grid3X3 className="w-4 h-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="playground" className="gap-2">
                <Play className="w-4 h-4" />
                Playground
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Status</option>
                <option value="stable">Stable</option>
                <option value="beta">Beta</option>
                <option value="experimental">Experimental</option>
                <option value="deprecated">Deprecated</option>
              </select>
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-violet-100 text-violet-700' : 'bg-white dark:bg-gray-800'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-violet-100 text-violet-700' : 'bg-white dark:bg-gray-800'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'bg-violet-600' : ''}
              >
                All Components
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={selectedCategory === cat.id ? 'bg-violet-600' : ''}
                >
                  {cat.icon}
                  <span className="ml-1">{cat.name}</span>
                  <span className="ml-1 text-xs opacity-60">({cat.count})</span>
                </Button>
              ))}
            </div>

            {filteredComponents.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Puzzle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No components found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                  <Button className="bg-violet-600">Browse All</Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredComponents.map(comp => (
                  <ComponentCard key={comp.id} component={comp} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(cat => (
                <Card
                  key={cat.id}
                  className="cursor-pointer hover:shadow-md hover:border-violet-300 transition-all"
                  onClick={() => { setSelectedCategory(cat.id); setActiveTab('components') }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-3 text-violet-600">
                      {cat.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
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
                <Play className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Playground</h3>
                <p className="text-gray-500 mb-4">Select a component to start experimenting with props and variants</p>
                <Button className="bg-violet-600" onClick={() => setActiveTab('components')}>
                  Browse Components
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Component Detail Dialog */}
      <Dialog open={!!selectedComponent} onOpenChange={() => setSelectedComponent(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
          {selectedComponent && (
            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-64 border-r bg-gray-50 dark:bg-gray-900 p-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Variants</h3>
                  {selectedComponent.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setActiveVariant(v.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeVariant === v.id ? 'bg-violet-100 text-violet-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                <DialogHeader className="p-6 border-b">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
                      <Puzzle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <DialogTitle className="text-2xl">{selectedComponent.displayName}</DialogTitle>
                        <Badge className={getStatusColor(selectedComponent.status)}>{selectedComponent.status}</Badge>
                      </div>
                      <p className="text-gray-500 mt-1">v{selectedComponent.version} by {selectedComponent.author.name}</p>
                    </div>
                    <div className="flex gap-2">
                      {selectedComponent.figmaUrl && (
                        <Button variant="outline" size="sm">
                          <Figma className="w-4 h-4 mr-1" />
                          Figma
                        </Button>
                      )}
                      {selectedComponent.githubUrl && (
                        <Button variant="outline" size="sm">
                          <Github className="w-4 h-4 mr-1" />
                          Source
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                <ScrollArea className="flex-1">
                  <Tabs defaultValue="preview" className="p-6">
                    <TabsList className="mb-4">
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="props">Props</TabsTrigger>
                      <TabsTrigger value="code">Code</TabsTrigger>
                      <TabsTrigger value="accessibility">A11y</TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview" className="space-y-6">
                      {/* Canvas */}
                      <div className="border rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b">
                          <span className="text-sm font-medium">Preview</span>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setDarkMode(!darkMode)}>
                              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Smartphone className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Monitor className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className={`p-12 flex items-center justify-center min-h-[200px] ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                          <div className="text-center text-gray-400">
                            <Eye className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Component preview renders here</p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-600">{selectedComponent.description}</p>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Download className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                            <div className="font-bold">{(selectedComponent.metrics.downloads / 1000).toFixed(0)}K</div>
                            <div className="text-xs text-gray-500">Downloads</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Heart className="w-5 h-5 mx-auto text-red-500 mb-1" />
                            <div className="font-bold">{selectedComponent.metrics.stars}</div>
                            <div className="text-xs text-gray-500">Stars</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Box className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                            <div className="font-bold">{selectedComponent.metrics.bundleSize}</div>
                            <div className="text-xs text-gray-500">Bundle</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Accessibility className="w-5 h-5 mx-auto text-green-500 mb-1" />
                            <div className="font-bold">{selectedComponent.accessibility.score}%</div>
                            <div className="text-xs text-gray-500">A11y Score</div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="props" className="space-y-4">
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
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
                                <td className="px-4 py-3">
                                  <code className="text-violet-600">{prop.name}</code>
                                  {prop.required && <span className="text-red-500 ml-1">*</span>}
                                </td>
                                <td className="px-4 py-3">
                                  <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{prop.type}</code>
                                </td>
                                <td className="px-4 py-3 text-gray-500">{prop.defaultValue || '-'}</td>
                                <td className="px-4 py-3 text-gray-600">{prop.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>

                    <TabsContent value="code" className="space-y-4">
                      {selectedComponent.examples.map(ex => (
                        <div key={ex.id} className="border rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b">
                            <div>
                              <span className="font-medium">{ex.title}</span>
                              <p className="text-xs text-gray-500">{ex.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(ex.code, ex.id)}
                            >
                              {copiedCode === ex.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                          <pre className="p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto">
                            <code>{ex.code}</code>
                          </pre>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="accessibility" className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-lg font-bold text-lg ${getAccessibilityColor(selectedComponent.accessibility.level)}`}>
                          WCAG {selectedComponent.accessibility.level}
                        </div>
                        <div>
                          <div className="font-semibold">Score: {selectedComponent.accessibility.score}%</div>
                          <p className="text-sm text-gray-500">Accessibility compliance score</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedComponent.accessibility.features.map((f, i) => (
                            <Badge key={i} variant="outline" className="text-green-600 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {selectedComponent.accessibility.issues.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Issues</h4>
                          <div className="space-y-2">
                            {selectedComponent.accessibility.issues.map((issue, i) => (
                              <div key={i} className={`p-3 rounded-lg flex items-start gap-3 ${
                                issue.severity === 'error' ? 'bg-red-50' :
                                issue.severity === 'warning' ? 'bg-yellow-50' :
                                'bg-blue-50'
                              }`}>
                                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                  issue.severity === 'error' ? 'text-red-500' :
                                  issue.severity === 'warning' ? 'text-yellow-500' :
                                  'text-blue-500'
                                }`} />
                                <div>
                                  <p className="text-sm">{issue.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">WCAG {issue.wcag}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
