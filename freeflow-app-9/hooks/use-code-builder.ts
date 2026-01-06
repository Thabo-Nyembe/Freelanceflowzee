/**
 * Code Builder Hook - Manus-like AI Code Generation
 * Provides real-time streaming code generation with SSE
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Types
export interface AgentSession {
  id: string;
  user_id: string;
  status: 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  title?: string;
  model: string;
  provider: string;
  temperature: number;
  max_tokens: number;
  total_tokens_used: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export interface AgentTask {
  id: string;
  session_id: string;
  prompt: string;
  task_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  result?: unknown;
  error?: string;
  started_at?: string;
  completed_at?: string;
  actual_duration_ms?: number;
}

export interface AgentStep {
  id: string;
  task_id: string;
  step_number: number;
  action: string;
  tool: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration_ms?: number;
}

export interface GeneratedFile {
  id: string;
  task_id: string;
  file_path: string;
  file_name: string;
  content: string;
  language: string;
  framework?: string;
  file_type: string;
  size_bytes: number;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_name?: string;
  created_at?: string;
}

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  preview_image?: string;
  usage_count: number;
  rating: number;
}

export interface StreamEvent {
  type: 'start' | 'step' | 'message' | 'file' | 'complete' | 'error';
  sessionId?: string;
  step?: AgentStep;
  message?: AgentMessage;
  file?: GeneratedFile;
  task?: AgentTask;
  files?: GeneratedFile[];
  error?: string;
}

interface UseCodeBuilderOptions {
  onStep?: (step: AgentStep) => void;
  onMessage?: (message: AgentMessage) => void;
  onFile?: (file: GeneratedFile) => void;
  onComplete?: (task: AgentTask, files: GeneratedFile[]) => void;
  onError?: (error: string) => void;
}

export function useCodeBuilder(options: UseCodeBuilderOptions = {}) {
  const supabase = createClient();
  const [session, setSession] = useState<AgentSession | null>(null);
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [currentTask, setCurrentTask] = useState<AgentTask | null>(null);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [templates, setTemplates] = useState<CodeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch all sessions
  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/agent');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sessions');
      }

      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new session
  const createSession = useCallback(async (title?: string, config?: {
    model?: string;
    provider?: string;
    temperature?: number;
    maxTokens?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, ...config })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session');
      }

      setSession(data.session);
      setMessages([]);
      setFiles([]);
      setSteps([]);
      setCurrentTask(null);

      // Refresh sessions list
      await fetchSessions();

      return data.session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSessions]);

  // Load an existing session
  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai/agent/${sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load session');
      }

      setSession(data.session);
      setMessages(data.messages || []);
      setFiles(data.files || []);

      // Get steps from tasks
      if (data.tasks && data.tasks.length > 0) {
        setCurrentTask(data.tasks[0]);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load session';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/ai/agent/${sessionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete session');
      }

      // Clear current session if it was deleted
      if (session?.id === sessionId) {
        setSession(null);
        setMessages([]);
        setFiles([]);
        setSteps([]);
        setCurrentTask(null);
      }

      // Refresh sessions list
      await fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      throw err;
    }
  }, [session, fetchSessions]);

  // Send a message to generate code
  const generateCode = useCallback(async (prompt: string, taskType: string = 'code_generation') => {
    if (!session) {
      throw new Error('No active session. Create or load a session first.');
    }

    setIsGenerating(true);
    setError(null);
    setSteps([]);

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/ai/agent/${session.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, taskType }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Failed to start code generation');
      }

      // Add user message
      const userMessage: AgentMessage = {
        role: 'user',
        content: prompt,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: StreamEvent = JSON.parse(line.slice(6));

              switch (event.type) {
                case 'start':
                  // Session started
                  break;

                case 'step':
                  if (event.step) {
                    setSteps(prev => [...prev, event.step!]);
                    options.onStep?.(event.step);
                  }
                  break;

                case 'message':
                  if (event.message) {
                    setMessages(prev => [...prev, event.message!]);
                    options.onMessage?.(event.message);
                  }
                  break;

                case 'file':
                  if (event.file) {
                    setFiles(prev => [...prev, event.file!]);
                    options.onFile?.(event.file);
                  }
                  break;

                case 'complete':
                  if (event.task) {
                    setCurrentTask(event.task);
                  }
                  if (event.files) {
                    setFiles(event.files);
                  }
                  options.onComplete?.(event.task!, event.files || []);
                  break;

                case 'error':
                  setError(event.error || 'Unknown error');
                  options.onError?.(event.error || 'Unknown error');
                  break;
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Cancelled
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate code';
      setError(errorMessage);
      options.onError?.(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [session, options]);

  // Cancel current generation
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  }, []);

  // Fetch code templates
  const fetchTemplates = useCallback(async (category?: string, framework?: string) => {
    try {
      const { data, error } = await supabase
        .from('code_templates')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;

      let filtered = data || [];
      if (category) {
        filtered = filtered.filter(t => t.category === category);
      }
      if (framework) {
        filtered = filtered.filter(t => t.framework === framework);
      }

      setTemplates(filtered);
      return filtered;
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      return [];
    }
  }, [supabase]);

  // Generate from template
  const generateFromTemplate = useCallback(async (templateId: string, customization?: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const prompt = customization
      ? `Create a ${template.name} using ${template.framework}. Customization: ${customization}`
      : `Create a ${template.name} using ${template.framework} with all standard features.`;

    // Increment usage count
    await supabase
      .from('code_templates')
      .update({ usage_count: template.usage_count + 1 })
      .eq('id', templateId);

    return generateCode(prompt, 'web_app');
  }, [templates, generateCode, supabase]);

  // Download generated files
  const downloadFiles = useCallback(() => {
    if (files.length === 0) return;

    // Create a simple zip-like download (JSON for now)
    const content = files.map(f => ({
      path: f.file_path,
      content: f.content,
      language: f.language
    }));

    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-code-${session?.id || 'files'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [files, session]);

  // Copy file content to clipboard
  const copyFileContent = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      await navigator.clipboard.writeText(file.content);
      return true;
    }
    return false;
  }, [files]);

  // Initialize
  useEffect(() => {
    fetchSessions();
    fetchTemplates();
  }, [fetchSessions, fetchTemplates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    session,
    sessions,
    currentTask,
    steps,
    messages,
    files,
    templates,
    isLoading,
    isGenerating,
    error,

    // Session actions
    createSession,
    loadSession,
    deleteSession,
    fetchSessions,

    // Generation actions
    generateCode,
    cancelGeneration,
    generateFromTemplate,

    // Template actions
    fetchTemplates,

    // File actions
    downloadFiles,
    copyFileContent,

    // Utilities
    clearError: () => setError(null)
  };
}

export default useCodeBuilder;
