'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ProjectData {
  title: string
  description: string
  client_name: string
  budget: string
  start_date: string
  end_date: string
  priority: string
  category: string
  team_members: string[]
  initial_files: File[]
  milestones: { title: string; amount: string; dueDate: string }[]
  permissions: 'private' | 'team' | 'public'
}

interface Props {
  isOpen: boolean
  onClose: () => void
  projectData: ProjectData
  onProjectDataChange: (data: ProjectData) => void
  onSubmit: () => void
  wizardStep: number
  setWizardStep: (step: number) => void
}

export function ProjectCreationWizard({
  isOpen,
  onClose,
  projectData,
  onProjectDataChange,
  onSubmit,
  wizardStep,
  setWizardStep
}: Props) {
  if (!isOpen) return null

  const handleClose = () => {
    setWizardStep(1)
    onClose()
  }

  const updateField = (field: keyof ProjectData, value: any) => {
    onProjectDataChange({ ...projectData, [field]: value })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl bg-white my-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Create New Project</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>

          {/* WIZARD PROGRESS INDICATOR - USER MANUAL SPEC */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              {[
                { step: 1, label: '1. Project Details' },
                { step: 2, label: '2. Project Setup' },
                { step: 3, label: '3. Review & Create' }
              ].map(({ step, label }) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={cn(
                    "flex items-center gap-2",
                    step === wizardStep ? "text-blue-600 font-semibold" :
                    step < wizardStep ? "text-green-600" : "text-gray-400"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      step === wizardStep ? "bg-blue-600 text-white" :
                      step < wizardStep ? "bg-green-600 text-white" : "bg-gray-200"
                    )}>
                      {step < wizardStep ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    <span className="text-sm hidden md:block">{label}</span>
                  </div>
                  {step < 3 && (
                    <div className={cn(
                      "h-1 flex-1 mx-2",
                      step < wizardStep ? "bg-green-600" : "bg-gray-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* STEP 1: PROJECT DETAILS */}
          {wizardStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Project Title * <span className="text-xs text-gray-500">(Clear, descriptive name)</span>
                  </label>
                  <Input
                    value={projectData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="E.g., E-commerce Website Redesign"
                    data-testid="project-title-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Client Information * <span className="text-xs text-gray-500">(Add or select)</span>
                  </label>
                  <Input
                    value={projectData.client_name}
                    onChange={(e) => updateField('client_name', e.target.value)}
                    placeholder="Enter client name..."
                    data-testid="client-name-input"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description * <span className="text-xs text-gray-500">(Explain scope and goals)</span>
                </label>
                <Textarea
                  value={projectData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe what needs to be accomplished in this project..."
                  rows={4}
                  data-testid="project-description-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Budget ($) <span className="text-xs text-gray-500">(Value and payment terms)</span>
                  </label>
                  <Input
                    type="number"
                    value={projectData.budget}
                    onChange={(e) => updateField('budget', e.target.value)}
                    placeholder="0.00"
                    data-testid="project-budget-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Priority <span className="text-xs text-gray-500">(Low, medium, high, urgent)</span>
                  </label>
                  <select
                    value={projectData.priority}
                    onChange={(e) => updateField('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="project-priority-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Start Date <span className="text-xs text-gray-500">(Timeline start)</span>
                  </label>
                  <Input
                    type="date"
                    value={projectData.start_date}
                    onChange={(e) => updateField('start_date', e.target.value)}
                    data-testid="project-start-date-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    End Date <span className="text-xs text-gray-500">(Timeline end)</span>
                  </label>
                  <Input
                    type="date"
                    value={projectData.end_date}
                    onChange={(e) => updateField('end_date', e.target.value)}
                    data-testid="project-end-date-input"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PROJECT SETUP */}
          {wizardStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Configuration</h3>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Add Team Members <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <Input
                  placeholder="Enter email addresses (comma separated)"
                  onChange={(e) => updateField('team_members', e.target.value.split(',').map(email => email.trim()).filter(Boolean))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {projectData.team_members.length > 0 ?
                    `${projectData.team_members.length} member(s) added` :
                    'No team members added yet'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Upload Initial Files or Briefs <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      if (e.target.files) {
                        updateField('initial_files', Array.from(e.target.files))
                      }
                    }}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Plus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload files</p>
                    <p className="text-xs text-gray-400 mt-1">Or drag and drop here</p>
                  </label>
                  {projectData.initial_files.length > 0 && (
                    <p className="text-sm text-green-600 mt-3">
                      {projectData.initial_files.length} file(s) selected
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Set Up Milestones <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateField('milestones', [...projectData.milestones, { title: '', amount: '', dueDate: '' }])
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Milestone
                  </Button>
                  {projectData.milestones.length > 0 && (
                    <p className="text-xs text-gray-500">{projectData.milestones.length} milestone(s) added</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Configure Access Permissions
                </label>
                <select
                  value={projectData.permissions}
                  onChange={(e) => updateField('permissions', e.target.value as 'private' | 'team' | 'public')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="private">Private (Only me)</option>
                  <option value="team">Team (All team members)</option>
                  <option value="public">Public (Anyone with link)</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* STEP 3: REVIEW & CREATE */}
          {wizardStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Project</h3>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Project Title</p>
                    <p className="text-sm font-semibold text-gray-900">{projectData.title || '(Not set)'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Client</p>
                    <p className="text-sm font-semibold text-gray-900">{projectData.client_name || '(Not set)'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Budget</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ${projectData.budget || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Priority</p>
                    <Badge className={cn(
                      projectData.priority === 'urgent' ? 'bg-red-500' :
                      projectData.priority === 'high' ? 'bg-orange-500' :
                      projectData.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    )}>
                      {projectData.priority}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-gray-600">Description</p>
                    <p className="text-sm text-gray-900">{projectData.description || '(Not set)'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Timeline</p>
                    <p className="text-sm text-gray-900">
                      {projectData.start_date || '(No start)'} → {projectData.end_date || '(No end)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Team Members</p>
                    <p className="text-sm text-gray-900">{projectData.team_members.length} member(s)</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Files</p>
                    <p className="text-sm text-gray-900">{projectData.initial_files.length} file(s)</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Permissions</p>
                    <p className="text-sm text-gray-900 capitalize">{projectData.permissions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ✓ Review all details carefully before creating your project
                </p>
              </div>
            </motion.div>
          )}

          {/* WIZARD NAVIGATION */}
          <div className="flex gap-3 pt-4 border-t">
            {wizardStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setWizardStep(wizardStep - 1)}
              >
                ← Previous
              </Button>
            )}

            <Button
              variant="outline"
              className="ml-auto"
              onClick={handleClose}
              data-testid="create-project-cancel"
            >
              Cancel
            </Button>

            {wizardStep < 3 ? (
              <Button
                onClick={() => setWizardStep(wizardStep + 1)}
                disabled={
                  wizardStep === 1 && (!projectData.title.trim() || !projectData.client_name.trim())
                }
              >
                Next: {wizardStep === 1 ? 'Setup' : 'Review'} →
              </Button>
            ) : (
              <Button
                onClick={() => {
                  onSubmit()
                  setWizardStep(1)
                }}
                disabled={!projectData.title.trim()}
                data-testid="create-project-submit"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
