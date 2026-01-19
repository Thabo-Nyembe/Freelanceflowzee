/**
 * Voice AI Hook
 *
 * React hook for voice interface functionality
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  speechRecognition,
  textToSpeech,
  voiceCommands,
  SUPPORTED_LANGUAGES,
  OPENAI_VOICES,
} from '@/lib/voice-ai'

export interface UseVoiceAIOptions {
  language?: string
  voice?: string
  speakFeedback?: boolean
  autoStart?: boolean
  onCommand?: (command: string, action: string) => void
  onTranscript?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
}

export interface VoiceAIState {
  isListening: boolean
  isSpeaking: boolean
  transcript: string
  lastCommand: string | null
  error: string | null
  isSupported: boolean
}

export function useVoiceAI(options: UseVoiceAIOptions = {}) {
  const [state, setState] = useState<VoiceAIState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    lastCommand: null,
    error: null,
    isSupported: false,
  })

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversationHistory, setConversationHistory] = useState<
    { role: string; content: string }[]
  >([])

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Check support on mount
  useEffect(() => {
    const isSupported = speechRecognition.isSupported() && textToSpeech.isSupported()
    setState(prev => ({ ...prev, isSupported }))

    // Create audio element for playback
    audioRef.current = new Audio()
    audioRef.current.onended = () => {
      setState(prev => ({ ...prev, isSpeaking: false }))
    }

    return () => {
      stopListening()
      stopSpeaking()
    }
  }, [])

  // Start listening for voice input
  const startListening = useCallback(() => {
    if (!speechRecognition.isSupported()) {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported' }))
      return false
    }

    speechRecognition.configure({
      language: options.language || 'en-US',
      continuous: true,
      interimResults: true,
      onResult: (result) => {
        setState(prev => ({
          ...prev,
          transcript: result.transcript,
        }))
        options.onTranscript?.(result.transcript, result.isFinal)
      },
      onError: (error) => {
        setState(prev => ({ ...prev, error, isListening: false }))
        options.onError?.(error)
      },
      onStart: () => {
        setState(prev => ({ ...prev, isListening: true, error: null }))
      },
      onEnd: () => {
        setState(prev => ({ ...prev, isListening: false }))
      },
    })

    return speechRecognition.start()
  }, [options])

  // Stop listening
  const stopListening = useCallback(() => {
    speechRecognition.stop()
    setState(prev => ({ ...prev, isListening: false }))
  }, [])

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [state.isListening, startListening, stopListening])

  // Speak text using browser TTS
  const speakLocal = useCallback((text: string) => {
    setState(prev => ({ ...prev, isSpeaking: true }))

    textToSpeech.speak(text, {
      language: options.language,
      onEnd: () => {
        setState(prev => ({ ...prev, isSpeaking: false }))
      },
      onError: (error) => {
        setState(prev => ({ ...prev, isSpeaking: false, error }))
      },
    })
  }, [options.language])

  // Speak text using OpenAI TTS (higher quality)
  const speakAI = useCallback(async (text: string) => {
    setState(prev => ({ ...prev, isSpeaking: true }))

    try {
      const response = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'tts',
          text,
          voice: options.voice || 'nova',
        }),
      })

      if (!response.ok) throw new Error('TTS failed')

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        await audioRef.current.play()
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        error: error instanceof Error ? error.message : 'TTS failed',
      }))
    }
  }, [options.voice])

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    textToSpeech.stop()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setState(prev => ({ ...prev, isSpeaking: false }))
  }, [])

  // Start voice commands
  const startVoiceCommands = useCallback(() => {
    voiceCommands.configure({
      language: options.language || 'en-US',
      speakFeedback: options.speakFeedback ?? true,
      onCommand: (command, action) => {
        setState(prev => ({ ...prev, lastCommand: action }))
        options.onCommand?.(command, action)
      },
      onUnrecognized: (transcript) => {
        // Could send to AI for interpretation
        console.log('Unrecognized command:', transcript)
      },
      onListening: (isListening) => {
        setState(prev => ({ ...prev, isListening }))
      },
      onError: (error) => {
        setState(prev => ({ ...prev, error }))
        options.onError?.(error)
      },
    })

    return voiceCommands.start()
  }, [options])

  // Stop voice commands
  const stopVoiceCommands = useCallback(() => {
    voiceCommands.stop()
  }, [])

  // Voice conversation with AI
  const sendVoiceMessage = useCallback(async (message: string) => {
    try {
      setState(prev => ({ ...prev, error: null }))

      const response = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'conversation',
          message,
          conversationId,
          voice: options.voice || 'nova',
        }),
      })

      if (!response.ok) throw new Error('Conversation failed')

      const data = await response.json()

      // Update conversation state
      setConversationId(data.conversationId)
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: data.response.text },
      ])

      // Play audio response
      if (data.response.audio && audioRef.current) {
        setState(prev => ({ ...prev, isSpeaking: true }))
        audioRef.current.src = data.response.audio
        await audioRef.current.play()
      }

      return data.response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Voice conversation failed'
      setState(prev => ({ ...prev, error: errorMessage }))
      options.onError?.(errorMessage)
      return null
    }
  }, [conversationId, options])

  // Transcribe audio file
  const transcribeAudio = useCallback(async (audioFile: File, language?: string) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioFile)
      if (language) formData.append('language', language)

      const response = await fetch('/api/ai/voice', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Transcription failed')

      const data = await response.json()
      return data.transcription
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transcription failed'
      setState(prev => ({ ...prev, error: errorMessage }))
      options.onError?.(errorMessage)
      return null
    }
  }, [options])

  // Clear conversation
  const clearConversation = useCallback(() => {
    setConversationId(null)
    setConversationHistory([])
  }, [])

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }))
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    // State
    ...state,
    conversationId,
    conversationHistory,

    // Listening
    startListening,
    stopListening,
    toggleListening,

    // Speaking
    speakLocal,
    speakAI,
    stopSpeaking,

    // Voice Commands
    startVoiceCommands,
    stopVoiceCommands,
    getAvailableCommands: () => voiceCommands.getCommands(),

    // Conversation
    sendVoiceMessage,
    clearConversation,

    // Transcription
    transcribeAudio,

    // Utilities
    clearTranscript,
    clearError,
    getAvailableVoices: () => textToSpeech.getVoices(),
    getSupportedLanguages: () => SUPPORTED_LANGUAGES,
    getOpenAIVoices: () => OPENAI_VOICES,
  }
}
