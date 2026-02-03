'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Code, Book, Search, Copy, Play, CheckCircle, Terminal, FileJson,
  Lock, Unlock, ChevronRight, ExternalLink, Zap, Shield, Globe,
  Key, Server, Database, Webhook, Settings
} from 'lucide-react'

const apiEndpoints = [
  {
    category: 'Authentication',
    icon: Lock,
    endpoints: [
      { method: 'POST', path: '/api/auth/login', description: 'Authenticate user', auth: false },
      { method: 'POST', path: '/api/auth/register', description: 'Create new account', auth: false },
      { method: 'POST', path: '/api/auth/logout', description: 'End session', auth: true },
      { method: 'GET', path: '/api/auth/me', description: 'Get current user', auth: true },
      { method: 'POST', path: '/api/auth/refresh', description: 'Refresh access token', auth: true },
    ]
  },
  {
    category: 'Projects',
    icon: Database,
    endpoints: [
      { method: 'GET', path: '/api/projects', description: 'List all projects', auth: true },
      { method: 'POST', path: '/api/projects', description: 'Create project', auth: true },
      { method: 'GET', path: '/api/projects/:id', description: 'Get project details', auth: true },
      { method: 'PATCH', path: '/api/projects/:id', description: 'Update project', auth: true },
      { method: 'DELETE', path: '/api/projects/:id', description: 'Delete project', auth: true },
    ]
  },
  {
    category: 'Invoices',
    icon: FileJson,
    endpoints: [
      { method: 'GET', path: '/api/invoices', description: 'List invoices', auth: true },
      { method: 'POST', path: '/api/invoices', description: 'Create invoice', auth: true },
      { method: 'GET', path: '/api/invoices/:id', description: 'Get invoice', auth: true },
      { method: 'POST', path: '/api/invoices/:id/send', description: 'Send invoice email', auth: true },
      { method: 'POST', path: '/api/invoices/:id/pay', description: 'Process payment', auth: true },
    ]
  },
  {
    category: 'Webhooks',
    icon: Webhook,
    endpoints: [
      { method: 'GET', path: '/api/webhooks', description: 'List webhooks', auth: true },
      { method: 'POST', path: '/api/webhooks', description: 'Register webhook', auth: true },
      { method: 'DELETE', path: '/api/webhooks/:id', description: 'Remove webhook', auth: true },
      { method: 'POST', path: '/api/webhooks/:id/test', description: 'Test webhook', auth: true },
    ]
  },
  {
    category: 'AI Services',
    icon: Zap,
    endpoints: [
      { method: 'POST', path: '/api/ai/generate', description: 'Generate content', auth: true },
      { method: 'POST', path: '/api/ai/transcribe', description: 'Transcribe audio/video', auth: true },
      { method: 'POST', path: '/api/ai/analyze', description: 'Analyze document', auth: true },
      { method: 'POST', path: '/api/ai/chat', description: 'AI chat completion', auth: true },
    ]
  },
]

const codeExamples = {
  authentication: `// Authenticate with API
const response = await fetch('https://api.kazi.app/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'your-password'
  })
});

const { access_token, refresh_token } = await response.json();`,
  projects: `// List all projects
const response = await fetch('https://api.kazi.app/projects', {
  headers: {
    'Authorization': \`Bearer \${access_token}\`,
    'Content-Type': 'application/json'
  }
});

const projects = await response.json();`,
  webhooks: `// Register a webhook
const response = await fetch('https://api.kazi.app/webhooks', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${access_token}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://your-server.com/webhook',
    events: ['invoice.paid', 'project.created'],
    secret: 'your-webhook-secret'
  })
});`
}

export default function ApiDocsClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  const filteredEndpoints = useMemo(() => {
    if (!searchQuery) return apiEndpoints
    return apiEndpoints.map(category => ({
      ...category,
      endpoints: category.endpoints.filter(endpoint =>
        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.endpoints.length > 0)
  }, [searchQuery])

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const getMethodBadge = (method: string) => {
    const styles = {
      GET: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      PATCH: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      PUT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return <Badge variant="outline" className={`${styles[method as keyof typeof styles]} font-mono`}>{method}</Badge>
  }

  const insights = [
    { icon: Server, title: '250+ Endpoints', description: 'Full REST API' },
    { icon: Shield, title: 'OAuth 2.0', description: 'Secure authentication' },
    { icon: Zap, title: '99.9% Uptime', description: 'API reliability' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Code className="h-8 w-8 text-primary" />
            API Documentation
          </h1>
          <p className="text-muted-foreground mt-1">Integrate KAZI into your applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </Button>
          <Button>
            <ExternalLink className="h-4 w-4 mr-2" />
            Full Docs
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="API Overview"
        insights={insights}
        defaultExpanded={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search endpoints..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-2 space-y-1">
                  {filteredEndpoints.map((category) => (
                    <div key={category.category} className="mb-4">
                      <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                        <category.icon className="h-4 w-4" />
                        {category.category}
                      </div>
                      {category.endpoints.map((endpoint) => (
                        <button
                          key={endpoint.path}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-muted/50 transition-colors ${
                            selectedEndpoint === endpoint.path ? 'bg-primary/10' : ''
                          }`}
                          onClick={() => setSelectedEndpoint(endpoint.path)}
                        >
                          <div className="flex items-center gap-2">
                            {getMethodBadge(endpoint.method)}
                            <span className="font-mono text-xs truncate max-w-[120px]">{endpoint.path}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
              <TabsTrigger value="examples">Code Examples</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Quick start guide for the KAZI API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Base URL</h4>
                    <code className="text-sm bg-muted px-3 py-1 rounded">https://api.kazi.app/v1</code>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <Globe className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="font-medium">RESTful API</p>
                      <p className="text-sm text-muted-foreground">Standard HTTP methods</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <Shield className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="font-medium">OAuth 2.0</p>
                      <p className="text-sm text-muted-foreground">Bearer token auth</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <FileJson className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="font-medium">JSON Format</p>
                      <p className="text-sm text-muted-foreground">Request & response</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Rate Limits</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Standard</p>
                        <p className="font-semibold">1,000 requests/hour</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Enterprise</p>
                        <p className="font-semibold">10,000 requests/hour</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {apiEndpoints.map((category) => (
                      <div key={category.category} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <category.icon className="h-5 w-5 text-primary" />
                          <h4 className="font-medium">{category.category}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{category.endpoints.length} endpoints</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="authentication" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>Secure your API requests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                      <Lock className="h-5 w-5" />
                      <span className="font-medium">All API requests require authentication</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Using Bearer Tokens</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono">
{`Authorization: Bearer your_access_token`}
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Example: Login Request</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(codeExamples.authentication)}
                      >
                        {copiedCode ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono whitespace-pre-wrap">
                        {codeExamples.authentication}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Code Examples</CardTitle>
                  <CardDescription>Common API usage patterns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">List Projects</h4>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Try it
                      </Button>
                    </div>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono whitespace-pre-wrap">
                        {codeExamples.projects}
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Register Webhook</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono whitespace-pre-wrap">
                        {codeExamples.webhooks}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhooks" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Events</CardTitle>
                  <CardDescription>Real-time event notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { event: 'invoice.created', description: 'When a new invoice is created' },
                      { event: 'invoice.paid', description: 'When an invoice is marked as paid' },
                      { event: 'project.created', description: 'When a new project is created' },
                      { event: 'project.completed', description: 'When a project is completed' },
                      { event: 'escrow.funded', description: 'When escrow is funded' },
                      { event: 'escrow.released', description: 'When escrow funds are released' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{item.event}</code>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
