'use client';

import { useState, useCallback } from 'react';
import { UIMessage } from '@ai-sdk/react';

// Enhanced tool input types for FreeflowZee
export interface ProjectAnalysisInput {
  projectType: 'website' | 'logo' | 'branding' | 'mobile-app' | 'video' | 'content';
  budget: number;
  timeline: string;
  clientRequirements: string;
}

export interface CreativeAssetInput {
  assetType: 'color-palette' | 'typography' | 'layout' | 'imagery' | 'branding-elements';
  style: string;
  industry: string;
  targetAudience: string;
}

export interface ClientCommunicationInput {
  communicationType: 'proposal' | 'update' | 'invoice' | 'feedback-request' | 'project-completion';
  projectContext: string;
  clientName: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface TimeBudgetInput {
  availableHours: number;
  projectCount: number;
  deadlines: string[];
  priorities: ('low' | 'medium' | 'high' | 'urgent')[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: Array<{
    toolName: string;
    args: unknown;
    result?: unknown;
  }>;
  timestamp: number;
}

export interface StreamingMetadata {
  startTime: number;
  duration?: number;
  tokensUsed?: number;
  toolsUsed: string[];
  errorCount: number;
}

interface AIResponse {
  text: string;
  reasoning?: string;
  sources?: unknown[];
  usage?: unknown;
  finishReason?: string;
  toolCalls?: unknown[];
}

interface AIOptions {
  useWebSearch?: boolean;
  useFileSearch?: boolean;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export function useFreeflowAI() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<StreamingMetadata>({
    startTime: Date.now(),
    toolsUsed: [],
    errorCount: 0,
  });

  // Function for non-streaming text generation
  const generateText = async (
    prompt: string | UIMessage[],
    options: AIOptions = {}
  ): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/enhanced-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(typeof prompt === 'string' ? { prompt } : { messages: prompt }),
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate text');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      return {
        text: data.text,
        reasoning: data.reasoning,
        sources: data.sources,
        usage: data.usage,
        finishReason: data.finishReason,
        toolCalls: data.toolCalls,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate text';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function for streaming text generation
  const streamText = async (
    prompt: string | UIMessage[],
    options: AIOptions = {},
    onChunk: (chunk: string) => void
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/stream-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(typeof prompt === 'string' ? { prompt } : { messages: prompt }),
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to stream text');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream not available');
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5).trim();
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                onChunk(parsed.text);
              }
            } catch (e) {
              console.warn('Failed to parse chunk: ', e);
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stream text';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to send a message
  const sendMessage = useCallback(async (prompt: string, toolType?: string) => {
    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    if (toolType) {
      setMetadata(prev => ({ 
        ...prev, 
        startTime: Date.now(),
        toolsUsed: [...prev.toolsUsed, toolType],
      }));
    }

    try {
      const response = await fetch('/api/ai/enhanced-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          
          if (value) {
            const chunk = decoder.decode(value);
            fullContent += chunk;
          }
        }
      }

      const assistantMessage: AIMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fullContent,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setMetadata(prev => ({
        ...prev,
        duration: Date.now() - prev.startTime,
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setMetadata(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [messages, setMetadata]);

  // Project Analysis Tool
  const analyzeProject = useCallback((input: ProjectAnalysisInput) => {
    const prompt = `Please analyze this project using the project analysis tool:
- Project Type: ${input.projectType}
- Budget: $${input.budget}
- Timeline: ${input.timeline}
- Requirements: ${input.clientRequirements}

Please provide a comprehensive analysis with recommended steps, time estimates, risk factors, and pricing suggestions.`;

    sendMessage(prompt, 'projectAnalysis');
  }, [sendMessage]);

  // Creative Asset Generator Tool
  const generateCreativeAssets = useCallback((input: CreativeAssetInput) => {
    const prompt = `Please generate creative assets using the creative asset tool:
- Asset Type: ${input.assetType}
- Style: ${input.style}
- Industry: ${input.industry}
- Target Audience: ${input.targetAudience}

Please provide detailed suggestions with rationale for the creative direction.`;

    sendMessage(prompt, 'creativeAsset');
  }, [sendMessage]);

  // Client Communication Tool
  const generateClientCommunication = useCallback((input: ClientCommunicationInput) => {
    const prompt = `Please generate professional client communication using the client communication tool:
- Communication Type: ${input.communicationType}
- Project Context: ${input.projectContext}
- Client Name: ${input.clientName}
- Urgency: ${input.urgency}

Please provide a professional template with appropriate tone and next steps.`;

    sendMessage(prompt, 'clientCommunication');
  }, [sendMessage]);

  // Time Budget Optimization Tool
  const optimizeTimeBudget = useCallback((input: TimeBudgetInput) => {
    const prompt = `Please optimize time allocation using the time budget tool:
- Available Hours: ${input.availableHours}
- Project Count: ${input.projectCount}
- Deadlines: ${input.deadlines.join(', ')}
- Priorities: ${input.priorities.join(', ')}

Please provide optimized time allocation and productivity recommendations.`;

    sendMessage(prompt, 'timeBudget');
  }, [sendMessage]);

  // General chat with context awareness
  const chatWithContext = useCallback((message: string, context?: string) => {
    const contextualMessage = context 
      ? `Context: ${context}\n\nUser: ${message}`
      : message;

    sendMessage(contextualMessage);
  }, [sendMessage]);

  // Reset conversation
  const resetConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    setMetadata({
      startTime: Date.now(),
      toolsUsed: [],
      errorCount: 0,
    });
  }, []);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    const currentTime = Date.now();
    const sessionDuration = currentTime - metadata.startTime;
    
    return {
      sessionDuration: Math.round(sessionDuration / 1000), // seconds
      messageCount: messages.length,
      toolsUsed: metadata.toolsUsed.length,
      uniqueTools: [...new Set(metadata.toolsUsed)].length,
      errorRate: metadata.errorCount / Math.max(messages.length, 1),
      avgResponseTime: metadata.duration ? Math.round(metadata.duration / 1000) : 0,
      tokensUsed: metadata.tokensUsed || 0,
    };
  }, [messages.length, metadata]);

  return {
    // Core chat functionality
    messages,
    isLoading,
    error,

    // FreeflowZee-specific tools
    analyzeProject,
    generateCreativeAssets,
    generateClientCommunication,
    optimizeTimeBudget,
    chatWithContext,

    // Utility functions
    resetConversation,
    getPerformanceMetrics,

    // Metadata and analytics
    metadata,
    performanceMetrics: getPerformanceMetrics(),

    // New text generation functions
    generateText,
    streamText,
  };
} 