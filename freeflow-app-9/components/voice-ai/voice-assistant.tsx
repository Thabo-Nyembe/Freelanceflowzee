'use client'

/**
 * Voice Assistant Component
 *
 * Full voice interface for hands-free FreeFlow operation
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Settings,
  X,
  Loader2,
  Send,
  ChevronDown,
  ChevronUp,
  Keyboard,
  Globe,
  Sparkles,
  History,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useVoiceAI } from '@/lib/hooks/use-voice-ai'
import { toast } from 'sonner'

interface VoiceAssistantProps {
  className?: string
  defaultOpen?: boolean
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export function VoiceAssistant({
  className,
  defaultOpen = false,
  position = 'bottom-right',
}: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isExpanded, setIsExpanded] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState('nova')
  const [speechRate, setSpeechRate] = useState(1)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')

  const inputRef = useRef<HTMLInputElement>(null)

  const {
    isListening,
    isSpeaking,
    transcript,
    lastCommand,
    error,
    isSupported,
    conversationHistory,
    startListening,
    stopListening,
    toggleListening,
    speakAI,
    stopSpeaking,
    sendVoiceMessage,
    clearConversation,
    clearTranscript,
    clearError,
    getAvailableCommands,
    getSupportedLanguages,
    getOpenAIVoices,
  } = useVoiceAI({
    language: selectedLanguage,
    voice: selectedVoice,
    speakFeedback: autoSpeak,
    onCommand: (command, action) => {
      toast.success(`Command: ${action}`, { description: command })
    },
    onError: (err) => {
      toast.error('Voice AI Error', { description: err })
    },
  })

  // Handle text message send
  const handleSendMessage = useCallback(async () => {
    const message = textInput.trim() || transcript.trim()
    if (!message) return

    setTextInput('')
    clearTranscript()

    const response = await sendVoiceMessage(message)
    if (response && autoSpeak) {
      // Audio is auto-played by the hook
    }
  }, [textInput, transcript, sendVoiceMessage, autoSpeak, clearTranscript])

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  // Position styles
  const positionStyles = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }

  // Render floating button when closed
  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn('fixed z-50', positionStyles[position], className)}
      >
        <Button
          size="lg"
          className={cn(
            'rounded-full w-14 h-14 shadow-lg',
            isListening && 'animate-pulse bg-red-500 hover:bg-red-600'
          )}
          onClick={() => setIsOpen(true)}
        >
          {isListening ? (
            <Mic className="h-6 w-6" />
          ) : (
            <MessageSquare className="h-6 w-6" />
          )}
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={cn(
        'fixed z-50',
        positionStyles[position],
        isExpanded ? 'w-96 h-[600px]' : 'w-80 h-[400px]',
        className
      )}
    >
      <Card className="h-full flex flex-col shadow-2xl">
        {/* Header */}
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Voice Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-2 mt-2">
            {isListening && (
              <Badge variant="destructive" className="animate-pulse">
                <Mic className="h-3 w-3 mr-1" />
                Listening
              </Badge>
            )}
            {isSpeaking && (
              <Badge variant="secondary">
                <Volume2 className="h-3 w-3 mr-1" />
                Speaking
              </Badge>
            )}
            {lastCommand && (
              <Badge variant="outline" className="text-xs">
                {lastCommand}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden p-3">
          {showSettings ? (
            /* Settings Panel */
            <div className="space-y-4">
              <div>
                <Label>Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getOpenAIVoices().map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name} - {voice.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getSupportedLanguages().map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Speech Rate: {speechRate}x</Label>
                <Slider
                  value={[speechRate]}
                  onValueChange={([v]) => setSpeechRate(v)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Auto-speak responses</Label>
                <Switch checked={autoSpeak} onCheckedChange={setAutoSpeak} />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowSettings(false)}
              >
                Done
              </Button>
            </div>
          ) : showHistory ? (
            /* Conversation History */
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <Label>Conversation History</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearConversation}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {conversationHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        'p-2 rounded-lg text-sm',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-4'
                          : 'bg-muted mr-4'
                      )}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {conversationHistory.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">
                      No conversation yet
                    </p>
                  )}
                </div>
              </ScrollArea>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => setShowHistory(false)}
              >
                Back
              </Button>
            </div>
          ) : (
            /* Main Interface */
            <Tabs defaultValue="conversation" className="flex-1 flex flex-col">
              <TabsList className="w-full">
                <TabsTrigger value="conversation" className="flex-1">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="commands" className="flex-1">
                  Commands
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conversation" className="flex-1 flex flex-col mt-2">
                {/* Messages */}
                <ScrollArea className="flex-1 mb-2">
                  <div className="space-y-2 pr-2">
                    {conversationHistory.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'p-3 rounded-lg',
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground ml-8'
                            : 'bg-muted mr-8'
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </motion.div>
                    ))}
                    {transcript && (
                      <div className="p-3 rounded-lg bg-primary/20 ml-8">
                        <p className="text-sm italic">{transcript}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant={isListening ? 'destructive' : 'secondary'}
                    onClick={toggleListening}
                    disabled={!isSupported}
                    className="flex-shrink-0"
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>

                  <Input
                    ref={inputRef}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type or speak..."
                    className="flex-1"
                  />

                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!textInput.trim() && !transcript.trim()}
                    className="flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>

                  {isSpeaking && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={stopSpeaking}
                      className="flex-shrink-0"
                    >
                      <VolumeX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="commands" className="flex-1">
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {getAvailableCommands().map((cmd, i) => (
                      <div
                        key={i}
                        className="p-2 rounded border text-sm"
                      >
                        <div className="font-medium">{cmd.description}</div>
                        <div className="text-muted-foreground text-xs mt-1">
                          Say: "{typeof cmd.patterns[0] === 'string' ? cmd.patterns[0] : 'Pattern'}"
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}

          {/* Error display */}
          {error && (
            <div className="mt-2 p-2 rounded bg-destructive/10 text-destructive text-sm flex items-center justify-between">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default VoiceAssistant
