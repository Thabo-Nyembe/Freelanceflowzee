import { NextRequest, NextResponse } from 'next/server'

// Task Management & My Day API
// Supports: CRUD tasks, AI scheduling, time tracking, productivity insights

interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'work' | 'personal' | 'meeting' | 'break'
  estimatedTime: number
  completed: boolean
  startTime?: string
  endTime?: string
  projectId?: string
  tags: string[]
  userId?: string
  createdAt?: string
  updatedAt?: string
}

interface TaskRequest {
  action: 'create' | 'list' | 'update' | 'delete' | 'complete' | 'schedule' | 'ai-optimize'
  taskId?: string
  data?: Partial<Task>
  filters?: {
    category?: string
    priority?: string
    completed?: boolean
    date?: string
  }
}

// Generate unique task ID
function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create new task
async function handleCreateTask(data: Partial<Task>): Promise<NextResponse> {
  try {
    const task: Task = {
      id: generateTaskId(),
      title: data.title || 'Untitled Task',
      description: data.description || '',
      priority: data.priority || 'medium',
      category: data.category || 'work',
      estimatedTime: data.estimatedTime || 60,
      completed: false,
      projectId: data.projectId,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In production: Save to database
    // await db.tasks.create(task)

    return NextResponse.json({
      success: true,
      action: 'create',
      task,
      message: `Task "${task.title}" created successfully`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create task'
    }, { status: 500 })
  }
}

// List tasks with filters
async function handleListTasks(filters?: any): Promise<NextResponse> {
  try {
    // Mock task data
    const mockTasks: Task[] = [
      {
        id: 'task_1',
        title: 'Complete logo design mockups',
        description: 'Create 3 logo variations for TechCorp client',
        priority: 'high',
        category: 'work',
        estimatedTime: 120,
        completed: false,
        projectId: 'proj_001',
        tags: ['design', 'branding', 'urgent']
      },
      {
        id: 'task_2',
        title: 'Review brand guidelines document',
        description: 'Final review before client presentation',
        priority: 'medium',
        category: 'work',
        estimatedTime: 45,
        completed: true,
        projectId: 'proj_001',
        tags: ['review', 'branding']
      },
      {
        id: 'task_3',
        title: 'Client call - Project Alpha',
        description: 'Weekly sync with client stakeholders',
        priority: 'urgent',
        category: 'meeting',
        estimatedTime: 60,
        completed: false,
        tags: ['meeting', 'client']
      }
    ]

    let filteredTasks = mockTasks

    // Apply filters
    if (filters?.category) {
      filteredTasks = filteredTasks.filter(t => t.category === filters.category)
    }
    if (filters?.priority) {
      filteredTasks = filteredTasks.filter(t => t.priority === filters.priority)
    }
    if (filters?.completed !== undefined) {
      filteredTasks = filteredTasks.filter(t => t.completed === filters.completed)
    }

    const stats = {
      total: filteredTasks.length,
      completed: filteredTasks.filter(t => t.completed).length,
      pending: filteredTasks.filter(t => !t.completed).length,
      urgent: filteredTasks.filter(t => t.priority === 'urgent' && !t.completed).length,
      totalEstimatedTime: filteredTasks.reduce((sum, t) => sum + t.estimatedTime, 0)
    }

    return NextResponse.json({
      success: true,
      action: 'list',
      tasks: filteredTasks,
      stats,
      message: `Found ${filteredTasks.length} tasks`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to list tasks'
    }, { status: 500 })
  }
}

// Complete/uncomplete task
async function handleCompleteTask(taskId: string, completed: boolean = true): Promise<NextResponse> {
  try {
    const task = {
      id: taskId,
      completed,
      endTime: completed ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString()
    }

    // In production: Update database
    // await db.tasks.update(taskId, task)

    return NextResponse.json({
      success: true,
      action: 'complete',
      task,
      message: completed ? 'Task completed!' : 'Task reopened',
      celebration: completed ? {
        message: '🎉 Great job! Task completed!',
        points: 10,
        streak: 5
      } : undefined
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update task'
    }, { status: 500 })
  }
}

// AI-powered schedule optimization
async function handleAIOptimize(data: any): Promise<NextResponse> {
  try {
    // AI would analyze tasks and suggest optimal schedule
    const optimizedSchedule = {
      timeBlocks: [
        {
          id: 'block_1',
          title: 'Deep Focus: High Priority Tasks',
          start: '09:00',
          end: '11:00',
          type: 'focus',
          tasks: ['task_1', 'task_3'],
          reason: 'Peak productivity hours - tackle challenging tasks',
          energyLevel: 'high',
          distractionRisk: 'low'
        },
        {
          id: 'block_2',
          title: 'Communication & Meetings',
          start: '11:00',
          end: '12:30',
          type: 'meeting',
          tasks: ['task_3'],
          reason: 'Good time for client interactions',
          energyLevel: 'medium',
          distractionRisk: 'medium'
        },
        {
          id: 'block_3',
          title: 'Creative Work',
          start: '14:00',
          end: '16:00',
          type: 'focus',
          tasks: ['task_1'],
          reason: 'Post-lunch energy boost for creative tasks',
          energyLevel: 'medium-high',
          distractionRisk: 'low'
        },
        {
          id: 'block_4',
          title: 'Review & Admin',
          start: '16:00',
          end: '17:00',
          type: 'admin',
          tasks: ['task_2'],
          reason: 'Lower energy - perfect for reviews',
          energyLevel: 'medium',
          distractionRisk: 'medium'
        }
      ],
      insights: {
        totalProductiveTime: '6.5 hours',
        estimatedCompletion: '95%',
        burnoutRisk: 'low',
        workloadBalance: 'optimal',
        recommendations: [
          'Take a 15-minute break between focus blocks',
          'Consider scheduling design work during morning peak hours',
          'Batch similar tasks together for efficiency'
        ]
      },
      aiConfidence: 92.4
    }

    return NextResponse.json({
      success: true,
      action: 'ai-optimize',
      schedule: optimizedSchedule,
      message: 'AI-optimized schedule generated'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to optimize schedule'
    }, { status: 500 })
  }
}

// Update task
async function handleUpdateTask(taskId: string, updates: Partial<Task>): Promise<NextResponse> {
  try {
    const task = {
      id: taskId,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      action: 'update',
      task,
      message: 'Task updated successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update task'
    }, { status: 500 })
  }
}

// Delete task
async function handleDeleteTask(taskId: string): Promise<NextResponse> {
  try {
    // In production: Delete from database
    // await db.tasks.delete(taskId)

    return NextResponse.json({
      success: true,
      action: 'delete',
      taskId,
      message: 'Task deleted successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete task'
    }, { status: 500 })
  }
}

// Main POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: TaskRequest = await request.json()

    switch (body.action) {
      case 'create':
        if (!body.data) {
          return NextResponse.json({
            success: false,
            error: 'Task data required'
          }, { status: 400 })
        }
        return handleCreateTask(body.data)

      case 'list':
        return handleListTasks(body.filters)

      case 'complete':
        if (!body.taskId) {
          return NextResponse.json({
            success: false,
            error: 'Task ID required'
          }, { status: 400 })
        }
        return handleCompleteTask(body.taskId, body.data?.completed ?? true)

      case 'update':
        if (!body.taskId || !body.data) {
          return NextResponse.json({
            success: false,
            error: 'Task ID and update data required'
          }, { status: 400 })
        }
        return handleUpdateTask(body.taskId, body.data)

      case 'delete':
        if (!body.taskId) {
          return NextResponse.json({
            success: false,
            error: 'Task ID required'
          }, { status: 400 })
        }
        return handleDeleteTask(body.taskId)

      case 'ai-optimize':
        return handleAIOptimize(body.data)

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${body.action}`
        }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Invalid request'
    }, { status: 400 })
  }
}

// GET handler
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const completed = searchParams.get('completed')

    return handleListTasks({
      category,
      priority,
      completed: completed ? completed === 'true' : undefined
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch tasks'
    }, { status: 500 })
  }
}
