import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Clock, Zap, CheckCircle, AlertCircle } from "lucide-react"

interface HistoryEntry {
  id: string
  type: 'analysis' | 'generation' | 'automation'
  title: string
  timestamp: Date
  status: 'completed' | 'failed' | 'in_progress'
  result?: string
}

interface HistoryTabProps {
  history: HistoryEntry[]
  metrics: {
    successRate: number
    averageTime: number
    totalInteractions: number
  }
}

export function HistoryTab({ history, metrics }: HistoryTabProps) {
  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{metrics.successRate}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <Progress value={metrics.successRate} className="mt-2" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Response Time</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.averageTime}s</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
          <Progress value={metrics.averageTime / 10} className="mt-2" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Interactions</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.totalInteractions}</p>
            </div>
            <Zap className="h-8 w-8 text-purple-500" />
          </div>
          <Progress value={metrics.totalInteractions / 10} className="mt-2" />
        </Card>
      </div>

      {/* History List */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {history.map((entry) => (
              <div 
                key={entry.id} 
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="p-2 rounded-lg bg-gray-100">
                  {entry.type === 'analysis' && <AlertCircle className="h-5 w-5 text-blue-600" />}
                  {entry.type === 'generation' && <Zap className="h-5 w-5 text-purple-600" />}
                  {entry.type === 'automation' && <CheckCircle className="h-5 w-5 text-green-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{entry.title}</h4>
                    <Badge 
                      variant={
                        entry.status === 'completed' ? 'default' :
                        entry.status === 'failed' ? 'destructive' : 'outline'
                      }
                    >
                      {entry.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {entry.timestamp.toLocaleString()}
                  </p>
                  {entry.result && (
                    <p className="text-sm text-gray-700 mt-2">{entry.result}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
} 