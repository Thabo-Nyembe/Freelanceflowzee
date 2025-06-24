import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase, 
  Users, 
  Calendar, 
  Tags,
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (projectData: ProjectData) => void
}

interface ProjectData {
  name: string
  description: string
  type: string
  startDate: string
  endDate: string
  tags: string[]
  teamSize: number
  budget?: number
}

const projectTypes = [
  {
    id: 'freelance',
    name: 'Freelance Project',
    description: 'Individual client work with flexible terms',
    icon: Briefcase
  },
  {
    id: 'team',
    name: 'Team Project',
    description: 'Collaborative project with multiple contributors',
    icon: Users
  },
  {
    id: 'personal',
    name: 'Personal Project',
    description: 'Self-directed work and experiments',
    icon: FileText
  }
]

export function CreateProjectDialog({ open, onOpenChange, onSubmit }: CreateProjectDialogProps) {
  const [formData, setFormData] = useState<ProjectData>({
    name: '',
    description: '',
    type: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    tags: [],
    teamSize: 1
  })

  const [currentTag, setCurrentTag] = useState('')
  const [errors, setErrors] = useState<Partial<ProjectData>>({})

  const validateForm = () => {
    const newErrors: Partial<ProjectData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }
    if (!formData.type) {
      newErrors.type = 'Project type is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required'
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }
    if (formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData)
      onOpenChange(false)
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter project name"
              data-testid="project-name-input"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-4">
            <Label>Project Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projectTypes.map(type => {
                const Icon = type.icon
                return (
                  <Card
                    key={type.id}
                    className={`p-4 cursor-pointer hover:border-blue-500 transition-colors ${
                      formData.type === type.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                    data-testid={`project-type-${type.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{type.name}</h4>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
            {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter project description"
              data-testid="project-description-input"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                data-testid="project-start-date-input"
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                data-testid="project-end-date-input"
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex space-x-2">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tags"
                data-testid="project-tags-input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                data-testid="add-tag-btn"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <span className="ml-1 text-gray-500">×</span>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamSize">Team Size</Label>
            <Select
              value={formData.teamSize.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, teamSize: parseInt(value) }))}
            >
              <SelectTrigger id="teamSize" data-testid="team-size-select">
                <SelectValue placeholder="Select team size" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, '6+'].map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} {size === 1 ? 'member' : 'members'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (Optional)</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || undefined }))}
              placeholder="Enter project budget"
              data-testid="project-budget-input"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="cancel-project-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            data-testid="create-project-btn"
          >
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 