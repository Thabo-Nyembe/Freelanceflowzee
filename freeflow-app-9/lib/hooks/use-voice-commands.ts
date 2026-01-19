'use client';

/**
 * Real-time Voice Commands Hook - FreeFlow A+++ Implementation
 *
 * Industry-leading voice control with:
 * - Wake word detection ("Hey FreeFlow")
 * - Continuous listening mode
 * - Command pattern matching
 * - Fuzzy command recognition
 * - Context-aware commands
 * - Voice feedback
 * - Multi-language support
 *
 * Competitors: Siri, Alexa, Google Assistant, Cortana
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

// Types
export interface VoiceCommand {
  id: string;
  patterns: string[];
  description: string;
  category: VoiceCommandCategory;
  action: (params: CommandParams) => void | Promise<void>;
  requiresConfirmation?: boolean;
  contextRequired?: string[];
}

export interface CommandParams {
  transcript: string;
  matchedPattern: string;
  extractedEntities: Record<string, string>;
  confidence: number;
}

export type VoiceCommandCategory =
  | 'navigation'
  | 'creation'
  | 'editing'
  | 'search'
  | 'communication'
  | 'settings'
  | 'ai'
  | 'custom';

export interface VoiceCommandsState {
  isListening: boolean;
  isProcessing: boolean;
  isWakeWordActive: boolean;
  lastTranscript: string;
  lastCommand: VoiceCommand | null;
  error: string | null;
  confidence: number;
}

export interface UseVoiceCommandsOptions {
  wakeWord?: string;
  wakeWordEnabled?: boolean;
  continuousListening?: boolean;
  language?: string;
  onTranscript?: (transcript: string) => void;
  onCommand?: (command: VoiceCommand, params: CommandParams) => void;
  onError?: (error: Error) => void;
  commands?: VoiceCommand[];
  enableFeedback?: boolean;
  minConfidence?: number;
}

// Default commands
const defaultCommands: VoiceCommand[] = [
  // Navigation commands
  {
    id: 'nav-dashboard',
    patterns: ['go to dashboard', 'open dashboard', 'show dashboard', 'navigate to dashboard'],
    description: 'Navigate to dashboard',
    category: 'navigation',
    action: () => window.location.href = '/dashboard',
  },
  {
    id: 'nav-projects',
    patterns: ['go to projects', 'open projects', 'show my projects', 'navigate to projects'],
    description: 'Navigate to projects',
    category: 'navigation',
    action: () => window.location.href = '/dashboard/projects-v2',
  },
  {
    id: 'nav-messages',
    patterns: ['go to messages', 'open messages', 'show messages', 'check messages'],
    description: 'Navigate to messages',
    category: 'navigation',
    action: () => window.location.href = '/dashboard/messages-v2',
  },
  {
    id: 'nav-calendar',
    patterns: ['go to calendar', 'open calendar', 'show calendar', 'check schedule'],
    description: 'Navigate to calendar',
    category: 'navigation',
    action: () => window.location.href = '/dashboard/calendar-v2',
  },
  {
    id: 'nav-tasks',
    patterns: ['go to tasks', 'open tasks', 'show my tasks', 'check tasks'],
    description: 'Navigate to tasks',
    category: 'navigation',
    action: () => window.location.href = '/dashboard/tasks-v2',
  },
  {
    id: 'nav-files',
    patterns: ['go to files', 'open files', 'show files', 'file manager'],
    description: 'Navigate to files',
    category: 'navigation',
    action: () => window.location.href = '/dashboard/files-v2',
  },
  {
    id: 'nav-settings',
    patterns: ['go to settings', 'open settings', 'show settings'],
    description: 'Navigate to settings',
    category: 'navigation',
    action: () => window.location.href = '/dashboard/settings-v2',
  },
  {
    id: 'nav-back',
    patterns: ['go back', 'navigate back', 'previous page'],
    description: 'Go back',
    category: 'navigation',
    action: () => window.history.back(),
  },

  // Creation commands
  {
    id: 'create-project',
    patterns: ['create new project', 'new project', 'start a project', 'make a project'],
    description: 'Create a new project',
    category: 'creation',
    action: () => {
      document.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'create-project' } }));
    },
  },
  {
    id: 'create-task',
    patterns: ['create new task', 'new task', 'add a task', 'make a task'],
    description: 'Create a new task',
    category: 'creation',
    action: () => {
      document.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'create-task' } }));
    },
  },
  {
    id: 'create-note',
    patterns: ['create new note', 'new note', 'take a note', 'make a note'],
    description: 'Create a new note',
    category: 'creation',
    action: () => {
      document.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'create-note' } }));
    },
  },
  {
    id: 'compose-message',
    patterns: ['compose message', 'new message', 'send a message', 'write message'],
    description: 'Compose a new message',
    category: 'creation',
    action: () => {
      document.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'compose-message' } }));
    },
  },

  // Search commands
  {
    id: 'search',
    patterns: ['search for *', 'find *', 'look for *', 'search *'],
    description: 'Search for something',
    category: 'search',
    action: (params) => {
      const query = params.extractedEntities['*'] || params.transcript;
      document.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'search', query } }));
    },
  },
  {
    id: 'global-search',
    patterns: ['global search', 'search everywhere', 'find anywhere'],
    description: 'Open global search',
    category: 'search',
    action: () => {
      // Trigger CMD+K or global search
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    },
  },

  // AI commands
  {
    id: 'ai-help',
    patterns: ['hey ai', 'ask ai', 'ai assistant', 'help me with *'],
    description: 'Open AI assistant',
    category: 'ai',
    action: (params) => {
      const query = params.extractedEntities['*'] || '';
      document.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'ai-help', query } }));
    },
  },
  {
    id: 'summarize',
    patterns: ['summarize this', 'give me a summary', 'summarize page'],
    description: 'Summarize current content',
    category: 'ai',
    action: () => {
      document.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'summarize' } }));
    },
  },
  {
    id: 'transcribe',
    patterns: ['start transcription', 'transcribe this', 'begin transcribing'],
    description: 'Start voice transcription',
    category: 'ai',
    action: () => {
      document.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'transcribe' } }));
    },
  },

  // Settings commands
  {
    id: 'toggle-dark-mode',
    patterns: ['toggle dark mode', 'dark mode', 'light mode', 'switch theme'],
    description: 'Toggle dark/light mode',
    category: 'settings',
    action: () => {
      document.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'toggle-theme' } }));
    },
  },
  {
    id: 'mute',
    patterns: ['mute', 'mute audio', 'silence'],
    description: 'Mute audio',
    category: 'settings',
    action: () => {
      document.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'mute' } }));
    },
  },

  // Communication commands
  {
    id: 'call',
    patterns: ['call *', 'start call with *', 'video call *'],
    description: 'Start a call',
    category: 'communication',
    action: (params) => {
      const contact = params.extractedEntities['*'];
      document.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'call', contact } }));
    },
  },
  {
    id: 'schedule-meeting',
    patterns: ['schedule meeting', 'book meeting', 'create meeting'],
    description: 'Schedule a meeting',
    category: 'communication',
    action: () => {
      document.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'schedule-meeting' } }));
    },
  },
];

/**
 * useVoiceCommands - Real-time voice control hook
 */
export function useVoiceCommands(options: UseVoiceCommandsOptions = {}) {
  const {
    wakeWord = 'hey freeflow',
    wakeWordEnabled = true,
    continuousListening = false,
    language = 'en-US',
    onTranscript,
    onCommand,
    onError,
    commands = defaultCommands,
    enableFeedback = true,
    minConfidence = 0.7,
  } = options;

  // State
  const [state, setState] = useState<VoiceCommandsState>({
    isListening: false,
    isProcessing: false,
    isWakeWordActive: false,
    lastTranscript: '',
    lastCommand: null,
    error: null,
    confidence: 0,
  });

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wakeWordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const allCommands = useRef<VoiceCommand[]>([...defaultCommands, ...commands]);

  // Update commands when they change
  useEffect(() => {
    allCommands.current = [...defaultCommands, ...commands.filter(c => !defaultCommands.find(d => d.id === c.id))];
  }, [commands]);

  /**
   * Match transcript against command patterns
   */
  const matchCommand = useCallback((transcript: string): { command: VoiceCommand; params: CommandParams } | null => {
    const normalizedTranscript = transcript.toLowerCase().trim();

    for (const command of allCommands.current) {
      for (const pattern of command.patterns) {
        const normalizedPattern = pattern.toLowerCase();

        // Check for wildcard patterns
        if (normalizedPattern.includes('*')) {
          const regex = new RegExp(
            '^' + normalizedPattern.replace(/\*/g, '(.+)') + '$',
            'i'
          );
          const match = normalizedTranscript.match(regex);

          if (match) {
            const extractedEntities: Record<string, string> = {};
            match.slice(1).forEach((m, i) => {
              extractedEntities['*'] = m.trim();
            });

            return {
              command,
              params: {
                transcript: normalizedTranscript,
                matchedPattern: pattern,
                extractedEntities,
                confidence: 0.9,
              },
            };
          }
        } else {
          // Exact match or fuzzy match
          if (normalizedTranscript === normalizedPattern ||
              normalizedTranscript.includes(normalizedPattern) ||
              fuzzyMatch(normalizedTranscript, normalizedPattern) > 0.8) {
            return {
              command,
              params: {
                transcript: normalizedTranscript,
                matchedPattern: pattern,
                extractedEntities: {},
                confidence: fuzzyMatch(normalizedTranscript, normalizedPattern),
              },
            };
          }
        }
      }
    }

    return null;
  }, []);

  /**
   * Process transcript and execute matching command
   */
  const processTranscript = useCallback(async (transcript: string) => {
    setState(prev => ({ ...prev, isProcessing: true, lastTranscript: transcript }));

    try {
      // Check for wake word if enabled
      const normalizedTranscript = transcript.toLowerCase().trim();

      if (wakeWordEnabled && !state.isWakeWordActive) {
        if (normalizedTranscript.includes(wakeWord.toLowerCase())) {
          setState(prev => ({ ...prev, isWakeWordActive: true }));
          if (enableFeedback) {
            toast.success('Listening for command...');
          }
          // Set timeout to deactivate wake word after 10 seconds
          if (wakeWordTimeoutRef.current) {
            clearTimeout(wakeWordTimeoutRef.current);
          }
          wakeWordTimeoutRef.current = setTimeout(() => {
            setState(prev => ({ ...prev, isWakeWordActive: false }));
          }, 10000);
          return;
        }
        // If wake word not detected and not active, ignore
        return;
      }

      // Remove wake word from transcript if present
      let commandTranscript = normalizedTranscript;
      if (wakeWordEnabled) {
        commandTranscript = normalizedTranscript.replace(wakeWord.toLowerCase(), '').trim();
      }

      // Match command
      const match = matchCommand(commandTranscript);

      if (match && match.params.confidence >= minConfidence) {
        const { command, params } = match;

        setState(prev => ({
          ...prev,
          lastCommand: command,
          confidence: params.confidence,
          isWakeWordActive: false,
        }));

        // Execute command
        if (command.requiresConfirmation) {
          if (enableFeedback) {
            toast.info(`Execute "${command.description}"?`, {
              action: {
                label: 'Confirm',
                onClick: async () => {
                  await command.action(params);
                  onCommand?.(command, params);
                },
              },
            });
          }
        } else {
          await command.action(params);
          onCommand?.(command, params);

          if (enableFeedback) {
            toast.success(`${command.description}`);
          }
        }

        // Clear wake word timeout
        if (wakeWordTimeoutRef.current) {
          clearTimeout(wakeWordTimeoutRef.current);
          wakeWordTimeoutRef.current = null;
        }
      } else if (state.isWakeWordActive) {
        // No command matched but wake word was active
        if (enableFeedback) {
          toast.error('Command not recognized. Try again.');
        }
        setState(prev => ({ ...prev, isWakeWordActive: false }));
      }

      // Callback
      onTranscript?.(transcript);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState(prev => ({ ...prev, error: err.message }));
      onError?.(err);
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [wakeWord, wakeWordEnabled, state.isWakeWordActive, matchCommand, minConfidence, enableFeedback, onCommand, onTranscript, onError]);

  /**
   * Start listening
   */
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const error = new Error('Speech recognition not supported in this browser');
      setState(prev => ({ ...prev, error: error.message }));
      onError?.(error);
      return;
    }

    // Create recognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = continuousListening;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        processTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Speech recognition error';

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied';
          break;
        case 'network':
          errorMessage = 'Network error';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }

      setState(prev => ({ ...prev, error: errorMessage, isListening: false }));
      onError?.(new Error(errorMessage));
    };

    recognition.onend = () => {
      if (continuousListening && state.isListening) {
        // Restart recognition for continuous mode
        try {
          recognition.start();
        } catch {
          setState(prev => ({ ...prev, isListening: false }));
        }
      } else {
        setState(prev => ({ ...prev, isListening: false }));
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to start recognition');
      setState(prev => ({ ...prev, error: err.message }));
      onError?.(err);
    }
  }, [continuousListening, language, onError, processTranscript, state.isListening]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setState(prev => ({ ...prev, isListening: false, isWakeWordActive: false }));

    if (wakeWordTimeoutRef.current) {
      clearTimeout(wakeWordTimeoutRef.current);
      wakeWordTimeoutRef.current = null;
    }
  }, []);

  /**
   * Toggle listening
   */
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  /**
   * Register custom command
   */
  const registerCommand = useCallback((command: VoiceCommand) => {
    allCommands.current = [...allCommands.current.filter(c => c.id !== command.id), command];
  }, []);

  /**
   * Unregister command
   */
  const unregisterCommand = useCallback((commandId: string) => {
    allCommands.current = allCommands.current.filter(c => c.id !== commandId);
  }, []);

  /**
   * Get available commands by category
   */
  const getCommandsByCategory = useCallback((category: VoiceCommandCategory) => {
    return allCommands.current.filter(c => c.category === category);
  }, []);

  /**
   * Get all available commands
   */
  const getAllCommands = useCallback(() => {
    return allCommands.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (wakeWordTimeoutRef.current) {
        clearTimeout(wakeWordTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    registerCommand,
    unregisterCommand,
    getCommandsByCategory,
    getAllCommands,
  };
}

// Fuzzy matching helper
function fuzzyMatch(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return dp[m][n];
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default useVoiceCommands;
