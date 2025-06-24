import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wand2, FileText, Code, MessageSquare, Presentation } from "lucide-react"

interface GenerateTabProps {
  onGenerate: (tool: string) => void
}

const generateTools = [
  {
    id: 'content',
    name: 'Content Generation',
    icon: FileText,
    description: 'Generate blog posts, articles, and marketing copy',
  },
  {
    id: 'code',
    name: 'Code Generation',
    icon: Code,
    description: 'Generate code snippets and components',
  },
  {
    id: 'chat',
    name: 'Chat Responses',
    icon: MessageSquare,
    description: 'Generate customer service and chat responses',
  },
  {
    id: 'presentation',
    name: 'Presentation Content',
    icon: Presentation,
    description: 'Generate slides and presentation content',
  }
]

export function GenerateTab({ onGenerate }: GenerateTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {generateTools.map((tool) => (
          <Card key={tool.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-lg bg-blue-50">
                <tool.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  {tool.name}
                  <Badge variant="outline" className="ml-2">Smart</Badge>
                </h3>
                <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                <Button 
                  onClick={() => onGenerate(tool.id)}
                  className="mt-3 w-full"
                  data-testid={`generate-${tool.id}-btn`}
                >
                  Start Generating
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-lg bg-white">
            <Wand2 className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Set Up Automation</h3>
            <p className="text-sm text-gray-600">Create automated workflows for content generation</p>
            <Button 
              variant="outline" 
              className="mt-3"
              data-testid="setup-automation-btn"
            >
              Configure Automation
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 