'use client'

import * as React from 'react'
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Layers3,
  Box,
  Move3D,
  RotateCw,
  Maximize,
  Eye,
  Hand,
  Zap,
  Sparkles,
  Globe,
  Orbit,
  Shapes,
  PenTool,
  MousePointer2
} from 'lucide-react'

// Context7 MCP Spatial Computing Interface Types
interface SpatialNode {
  id: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  content: React.ReactNode
  connections: string[]
  metadata: Record<string, any>
}

interface SpatialViewport {
  camera: {
    position: { x: number; y: number; z: number }
    target: { x: number; y: number; z: number }
    fov: number
  }
  lighting: {
    ambient: number
    directional: { intensity: number; direction: { x: number; y: number; z: number } }
  }
  fog: { near: number; far: number; color: string }
}

// 3D Spatial Canvas Component
export function SpatialCanvas({
  nodes = [],
  viewport,
  onNodeSelect,
  onNodeMove,
  interactive = true,
  className
}: {
  nodes?: SpatialNode[]
  viewport?: Partial<SpatialViewport>
  onNodeSelect?: (nodeId: string) => void
  onNodeMove?: (nodeId: string, position: { x: number; y: number; z: number }) => void
  interactive?: boolean
  className?: string
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null)
  const [cameraState, setCameraState] = React.useState({
    x: 0,
    y: 0,
    z: 500,
    rotationX: 0,
    rotationY: 0
  })
  const [isDragging, setIsDragging] = React.useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotationX = useTransform(mouseY, [-300, 300], [30, -30])
  const rotationY = useTransform(mouseX, [-300, 300], [-30, 30])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const x = e.clientX - rect.left - centerX
    const y = e.clientY - rect.top - centerY

    mouseX.set(x)
    mouseY.set(y)
  }

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId)
    onNodeSelect?.(nodeId)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800",
        "perspective-1000 transform-gpu",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0)
        mouseY.set(0)
      }}
    >
      {/* 3D Grid Background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'rotateX(60deg) translateZ(-200px)'
        }}
      />

      {/* Spatial Environment */}
      <motion.div
        className="absolute inset-0 preserve-3d"
        style={{
          transformStyle: 'preserve-3d',
          rotateX: rotationX,
          rotateY: rotationY
        }}
      >
        {/* Render Spatial Nodes */}
        {nodes.map((node, index) => (
          <SpatialNode
            key={node.id}
            node={node}
            isSelected={selectedNode === node.id}
            onSelect={() => handleNodeClick(node.id)}
            onMove={(position) => onNodeMove?.(node.id, position)}
            interactive={interactive}
            zIndex={nodes.length - index}
          />
        ))}

        {/* Connection Lines */}
        {nodes.map(node =>
          node.connections.map(targetId => {
            const targetNode = nodes.find(n => n.id === targetId)
            if (!targetNode) return null

            return (
              <SpatialConnection
                key={`${node.id}-${targetId}`}
                from={node.position}
                to={targetNode.position}
                active={selectedNode === node.id || selectedNode === targetId}
              />
            )
          })
        )}
      </motion.div>

      {/* Spatial UI Controls */}
      <div className="absolute top-4 left-4 z-50 space-y-2">
        <SpatialControlPanel
          cameraState={cameraState}
          onCameraChange={setCameraState}
          selectedNode={selectedNode}
        />
      </div>

      {/* Node Inspector */}
      {selectedNode && (
        <div className="absolute top-4 right-4 z-50">
          <NodeInspector
            node={nodes.find(n => n.id === selectedNode)}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      )}
    </div>
  )
}

// Individual Spatial Node Component
function SpatialNode({
  node,
  isSelected,
  onSelect,
  onMove,
  interactive,
  zIndex
}: {
  node: SpatialNode
  isSelected: boolean
  onSelect: () => void
  onMove: (position: { x: number; y: number; z: number }) => void
  interactive: boolean
  zIndex: number
}) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  const springConfig = { type: "spring", stiffness: 300, damping: 30 }

  return (
    <motion.div
      className={cn(
        "absolute cursor-pointer preserve-3d transform-gpu",
        "transition-all duration-200 ease-out"
      )}
      style={{
        transform: `
          translate3d(${node.position.x}px, ${node.position.y}px, ${node.position.z}px)
          rotateX(${node.rotation.x}deg)
          rotateY(${node.rotation.y}deg)
          rotateZ(${node.rotation.z}deg)
          scale3d(${node.scale.x}, ${node.scale.y}, ${node.scale.z})
        `,
        zIndex
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: isSelected ? 1.1 : isHovered ? 1.05 : 1
      }}
      transition={springConfig}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onSelect}
      drag={interactive}
      dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      whileDrag={{ scale: 1.2, rotateZ: 5 }}
    >
      {/* Node Container */}
      <div
        className={cn(
          "relative p-4 rounded-2xl backdrop-blur-xl border",
          "transition-all duration-300 ease-out transform-gpu",
          isSelected
            ? "bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-400/25"
            : isHovered
            ? "bg-white/10 border-white/30 shadow-lg"
            : "bg-white/5 border-white/20",
          isDragging && "shadow-2xl shadow-cyan-400/40"
        )}
      >
        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl opacity-20"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Hover Glow */}
        {isHovered && (
          <motion.div
            className="absolute -inset-2 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        {/* Node Content */}
        <div className="relative z-10">
          {node.content}
        </div>

        {/* Node Handles */}
        {isSelected && (
          <>
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-lg" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-red-400 rounded-full border-2 border-white shadow-lg" />
          </>
        )}
      </div>

      {/* Depth Shadow */}
      <div
        className="absolute inset-0 bg-black/20 rounded-2xl blur-lg"
        style={{
          transform: 'translateZ(-10px) scale(0.95)',
          opacity: node.position.z > 0 ? 0.3 : 0.1
        }}
      />
    </motion.div>
  )
}

// Spatial Connection Lines
function SpatialConnection({
  from,
  to,
  active = false
}: {
  from: { x: number; y: number; z: number }
  to: { x: number; y: number; z: number }
  active?: boolean
}) {
  const length = Math.sqrt(
    Math.pow(to.x - from.x, 2) +
    Math.pow(to.y - from.y, 2) +
    Math.pow(to.z - from.z, 2)
  )

  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2
  const midZ = (from.z + to.z) / 2

  const angleX = Math.atan2(to.y - from.y, Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.z - from.z, 2)))
  const angleY = Math.atan2(to.x - from.x, to.z - from.z)

  return (
    <motion.div
      className="absolute origin-left"
      style={{
        width: length,
        height: 2,
        background: active
          ? 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)'
          : 'linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
        transform: `
          translate3d(${from.x}px, ${from.y}px, ${from.z}px)
          rotateY(${angleY}rad)
          rotateX(${angleX}rad)
        `,
        transformOrigin: 'left center'
      }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Connection Flow Animation */}
      {active && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
          animate={{
            x: [-100, length + 100]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </motion.div>
  )
}

// Spatial Control Panel
function SpatialControlPanel({
  cameraState,
  onCameraChange,
  selectedNode
}: {
  cameraState: any
  onCameraChange: (state: any) => void
  selectedNode: string | null
}) {
  return (
    <Card className="bg-black/80 border-white/20 text-white backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Box className="h-4 w-4" />
          Spatial Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Camera Controls */}
        <div className="space-y-2">
          <div className="text-xs text-gray-300">Camera</div>
          <div className="grid grid-cols-3 gap-1">
            <Button size="sm" variant="ghost" className="h-8 text-xs">
              <Eye className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs">
              <Move3D className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs">
              <RotateCw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Node Controls */}
        {selectedNode && (
          <div className="space-y-2">
            <div className="text-xs text-gray-300">Selected Node</div>
            <div className="grid grid-cols-2 gap-1">
              <Button size="sm" variant="ghost" className="h-8 text-xs">
                <Layers3 className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs">
                <Maximize className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* View Controls */}
        <div className="space-y-2">
          <div className="text-xs text-gray-300">View</div>
          <div className="grid grid-cols-2 gap-1">
            <Button size="sm" variant="ghost" className="h-8 text-xs">
              <Globe className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs">
              <Orbit className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Node Inspector Panel
function NodeInspector({
  node,
  onClose
}: {
  node?: SpatialNode
  onClose: () => void
}) {
  if (!node) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card className="bg-black/90 border-white/20 text-white backdrop-blur-xl w-64">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Box className="h-4 w-4" />
              Node Inspector
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={onClose} className="h-6 w-6 p-0">
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Node ID */}
          <div>
            <div className="text-xs text-gray-300 mb-1">ID</div>
            <div className="text-sm font-mono bg-white/10 px-2 py-1 rounded">
              {node.id}
            </div>
          </div>

          {/* Position */}
          <div>
            <div className="text-xs text-gray-300 mb-1">Position</div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="bg-red-500/20 px-1 py-0.5 rounded text-center">
                X: {Math.round(node.position.x)}
              </div>
              <div className="bg-green-500/20 px-1 py-0.5 rounded text-center">
                Y: {Math.round(node.position.y)}
              </div>
              <div className="bg-blue-500/20 px-1 py-0.5 rounded text-center">
                Z: {Math.round(node.position.z)}
              </div>
            </div>
          </div>

          {/* Rotation */}
          <div>
            <div className="text-xs text-gray-300 mb-1">Rotation</div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="bg-red-500/20 px-1 py-0.5 rounded text-center">
                {Math.round(node.rotation.x)}°
              </div>
              <div className="bg-green-500/20 px-1 py-0.5 rounded text-center">
                {Math.round(node.rotation.y)}°
              </div>
              <div className="bg-blue-500/20 px-1 py-0.5 rounded text-center">
                {Math.round(node.rotation.z)}°
              </div>
            </div>
          </div>

          {/* Connections */}
          <div>
            <div className="text-xs text-gray-300 mb-1">Connections</div>
            <div className="text-sm bg-white/10 px-2 py-1 rounded">
              {node.connections.length} connected
            </div>
          </div>

          {/* Metadata */}
          {Object.keys(node.metadata).length > 0 && (
            <div>
              <div className="text-xs text-gray-300 mb-1">Metadata</div>
              <div className="text-xs space-y-1">
                {Object.entries(node.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-400">{key}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Spatial Gesture Recognition
export function SpatialGestureZone({
  children,
  onSpatialGesture,
  className
}: {
  children: React.ReactNode
  onSpatialGesture?: (gesture: string, data: any) => void
  className?: string
}) {
  const [gestureState, setGestureState] = React.useState({
    isTracking: false,
    currentGesture: null as string | null,
    confidence: 0
  })

  // Simulated spatial gesture detection
  React.useEffect(() => {
    const detectGestures = () => {
      // In a real implementation, this would connect to spatial tracking APIs
      // like WebXR, MediaPipe, or device-specific APIs

      const gestures = ['pinch', 'grab', 'point', 'swipe', 'rotate']
      const randomGesture = gestures[Math.floor(Math.random() * gestures.length)]

      if (Math.random() > 0.95) { // Occasionally detect a gesture
        setGestureState({
          isTracking: true,
          currentGesture: randomGesture,
          confidence: Math.random() * 0.4 + 0.6 // 60-100% confidence
        })

        onSpatialGesture?.(randomGesture, {
          confidence: gestureState.confidence,
          timestamp: Date.now()
        })

        // Clear gesture after 1 second
        setTimeout(() => {
          setGestureState(prev => ({ ...prev, currentGesture: null, isTracking: false }))
        }, 1000)
      }
    }

    const interval = setInterval(detectGestures, 1000)
    return () => clearInterval(interval)
  }, [onSpatialGesture, gestureState.confidence])

  return (
    <div className={cn("relative", className)}>
      {/* Gesture Feedback Overlay */}
      <AnimatePresence>
        {gestureState.currentGesture && (
          <motion.div
            className="absolute top-2 left-2 z-50 flex items-center gap-2 px-3 py-1 bg-black/80 text-white rounded-full text-xs"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Hand className="h-3 w-3 text-cyan-400" />
            <span>{gestureState.currentGesture}</span>
            <span className="text-gray-300">
              {Math.round(gestureState.confidence * 100)}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  )
}

// Export components
export default SpatialCanvas