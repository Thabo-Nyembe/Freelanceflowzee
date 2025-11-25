'use client'

import { useReducer } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

// MY DAY UTILITIES
import {
  taskReducer,
  initialTaskState,
  mockTimeBlocks
} from '@/lib/my-day-utils'

export default function SchedulePage() {
  const [state] = useReducer(taskReducer, initialTaskState)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Time Blocks</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your optimized schedule for maximum productivity
        </p>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTimeBlocks.map(block => (
              <div key={block.id} className={cn("p-4 rounded-xl border", block.color)}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{block.title}</h4>
                    <p className="text-sm opacity-75">{block.start} - {block.end}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {block.type}
                  </Badge>
                </div>
                {block.tasks.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {block.tasks.map(taskId => {
                      const task = state.tasks.find(t => t.id === taskId)
                      return task ? (
                        <div key={taskId} className="text-sm opacity-75">
                          • {task.title}
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
