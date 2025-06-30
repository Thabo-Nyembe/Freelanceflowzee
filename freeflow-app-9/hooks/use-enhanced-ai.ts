import { useState } from 'react';

interface UseEnhancedAIOptions {
  useWebSearch?: boolean;
  useFileSearch?: boolean;
}

interface AIResponse {
  success: boolean;
  text: string;
  sources?: any[];
  usage?: any;
  finishReason?: string;
  toolCalls?: any[];
  error?: string;
  details?: string;
}

export function useEnhancedAI(options: UseEnhancedAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateText = async (
    prompt: string,
    messages?: any[],
    customOptions?: UseEnhancedAIOptions
  ) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const requestBody = {
        prompt,
        messages: messages || [],
        useWebSearch: customOptions?.useWebSearch ?? options.useWebSearch ?? false,
        useFileSearch: customOptions?.useFileSearch ?? options.useFileSearch ?? false,
      };

      const res = await fetch('/api/ai/enhanced-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'AI generation failed');
      }

      setResponse(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateWithWebSearch = (prompt: string, messages?: any[]) => {
    return generateText(prompt, messages, { useWebSearch: true });
  };

  const generateWithFileSearch = (prompt: string, messages?: any[]) => {
    return generateText(prompt, messages, { useFileSearch: true });
  };

  const generateWithBothTools = (prompt: string, messages?: any[]) => {
    return generateText(prompt, messages, { 
      useWebSearch: true, 
      useFileSearch: true 
    });
  };

  return {
    generateText,
    generateWithWebSearch,
    generateWithFileSearch,
    generateWithBothTools,
    isLoading,
    response,
    error,
    // Derived values for easier access
    text: response?.text,
    sources: response?.sources,
    toolCalls: response?.toolCalls,
    usage: response?.usage,
  };
} 