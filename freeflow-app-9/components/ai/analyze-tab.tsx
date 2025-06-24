import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Palette, Layout, Type, Eye } from "lucide-react"

interface AnalyzeTabProps {
  onAnalyze: (tool: string) => void
}

const analyzeTools = [
  {
    id: 'design',
    name: 'Design Analysis',
    icon: Lightbulb,
    description: 'Analyze overall design patterns and consistency',
  },
  {
    id: 'color',
    name: 'Color Analysis',
    icon: Palette,
    description: 'Check color harmony and accessibility',
  },
  {
    id: 'layout',
    name: 'Layout Suggestions',
    icon: Layout,
    description: 'Get recommendations for layout improvements',
  },
  {
    id: 'typography',
    name: 'Typography Review',
    icon: Type,
    description: 'Evaluate typography and readability',
  },
  {
    id: 'accessibility',
    name: 'Accessibility Check',
    icon: Eye,
    description: 'Verify accessibility compliance',
  },
]

export function AnalyzeTab({ onAnalyze }: AnalyzeTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {analyzeTools.map((tool) => (
        <Card key={tool.id} className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-start space-x-4">
            <div className="p-2 rounded-lg bg-purple-50">
              <tool.icon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 flex items-center">
                {tool.name}
                <Badge variant="outline" className="ml-2">AI-Powered</Badge>
              </h3>
              <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
              <Button 
                onClick={() => onAnalyze(tool.id)}
                className="mt-3 w-full"
                data-testid={`analyze-${tool.id}-btn`}
              >
                Start Analysis
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 