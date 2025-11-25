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
  Mail,
  Sparkles,
  Copy,
  Send,
  Loader2,
  CheckCircle,
  FileText,
  MessageSquare
} from 'lucide-react'
import { useContentGeneration } from '@/lib/hooks/use-kazi-ai'

const EMAIL_TEMPLATES = [
  {
    id: 'proposal',
    name: 'Project Proposal',
    description: 'Professional proposal for new projects',
    icon: FileText,
    color: 'purple'
  },
  {
    id: 'follow-up',
    name: 'Follow-up Email',
    description: 'Check in with clients',
    icon: MessageSquare,
    color: 'blue'
  },
  {
    id: 'update',
    name: 'Project Update',
    description: 'Status updates and progress reports',
    icon: CheckCircle,
    color: 'green'
  },
  {
    id: 'inquiry',
    name: 'Initial Inquiry',
    description: 'Respond to client inquiries',
    icon: Mail,
    color: 'orange'
  },
  {
    id: 'thank-you',
    name: 'Thank You',
    description: 'Show appreciation to clients',
    icon: Sparkles,
    color: 'pink'
  }
]

export function SmartEmailTemplates() {
  const { generateEmail, loading } = useContentGeneration()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [generatedEmail, setGeneratedEmail] = useState<string>('')

  const [formData, setFormData] = useState({
    recipient: '',
    context: '',
    tone: 'professional' as 'professional' | 'friendly' | 'formal'
  })

  const handleGenerate = async () => {
    if (!selectedTemplate || !formData.recipient || !formData.context) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const result = await generateEmail({
        type: selectedTemplate as any,
        recipient: formData.recipient,
        context: formData.context,
        tone: formData.tone
      })

      setGeneratedEmail(result.response)

      toast.success('Email generated', {
        description: 'Review and customize before sending'
      })
    } catch (error) {
      toast.error('Generation failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEmail)
    toast.success('Copied to clipboard', {
      description: 'Email ready to paste'
    })
  }

  const getTemplateColor = (color: string) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-700 border-purple-300',
      blue: 'bg-blue-100 text-blue-700 border-blue-300',
      green: 'bg-green-100 text-green-700 border-green-300',
      orange: 'bg-orange-100 text-orange-700 border-orange-300',
      pink: 'bg-pink-100 text-pink-700 border-pink-300'
    }
    return colors[color as keyof typeof colors] || colors.purple
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Smart Email Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {EMAIL_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                  selectedTemplate === template.id
                    ? getTemplateColor(template.color)
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <template.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                    <p className="text-xs opacity-80">{template.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedTemplate && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipient">Recipient Name *</Label>
                  <Input
                    id="recipient"
                    placeholder="John Smith"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="tone">Email Tone *</Label>
                  <select
                    id="tone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="context">Context / Details *</Label>
                <Textarea
                  id="context"
                  placeholder="Provide context about the email (project details, what you want to communicate, etc.)"
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  rows={4}
                />
              </div>

              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Email...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Email
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Email */}
      {generatedEmail && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Generated Email
              </CardTitle>
              <div className="flex gap-2">
                <Button onClick={handleCopy} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="whitespace-pre-wrap text-gray-800">{generatedEmail}</div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Review and customize the email before sending. Add personal touches to make it more authentic.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tips for Better Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Provide specific context for more relevant emails</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Choose the tone that matches your relationship with the client</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Always review and personalize AI-generated content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Add specific details, dates, and numbers to make it more authentic</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
