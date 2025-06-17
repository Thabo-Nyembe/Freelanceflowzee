"use client"

import { useState } from 'react'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText,
  Lightbulb,
  Target,
  ArrowRight,
  Download,
  CheckCircle,
  Clock,
  Users,
  Copy
} from 'lucide-react'
import Link from 'next/link'

export default function ScopeGeneratorPage() {
  const [projectData, setProjectData] = useState({
    projectName: '',
    clientName: '',
    projectType: 'Web Development',
    budget: '$5,000 - $10,000',
    timeline: '4-6 weeks',
    deliverables: '',
    requirements: ''
  })

  const [generatedScope, setGeneratedScope] = useState('')

  const generateScope = () => {
    const scope = `
PROJECT SCOPE DOCUMENT

Project: ${projectData.projectName}
Client: ${projectData.clientName}
Project Type: ${projectData.projectType}
Budget: ${projectData.budget}
Timeline: ${projectData.timeline}

PROJECT OVERVIEW
This document outlines the scope of work for ${projectData.projectName}. The project involves ${projectData.projectType.toLowerCase()} services with a focus on delivering high-quality, professional results within the specified timeline and budget.

DELIVERABLES
${projectData.deliverables || 'To be defined based on project requirements'}

REQUIREMENTS
${projectData.requirements || 'Detailed requirements to be gathered during discovery phase'}

TIMELINE
Project Duration: ${projectData.timeline}
- Discovery & Planning: Week 1
- Design & Development: Week 2-4
- Testing & Revisions: Week 5-6
- Final Delivery: End of Week 6

BUDGET
Total Project Cost: ${projectData.budget}
Payment Schedule:
- 50% upon project commencement
- 25% at milestone completion
- 25% upon final delivery

TERMS & CONDITIONS
- All deliverables remain property of client upon final payment
- Client feedback and approvals required at each milestone
- Additional requests outside scope will incur extra charges
- Project timeline may be extended due to client delays

CONTACT
For questions or clarifications, please contact the project team.
`
    setGeneratedScope(scope)
  }

  const handleInputChange = (field: string, value: string) => {
    setProjectData(prev => ({ ...prev, [field]: value }))
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScope)
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-green-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-green-100 text-green-700">
              <FileText className="w-4 h-4 mr-2" />
              Free Tool • Professional Templates
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Project Scope{' '}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Generator
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Generate detailed project scopes and statements of work in minutes. 
              Protect your projects and set clear expectations with professional documentation.
            </p>
            
            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-green-500" />
                18,500+ Generated
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                5 Minutes Setup
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-purple-500" />
                Professional Quality
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Input Form */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Target className="w-6 h-6 mr-2 text-green-600" />
                  Project Details
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={projectData.projectName}
                      onChange={(e) => handleInputChange('projectName', e.target.value)}
                      placeholder="e.g., Company Website Redesign"
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={projectData.clientName}
                      onChange={(e) => handleInputChange('clientName', e.target.value)}
                      placeholder="e.g., ABC Corporation"
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="projectType">Project Type</Label>
                    <select 
                      id="projectType"
                      value={projectData.projectType}
                      onChange={(e) => handleInputChange('projectType', e.target.value)}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option>Web Development</option>
                      <option>Mobile App</option>
                      <option>Branding & Design</option>
                      <option>Digital Marketing</option>
                      <option>Content Creation</option>
                      <option>Consulting</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="budget">Project Budget</Label>
                    <select 
                      id="budget"
                      value={projectData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option>$1,000 - $2,500</option>
                      <option>$2,500 - $5,000</option>
                      <option>$5,000 - $10,000</option>
                      <option>$10,000 - $25,000</option>
                      <option>$25,000+</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="timeline">Project Timeline</Label>
                    <select 
                      id="timeline"
                      value={projectData.timeline}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option>1-2 weeks</option>
                      <option>2-4 weeks</option>
                      <option>4-6 weeks</option>
                      <option>6-8 weeks</option>
                      <option>2-3 months</option>
                      <option>3+ months</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="deliverables">Key Deliverables</Label>
                    <Textarea
                      id="deliverables"
                      value={projectData.deliverables}
                      onChange={(e) => handleInputChange('deliverables', e.target.value)}
                      placeholder="List the main deliverables for this project..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="requirements">Special Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={projectData.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      placeholder="Any specific requirements or constraints..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    onClick={generateScope}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Generate Project Scope
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Scope */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FileText className="w-6 h-6 mr-2 text-green-600" />
                    Generated Scope
                  </h2>
                  {generatedScope && (
                    <Button size="sm" variant="outline" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  )}
                </div>
                
                {generatedScope ? (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                      {generatedScope}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Fill in the project details and click "Generate Project Scope" to create your professional scope document.
                    </p>
                  </div>
                )}
                
                <div className="mt-8 space-y-4">
                  <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                    <Link href="/signup">
                      Save & Get More Templates
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/resources">
                      <Download className="w-4 h-4 mr-2" />
                      Download Contract Templates
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
} 