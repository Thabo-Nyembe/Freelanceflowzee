import '@tensorflow/tfjs-backend-webgl'
import * as handpose from '@tensorflow-models/handpose'
import { toast } from '@/components/ui/use-toast'

export interface GestureEvent {
  type: 'swipe_left' | 'swipe_right' | 'point' | 'wave' | 'thumbs_up' | 'thumbs_down'
  confidence: number
  timestamp: number
}

export class GestureRecognitionService {
  private model: handpose.HandPose | null = null
  private isProcessing = false
  private lastGesture: GestureEvent | null = null
  private gestureHistory: { x: number; y: number; timestamp: number }[] = []
  private readonly HISTORY_SIZE = 10
  private readonly SWIPE_THRESHOLD = 100
  private readonly GESTURE_COOLDOWN = 1000 // ms

  async initialize() {
    if (this.model) return

    try {
      this.model = await handpose.load()
    } catch (error) {
      console.error('Failed to initialize gesture recognition:', error)
      toast({
        title: 'Error',
        description: 'Failed to initialize gesture recognition. Please try again.',
        variant: 'destructive'
      })
    }
  }

  async detectGestures(
    video: HTMLVideoElement,
    onGestureDetected: (gesture: GestureEvent) => void
  ) {
    if (!this.model || this.isProcessing || !video) return

    this.isProcessing = true

    try {
      // Get hand landmarks
      const predictions = await this.model.estimateHands(video)

      if (predictions.length > 0) {
        const hand = predictions[0]
        const palmBase = hand.landmarks[0]
        const currentTime = Date.now()

        // Update gesture history
        this.gestureHistory.push({
          x: palmBase[0],
          y: palmBase[1],
          timestamp: currentTime
        })

        // Keep history size limited
        if (this.gestureHistory.length > this.HISTORY_SIZE) {
          this.gestureHistory.shift()
        }

        // Detect gestures
        const gesture = this.analyzeGesture(hand.landmarks, currentTime)

        if (gesture && (!this.lastGesture || 
            (currentTime - this.lastGesture.timestamp > this.GESTURE_COOLDOWN))) {
          this.lastGesture = gesture
          onGestureDetected(gesture)
        }
      }
    } catch (error) {
      console.error('Error detecting gestures:', error)
    }

    this.isProcessing = false
  }

  private analyzeGesture(
    landmarks: number[][],
    timestamp: number
  ): GestureEvent | null {
    // Calculate relevant points
    const palmBase = landmarks[0]
    const thumbTip = landmarks[4]
    const indexTip = landmarks[8]

    // Check for swipe gestures
    if (this.gestureHistory.length >= 2) {
      const oldestPoint = this.gestureHistory[0]
      const latestPoint = this.gestureHistory[this.gestureHistory.length - 1]
      const deltaX = latestPoint.x - oldestPoint.x

      if (Math.abs(deltaX) > this.SWIPE_THRESHOLD) {
        return {
          type: deltaX > 0 ? 'swipe_right' : 'swipe_left',
          confidence: Math.min(Math.abs(deltaX) / this.SWIPE_THRESHOLD, 1),
          timestamp
        }
      }
    }

    // Check for pointing gesture
    const isPointing = this.isPointingGesture(landmarks)
    if (isPointing) {
      return {
        type: 'point',
        confidence: 0.9,
        timestamp
      }
    }

    // Check for wave gesture
    const isWaving = this.isWavingGesture(landmarks)
    if (isWaving) {
      return {
        type: 'wave',
        confidence: 0.8,
        timestamp
      }
    }

    // Check for thumbs up/down
    const thumbsGesture = this.detectThumbsGesture(landmarks)
    if (thumbsGesture) {
      return {
        type: thumbsGesture,
        confidence: 0.9,
        timestamp
      }
    }

    return null
  }

  private isPointingGesture(landmarks: number[][]): boolean {
    const indexTip = landmarks[8]
    const indexMcp = landmarks[5]
    const middleTip = landmarks[12]
    const ringTip = landmarks[16]
    const pinkyTip = landmarks[20]

    // Check if index finger is extended while others are curled
    const indexExtension = Math.abs(indexTip[1] - indexMcp[1])
    const otherFingersCurled = 
      Math.abs(middleTip[1] - indexMcp[1]) < indexExtension / 2 &&
      Math.abs(ringTip[1] - indexMcp[1]) < indexExtension / 2 &&
      Math.abs(pinkyTip[1] - indexMcp[1]) < indexExtension / 2

    return indexExtension > 50 && otherFingersCurled
  }

  private isWavingGesture(landmarks: number[][]): boolean {
    if (this.gestureHistory.length < this.HISTORY_SIZE) return false

    let waveCycles = 0
    let direction = 0

    // Analyze vertical movement pattern
    for (let i = 1; i < this.gestureHistory.length; i++) {
      const deltaY = this.gestureHistory[i].y - this.gestureHistory[i - 1].y
      
      if (Math.abs(deltaY) > 20) {
        const currentDirection = Math.sign(deltaY)
        if (currentDirection !== direction && direction !== 0) {
          waveCycles++
        }
        direction = currentDirection
      }
    }

    return waveCycles >= 2
  }

  private detectThumbsGesture(landmarks: number[][]): 'thumbs_up' | 'thumbs_down' | null {
    const thumbTip = landmarks[4]
    const thumbBase = landmarks[2]
    const indexTip = landmarks[8]
    const palmBase = landmarks[0]

    // Calculate thumb direction
    const thumbDirection = thumbTip[1] - thumbBase[1]
    const isThumbExtended = Math.abs(thumbDirection) > 50

    // Check if other fingers are curled
    const areOtherFingersCurled = 
      Math.abs(indexTip[1] - palmBase[1]) < 30

    if (isThumbExtended && areOtherFingersCurled) {
      return thumbDirection < 0 ? 'thumbs_up' : 'thumbs_down'
    }

    return null
  }

  cleanup() {
    this.model = null
    this.isProcessing = false
    this.lastGesture = null
    this.gestureHistory = []
  }
} 