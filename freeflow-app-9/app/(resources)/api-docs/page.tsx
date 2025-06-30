'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Code, 
  Copy, 
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

const apiSections = [
  {
    id: 'authentication',
    title: 'Authentication',
    description: 'Secure your API requests with proper authentication'
  },
  {
    id: 'projects',
    title: 'Projects',
    description: 'Manage your creative projects and assets'
  },
  {
    id: 'files',
    title: 'Files',
    description: 'Upload, manage, and organize your media files'
  },
  {
    id: 'ai',
    title: 'AI Generation',
    description: 'Leverage AI for content creation and enhancement'
  }
]

const codeExamples = {
  authentication: {
    curl: `curl -X POST https://api.freeflowzee.com/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "your_password"}'`,
    javascript: `const response = await fetch('https://api.freeflowzee.com/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'your_password'
  })
})

const data = await response.json()`,
    python: `import requests

response = requests.post('https://api.freeflowzee.com/auth/login', 
  json={'email': 'user@example.com', 'password': 'your_password'})
  
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
})

const projects = await response.json()`,
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
  const [activeSection, setActiveSection] = useState('authentication')
  const [activeLanguage, setActiveLanguage] = useState('curl')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleQuickStartAction = (action: string) => {
    switch (action) {
      case "Go to Dashboard":
        window.open('/dashboard', '_blank')
        break
      case "View Example":
        setActiveSection('authentication')
        break
      case "Try API":
        setActiveSection('projects')
        break
      case "Setup Webhooks":
        setActiveSection('webhooks')
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
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">API Documentation</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive API reference for integrating FreeflowZee into your applications
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>API Reference</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    {apiSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    {apiSections.find(s => s.id === activeSection)?.title}
                  </CardTitle>
                  <p className="text-gray-600">
                    {apiSections.find(s => s.id === activeSection)?.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
                    <TabsList>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                    </TabsList>

                    {Object.entries(codeExamples).map(([sectionId, examples]) => (
                      activeSection === sectionId && (
                        <div key={sectionId}>
                          {Object.entries(examples).map(([lang, code]) => (
                            <TabsContent key={lang} value={lang}>
                              <div className="relative">
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                  <code>{code}</code>
                                </pre>
                                <button
                                  onClick={() => copyToClipboard(code, `${sectionId}-${lang}`)}
                                  className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                                >
                                  {copiedCode === `${sectionId}-${lang}` ? (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            </TabsContent>
                          ))}
                        </div>
                      )
                    ))}
                  </Tabs>

                  {/* Additional Documentation */}
                  <div className="mt-8 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Request Parameters</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">
                          All API requests should include proper authentication headers and content-type specifications.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Response Format</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                          All responses are returned in JSON format with appropriate HTTP status codes.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
} 