'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Database, Table2, BarChart3, LineChart, PieChart, Search, Plus,
  Play, Pause, RefreshCw, Download, Upload, Settings, Code,
  FileJson, FileSpreadsheet, GitBranch, Clock, CheckCircle,
  AlertCircle, Layers, Filter, Share2, Eye, Trash2, Copy
} from 'lucide-react'

const datasets = [
  {
    id: 1,
    name: 'Customer Analytics',
    description: 'Comprehensive customer behavior and demographics data',
    type: 'sql',
    source: 'PostgreSQL',
    rows: 1250000,
    columns: 45,
    lastSync: '2024-01-15 14:30',
    status: 'synced',
    refreshRate: '1 hour',
    owner: 'Analytics Team'
  },
  {
    id: 2,
    name: 'Sales Transactions',
    description: 'Real-time sales data from all channels',
    type: 'stream',
    source: 'Kafka',
    rows: 5670000,
    columns: 28,
    lastSync: '2024-01-15 15:45',
    status: 'syncing',
    refreshRate: 'Real-time',
    owner: 'Sales Ops'
  },
  {
    id: 3,
    name: 'Marketing Campaigns',
    description: 'Campaign performance and attribution data',
    type: 'api',
    source: 'Marketing API',
    rows: 89000,
    columns: 32,
    lastSync: '2024-01-15 12:00',
    status: 'synced',
    refreshRate: '6 hours',
    owner: 'Marketing'
  },
  {
    id: 4,
    name: 'Product Inventory',
    description: 'Stock levels and warehouse data',
    type: 'csv',
    source: 'File Upload',
    rows: 15600,
    columns: 18,
    lastSync: '2024-01-14 09:00',
    status: 'stale',
    refreshRate: 'Manual',
    owner: 'Operations'
  },
  {
    id: 5,
    name: 'User Sessions',
    description: 'Website and app session analytics',
    type: 'sql',
    source: 'ClickHouse',
    rows: 12400000,
    columns: 52,
    lastSync: '2024-01-15 15:30',
    status: 'synced',
    refreshRate: '15 mins',
    owner: 'Product'
  },
]

const queries = [
  { id: 1, name: 'Monthly Revenue Report', dataset: 'Sales Transactions', lastRun: '2024-01-15', runtime: '2.3s', status: 'completed' },
  { id: 2, name: 'Customer Cohort Analysis', dataset: 'Customer Analytics', lastRun: '2024-01-15', runtime: '5.1s', status: 'completed' },
  { id: 3, name: 'Campaign ROI Calculator', dataset: 'Marketing Campaigns', lastRun: '2024-01-14', runtime: '1.8s', status: 'completed' },
  { id: 4, name: 'Inventory Alerts', dataset: 'Product Inventory', lastRun: '2024-01-15', runtime: '0.9s', status: 'running' },
  { id: 5, name: 'Session Funnel Analysis', dataset: 'User Sessions', lastRun: '2024-01-15', runtime: '8.2s', status: 'failed' },
]

const visualizations = [
  { id: 1, name: 'Revenue Dashboard', type: 'dashboard', charts: 8, views: 1245, shared: true },
  { id: 2, name: 'Customer Segmentation', type: 'chart', charts: 1, views: 567, shared: true },
  { id: 3, name: 'Sales Funnel', type: 'chart', charts: 1, views: 890, shared: false },
  { id: 4, name: 'Marketing KPIs', type: 'dashboard', charts: 6, views: 432, shared: true },
]

export default function DataStudioClient() {
  const [activeTab, setActiveTab] = useState('datasets')
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')

  const stats = useMemo(() => ({
    totalDatasets: datasets.length,
    totalRows: datasets.reduce((sum, d) => sum + d.rows, 0),
    syncedDatasets: datasets.filter(d => d.status === 'synced').length,
    totalQueries: queries.length,
  }), [])

  const filteredDatasets = useMemo(() => {
    return datasets.filter(dataset => {
      const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           dataset.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSource = sourceFilter === 'all' || dataset.type === sourceFilter
      return matchesSearch && matchesSource
    })
  }, [searchQuery, sourceFilter])

  const getStatusBadge = (status: string) => {
    const styles = {
      synced: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      syncing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      stale: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    const icons = {
      synced: <CheckCircle className="h-3 w-3 mr-1" />,
      syncing: <RefreshCw className="h-3 w-3 mr-1 animate-spin" />,
      stale: <Clock className="h-3 w-3 mr-1" />,
      error: <AlertCircle className="h-3 w-3 mr-1" />,
    }
    return (
      <Badge variant="outline" className={`${styles[status as keyof typeof styles]} flex items-center`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'sql': return <Database className="h-5 w-5" />
      case 'stream': return <GitBranch className="h-5 w-5" />
      case 'api': return <Code className="h-5 w-5" />
      case 'csv': return <FileSpreadsheet className="h-5 w-5" />
      default: return <Table2 className="h-5 w-5" />
    }
  }

  const insights = [
    { icon: Database, title: `${stats.totalDatasets}`, description: 'Connected datasets' },
    { icon: Table2, title: `${(stats.totalRows / 1000000).toFixed(1)}M`, description: 'Total rows' },
    { icon: CheckCircle, title: `${stats.syncedDatasets}/${stats.totalDatasets}`, description: 'Synced' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            Data Studio
          </h1>
          <p className="text-muted-foreground mt-1">Connect, transform, and visualize your data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Connection
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Data Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Sources</p>
                <p className="text-2xl font-bold">{stats.totalDatasets}</p>
                <p className="text-xs text-green-600 mt-1">+2 this week</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{(stats.totalRows / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground mt-1">Across all datasets</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Table2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saved Queries</p>
                <p className="text-2xl font-bold">{stats.totalQueries}</p>
                <p className="text-xs text-muted-foreground mt-1">Ready to run</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Code className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visualizations</p>
                <p className="text-2xl font-bold">{visualizations.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Dashboards & charts</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="queries">Queries</TabsTrigger>
          <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
          <TabsTrigger value="transforms">Transforms</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Connected Datasets</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search datasets..."
                      className="pl-9 w-48"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Source type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="sql">SQL Database</SelectItem>
                      <SelectItem value="stream">Streaming</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="csv">File Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDatasets.map((dataset) => (
                  <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {getSourceIcon(dataset.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{dataset.name}</span>
                          {getStatusBadge(dataset.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{dataset.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{dataset.source}</span>
                          <span>{dataset.rows.toLocaleString()} rows</span>
                          <span>{dataset.columns} columns</span>
                          <span>Refresh: {dataset.refreshRate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queries" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Saved Queries</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Query
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {queries.map((query) => (
                  <div key={query.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Code className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{query.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{query.dataset}</span>
                          <span>Last run: {query.lastRun}</span>
                          <span>Runtime: {query.runtime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={query.status === 'completed' ? 'default' : query.status === 'running' ? 'secondary' : 'destructive'}>
                        {query.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualizations" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Dashboards & Charts</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Visualization
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visualizations.map((viz) => (
                  <div key={viz.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {viz.type === 'dashboard' ? (
                          <Layers className="h-5 w-5 text-purple-600" />
                        ) : (
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                        )}
                        <span className="font-semibold">{viz.name}</span>
                      </div>
                      {viz.shared && (
                        <Badge variant="outline" className="text-xs">
                          <Share2 className="h-3 w-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{viz.charts} {viz.type === 'dashboard' ? 'charts' : 'chart'}</span>
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {viz.views} views
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transforms" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Transforms</CardTitle>
              <CardDescription>Create and manage data transformation pipelines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Build Your First Transform</h3>
                <p className="text-muted-foreground mb-4">
                  Create data pipelines to clean, transform, and prepare your data
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Transform
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
