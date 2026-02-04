/**
 * WebRTC Hook
 * Peer-to-peer video calling with screen sharing
 *
 * Features:
 * - Video/audio calls (1-on-1 and group)
 * - Screen sharing
 * - Recording capability
 * - Quality controls
 * - Mute/unmute
 * - Device selection
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('WebRTC')

export interface MediaSettings {
  video: boolean
  audio: boolean
  videoDeviceId?: string
  audioDeviceId?: string
  resolution?: '720p' | '1080p' | '4k'
  frameRate?: 15 | 30 | 60
}

export interface PeerConnection {
  userId: string
  userName: string
  connection: RTCPeerConnection
  stream: MediaStream | null
  dataChannel: RTCDataChannel | null
}

export interface UseWebRTCOptions {
  roomId: string
  userId: string
  userName: string
  onRemoteStream?: (userId: string, stream: MediaStream) => void
  onRemoteStreamRemoved?: (userId: string) => void
  onError?: (error: Error) => void
}

// ICE servers (STUN/TURN)
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    // In production, add TURN servers for NAT traversal
    // { urls: 'turn:your-turn-server.com', username: 'user', credential: 'pass' }
  ]
}

/**
 * WebRTC hook for peer-to-peer video calls
 */
export function useWebRTC(options: UseWebRTCOptions) {
  const { roomId, userId, userName, onRemoteStream, onRemoteStreamRemoved, onError } = options

  // State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [currentDevices, setCurrentDevices] = useState<{
    videoDeviceId?: string
    audioDeviceId?: string
  }>({})

  // Refs
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map())
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const originalStreamRef = useRef<MediaStream | null>(null)

  // ============================================================================
  // DEVICE ENUMERATION
  // ============================================================================

  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()

      const videoDevices = devices.filter(d => d.kind === 'videoinput')
      const audioDevices = devices.filter(d => d.kind === 'audioinput')

      setAvailableDevices([...videoDevices, ...audioDevices])

      logger.info('Devices enumerated', {
        videoDevices: videoDevices.length,
        audioDevices: audioDevices.length
      })

      return devices
    } catch (error: any) {
      logger.error('Failed to enumerate devices', { error: error.message })
      onError?.(error)
      return []
    }
  }, [onError])

  useEffect(() => {
    enumerateDevices()
  }, [enumerateDevices])

  // ============================================================================
  // LOCAL MEDIA
  // ============================================================================

  const startLocalMedia = useCallback(async (settings: MediaSettings = {
    video: true,
    audio: true,
    resolution: '720p',
    frameRate: 30
  }) => {
    try {
      logger.info('Starting local media', settings)

      const constraints: MediaStreamConstraints = {
        audio: settings.audio ? {
          deviceId: settings.audioDeviceId ? { exact: settings.audioDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false,
        video: settings.video ? {
          deviceId: settings.videoDeviceId ? { exact: settings.videoDeviceId } : undefined,
          width: settings.resolution === '4k' ? { ideal: 3840 } : settings.resolution === '1080p' ? { ideal: 1920 } : { ideal: 1280 },
          height: settings.resolution === '4k' ? { ideal: 2160 } : settings.resolution === '1080p' ? { ideal: 1080 } : { ideal: 720 },
          frameRate: { ideal: settings.frameRate || 30 }
        } : false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      setLocalStream(stream)
      originalStreamRef.current = stream
      setIsVideoEnabled(settings.video)
      setIsAudioEnabled(settings.audio)

      if (settings.videoDeviceId || settings.audioDeviceId) {
        setCurrentDevices({
          videoDeviceId: settings.videoDeviceId,
          audioDeviceId: settings.audioDeviceId
        })
      }

      logger.info('Local media started', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      })

      toast.success('Camera and microphone ready')

      return stream
    } catch (error: any) {
      logger.error('Failed to start local media', { error: error.message })
      toast.error('Failed to access camera/microphone')
      onError?.(error)
      return null
    }
  }, [onError])

  const stopLocalMedia = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
      originalStreamRef.current = null

      logger.info('Local media stopped')
      toast.info('Camera and microphone stopped')
    }
  }, [localStream])

  // ============================================================================
  // MEDIA CONTROLS
  // ============================================================================

  const toggleVideo = useCallback(() => {
    if (!localStream) return

    const videoTrack = localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setIsVideoEnabled(videoTrack.enabled)

      logger.info('Video toggled', { enabled: videoTrack.enabled })
      toast.info(videoTrack.enabled ? 'Camera on' : 'Camera off')
    }
  }, [localStream])

  const toggleAudio = useCallback(() => {
    if (!localStream) return

    const audioTrack = localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setIsAudioEnabled(audioTrack.enabled)

      logger.info('Audio toggled', { enabled: audioTrack.enabled })
      toast.info(audioTrack.enabled ? 'Microphone on' : 'Microphone off')
    }
  }, [localStream])

  const switchCamera = useCallback(async (deviceId: string) => {
    if (!localStream) return

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: localStream.getAudioTracks().length > 0
      })

      // Replace video track
      const oldVideoTrack = localStream.getVideoTracks()[0]
      const newVideoTrack = newStream.getVideoTracks()[0]

      if (oldVideoTrack) {
        localStream.removeTrack(oldVideoTrack)
        oldVideoTrack.stop()
      }

      localStream.addTrack(newVideoTrack)

      // Update peer connections
      peerConnectionsRef.current.forEach(peer => {
        const sender = peer.connection.getSenders().find(s => s.track?.kind === 'video')
        if (sender) {
          sender.replaceTrack(newVideoTrack)
        }
      })

      setCurrentDevices(prev => ({ ...prev, videoDeviceId: deviceId }))

      logger.info('Camera switched', { deviceId })
      toast.success('Camera switched')
    } catch (error: any) {
      logger.error('Failed to switch camera', { error: error.message })
      toast.error('Failed to switch camera')
    }
  }, [localStream])

  // ============================================================================
  // SCREEN SHARING
  // ============================================================================

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        } as any,
        audio: true
      })

      // Save original stream
      if (localStream && !originalStreamRef.current) {
        originalStreamRef.current = localStream
      }

      // Replace video track in local stream
      if (localStream) {
        const oldVideoTrack = localStream.getVideoTracks()[0]
        const newVideoTrack = screenStream.getVideoTracks()[0]

        if (oldVideoTrack) {
          localStream.removeTrack(oldVideoTrack)
          oldVideoTrack.stop()
        }

        localStream.addTrack(newVideoTrack)

        // Update peer connections
        peerConnectionsRef.current.forEach(peer => {
          const sender = peer.connection.getSenders().find(s => s.track?.kind === 'video')
          if (sender) {
            sender.replaceTrack(newVideoTrack)
          }
        })
      } else {
        setLocalStream(screenStream)
      }

      setIsScreenSharing(true)

      // Handle screen share stop
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }

      logger.info('Screen sharing started')
      toast.success('Screen sharing started')
    } catch (error: any) {
      logger.error('Failed to start screen share', { error: error.message })
      toast.error('Failed to start screen sharing')
    }
  }, [localStream])

  const stopScreenShare = useCallback(async () => {
    if (!isScreenSharing || !originalStreamRef.current) return

    try {
      // Stop screen share track
      if (localStream) {
        localStream.getVideoTracks().forEach(track => track.stop())
      }

      // Restore original camera stream
      const cameraStream = originalStreamRef.current
      const cameraVideoTrack = cameraStream.getVideoTracks()[0]

      if (localStream && cameraVideoTrack) {
        const screenTrack = localStream.getVideoTracks()[0]
        localStream.removeTrack(screenTrack)
        localStream.addTrack(cameraVideoTrack)

        // Update peer connections
        peerConnectionsRef.current.forEach(peer => {
          const sender = peer.connection.getSenders().find(s => s.track?.kind === 'video')
          if (sender) {
            sender.replaceTrack(cameraVideoTrack)
          }
        })
      }

      setIsScreenSharing(false)

      logger.info('Screen sharing stopped')
      toast.info('Screen sharing stopped')
    } catch (error: any) {
      logger.error('Failed to stop screen share', { error: error.message })
    }
  }, [isScreenSharing, localStream])

  // ============================================================================
  // RECORDING
  // ============================================================================

  const startRecording = useCallback(() => {
    if (!localStream) {
      toast.error('No active media to record')
      return
    }

    try {
      recordedChunksRef.current = []

      const mediaRecorder = new MediaRecorder(localStream, {
        mimeType: 'video/webm;codecs=vp9'
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)

        // Trigger download
        const a = document.createElement('a')
        a.href = url
        a.download = `recording-${Date.now()}.webm`
        a.click()

        URL.revokeObjectURL(url)

        logger.info('Recording saved', {
          size: blob.size,
          duration: recordedChunksRef.current.length
        })

        toast.success('Recording saved')
      }

      mediaRecorder.start(1000) // Collect data every second
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)

      logger.info('Recording started')
      toast.success('Recording started')
    } catch (error: any) {
      logger.error('Failed to start recording', { error: error.message })
      toast.error('Failed to start recording')
    }
  }, [localStream])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
      setIsRecording(false)

      logger.info('Recording stopped')
    }
  }, [isRecording])

  // ============================================================================
  // PEER CONNECTION MANAGEMENT
  // ============================================================================

  const createPeerConnection = useCallback((peerId: string, peerName: string): RTCPeerConnection => {
    logger.info('Creating peer connection', { peerId, peerName })

    const pc = new RTCPeerConnection(ICE_SERVERS)

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream)
      })
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        logger.debug('ICE candidate', { peerId, candidate: event.candidate.candidate })

        // Send ICE candidate to peer via signaling
        // This would be sent through WebSocket
        const iceEvent = new CustomEvent('webrtc-ice-candidate', {
          detail: { peerId, candidate: event.candidate }
        })
        window.dispatchEvent(iceEvent)
      }
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      logger.info('Remote track received', {
        peerId,
        kind: event.track.kind
      })

      const stream = event.streams[0]
      if (stream) {
        setRemoteStreams(prev => {
          const next = new Map(prev)
          next.set(peerId, stream)
          return next
        })

        onRemoteStream?.(peerId, stream)
        toast.success(`${peerName} joined the call`)
      }
    }

    // Handle connection state
    pc.onconnectionstatechange = () => {
      logger.debug('Connection state changed', {
        peerId,
        state: pc.connectionState
      })

      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        removePeerConnection(peerId)
      }
    }

    // Create data channel
    const dataChannel = pc.createDataChannel('messages')
    dataChannel.onmessage = (event) => {
      logger.debug('Data channel message', { peerId, data: event.data })
    }

    // Store peer connection
    peerConnectionsRef.current.set(peerId, {
      userId: peerId,
      userName: peerName,
      connection: pc,
      stream: null,
      dataChannel
    })

    return pc
  }, [localStream, onRemoteStream])

  const removePeerConnection = useCallback((peerId: string) => {
    const peer = peerConnectionsRef.current.get(peerId)

    if (peer) {
      peer.connection.close()
      peer.dataChannel?.close()

      peerConnectionsRef.current.delete(peerId)

      setRemoteStreams(prev => {
        const next = new Map(prev)
        next.delete(peerId)
        return next
      })

      onRemoteStreamRemoved?.(peerId)

      logger.info('Peer connection removed', { peerId })
      toast.info(`${peer.userName} left the call`)
    }
  }, [onRemoteStreamRemoved])

  const closeAllConnections = useCallback(() => {
    peerConnectionsRef.current.forEach((peer, peerId) => {
      peer.connection.close()
      peer.dataChannel?.close()
    })

    peerConnectionsRef.current.clear()
    setRemoteStreams(new Map())

    logger.info('All peer connections closed')
  }, [])

  // ============================================================================
  // SIGNALING (would be integrated with WebSocket)
  // ============================================================================

  const createOffer = useCallback(async (peerId: string, peerName: string) => {
    const pc = createPeerConnection(peerId, peerName)

    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      logger.info('Offer created', { peerId })

      // Send offer to peer via signaling
      const event = new CustomEvent('webrtc-offer', {
        detail: { peerId, offer }
      })
      window.dispatchEvent(event)

      return offer
    } catch (error: any) {
      logger.error('Failed to create offer', { peerId, error: error.message })
      return null
    }
  }, [createPeerConnection])

  const createAnswer = useCallback(async (peerId: string, peerName: string, offer: RTCSessionDescriptionInit) => {
    const pc = createPeerConnection(peerId, peerName)

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer))

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      logger.info('Answer created', { peerId })

      // Send answer to peer via signaling
      const event = new CustomEvent('webrtc-answer', {
        detail: { peerId, answer }
      })
      window.dispatchEvent(event)

      return answer
    } catch (error: any) {
      logger.error('Failed to create answer', { peerId, error: error.message })
      return null
    }
  }, [createPeerConnection])

  const handleAnswer = useCallback(async (peerId: string, answer: RTCSessionDescriptionInit) => {
    const peer = peerConnectionsRef.current.get(peerId)

    if (peer) {
      try {
        await peer.connection.setRemoteDescription(new RTCSessionDescription(answer))
        logger.info('Answer handled', { peerId })
      } catch (error: any) {
        logger.error('Failed to handle answer', { peerId, error: error.message })
      }
    }
  }, [])

  const handleIceCandidate = useCallback(async (peerId: string, candidate: RTCIceCandidateInit) => {
    const peer = peerConnectionsRef.current.get(peerId)

    if (peer) {
      try {
        await peer.connection.addIceCandidate(new RTCIceCandidate(candidate))
        logger.debug('ICE candidate added', { peerId })
      } catch (error: any) {
        logger.error('Failed to add ICE candidate', { peerId, error: error.message })
      }
    }
  }, [])

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      stopLocalMedia()
      closeAllConnections()
      stopRecording()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // RETURN API
  // ============================================================================

  return {
    // Local media
    localStream,
    startLocalMedia,
    stopLocalMedia,

    // Remote streams
    remoteStreams: Array.from(remoteStreams.entries()).map(([userId, stream]) => ({
      userId,
      stream
    })),

    // Controls
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio,

    // Screen sharing
    isScreenSharing,
    startScreenShare,
    stopScreenShare,

    // Recording
    isRecording,
    startRecording,
    stopRecording,

    // Devices
    availableDevices,
    currentDevices,
    enumerateDevices,
    switchCamera,

    // Peer connections
    createOffer,
    createAnswer,
    handleAnswer,
    handleIceCandidate,
    removePeerConnection,
    closeAllConnections,

    // Stats
    activePeers: peerConnectionsRef.current.size
  }
}
