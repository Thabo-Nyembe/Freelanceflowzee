"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Icons
import {
  Pencil,
  Highlighter,
  Square,
  Circle,
  ArrowRight,
  Type,
  Eraser,
  Undo,
  Redo,
  Move,
  Layers,
  Save,
  Download,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
} from "lucide-react"

// Drawing tool types
export type DrawingTool =
  | "pen"
  | "pencil"
  | "highlighter"
  | "brush"
  | "line"
  | "rectangle"
  | "circle"
  | "arrow"
  | "text"
  | "eraser"
  | "move"
  | "select"

export type DrawingMode = "draw" | "erase" | "select" | "text"

export interface DrawingState {
  tool: DrawingTool
  mode: DrawingMode
  color: string
  size: number
  opacity: number
  style: "solid" | "dashed" | "dotted"
  fill: boolean
  fillColor: string
  strokeWidth: number
  fontFamily: string
  fontSize: number
  textAlign: "left" | "center" | "right"
}

export interface DrawingLayer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  blendMode: string
  elements: DrawingElement[]
}

export interface DrawingElement {
  id: string
  type: DrawingTool
  points: { x: number; y: number }[]
  style: {
    color: string
    size: number
    opacity: number
    strokeWidth: number
    fill?: boolean
    fillColor?: string
    style?: "solid" | "dashed" | "dotted"
  }
  bounds?: { x: number; y: number; width: number; height: number }
  text?: string
  fontSize?: number
  fontFamily?: string
  textAlign?: "left" | "center" | "right"
  layerId: string
  timestamp: number
}

interface EnhancedDrawingToolsProps {
  onStateChange: (state: DrawingState) => void
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  onSave: () => void
  onExport: (format: string) => void
  canUndo: boolean
  canRedo: boolean
  layers: DrawingLayer[]
  onLayerChange: (layers: DrawingLayer[]) => void
  activeLayerId: string
  onActiveLayerChange: (layerId: string) => void
  className?: string
}

const colorPalette = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
  "#A52A2A", "#808080", "#FFC0CB", "#90EE90", "#FFD700",
  "#FF69B4", "#40E0D0", "#9932CC", "#32CD32", "#FF4500"
]

const fontFamilies = [
  "Arial", "Georgia", "Times New Roman", "Courier New",
  "Verdana", "Comic Sans MS", "Impact", "Trebuchet MS"
]

export function EnhancedDrawingTools({
  onStateChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onExport,
  canUndo,
  canRedo,
  layers,
  onLayerChange,
  activeLayerId,
  onActiveLayerChange,
  className
}: EnhancedDrawingToolsProps) {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    tool: "pen",
    mode: "draw",
    color: "#000000",
    size: 2,
    opacity: 1,
    style: "solid",
    fill: false,
    fillColor: "#000000",
    strokeWidth: 2,
    fontFamily: "Arial",
    fontSize: 16,
    textAlign: "left"
  })

  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [showTextOptions, setShowTextOptions] = useState(false)
  const [customColor, setCustomColor] = useState("#000000")
  const [pressureSupport, setPressureSupport] = useState(false)

  // Update parent when state changes
  useEffect(() => {
    onStateChange(drawingState)
  }, [drawingState, onStateChange])

  // Check for pressure sensitivity support
  useEffect(() => {
    if (navigator.userAgent.includes("Android") || navigator.userAgent.includes("iPhone")) {
      setPressureSupport(true)
    }
  }, [])

  const updateDrawingState = (updates: Partial<DrawingState>) => {
    setDrawingState(prev => ({ ...prev, ...updates }))
  }

  const selectTool = (tool: DrawingTool) => {
    const mode: DrawingMode =
      tool === "eraser" ? "erase" :
      tool === "move" || tool === "select" ? "select" :
      tool === "text" ? "text" : "draw"

    updateDrawingState({ tool, mode })

    if (tool === "text") {
      setShowTextOptions(true)
    } else {
      setShowTextOptions(false)
    }
  }

  const selectColor = (color: string) => {
    updateDrawingState({ color })
    setShowColorPicker(false)
  }

  const addLayer = () => {
    const newLayer: DrawingLayer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: "normal",
      elements: []
    }
    onLayerChange([...layers, newLayer])
    onActiveLayerChange(newLayer.id)
  }

  const duplicateLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId)
    if (layer) {
      const newLayer: DrawingLayer = {
        ...layer,
        id: `layer-${Date.now()}`,
        name: `${layer.name} Copy`,
        elements: layer.elements.map(el => ({ ...el, id: `${el.id}-copy` }))
      }
      const layerIndex = layers.findIndex(l => l.id === layerId)
      const newLayers = [...layers]
      newLayers.splice(layerIndex + 1, 0, newLayer)
      onLayerChange(newLayers)
    }
  }

  const deleteLayer = (layerId: string) => {
    if (layers.length > 1) {
      const newLayers = layers.filter(l => l.id !== layerId)
      onLayerChange(newLayers)
      if (activeLayerId === layerId) {
        onActiveLayerChange(newLayers[0].id)
      }
    }
  }

  const toggleLayerVisibility = (layerId: string) => {
    const newLayers = layers.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    )
    onLayerChange(newLayers)
  }

  const toggleLayerLock = (layerId: string) => {
    const newLayers = layers.map(layer =>
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    )
    onLayerChange(newLayers)
  }

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    const newLayers = layers.map(layer =>
      layer.id === layerId ? { ...layer, opacity } : layer
    )
    onLayerChange(newLayers)
  }

  // Tool button component
  const ToolButton = ({
    tool,
    icon: Icon,
    label,
    isActive = false,
    disabled = false,
    badge,
    onClick
  }: {
    tool?: DrawingTool
    icon: React.ElementType
    label: string
    isActive?: boolean
    disabled?: boolean
    badge?: string
    onClick?: () => void
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? "default" : "ghost"}
            size="icon"
            className={cn(
              "relative h-10 w-10 transition-all duration-200",
              isActive && "ring-2 ring-primary ring-offset-2",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={onClick || (tool ? () => selectTool(tool) : undefined)}
            disabled={disabled}
          >
            <Icon className="h-4 w-4" />
            {badge && (
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
              >
                {badge}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {/* Drawing Tools */}
          <div className="flex gap-1 p-1 bg-muted rounded-md">
            <ToolButton
              tool="pen"
              icon={Pencil}
              label="Pen"
              isActive={drawingState.tool === "pen"}
            />
            <ToolButton
              tool="pencil"
              icon={Pencil}
              label="Pencil"
              isActive={drawingState.tool === "pencil"}
            />
            <ToolButton
              tool="highlighter"
              icon={Highlighter}
              label="Highlighter"
              isActive={drawingState.tool === "highlighter"}
            />
            <ToolButton
              tool="eraser"
              icon={Eraser}
              label="Eraser"
              isActive={drawingState.tool === "eraser"}
            />
          </div>

          {/* Shape Tools */}
          <div className="flex gap-1 p-1 bg-muted rounded-md">
            <ToolButton
              tool="line"
              icon={ArrowRight}
              label="Line"
              isActive={drawingState.tool === "line"}
            />
            <ToolButton
              tool="rectangle"
              icon={Square}
              label="Rectangle"
              isActive={drawingState.tool === "rectangle"}
            />
            <ToolButton
              tool="circle"
              icon={Circle}
              label="Circle"
              isActive={drawingState.tool === "circle"}
            />
            <ToolButton
              tool="arrow"
              icon={ArrowRight}
              label="Arrow"
              isActive={drawingState.tool === "arrow"}
            />
          </div>

          {/* Utility Tools */}
          <div className="flex gap-1 p-1 bg-muted rounded-md">
            <ToolButton
              tool="text"
              icon={Type}
              label="Text"
              isActive={drawingState.tool === "text"}
            />
            <ToolButton
              tool="move"
              icon={Move}
              label="Move"
              isActive={drawingState.tool === "move"}
            />
            <ToolButton
              tool="select"
              icon={Move}
              label="Select"
              isActive={drawingState.tool === "select"}
            />
          </div>

          {/* Action Tools */}
          <div className="flex gap-1 p-1 bg-muted rounded-md">
            <ToolButton
              icon={Undo}
              label="Undo"
              disabled={!canUndo}
              onClick={onUndo}
            />
            <ToolButton
              icon={Redo}
              label="Redo"
              disabled={!canRedo}
              onClick={onRedo}
            />
            <ToolButton
              icon={Trash2}
              label="Clear All"
              onClick={onClear}
            />
          </div>

          {/* Settings */}
          <div className="flex gap-1 p-1 bg-muted rounded-md">
            <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <div
                    className="w-6 h-6 rounded border-2 border-border"
                    style={{ backgroundColor: drawingState.color }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-4">
                  <div>
                    <Label>Color Palette</Label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {colorPalette.map((color) => (
                        <button
                          key={color}
                          className={cn(
                            "w-8 h-8 rounded border-2 border-border cursor-pointer transition-transform hover:scale-110",
                            drawingState.color === color && "ring-2 ring-primary ring-offset-2"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => selectColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Custom Color</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-full h-10 rounded border border-border cursor-pointer"
                      />
                      <Button
                        size="sm"
                        onClick={() => selectColor(customColor)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setShowLayerPanel(!showLayerPanel)}
            >
              <Layers className="w-4 h-4" />
            </Button>

            <ToolButton
              icon={Save}
              label="Save"
              onClick={onSave}
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Download className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onExport("png")}
                  >
                    Export as PNG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onExport("svg")}
                  >
                    Export as SVG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onExport("pdf")}
                  >
                    Export as PDF
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Tool Properties */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          {/* Size Control */}
          <div className="flex items-center space-x-2">
            <Label className="text-sm">Size:</Label>
            <Slider
              value={[drawingState.size]}
              onValueChange={([size]) => updateDrawingState({ size })}
              max={50}
              min={1}
              step={1}
              className="w-24"
            />
            <span className="text-sm font-mono w-8">{drawingState.size}</span>
          </div>

          {/* Opacity Control */}
          <div className="flex items-center space-x-2">
            <Label className="text-sm">Opacity:</Label>
            <Slider
              value={[drawingState.opacity * 100]}
              onValueChange={([opacity]) => updateDrawingState({ opacity: opacity / 100 })}
              max={100}
              min={10}
              step={5}
              className="w-24"
            />
            <span className="text-sm font-mono w-10">{Math.round(drawingState.opacity * 100)}%</span>
          </div>

          {/* Style Control */}
          <div className="flex items-center space-x-2">
            <Label className="text-sm">Style:</Label>
            <Select
              value={drawingState.style}
              onValueChange={(style: "solid" | "dashed" | "dotted") =>
                updateDrawingState({ style })
              }
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Shape Fill Toggle */}
          {["rectangle", "circle"].includes(drawingState.tool) && (
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Fill:</Label>
              <Button
                variant={drawingState.fill ? "default" : "outline"}
                size="sm"
                onClick={() => updateDrawingState({ fill: !drawingState.fill })}
              >
                {drawingState.fill ? "Filled" : "Outline"}
              </Button>
            </div>
          )}

          {/* Pressure Sensitivity */}
          {pressureSupport && (
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Pressure:</Label>
              <Badge variant="secondary" className="text-xs">
                Enabled
              </Badge>
            </div>
          )}
        </div>

        {/* Text Options */}
        <AnimatePresence>
          {showTextOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t space-y-3"
            >
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Font:</Label>
                  <Select
                    value={drawingState.fontFamily}
                    onValueChange={(fontFamily) => updateDrawingState({ fontFamily })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map(font => (
                        <SelectItem key={font} value={font}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Size:</Label>
                  <Slider
                    value={[drawingState.fontSize]}
                    onValueChange={([fontSize]) => updateDrawingState({ fontSize })}
                    max={72}
                    min={8}
                    step={2}
                    className="w-24"
                  />
                  <span className="text-sm font-mono w-8">{drawingState.fontSize}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Align:</Label>
                  <div className="flex gap-1">
                    {(["left", "center", "right"] as const).map(align => (
                      <Button
                        key={align}
                        variant={drawingState.textAlign === align ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateDrawingState({ textAlign: align })}
                      >
                        {align}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Layer Panel */}
      <AnimatePresence>
        {showLayerPanel && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Layers</CardTitle>
                  <Button size="sm" onClick={addLayer}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Layer
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                        activeLayerId === layer.id ? "bg-primary/10" : "hover:bg-muted"
                      )}
                      onClick={() => onActiveLayerChange(layer.id)}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLayerVisibility(layer.id)
                        }}
                      >
                        {layer.visible ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLayerLock(layer.id)
                        }}
                      >
                        {layer.locked ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <Unlock className="w-3 h-3" />
                        )}
                      </Button>

                      <span className="flex-1 text-sm truncate">{layer.name}</span>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateLayer(layer.id)
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>

                        {layers.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteLayer(layer.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}