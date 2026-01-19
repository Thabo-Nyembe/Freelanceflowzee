/**
 * Voice Commands Service
 *
 * Natural language command processing for hands-free operation
 */

import { speechRecognition, SpeechRecognitionResult } from './speech-recognition'
import { textToSpeech } from './text-to-speech'

export interface VoiceCommand {
  patterns: (string | RegExp)[]
  action: string
  description: string
  handler: (params: Record<string, string>) => void | Promise<void>
  feedback?: string
}

export interface VoiceCommandsOptions {
  language?: string
  speakFeedback?: boolean
  onCommand?: (command: string, action: string) => void
  onUnrecognized?: (transcript: string) => void
  onListening?: (isListening: boolean) => void
  onError?: (error: string) => void
}

// Built-in commands
const DEFAULT_COMMANDS: VoiceCommand[] = [
  // Navigation
  {
    patterns: ['go to dashboard', 'open dashboard', 'show dashboard'],
    action: 'navigate:dashboard',
    description: 'Navigate to dashboard',
    handler: () => { window.location.href = '/dashboard' },
    feedback: 'Opening dashboard',
  },
  {
    patterns: ['go to projects', 'open projects', 'show projects'],
    action: 'navigate:projects',
    description: 'Navigate to projects',
    handler: () => { window.location.href = '/dashboard/projects-v2' },
    feedback: 'Opening projects',
  },
  {
    patterns: ['go to tasks', 'open tasks', 'show my tasks'],
    action: 'navigate:tasks',
    description: 'Navigate to tasks',
    handler: () => { window.location.href = '/dashboard/tasks-v2' },
    feedback: 'Opening tasks',
  },
  {
    patterns: ['go to messages', 'open messages', 'show messages'],
    action: 'navigate:messages',
    description: 'Navigate to messages',
    handler: () => { window.location.href = '/dashboard/messages-v2' },
    feedback: 'Opening messages',
  },
  {
    patterns: ['go to calendar', 'open calendar', 'show calendar'],
    action: 'navigate:calendar',
    description: 'Navigate to calendar',
    handler: () => { window.location.href = '/dashboard/calendar-v2' },
    feedback: 'Opening calendar',
  },
  {
    patterns: ['go to invoices', 'open invoices', 'show invoices'],
    action: 'navigate:invoices',
    description: 'Navigate to invoices',
    handler: () => { window.location.href = '/dashboard/invoices-v2' },
    feedback: 'Opening invoices',
  },
  {
    patterns: ['go to clients', 'open clients', 'show clients'],
    action: 'navigate:clients',
    description: 'Navigate to clients',
    handler: () => { window.location.href = '/dashboard/clients-v2' },
    feedback: 'Opening clients',
  },
  {
    patterns: ['go to settings', 'open settings'],
    action: 'navigate:settings',
    description: 'Navigate to settings',
    handler: () => { window.location.href = '/dashboard/settings-v2' },
    feedback: 'Opening settings',
  },
  {
    patterns: ['go to analytics', 'open analytics', 'show analytics'],
    action: 'navigate:analytics',
    description: 'Navigate to analytics',
    handler: () => { window.location.href = '/dashboard/analytics-v2' },
    feedback: 'Opening analytics',
  },
  {
    patterns: ['go back', 'go previous', 'back'],
    action: 'navigate:back',
    description: 'Go back',
    handler: () => { window.history.back() },
    feedback: 'Going back',
  },

  // Actions
  {
    patterns: [/create (new )?task(?: called)? (.+)/i, 'create task', 'new task'],
    action: 'create:task',
    description: 'Create a new task',
    handler: (params) => {
      const event = new CustomEvent('voice:create:task', { detail: params })
      window.dispatchEvent(event)
    },
    feedback: 'Creating new task',
  },
  {
    patterns: [/create (new )?project(?: called)? (.+)/i, 'create project', 'new project'],
    action: 'create:project',
    description: 'Create a new project',
    handler: (params) => {
      const event = new CustomEvent('voice:create:project', { detail: params })
      window.dispatchEvent(event)
    },
    feedback: 'Creating new project',
  },
  {
    patterns: [/create (new )?invoice/i, 'create invoice', 'new invoice'],
    action: 'create:invoice',
    description: 'Create a new invoice',
    handler: () => {
      const event = new CustomEvent('voice:create:invoice')
      window.dispatchEvent(event)
    },
    feedback: 'Creating new invoice',
  },
  {
    patterns: [/send message to (.+)/i],
    action: 'send:message',
    description: 'Send a message',
    handler: (params) => {
      const event = new CustomEvent('voice:send:message', { detail: params })
      window.dispatchEvent(event)
    },
    feedback: 'Opening message composer',
  },
  {
    patterns: ['start timer', 'start time tracking', 'track time'],
    action: 'timer:start',
    description: 'Start time tracking',
    handler: () => {
      const event = new CustomEvent('voice:timer:start')
      window.dispatchEvent(event)
    },
    feedback: 'Starting time tracker',
  },
  {
    patterns: ['stop timer', 'stop time tracking', 'pause timer'],
    action: 'timer:stop',
    description: 'Stop time tracking',
    handler: () => {
      const event = new CustomEvent('voice:timer:stop')
      window.dispatchEvent(event)
    },
    feedback: 'Stopping time tracker',
  },

  // Search
  {
    patterns: [/search for (.+)/i, /find (.+)/i],
    action: 'search',
    description: 'Search for something',
    handler: (params) => {
      const event = new CustomEvent('voice:search', { detail: params })
      window.dispatchEvent(event)
    },
    feedback: 'Searching',
  },

  // AI Assistant
  {
    patterns: ['open ai', 'ai assistant', 'hey assistant', 'open assistant'],
    action: 'ai:open',
    description: 'Open AI assistant',
    handler: () => {
      const event = new CustomEvent('voice:ai:open')
      window.dispatchEvent(event)
    },
    feedback: 'Opening AI assistant',
  },
  {
    patterns: [/ask ai (.+)/i, /ai (.+)/i],
    action: 'ai:ask',
    description: 'Ask AI a question',
    handler: (params) => {
      const event = new CustomEvent('voice:ai:ask', { detail: params })
      window.dispatchEvent(event)
    },
    feedback: 'Asking AI',
  },

  // Utility
  {
    patterns: ['refresh', 'reload page', 'refresh page'],
    action: 'utility:refresh',
    description: 'Refresh the page',
    handler: () => { window.location.reload() },
    feedback: 'Refreshing',
  },
  {
    patterns: ['scroll down', 'page down'],
    action: 'utility:scrollDown',
    description: 'Scroll down',
    handler: () => { window.scrollBy({ top: 500, behavior: 'smooth' }) },
  },
  {
    patterns: ['scroll up', 'page up'],
    action: 'utility:scrollUp',
    description: 'Scroll up',
    handler: () => { window.scrollBy({ top: -500, behavior: 'smooth' }) },
  },
  {
    patterns: ['scroll to top', 'go to top'],
    action: 'utility:scrollTop',
    description: 'Scroll to top',
    handler: () => { window.scrollTo({ top: 0, behavior: 'smooth' }) },
  },
  {
    patterns: ['scroll to bottom', 'go to bottom'],
    action: 'utility:scrollBottom',
    description: 'Scroll to bottom',
    handler: () => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) },
  },

  // Help
  {
    patterns: ['help', 'what can you do', 'show commands', 'voice commands'],
    action: 'help',
    description: 'Show available commands',
    handler: () => {
      const event = new CustomEvent('voice:help')
      window.dispatchEvent(event)
    },
    feedback: 'Here are the available voice commands',
  },
  {
    patterns: ['stop listening', 'stop voice', 'disable voice'],
    action: 'voice:stop',
    description: 'Stop voice commands',
    handler: () => {
      const event = new CustomEvent('voice:disable')
      window.dispatchEvent(event)
    },
    feedback: 'Voice commands disabled',
  },
]

class VoiceCommandsService {
  private commands: VoiceCommand[] = [...DEFAULT_COMMANDS]
  private options: VoiceCommandsOptions = {}
  private isActive: boolean = false

  constructor() {
    // Initialize commands
  }

  configure(options: VoiceCommandsOptions): void {
    this.options = options
  }

  addCommand(command: VoiceCommand): void {
    this.commands.push(command)
  }

  removeCommand(action: string): void {
    this.commands = this.commands.filter(cmd => cmd.action !== action)
  }

  getCommands(): VoiceCommand[] {
    return this.commands
  }

  start(): boolean {
    if (!speechRecognition.isSupported()) {
      this.options.onError?.('Speech recognition not supported')
      return false
    }

    speechRecognition.configure({
      language: this.options.language || 'en-US',
      continuous: true,
      interimResults: false,
      onResult: (result) => this.handleResult(result),
      onError: (error) => this.options.onError?.(error),
      onStart: () => {
        this.isActive = true
        this.options.onListening?.(true)
      },
      onEnd: () => {
        this.isActive = false
        this.options.onListening?.(false)
      },
    })

    return speechRecognition.start()
  }

  stop(): void {
    speechRecognition.stop()
    this.isActive = false
    this.options.onListening?.(false)
  }

  getIsActive(): boolean {
    return this.isActive
  }

  private handleResult(result: SpeechRecognitionResult): void {
    if (!result.isFinal) return

    const transcript = result.transcript.trim().toLowerCase()

    // Find matching command
    for (const command of this.commands) {
      for (const pattern of command.patterns) {
        let match: RegExpMatchArray | null = null

        if (typeof pattern === 'string') {
          if (transcript === pattern.toLowerCase()) {
            match = [transcript]
          }
        } else {
          match = transcript.match(pattern)
        }

        if (match) {
          // Extract parameters
          const params: Record<string, string> = {}
          if (match.length > 1) {
            match.slice(1).forEach((value, index) => {
              params[`param${index}`] = value
            })
          }
          params.transcript = transcript

          // Execute handler
          try {
            command.handler(params)
            this.options.onCommand?.(transcript, command.action)

            // Speak feedback
            if (this.options.speakFeedback && command.feedback) {
              textToSpeech.speak(command.feedback)
            }
          } catch (error) {
            this.options.onError?.(`Command failed: ${error}`)
          }
          return
        }
      }
    }

    // No command matched
    this.options.onUnrecognized?.(transcript)
  }
}

export const voiceCommands = new VoiceCommandsService()
