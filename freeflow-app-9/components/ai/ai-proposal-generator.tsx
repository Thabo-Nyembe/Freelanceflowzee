'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  FileText,
  Download,
  Copy,
  Loader2,
  CheckCircle,
  Sparkles,
  DollarSign,
  Clock
} from 'lucide-react'
import { useContentGeneration } from '@/lib/hooks/use-kazi-ai'

export function AIProposalGenerator() {
  const { generateProposal, loading } = useContentGeneration()
  const [generatedProposal, setGeneratedProposal] = useState<string>('')

  const [formData, setFormData] = useState({
    clientName: '',
    projectType: '',
    budget: '',
    timeline: '',
    scope: [''],
    deliverables: ['']
  })

  const addScopeItem = () => {
    setFormData({ ...formData, scope: [...formData.scope, ''] })
  }

  const removeScopeItem = (index: number) => {
    const newScope = formData.scope.filter((_, i) => i !== index)
    setFormData({ ...formData, scope: newScope })
  }

  const updateScopeItem = (index: number, value: string) => {
    const newScope = [...formData.scope]
    newScope[index] = value
    setFormData({ ...formData, scope: newScope })
  }

  const addDeliverableItem = () => {
    setFormData({ ...formData, deliverables: [...formData.deliverables, ''] })
  }

  const removeDeliverableItem = (index: number) => {
    const newDeliverables = formData.deliverables.filter((_, i) => i !== index)
    setFormData({ ...formData, deliverables: newDeliverables })
  }

  const updateDeliverableItem = (index: number, value: string) => {
    const newDeliverables = [...formData.deliverables]
    newDeliverables[index] = value
    setFormData({ ...formData, deliverables: newDeliverables })
  }

  const handleGenerate = async () => {
    if (!formData.clientName || !formData.projectType || !formData.budget || !formData.timeline) {
      toast.error('Please fill in all required fields')
      return
    }

    const validScope = formData.scope.filter(s => s.trim() !== '')
    const validDeliverables = formData.deliverables.filter(d => d.trim() !== '')

    if (validScope.length === 0 || validDeliverables.length === 0) {
      toast.error('Please add at least one scope item and deliverable')
      return
    }

    try {
      const result = await generateProposal({
        clientName: formData.clientName,
        projectType: formData.projectType,
        scope: validScope,
        timeline: formData.timeline,
        budget: parseFloat(formData.budget),
        deliverables: validDeliverables
      })

      setGeneratedProposal(result.response)

      toast.success('Proposal generated', {
        description: 'Review and customize before sending'
      })
    } catch (error) {
      toast.error('Generation failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedProposal)
    toast.success('Copied to clipboard')
  }

  const handleDownload = () => {
    const blob = new Blob([generatedProposal], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proposal-${formData.clientName.replace(/\s+/g, '-').toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Proposal downloaded')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            AI Proposal Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  placeholder="Acme Corporation"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="projectType">Project Type *</Label>
                <Input
                  id="projectType"
                  placeholder="E-commerce Website Development"
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="budget">Budget (USD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="budget"
                    type="number"
                    placeholder="15000"
                    className="pl-10"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timeline">Timeline *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="timeline"
                    placeholder="6 weeks"
                    className="pl-10"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scope of Work */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Scope of Work *</h3>
              <Button onClick={addScopeItem} variant="outline" size="sm">
                + Add Item
              </Button>
            </div>

            {formData.scope.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="e.g., Design and develop responsive homepage"
                  value={item}
                  onChange={(e) => updateScopeItem(index, e.target.value)}
                />
                {formData.scope.length > 1 && (
                  <Button
                    onClick={() => removeScopeItem(index)}
                    variant="ghost"
                    size="sm"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Deliverables */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Deliverables *</h3>
              <Button onClick={addDeliverableItem} variant="outline" size="sm">
                + Add Item
              </Button>
            </div>

            {formData.deliverables.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="e.g., Fully functional e-commerce website"
                  value={item}
                  onChange={(e) => updateDeliverableItem(index, e.target.value)}
                />
                {formData.deliverables.length > 1 && (
                  <Button
                    onClick={() => removeDeliverableItem(index)}
                    variant="ghost"
                    size="sm"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Proposal...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Proposal
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Proposal */}
      {generatedProposal && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Generated Proposal
              </CardTitle>
              <div className="flex gap-2">
                <Button onClick={handleCopy} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-white rounded-lg border border-gray-200 max-h-[600px] overflow-y-auto">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {generatedProposal}
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Review the proposal and add personal touches</li>
                <li>• Customize pricing and payment terms</li>
                <li>• Add your branding and contact information</li>
                <li>• Send to client or save as PDF</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
