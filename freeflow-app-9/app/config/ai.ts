export const aiConfig = {
  modelSettings: {
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.95,
    presencePenalty: 0.1,
    frequencyPenalty: 0.1,
  },
  
  models: {
    chat: 'gpt-4-turbo-preview',
    analyze: 'gpt-4-turbo-preview',
    generate: 'gpt-4-turbo-preview',
  },

  features: {
    chat: {
      enabled: true,
      streamingEnabled: true,
      maxHistoryLength: 10,
    },
    analyze: {
      enabled: true,
      maxAssetSize: 10 * 1024 * 1024, // 10MB
      supportedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    },
    generate: {
      enabled: true,
      maxPromptLength: 1000,
      supportedTypes: ['text', 'image', 'code'],
    },
  },
} as const 