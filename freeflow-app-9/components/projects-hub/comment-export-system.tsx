"use client"

import React, { useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Icons
import {
  Download,
  FileText,
  Table,
  Code,
  Mail,
  Presentation,
  BarChart3,
  Check,
  Loader2,
  Archive,
  FileDown,
  Globe
} from "lucide-react"

// Types
import { Comment } from "./universal-pinpoint-feedback-system-enhanced"
import { AICommentAnalysis, CommentInsights } from "@/lib/ai/comment-analysis-service"

export type ExportFormat =
  | "pdf"
  | "csv"
  | "excel"
  | "json"
  | "html"
  | "markdown"
  | "docx"
  | "presentation"
  | "email"
  | "report"

export interface ExportOptions {
  format: ExportFormat
  includeReplies: boolean
  includeAttachments: boolean
  includeVoiceNotes: boolean
  includeDrawings: boolean
  includeTimestamps: boolean
  includeMetadata: boolean
  includeAIAnalysis: boolean
  includeStatistics: boolean
  customFields: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  statusFilter: string[]
  priorityFilter: string[]
  authorFilter: string[]
  groupBy: "none" | "status" | "priority" | "author" | "date" | "category"
  sortBy: "date" | "priority" | "author" | "status"
  sortOrder: "asc" | "desc"
  template: "standard" | "executive" | "detailed" | "summary" | "presentation"
  branding: {
    includeLogo: boolean
    companyName?: string
    projectName?: string
    customHeader?: string
    customFooter?: string
  }
  privacy: {
    anonymizeUsers: boolean
    excludePrivateComments: boolean
    watermark?: string
  }
}

export interface ExportTemplate {
  id: string
  name: string
  description: string
  format: ExportFormat
  defaultOptions: Partial<ExportOptions>
  icon: React.ElementType
}

interface CommentExportSystemProps {
  comments: Comment[]
  analyses?: AICommentAnalysis[]
  insights?: CommentInsights
  projectName?: string
  onExport: (options: ExportOptions) => Promise<void>
  className?: string
  availableTemplates?: ExportTemplate[]
}

const defaultExportOptions: ExportOptions = {
  format: "pdf",
  includeReplies: true,
  includeAttachments: false,
  includeVoiceNotes: false,
  includeDrawings: false,
  includeTimestamps: true,
  includeMetadata: true,
  includeAIAnalysis: false,
  includeStatistics: true,
  customFields: [],
  statusFilter: [],
  priorityFilter: [],
  authorFilter: [],
  groupBy: "none",
  sortBy: "date",
  sortOrder: "desc",
  template: "standard",
  branding: {
    includeLogo: false,
    companyName: "",
    projectName: "",
    customHeader: "",
    customFooter: ""
  },
  privacy: {
    anonymizeUsers: false,
    excludePrivateComments: false,
    watermark: ""
  }
}

const exportTemplates: ExportTemplate[] = [
  {
    id: "executive-summary",
    name: "Executive Summary",
    description: "High-level overview with key metrics and insights",
    format: "pdf",
    defaultOptions: {
      template: "executive",
      includeStatistics: true,
      includeAIAnalysis: true,
      groupBy: "priority",
      includeReplies: false
    },
    icon: BarChart3
  },
  {
    id: "detailed-report",
    name: "Detailed Report",
    description: "Comprehensive report with all comments and analysis",
    format: "pdf",
    defaultOptions: {
      template: "detailed",
      includeReplies: true,
      includeAttachments: true,
      includeTimestamps: true,
      includeMetadata: true,
      includeAIAnalysis: true
    },
    icon: FileText
  },
  {
    id: "data-export",
    name: "Data Export",
    description: "Raw data in CSV/Excel format for analysis",
    format: "csv",
    defaultOptions: {
      includeMetadata: true,
      includeTimestamps: true,
      includeAIAnalysis: true
    },
    icon: Table
  },
  {
    id: "presentation",
    name: "Presentation",
    description: "PowerPoint-style presentation with key findings",
    format: "presentation",
    defaultOptions: {
      template: "presentation",
      includeStatistics: true,
      includeAIAnalysis: true,
      groupBy: "category"
    },
    icon: Presentation
  },
  {
    id: "email-summary",
    name: "Email Summary",
    description: "Email-friendly summary for stakeholders",
    format: "email",
    defaultOptions: {
      template: "summary",
      includeStatistics: true,
      groupBy: "status"
    },
    icon: Mail
  }
]

export function CommentExportSystem({
  comments,
  analyses = [],
  insights,
  projectName = "Project",
  onExport,
  className,
  availableTemplates = exportTemplates
}: CommentExportSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>(defaultExportOptions)
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("template")

  // Preview data based on current options
  const previewData = useMemo(() => {
    let filteredComments = [...comments]

    // Apply filters
    if (exportOptions.statusFilter.length > 0) {
      filteredComments = filteredComments.filter(c => exportOptions.statusFilter.includes(c.status))
    }
    if (exportOptions.priorityFilter.length > 0) {
      filteredComments = filteredComments.filter(c => exportOptions.priorityFilter.includes(c.priority))
    }
    if (exportOptions.authorFilter.length > 0) {
      filteredComments = filteredComments.filter(c => exportOptions.authorFilter.includes(c.author.id))
    }

    // Apply date range
    if (exportOptions.dateRange) {
      filteredComments = filteredComments.filter(c => {
        const commentDate = new Date(c.createdAt)
        return commentDate >= exportOptions.dateRange!.from && commentDate <= exportOptions.dateRange!.to
      })
    }

    // Sort
    filteredComments.sort((a, b) => {
      let aValue: any, bValue: any

      switch (exportOptions.sortBy) {
        case "date":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case "priority":
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case "author":
          aValue = a.author.name
          bValue = b.author.name
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        default:
          return 0
      }

      if (exportOptions.sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return {
      comments: filteredComments,
      totalComments: filteredComments.length,
      totalReplies: filteredComments.reduce((sum, c) => sum + c.replies.length, 0),
      estimatedSize: calculateEstimatedSize(filteredComments)
    }
  }, [comments, exportOptions])

  // Calculate estimated export size
  const calculateEstimatedSize = useCallback((comments: Comment[]) => {
    let size = comments.length * 2 // Base comment size in KB

    if (exportOptions.includeReplies) {
      size += comments.reduce((sum, c) => sum + c.replies.length, 0) * 1 // Reply size
    }

    if (exportOptions.includeAttachments) {
      size += comments.filter(c => c.attachments?.length).length * 100 // Estimated attachment size
    }

    if (exportOptions.includeAIAnalysis) {
      size += analyses.length * 5 // AI analysis size
    }

    return size
  }, [exportOptions, analyses])

  // Update export options
  const updateOptions = useCallback(<K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setExportOptions(prev => ({ ...prev, [key]: value }))
  }, [])

  // Apply template
  const applyTemplate = useCallback((template: ExportTemplate) => {
    setSelectedTemplate(template)
    setExportOptions(prev => ({
      ...prev,
      format: template.format,
      ...template.defaultOptions
    }))
  }, [])

  // Execute export
  const executeExport = useCallback(async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      await onExport(exportOptions)
      setIsOpen(false)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }, [onExport, exportOptions])

  // Format options
  const formatOptions = [
    { value: "pdf", label: "PDF Document", icon: FileText, description: "Professional document format" },
    { value: "csv", label: "CSV Spreadsheet", icon: Table, description: "For data analysis" },
    { value: "excel", label: "Excel Workbook", icon: Table, description: "Rich spreadsheet format" },
    { value: "json", label: "JSON Data", icon: Code, description: "Structured data format" },
    { value: "html", label: "HTML Report", icon: Globe, description: "Web-viewable report" },
    { value: "markdown", label: "Markdown", icon: FileText, description: "Plain text format" },
    { value: "docx", label: "Word Document", icon: FileText, description: "Microsoft Word format" },
    { value: "presentation", label: "Presentation", icon: Presentation, description: "PowerPoint-style slides" },
    { value: "email", label: "Email Format", icon: Mail, description: "Email-friendly summary" }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="w-4 h-4 mr-2" />
          Export Comments
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Archive className="w-5 h-5 mr-2" />
            Export Comments & Feedback
          </DialogTitle>
          <DialogDescription>
            Export your comments and feedback data in various formats with customizable options.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="template" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Choose Export Template</CardTitle>
                  <CardDescription>
                    Select a pre-configured template that matches your needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableTemplates.map((template) => {
                        const Icon = template.icon
                        const isSelected = selectedTemplate?.id === template.id

                        return (
                          <motion.div
                            key={template.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card
                              className={cn(
                                "cursor-pointer transition-all hover:shadow-md",
                                isSelected && "ring-2 ring-primary"
                              )}
                              onClick={() => applyTemplate(template)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                  <div className={cn(
                                    "p-2 rounded-lg",
                                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                                  )}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium text-sm mb-1">{template.name}</h3>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      {template.description}
                                    </p>
                                    <Badge variant="outline" className="text-xs">
                                      {template.format.toUpperCase()}
                                    </Badge>
                                  </div>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-primary" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="format" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Export Format</CardTitle>
                  <CardDescription>
                    Choose the output format for your export
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {formatOptions.map((option) => {
                        const Icon = option.icon
                        const isSelected = exportOptions.format === option.value

                        return (
                          <Card
                            key={option.value}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-md",
                              isSelected && "ring-2 ring-primary"
                            )}
                            onClick={() => updateOptions("format", option.value as ExportFormat)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center space-x-2 mb-2">
                                <Icon className="w-4 h-4" />
                                <span className="font-medium text-sm">{option.label}</span>
                                {isSelected && <Check className="w-3 h-3 text-primary ml-auto" />}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {option.description}
                              </p>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="options" className="h-full">
              <ScrollArea className="h-full">
                <div className="space-y-6">
                  {/* Content Options */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Content Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includeReplies"
                            checked={exportOptions.includeReplies}
                            onCheckedChange={(checked) => updateOptions("includeReplies", checked as boolean)}
                          />
                          <Label htmlFor="includeReplies" className="text-sm">Include Replies</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includeAttachments"
                            checked={exportOptions.includeAttachments}
                            onCheckedChange={(checked) => updateOptions("includeAttachments", checked as boolean)}
                          />
                          <Label htmlFor="includeAttachments" className="text-sm">Include Attachments</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includeVoiceNotes"
                            checked={exportOptions.includeVoiceNotes}
                            onCheckedChange={(checked) => updateOptions("includeVoiceNotes", checked as boolean)}
                          />
                          <Label htmlFor="includeVoiceNotes" className="text-sm">Include Voice Notes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includeDrawings"
                            checked={exportOptions.includeDrawings}
                            onCheckedChange={(checked) => updateOptions("includeDrawings", checked as boolean)}
                          />
                          <Label htmlFor="includeDrawings" className="text-sm">Include Drawings</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includeTimestamps"
                            checked={exportOptions.includeTimestamps}
                            onCheckedChange={(checked) => updateOptions("includeTimestamps", checked as boolean)}
                          />
                          <Label htmlFor="includeTimestamps" className="text-sm">Include Timestamps</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includeAIAnalysis"
                            checked={exportOptions.includeAIAnalysis}
                            onCheckedChange={(checked) => updateOptions("includeAIAnalysis", checked as boolean)}
                          />
                          <Label htmlFor="includeAIAnalysis" className="text-sm">Include AI Analysis</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Organization Options */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Organization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="groupBy" className="text-sm">Group By</Label>
                          <Select
                            value={exportOptions.groupBy}
                            onValueChange={(value) => updateOptions("groupBy", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Grouping</SelectItem>
                              <SelectItem value="status">Status</SelectItem>
                              <SelectItem value="priority">Priority</SelectItem>
                              <SelectItem value="author">Author</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="category">Category</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="sortBy" className="text-sm">Sort By</Label>
                          <Select
                            value={exportOptions.sortBy}
                            onValueChange={(value) => updateOptions("sortBy", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="priority">Priority</SelectItem>
                              <SelectItem value="author">Author</SelectItem>
                              <SelectItem value="status">Status</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Branding Options */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Branding</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeLogo"
                          checked={exportOptions.branding.includeLogo}
                          onCheckedChange={(checked) =>
                            updateOptions("branding", {
                              ...exportOptions.branding,
                              includeLogo: checked as boolean
                            })
                          }
                        />
                        <Label htmlFor="includeLogo" className="text-sm">Include Company Logo</Label>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="companyName" className="text-sm">Company Name</Label>
                          <Input
                            id="companyName"
                            value={exportOptions.branding.companyName || ""}
                            onChange={(e) =>
                              updateOptions("branding", {
                                ...exportOptions.branding,
                                companyName: e.target.value
                              })
                            }
                            placeholder="Your Company Name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="projectName" className="text-sm">Project Name</Label>
                          <Input
                            id="projectName"
                            value={exportOptions.branding.projectName || projectName}
                            onChange={(e) =>
                              updateOptions("branding", {
                                ...exportOptions.branding,
                                projectName: e.target.value
                              })
                            }
                            placeholder="Project Name"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="preview" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Export Preview</CardTitle>
                  <CardDescription>
                    Review your export settings and estimated output
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Export Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{previewData.totalComments}</div>
                        <div className="text-sm text-muted-foreground">Comments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{previewData.totalReplies}</div>
                        <div className="text-sm text-muted-foreground">Replies</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{exportOptions.format.toUpperCase()}</div>
                        <div className="text-sm text-muted-foreground">Format</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">~{previewData.estimatedSize}KB</div>
                        <div className="text-sm text-muted-foreground">Est. Size</div>
                      </div>
                    </div>

                    <Separator />

                    {/* Preview Content */}
                    <div>
                      <h4 className="font-medium mb-2">Export Content Preview</h4>
                      <ScrollArea className="h-48 border rounded-md p-3">
                        <div className="space-y-2">
                          {previewData.comments.slice(0, 5).map((comment) => (
                            <div key={comment.id} className="text-sm p-2 bg-muted rounded">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{comment.author.name}</span>
                                <Badge variant="outline" className="text-xs">{comment.status}</Badge>
                              </div>
                              <p className="text-muted-foreground text-xs line-clamp-2">
                                {comment.content}
                              </p>
                              {exportOptions.includeTimestamps && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(comment.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                                </div>
                              )}
                            </div>
                          ))}
                          {previewData.totalComments > 5 && (
                            <div className="text-center text-sm text-muted-foreground">
                              ... and {previewData.totalComments - 5} more comments
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Selected Options Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Selected Options</h4>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary">Format: {exportOptions.format}</Badge>
                        <Badge variant="secondary">Template: {exportOptions.template}</Badge>
                        {exportOptions.includeReplies && <Badge variant="outline">Replies</Badge>}
                        {exportOptions.includeAttachments && <Badge variant="outline">Attachments</Badge>}
                        {exportOptions.includeAIAnalysis && <Badge variant="outline">AI Analysis</Badge>}
                        {exportOptions.groupBy !== "none" && <Badge variant="outline">Group by {exportOptions.groupBy}</Badge>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <FileDown className="w-4 h-4" />
              <span>Ready to export {previewData.totalComments} comments</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
                Cancel
              </Button>
              <Button onClick={executeExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting... {exportProgress}%
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            </div>
          </div>

          {isExporting && (
            <div className="w-full mt-2">
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}