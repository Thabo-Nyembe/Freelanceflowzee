'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Code,
  Search,
  Book,
  Key,
  Globe,
  Shield,
  Zap,
  FileText,
  Settings,
  Database,
  ArrowRight,
  ExternalLink,
  Copy,
  CheckCircle,
  Play,
  Download,
  Terminal,
  Webhook,
  Lock,
  Users
} from 'lucide-react'

const apiSections = [
  {
    id: 'authentication',
    title: 'Authentication',
    icon: Key,
    description: 'Secure API access with API keys and OAuth',
    endpoints: [
      { method: 'POST', path: '/auth/token', description: 'Generate access token' },
      { method: 'POST', path: '/auth/refresh', description: 'Refresh access token' },
      { method: 'DELETE', path: '/auth/revoke', description: 'Revoke access token' }
    ]
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: FileText,
    description: 'Manage projects and file uploads',
    endpoints: [
      { method: 'GET', path: '/projects', description: 'List all projects' },
      { method: 'POST', path: '/projects', description: 'Create new project' },
      { method: 'GET', path: '/projects/{id}', description: 'Get project details' },
      { method: 'PUT', path: '/projects/{id}', description: 'Update project' },
      { method: 'DELETE', path: '/projects/{id}', description: 'Delete project' }
    ]
  },
  {
    id: 'files',
    title: 'File Management',
    icon: Database,
    description: 'Upload, organize, and manage files',
    endpoints: [
      { method: 'POST', path: '/files/upload', description: 'Upload file' },
      { method: 'GET', path: '/files/{id}', description: 'Get file details' },
      { method: 'DELETE', path: '/files/{id}', description: 'Delete file' },
      { method: 'GET', path: '/files/{id}/download', description: 'Download file' }
    ]
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: Settings,
    description: 'Process payments and manage invoices',
    endpoints: [
      { method: 'POST', path: '/payments/create', description: 'Create payment link' },
      { method: 'GET', path: '/payments/{id}', description: 'Get payment status' },
      { method: 'POST', path: '/invoices', description: 'Create invoice' },
      { method: 'GET', path: '/invoices/{id}', description: 'Get invoice details' }
    ]
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    icon: Webhook,
    description: 'Real-time event notifications',
    endpoints: [
      { method: 'POST', path: '/webhooks', description: 'Create webhook' },
      { method: 'GET', path: '/webhooks', description: 'List webhooks' },
      { method: 'DELETE', path: '/webhooks/{id}', description: 'Delete webhook' }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: Globe,
    description: 'Access usage and performance data',
    endpoints: [
      { method: 'GET', path: '/analytics/projects', description: 'Project analytics' },
      { method: 'GET', path: '/analytics/payments', description: 'Payment analytics' },
      { method: 'GET', path: '/analytics/usage', description: 'API usage stats' }
    ]
  }
]

const codeExamples = {
  authentication: {
    curl: `curl -X POST https://api.freeflowzee.com/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "your_api_key",
    "scope": "projects:read projects:write"
  }'`,
    javascript: `const response = await fetch('https://api.freeflowzee.com/auth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    api_key: 'your_api_key',
    scope: 'projects:read projects:write'
  })
});

const data = await response.json();`,
    python: `import requests

response = requests.post('https://api.freeflowzee.com/auth/token', 
  json={
    'api_key': 'your_api_key',
    'scope': 'projects:read projects:write'
  }
)

data = response.json()`
  },
  projects: {
    curl: `curl -X GET https://api.freeflowzee.com/projects \\
  -H "Authorization: Bearer your_access_token" \\
  -H "Content-Type: application/json"`,
    javascript: `const response = await fetch('https://api.freeflowzee.com/projects', {
  headers: {
    'Authorization': 'Bearer your_access_token',
    'Content-Type': 'application/json'
  }
});

const projects = await response.json();`,
    python: `import requests

headers = {
  'Authorization': 'Bearer your_access_token',
  'Content-Type': 'application/json'
}

response = requests.get('https://api.freeflowzee.com/projects', headers=headers)
projects = response.json()`
  }
}

const quickStart = [
  {
    step: 1,
    title: "Get API Key",
    description: "Generate your API key from the dashboard",
    action: "Go to Dashboard"
  },
  {
    step: 2,
    title: "Authenticate",
    description: "Use your API key to get an access token",
    action: "View Example"
  },
  {
    step: 3,
    title: "Make Requests",
    description: "Start making API calls to manage your projects",
    action: "Try API"
  },
  {
    step: 4,
    title: "Handle Webhooks",
    description: "Set up webhooks for real-time notifications",
    action: "Setup Webhooks"
  }
]

const sdks = [
  { name: 'JavaScript/Node.js', status: 'Available', link: '#' },
  { name: 'Python', status: 'Available', link: '#' },
  { name: 'PHP', status: 'Available', link: '#' },
  { name: 'Ruby', status: 'Coming Soon', link: '#' },
  { name: 'Go', status: 'Coming Soon', link: '#' },
  { name: 'Java', status: 'Coming Soon', link: '#' }
]

export default function ApiDocsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSection, setSelectedSection] = useState('authentication')
  const [selectedLanguage, setSelectedLanguage] = useState('curl')
  const [copiedCode, setCopiedCode] = useState('')

  const filteredSections = apiSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.endpoints.some(endpoint => 
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const selectedSectionData = apiSections.find(section => section.id === selectedSection)
  const currentCodeExample = codeExamples[selectedSection as keyof typeof codeExamples]

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const handleQuickStartAction = (action: string) => {
    switch (action) {
      case "Go to Dashboard":
        window.open('/dashboard', '_blank')
        break
      case "View Example":
        setSelectedSection('authentication')
        break
      case "Try API":
        setSelectedSection('projects')
        break
      case "Setup Webhooks":
        setSelectedSection('webhooks')
        break
      default:
        alert(`${action} functionality coming soon!`)
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800'
      case 'POST': return 'bg-blue-100 text-blue-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 to-blue-900 py-16 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Code className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h1 className="text-4xl font-bold mb-4">
                FreeflowZee API Documentation
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Integrate FreeflowZee into your applications with our powerful REST API. 
                Manage projects, process payments, and automate workflows programmatically.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/signup">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Key className="w-5 h-5 mr-2" />
                    Get API Key
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                  <Download className="w-5 h-5 mr-2" />
                  Download SDKs
                </Button>
              </div>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search API endpoints..."
                  className="pl-12 pr-4 py-3 text-lg bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-blue-400 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Start</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get up and running with the FreeflowZee API in just a few steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStart.map((item, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="group-hover:bg-blue-600 group-hover:text-white transition-colors"
                      onClick={() => handleQuickStartAction(item.action)}
                    >
                      {item.action}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">API Reference</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Complete reference for all available endpoints and methods.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-2">
                  {filteredSections.map((section) => (
                    <Button
                      key={section.id}
                      variant={selectedSection === section.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedSection(section.id)}
                    >
                      <section.icon className="w-4 h-4 mr-2" />
                      {section.title}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-2">
                {selectedSectionData && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center mb-4">
                        <selectedSectionData.icon className="w-6 h-6 text-blue-600 mr-3" />
                        <div>
                          <CardTitle className="text-2xl">{selectedSectionData.title}</CardTitle>
                          <CardDescription className="text-lg">{selectedSectionData.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Endpoints */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Endpoints</h3>
                        <div className="space-y-3">
                          {selectedSectionData.endpoints.map((endpoint, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <Badge className={`mr-3 ${getMethodColor(endpoint.method)}`}>
                                  {endpoint.method}
                                </Badge>
                                <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
                              </div>
                              <span className="text-sm text-gray-600">{endpoint.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Code Examples */}
                      {currentCodeExample && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Code Examples</h3>
                          
                          {/* Language Tabs */}
                          <div className="flex space-x-2 mb-4">
                            {Object.keys(currentCodeExample).map((lang) => (
                              <Button
                                key={lang}
                                size="sm"
                                variant={selectedLanguage === lang ? "default" : "outline"}
                                onClick={() => setSelectedLanguage(lang)}
                              >
                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                              </Button>
                            ))}
                          </div>

                          {/* Code Block */}
                          <div className="relative">
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{currentCodeExample[selectedLanguage as keyof typeof currentCodeExample]}</code>
                            </pre>
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                              onClick={() => copyToClipboard(currentCodeExample[selectedLanguage as keyof typeof currentCodeExample])}
                            >
                              {copiedCode === currentCodeExample[selectedLanguage as keyof typeof currentCodeExample] ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SDKs and Libraries */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">SDKs & Libraries</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Official SDKs and community libraries to get you started quickly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sdks.map((sdk, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{sdk.name}</h3>
                      <Badge 
                        variant={sdk.status === 'Available' ? 'default' : 'secondary'}
                        className={sdk.status === 'Available' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {sdk.status}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled={sdk.status !== 'Available'}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {sdk.status === 'Available' ? 'Download' : 'Coming Soon'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Need Help with the API?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Our developer support team is here to help you integrate successfully.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/support">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Users className="w-5 h-5 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <Link href="/community">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Join Community
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 