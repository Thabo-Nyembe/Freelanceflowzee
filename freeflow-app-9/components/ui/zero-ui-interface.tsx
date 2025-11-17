'use client'

import * as React from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Mic,
  MicOff,
  Eye,
  EyeOff,
  Hand,
  Brain,
  Zap,
  Waves,
  Activity,
  Pulse,
  Focus,
  Compass,
  Target,
  Volume2,
  VolumeX,
  Vibrate,
  Bluetooth,
  Wifi
} from 'lucide-react'

// Context7 MCP Zero-UI Interface Types
interface VoiceCommand {
  phrase: string
  action: string
  confidence: number
  context?: Record<string, any>
}

interface GestureCommand {
  type: 'swipe' | 'pinch' | 'tap' | 'hold' | 'point' | 'grab'
  direction?: 'up' | 'down' | 'left' | 'right'
  strength: number
  position: { x: number; y: number }
}

interface BrainWaveCommand {
  pattern: 'focus' | 'relax' | 'intent' | 'select'
  intensity: number
  duration: number
}

interface ZeroUIState {
  voiceActive: boolean
  gestureActive: boolean
  eyeTrackingActive: boolean
  brainWaveActive: boolean
  ambientMode: boolean
  invisibleInteractions: boolean
  predictiveActions: boolean
  contextualAdaptation: boolean
}

// Voice Command Interface
export function VoiceCommandInterface({
  onCommand,
  isListening = false,
  className
}: {
  onCommand?: (command: VoiceCommand) => void
  isListening?: boolean
  className?: string
}) {
  const [voiceState, setVoiceState] = React.useState({
    isActive: isListening,
    isProcessing: false,
    currentCommand: null as string | null,
    confidence: 0,
    waveform: Array(20).fill(0)
  })

  const [recognition, setRecognition] = React.useState<SpeechRecognition | null>(null)

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isActive: true }))
      }

      recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1]
        const transcript = result[0].transcript
        const confidence = result[0].confidence

        setVoiceState(prev => ({
          ...prev,
          currentCommand: transcript,
          confidence: confidence || 0.8,
          isProcessing: true
        }))

        if (result.isFinal) {
          onCommand?.({
            phrase: transcript,
            action: parseVoiceCommand(transcript),
            confidence: confidence || 0.8
          })

          setTimeout(() => {
            setVoiceState(prev => ({ ...prev, isProcessing: false, currentCommand: null }))
          }, 1000)
        }
      }

      recognition.onerror = () => {
        setVoiceState(prev => ({ ...prev, isActive: false, isProcessing: false }))
      }

      setRecognition(recognition)
    }
  }, [onCommand])

  const parseVoiceCommand = (transcript: string): string => {
    const commands = {
      'open': ['open', 'launch', 'start'],
      'close': ['close', 'exit', 'stop'],
      'navigate': ['go to', 'navigate', 'show'],
      'create': ['create', 'new', 'add'],
      'search': ['search', 'find', 'look for'],
      'help': ['help', 'assist', 'support']
    }

    for (const [action, phrases] of Object.entries(commands)) {
      if (phrases.some(phrase => transcript.toLowerCase().includes(phrase))) {
        return action
      }
    }

    return 'unknown'
  }

  const toggleListening = () => {
    if (voiceState.isActive) {
      recognition?.stop()
      setVoiceState(prev => ({ ...prev, isActive: false }))
    } else {
      recognition?.start()
    }
  }

  // Simulate audio waveform
  React.useEffect(() => {
    if (!voiceState.isActive) return

    const interval = setInterval(() => {
      setVoiceState(prev => ({
        ...prev,
        waveform: prev.waveform.map(() => Math.random() * (voiceState.isProcessing ? 80 : 20))
      }))
    }, 100)

    return () => clearInterval(interval)
  }, [voiceState.isActive, voiceState.isProcessing])

  return (
    <motion.div
      className={cn(
        "relative p-4 rounded-2xl backdrop-blur-xl",
        voiceState.isActive
          ? "bg-blue-500/20 border-blue-400/50"
          : "bg-gray-900/20 border-gray-600/30",
        "border transition-all duration-300",
        className
      )}
      animate={voiceState.isActive ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 2, repeat: voiceState.isActive ? Infinity : 0 }}
    >
      {/* Voice Activation Button */}
      <div className="flex items-center justify-center mb-4">
        <Button
          size="lg"
          variant={voiceState.isActive ? "default" : "outline"}
          onClick={toggleListening}
          className={cn(
            "rounded-full w-16 h-16 p-0",
            voiceState.isActive && "bg-blue-500 hover:bg-blue-600"
          )}
        >
          {voiceState.isActive ? (
            <Mic className="h-6 w-6" />
          ) : (
            <MicOff className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Audio Waveform Visualization */}
      <AnimatePresence>
        {voiceState.isActive && (
          <motion.div
            className="flex items-center justify-center space-x-1 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {voiceState.waveform.map((height, index) => (
              <motion.div
                key={index}
                className={cn(
                  "w-1 rounded-full",
                  voiceState.isProcessing ? "bg-green-400" : "bg-blue-400"
                )}
                animate={{ height: Math.max(4, height) }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Display */}
      <AnimatePresence>
        {voiceState.currentCommand && (
          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="text-sm text-gray-300">Recognized:</div>
            <div className="text-lg font-medium text-white">
              "{voiceState.currentCommand}"
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Activity className="h-3 w-3" />
              <span>Confidence: {Math.round(voiceState.confidence * 100)}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Indicator */}
      <div className="absolute top-2 right-2">
        <div
          className={cn(
            "w-3 h-3 rounded-full",
            voiceState.isActive ? "bg-green-400 animate-pulse" : "bg-gray-500"
          )}
        />
      </div>
    </motion.div>
  )
}

// Eye Tracking Interface
export function EyeTrackingInterface({
  onGaze,
  isActive = false,
  className
}: {
  onGaze?: (position: { x: number; y: number }, fixation: boolean) => void
  isActive?: boolean
  className?: string
}) {
  const [eyeState, setEyeState] = React.useState({
    isCalibrating: false,
    gazePosition: { x: 50, y: 50 },
    fixationStrength: 0,
    blinkCount: 0,
    isFixating: false
  })

  // Simulate eye tracking
  React.useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      const newX = Math.max(0, Math.min(100, eyeState.gazePosition.x + (Math.random() - 0.5) * 10))
      const newY = Math.max(0, Math.min(100, eyeState.gazePosition.y + (Math.random() - 0.5) * 10))
      const fixation = Math.random() > 0.8
      const strength = fixation ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3

      setEyeState(prev => ({
        ...prev,
        gazePosition: { x: newX, y: newY },
        fixationStrength: strength,
        isFixating: fixation,
        blinkCount: Math.random() > 0.95 ? prev.blinkCount + 1 : prev.blinkCount
      }))

      onGaze?.({ x: newX, y: newY }, fixation)
    }, 100)

    return () => clearInterval(interval)
  }, [isActive, eyeState.gazePosition, onGaze])

  return (
    <div className={cn("relative w-full h-64 rounded-2xl overflow-hidden", className)}>
      {/* Eye Tracking Visualization */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl">
        {/* Gaze Point */}
        <motion.div
          className={cn(
            "absolute w-6 h-6 rounded-full border-2 border-white shadow-lg",
            eyeState.isFixating ? "bg-green-400/80" : "bg-blue-400/60"
          )}
          style={{
            left: `${eyeState.gazePosition.x}%`,
            top: `${eyeState.gazePosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: eyeState.isFixating ? [1, 1.5, 1] : 1,
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: eyeState.isFixating ? 0.5 : 2,
            repeat: Infinity
          }}
        />

        {/* Fixation Heatmap */}
        {eyeState.isFixating && (
          <motion.div
            className="absolute bg-gradient-radial from-red-400/40 via-yellow-400/20 to-transparent rounded-full"
            style={{
              width: `${eyeState.fixationStrength * 100}px`,
              height: `${eyeState.fixationStrength * 100}px`,
              left: `${eyeState.gazePosition.x}%`,
              top: `${eyeState.gazePosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          />
        )}

        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-6 h-full">
            {Array(48).fill(0).map((_, i) => (
              <div key={i} className="border border-white/10" />
            ))}
          </div>
        </div>
      </div>

      {/* Eye Tracking Status */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-white">
          <Eye className="h-4 w-4" />
          <span>Eye Tracking</span>
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isActive ? "bg-green-400 animate-pulse" : "bg-gray-500"
            )}
          />
        </div>

        <div className="text-xs text-gray-300 space-y-1">
          <div>Gaze: ({Math.round(eyeState.gazePosition.x)}, {Math.round(eyeState.gazePosition.y)})</div>
          <div>Fixation: {Math.round(eyeState.fixationStrength * 100)}%</div>
          <div>Blinks: {eyeState.blinkCount}</div>
        </div>
      </div>

      {/* Calibration Button */}
      <div className="absolute top-4 right-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setEyeState(prev => ({ ...prev, isCalibrating: !prev.isCalibrating }))}
          className="bg-white/10 border-white/20 text-white"
        >
          <Target className="h-3 w-3 mr-1" />
          Calibrate
        </Button>
      </div>
    </div>
  )
}

// Ambient Computing Interface
export function AmbientInterface({
  children,
  adaptToContext = true,
  invisible = false,
  className
}: {
  children: React.ReactNode
  adaptToContext?: boolean
  invisible?: boolean
  className?: string
}) {
  const [ambientState, setAmbientState] = React.useState({
    proximityLevel: 0,
    ambientLighting: 50,
    soundLevel: 30,
    userPresence: false,
    contextualActions: [] as string[],
    environmentalData: {
      temperature: 22,
      humidity: 45,
      noise: 35
    }
  })

  // Simulate ambient sensing
  React.useEffect(() => {
    if (!adaptToContext) return

    const interval = setInterval(() => {
      const proximity = Math.random() * 100
      const presence = proximity > 60

      setAmbientState(prev => ({
        ...prev,
        proximityLevel: proximity,
        userPresence: presence,
        ambientLighting: Math.random() * 100,
        soundLevel: Math.random() * 80,
        contextualActions: presence
          ? ['Show quick actions', 'Adjust brightness', 'Enable voice']
          : [],
        environmentalData: {
          temperature: 20 + Math.random() * 10,
          humidity: 40 + Math.random() * 20,
          noise: 20 + Math.random() * 60
        }
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [adaptToContext])

  return (
    <motion.div
      className={cn(
        "relative transition-all duration-1000",
        invisible && !ambientState.userPresence && "opacity-20",
        className
      )}
      animate={{
        opacity: invisible
          ? (ambientState.userPresence ? 1 : 0.2)
          : 1,
        scale: ambientState.proximityLevel > 80 ? 1.02 : 1
      }}
    >
      {/* Ambient Glow Effect */}
      <motion.div
        className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl"
        animate={{
          opacity: ambientState.userPresence ? 0.6 : 0.2,
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Contextual Actions Overlay */}
      <AnimatePresence>
        {ambientState.userPresence && ambientState.contextualActions.length > 0 && (
          <motion.div
            className="absolute -top-12 left-0 right-0 flex justify-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex gap-2">
              {ambientState.contextualActions.map((action, index) => (
                <motion.div
                  key={action}
                  className="px-3 py-1 bg-black/60 text-white rounded-full text-xs backdrop-blur-xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {action}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proximity Indicator */}
      <div className="absolute top-2 left-2">
        <motion.div
          className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Environmental Data Panel */}
      {ambientState.userPresence && (
        <motion.div
          className="absolute top-2 right-2 p-2 bg-black/40 rounded-lg text-xs text-white backdrop-blur-xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="space-y-1">
            <div>🌡️ {Math.round(ambientState.environmentalData.temperature)}°C</div>
            <div>💧 {Math.round(ambientState.environmentalData.humidity)}%</div>
            <div>🔊 {Math.round(ambientState.environmentalData.noise)}dB</div>
          </div>
        </motion.div>
      )}

      {children}
    </motion.div>
  )
}

// Brain-Computer Interface (Conceptual)
export function BrainComputerInterface({
  onBrainWave,
  isActive = false,
  className
}: {
  onBrainWave?: (command: BrainWaveCommand) => void
  isActive?: boolean
  className?: string
}) {
  const [brainState, setBrainState] = React.useState({
    isConnected: false,
    signalStrength: 0,
    currentPattern: null as string | null,
    meditation: 0,
    attention: 0,
    eyeBlink: 0,
    rawWaves: Array(8).fill(0)
  })

  // Simulate EEG data
  React.useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      const attention = Math.random() * 100
      const meditation = Math.random() * 100
      const patterns = ['focus', 'relax', 'intent', 'select']
      const pattern = attention > 70 ? patterns[Math.floor(Math.random() * patterns.length)] : null

      setBrainState(prev => ({
        ...prev,
        isConnected: true,
        signalStrength: Math.random() * 100,
        attention,
        meditation,
        currentPattern: pattern,
        eyeBlink: Math.random() > 0.95 ? prev.eyeBlink + 1 : prev.eyeBlink,
        rawWaves: Array(8).fill(0).map(() => Math.random() * 100)
      }))

      if (pattern) {
        onBrainWave?.({
          pattern: pattern as any,
          intensity: attention / 100,
          duration: 1000
        })
      }
    }, 500)

    return () => clearInterval(interval)
  }, [isActive, onBrainWave])

  return (
    <div className={cn("relative p-4 rounded-2xl backdrop-blur-xl", className)}>
      {/* Brain Wave Visualization */}
      <div className="relative h-32 mb-4 bg-black/20 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-center space-x-1 p-2">
          {brainState.rawWaves.map((wave, index) => (
            <motion.div
              key={index}
              className="w-4 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-t"
              animate={{ height: `${wave}%` }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </div>

        {/* Pattern Recognition */}
        <AnimatePresence>
          {brainState.currentPattern && (
            <motion.div
              className="absolute top-2 left-2 px-2 py-1 bg-green-500/80 text-white rounded text-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Brain className="h-3 w-3 inline mr-1" />
              {brainState.currentPattern}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Attention:</span>
            <span className="text-white">{Math.round(brainState.attention)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Meditation:</span>
            <span className="text-white">{Math.round(brainState.meditation)}%</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Signal:</span>
            <span className="text-white">{Math.round(brainState.signalStrength)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Blinks:</span>
            <span className="text-white">{brainState.eyeBlink}</span>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="absolute top-2 right-2 flex items-center gap-1 text-xs">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            brainState.isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
          )}
        />
        <span className="text-white">
          {brainState.isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </div>
  )
}

// Zero UI Master Controller
export function ZeroUIController({
  children,
  features = {
    voice: true,
    gesture: true,
    eyeTracking: false,
    ambient: true,
    brainWave: false
  },
  onCommand,
  className
}: {
  children: React.ReactNode
  features?: {
    voice?: boolean
    gesture?: boolean
    eyeTracking?: boolean
    ambient?: boolean
    brainWave?: boolean
  }
  onCommand?: (source: string, command: any) => void
  className?: string
}) {
  const [zeroUIState, setZeroUIState] = React.useState<ZeroUIState>({
    voiceActive: features.voice || false,
    gestureActive: features.gesture || false,
    eyeTrackingActive: features.eyeTracking || false,
    brainWaveActive: features.brainWave || false,
    ambientMode: features.ambient || false,
    invisibleInteractions: true,
    predictiveActions: true,
    contextualAdaptation: true
  })

  return (
    <div className={cn("relative", className)}>
      {/* Zero UI Status Indicator */}
      <motion.div
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-black/80 text-white rounded-lg text-sm backdrop-blur-xl"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Zap className="h-4 w-4 text-cyan-400" />
        <span>Zero UI</span>
        <div className="flex gap-1">
          {zeroUIState.voiceActive && <Mic className="h-3 w-3 text-green-400" />}
          {zeroUIState.gestureActive && <Hand className="h-3 w-3 text-blue-400" />}
          {zeroUIState.eyeTrackingActive && <Eye className="h-3 w-3 text-purple-400" />}
          {zeroUIState.brainWaveActive && <Brain className="h-3 w-3 text-pink-400" />}
        </div>
      </motion.div>

      {children}
    </div>
  )
}

// Components are already exported inline above