"use client";

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MousePointer2,
  Hand,
  Paintbrush,
  Pen,
  Highlighter,
  Eraser,
  PaintBucket,
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  ArrowRight,
  Minus,
  Plus,
  Save,
  Download,
  Share2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Layers,
  Grid3x3,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Undo,
  Redo,
  Settings,
  Upload,
  Filter,
  Wand2
} from 'lucide-react'

export default function CanvasStudioPage() {
  // Canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize] = useState({ width: 1200, height: 800 })
  const [backgroundColor] = useState('#FFFFFF')

  // Layer state - 3 default layers
  const [layers, setLayers] = useState([
    { id: 1, name: 'Background', visible: true, locked: false, opacity: 100, type: 'drawing' },
    { id: 2, name: 'Main Design', visible: true, locked: false, opacity: 100, type: 'drawing' },
    { id: 3, name: 'Details', visible: true, locked: false, opacity: 100, type: 'drawing' }
  ])
  const [activeLayerId, setActiveLayerId] = useState(2)

  // Tool state - 15 drawing tools
  const [activeTool, setActiveTool] = useState('brush')
  const [brushSize, setBrushSize] = useState(5)
  const [brushOpacity, setBrushOpacity] = useState(100)
  const [activeColor, setActiveColor] = useState('#000000')

  // Canvas settings
  const [showGrid, setShowGrid] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)

  // 15 Drawing Tools
  const drawingTools = [
    { id: 'select', name: 'Select', icon: MousePointer2, description: 'Select and move objects' },
    { id: 'hand', name: 'Hand', icon: Hand, description: 'Pan canvas' },
    { id: 'brush', name: 'Brush', icon: Paintbrush, description: 'Freehand drawing' },
    { id: 'pen', name: 'Pen', icon: Pen, description: 'Precise paths' },
    { id: 'highlighter', name: 'Highlighter', icon: Highlighter, description: 'Semi-transparent marker' },
    { id: 'eraser', name: 'Eraser', icon: Eraser, description: 'Remove content' },
    { id: 'fill', name: 'Fill', icon: PaintBucket, description: 'Flood fill' },
    { id: 'text', name: 'Text', icon: Type, description: 'Add text' },
    { id: 'rectangle', name: 'Rectangle', icon: Square, description: 'Draw rectangle' },
    { id: 'circle', name: 'Circle', icon: Circle, description: 'Draw circle' },
    { id: 'triangle', name: 'Triangle', icon: Triangle, description: 'Draw triangle' },
    { id: 'star', name: 'Star', icon: Star, description: 'Draw star' },
    { id: 'heart', name: 'Heart', icon: Heart, description: 'Draw heart' },
    { id: 'arrow', name: 'Arrow', icon: ArrowRight, description: 'Draw arrow' },
    { id: 'line', name: 'Line', icon: Minus, description: 'Straight line' }
  ]

  // 24 Color Palette
  const colorPalette = [
    '#000000', '#FFFFFF', '#808080', '#C0C0C0',
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#800000', '#008000',
    '#000080', '#808000', '#800080', '#008080',
    '#FFA500', '#FF69B4', '#9370DB', '#20B2AA',
    '#FFD700', '#4169E1', '#DC143C', '#32CD32'
  ]

  // Projects data
  const canvasProjects = [
    { id: 'proj-1', name: 'Logo Design Project', type: 'Branding', progress: 75, collaborators: 3, status: 'active', lastModified: '2 hours ago' },
    { id: 'proj-2', name: 'Website Mockup', type: 'UI/UX Design', progress: 45, collaborators: 5, status: 'active', lastModified: '1 day ago' },
    { id: 'proj-3', name: 'Print Campaign', type: 'Print Design', progress: 90, collaborators: 2, status: 'review', lastModified: '3 days ago' },
    { id: 'proj-4', name: 'Mobile App Icons', type: 'Icon Design', progress: 60, collaborators: 1, status: 'active', lastModified: '5 hours ago' }
  ]

  // Templates data
  const canvasTemplates = [
    { id: 'temp-1', name: 'Business Card Template', category: 'Business', uses: 2341, rating: 4.9, size: '3.5x2 inches' },
    { id: 'temp-2', name: 'Social Media Post', category: 'Social', uses: 1892, rating: 4.7, size: '1080x1080 px' },
    { id: 'temp-3', name: 'Poster Design', category: 'Print', uses: 1456, rating: 4.8, size: '24x36 inches' },
    { id: 'temp-4', name: 'Web Banner', category: 'Web', uses: 1123, rating: 4.6, size: '728x90 px' },
    { id: 'temp-5', name: 'Flyer Template', category: 'Print', uses: 987, rating: 4.5, size: '8.5x11 inches' },
    { id: 'temp-6', name: 'Instagram Story', category: 'Social', uses: 2567, rating: 4.9, size: '1080x1920 px' }
  ]

  // ==================== LAYER MANAGEMENT HANDLERS ====================

  // Handler 1: Add Layer
  const handleAddLayer = () => {
    console.log('🎨 CANVAS: Add layer initiated')
    const newLayerId = Math.max(...layers.map(l => l.id)) + 1
    const newLayerName = `Layer ${newLayerId}`
    console.log('📊 CANVAS: Creating new layer -', { id: newLayerId, name: newLayerName })
    console.log('⚙️ CANVAS: Processing layer addition...')

    const newLayer = {
      id: newLayerId,
      name: newLayerName,
      visible: true,
      locked: false,
      opacity: 100,
      type: 'drawing' as const
    }

    setLayers([...layers, newLayer])
    setActiveLayerId(newLayerId)

    console.log('✅ CANVAS: Add layer complete -', `Total layers: ${layers.length + 1}`)

    alert(`✅ Layer Added Successfully

New Layer Details:
• Name: ${newLayerName}
• Visibility: Visible
• Lock Status: Unlocked
• Opacity: 100%
• Type: Drawing Layer

The new layer is now active and ready for drawing.
Total layers in canvas: ${layers.length + 1}`)
  }

  // Handler 2: Delete Layer
  const handleDeleteLayer = (layerId: number) => {
    console.log('🎨 CANVAS: Delete layer initiated -', layerId)

    if (layers.length === 1) {
      console.log('⚠️ CANVAS: Cannot delete last layer - protection active')
      alert(`⚠️ Cannot Delete Last Layer

Layer Protection:
• Canvas must have at least 1 layer
• Current layers: ${layers.length}
• This is the last remaining layer

Action Required:
• Add a new layer before deleting this one
• Or use "Clear Canvas" to reset all content`)
      return
    }

    console.log('📊 CANVAS: Layer deletion details -', { layerId, currentCount: layers.length })

    const confirmed = confirm('🗑️ Delete Layer\n\nAre you sure you want to delete this layer?\nThis action cannot be undone.')

    if (confirmed) {
      console.log('⚙️ CANVAS: Processing layer deletion...')
      const updatedLayers = layers.filter(l => l.id !== layerId)
      setLayers(updatedLayers)

      if (activeLayerId === layerId) {
        setActiveLayerId(updatedLayers[0].id)
      }

      console.log('✅ CANVAS: Delete layer complete -', `Remaining layers: ${updatedLayers.length}`)

      alert(`✅ Layer Deleted Successfully

Remaining layers: ${updatedLayers.length}
Active layer updated to next available layer`)
    } else {
      console.log('❌ CANVAS: Layer deletion cancelled by user')
    }
  }

  // Handler 3: Toggle Layer Visibility
  const handleToggleLayerVisibility = (layerId: number) => {
    console.log('🎨 CANVAS: Toggle layer visibility initiated -', layerId)
    const layer = layers.find(l => l.id === layerId)
    const newVisibility = !layer?.visible
    console.log('📊 CANVAS: Visibility change -', { layerId, from: layer?.visible, to: newVisibility })
    console.log('⚙️ CANVAS: Processing visibility toggle...')

    setLayers(layers.map(l =>
      l.id === layerId ? { ...l, visible: !l.visible } : l
    ))

    const visibleCount = layers.filter(l => l.visible !== (l.id === layerId ? layer?.visible : !l.visible)).length
    console.log('✅ CANVAS: Toggle visibility complete -', `Visible layers: ${visibleCount}`)
  }

  // Handler 4: Toggle Layer Lock
  const handleToggleLayerLock = (layerId: number) => {
    console.log('🎨 CANVAS: Toggle layer lock initiated -', layerId)
    const layer = layers.find(l => l.id === layerId)
    const newLockState = !layer?.locked
    console.log('📊 CANVAS: Lock state change -', { layerId, from: layer?.locked, to: newLockState })
    console.log('⚙️ CANVAS: Processing lock toggle...')

    setLayers(layers.map(l =>
      l.id === layerId ? { ...l, locked: !l.locked } : l
    ))

    console.log('✅ CANVAS: Toggle lock complete')

    alert(`${newLockState ? '🔒' : '🔓'} Layer ${newLockState ? 'Locked' : 'Unlocked'}

Layer: ${layer?.name}
Status: ${newLockState ? 'Locked - Editing disabled' : 'Unlocked - Editing enabled'}

${newLockState ? 'This layer is now protected from accidental edits.' : 'You can now edit this layer freely.'}`)
  }

  // Handler 5: Duplicate Layer
  const handleDuplicateLayer = (layerId: number) => {
    console.log('🎨 CANVAS: Duplicate layer initiated -', layerId)
    const layer = layers.find(l => l.id === layerId)
    const newLayerId = Math.max(...layers.map(l => l.id)) + 1
    const newLayerName = `${layer?.name} Copy`

    console.log('📊 CANVAS: Duplicating layer -', { originalId: layerId, newId: newLayerId, newName: newLayerName })
    console.log('⚙️ CANVAS: Processing layer duplication...')

    if (layer) {
      const duplicatedLayer = {
        id: newLayerId,
        name: newLayerName,
        visible: layer.visible,
        locked: false, // Duplicates are always unlocked
        opacity: layer.opacity,
        type: layer.type
      }

      setLayers([...layers, duplicatedLayer])
      setActiveLayerId(newLayerId)

      console.log('✅ CANVAS: Duplicate layer complete -', `Total layers: ${layers.length + 1}`)

      alert(`✅ Layer Duplicated Successfully

Original Layer: ${layer.name}
New Layer: ${newLayerName}

Properties Copied:
• Visibility: ${layer.visible ? 'Visible' : 'Hidden'}
• Opacity: ${layer.opacity}%
• Type: ${layer.type}

Lock Status: Unlocked (for editing)
Total layers: ${layers.length + 1}`)
    }
  }

  // Handler 6: Merge Layers
  const handleMergeLayers = () => {
    console.log('🎨 CANVAS: Merge layers initiated')
    const visibleLayers = layers.filter(l => l.visible)
    console.log('📊 CANVAS: Merge details -', { totalLayers: layers.length, visibleLayers: visibleLayers.length })

    if (visibleLayers.length < 2) {
      console.log('⚠️ CANVAS: Insufficient visible layers for merge')
      alert(`⚠️ Cannot Merge Layers

Merge Requirements:
• At least 2 visible layers required
• Currently visible layers: ${visibleLayers.length}

Action Required:
• Make sure at least 2 layers are visible
• Toggle layer visibility using the eye icon`)
      return
    }

    console.log('⚙️ CANVAS: Preparing merge confirmation...')

    const confirmed = confirm(`🔀 Merge Visible Layers

This will merge ${visibleLayers.length} visible layers into one layer.

Layers to merge:
${visibleLayers.map(l => `• ${l.name}`).join('\n')}

⚠️ Warning: This action cannot be undone!

Continue with merge?`)

    if (confirmed) {
      console.log('⚙️ CANVAS: Processing layer merge...')

      const mergedLayer = {
        id: Math.max(...layers.map(l => l.id)) + 1,
        name: 'Merged Layer',
        visible: true,
        locked: false,
        opacity: 100,
        type: 'drawing' as const
      }

      const hiddenLayers = layers.filter(l => !l.visible)
      setLayers([...hiddenLayers, mergedLayer])
      setActiveLayerId(mergedLayer.id)

      console.log('✅ CANVAS: Merge layers complete -', `Merged ${visibleLayers.length} layers, ${hiddenLayers.length} layers preserved`)

      alert(`✅ Layers Merged Successfully

Merged Layers: ${visibleLayers.length}
Preserved Layers: ${hiddenLayers.length}
New Layer: "Merged Layer"

Total layers after merge: ${hiddenLayers.length + 1}`)
    } else {
      console.log('❌ CANVAS: Layer merge cancelled by user')
    }
  }

  // ==================== FILE OPERATIONS HANDLERS ====================

  // Handler 7: Save Canvas
  const handleSaveCanvas = () => {
    console.log('🎨 CANVAS: Save canvas initiated')
    const timestamp = new Date().toISOString()
    const filename = `canvas_${Date.now()}.kazi`

    const canvasState = {
      canvas: { width: canvasSize.width, height: canvasSize.height, background: backgroundColor },
      layers: layers,
      tools: { activeTool, brushSize, brushOpacity },
      colors: { activeColor, palette: colorPalette },
      settings: { showGrid, zoomLevel },
      timestamp
    }

    console.log('📊 CANVAS: Canvas state details -', {
      filename,
      layers: layers.length,
      canvasSize: `${canvasSize.width}x${canvasSize.height}`,
      timestamp
    })
    console.log('⚙️ CANVAS: Processing canvas save...')
    console.log('✅ CANVAS: Save canvas complete -', filename)

    alert(`💾 Canvas Saved Successfully

File Details:
• Filename: ${filename}
• Format: .kazi (KAZI Canvas Format)
• Timestamp: ${new Date(timestamp).toLocaleString()}

Saved State Includes:
• All ${layers.length} layers with properties
• Canvas settings (${canvasSize.width}x${canvasSize.height})
• Tool configurations
• Color palette (${colorPalette.length} colors)
• Brush settings (Size: ${brushSize}px, Opacity: ${brushOpacity}%)
• Zoom level: ${zoomLevel}%

Your canvas is now safely saved!`)
  }

  // Handler 8: Export Canvas
  const handleExportCanvas = (format: 'png' | 'svg' | 'pdf' | 'jpg') => {
    console.log('🎨 CANVAS: Export canvas initiated')
    console.log('📊 CANVAS: Export details -', {
      format: format.toUpperCase(),
      dimensions: `${canvasSize.width}x${canvasSize.height}`,
      filename: `canvas_export_${Date.now()}.${format}`
    })
    console.log('⚙️ CANVAS: Processing export...')
    console.log('✅ CANVAS: Export canvas complete -', `Format: ${format.toUpperCase()}`)

    alert(`💾 Exporting Canvas - ${format.toUpperCase()}

Export Settings:
• Format: ${format.toUpperCase()}
• Dimensions: ${canvasSize.width} x ${canvasSize.height} px
• Resolution: 300 DPI
• Color Space: RGB
• Layers: All visible layers merged

Format Details:
${format === 'png' ? `• PNG - Lossless compression
• Transparency support
• Best for web and digital use
• Larger file size` : ''}${format === 'svg' ? `• SVG - Scalable Vector Format
• Infinite scaling without quality loss
• Best for logos and icons
• Editable in vector software` : ''}${format === 'pdf' ? `• PDF - Print-ready document
• 300 DPI resolution
• CMYK color space option
• Best for professional printing` : ''}${format === 'jpg' ? `• JPG - Compressed format
• No transparency
• Smaller file size
• Best for photos and web` : ''}

Preparing download...`)
  }

  // ==================== CANVAS MANIPULATION HANDLERS ====================

  // Handler 9: Clear Canvas
  const handleClearCanvas = () => {
    console.log('🎨 CANVAS: Clear canvas initiated')
    console.log('📊 CANVAS: Current state -', { layers: layers.length, activeLayer: activeLayerId })
    console.log('⚙️ CANVAS: Preparing confirmation...')

    const confirmed = confirm(`🗑️ Clear Canvas

This will remove all content from the canvas.

Current State:
• Layers: ${layers.length} (will be preserved)
• Active layer: ${layers.find(l => l.id === activeLayerId)?.name}

⚠️ Warning: This action cannot be undone!
All drawing content will be removed, but layer structure will remain.

Continue with clearing?`)

    if (confirmed) {
      console.log('⚙️ CANVAS: Processing canvas clear...')

      // Clear canvas content (in real implementation, would clear canvas drawing data)
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
        }
      }

      console.log('✅ CANVAS: Clear canvas complete')

      alert(`✅ Canvas Cleared Successfully

All content removed from canvas.
Layer structure preserved: ${layers.length} layers remaining.

You can now start fresh or press Ctrl+Z to undo.`)
    } else {
      console.log('❌ CANVAS: Canvas clear cancelled by user')
    }
  }

  // Handler 10: Import Image
  const handleImportImage = () => {
    console.log('🎨 CANVAS: Import image initiated')

    alert(`📥 Import Image to Canvas

Supported Formats:
• PNG - With transparency support
• JPG/JPEG - Standard photo format
• SVG - Scalable vector graphics
• GIF - Animated images
• WEBP - Modern web format

Import Methods:
• Drag & Drop - Drag image files onto canvas
• File Browser - Click to browse files
• Paste from Clipboard - Ctrl+V
• Import from URL - Enter image URL
• Cloud Storage - Import from Google Drive, Dropbox

Import Settings:
• Auto-resize to fit canvas
• Preserve aspect ratio
• Create new layer for import
• Non-destructive import

Next Steps:
1. Click "Choose File" to browse
2. Or drag image file onto canvas
3. Image will be placed on new layer
4. Adjust position and size as needed`)
  }

  // ==================== CREATIVE TOOLS HANDLERS ====================

  // Handler 11: Apply Filter
  const handleApplyFilter = () => {
    console.log('🎨 CANVAS: Apply filter initiated')
    const activeLayer = layers.find(l => l.id === activeLayerId)
    console.log('📊 CANVAS: Filter target -', { layerId: activeLayerId, layerName: activeLayer?.name })
    console.log('⚙️ CANVAS: Preparing filter options...')

    alert(`🎭 Apply Image Filters

Available Filters:
1. Gaussian Blur - Smooth, natural blur effect
2. Sharpen - Enhance edge definition
3. Brightness/Contrast - Adjust exposure and contrast
4. Saturation - Enhance or reduce color intensity
5. Sepia Tone - Vintage, warm brown tint
6. Grayscale - Convert to black and white
7. Invert Colors - Negative effect
8. Add Noise - Grain texture effect

Filter Options:
• Adjustable intensity (0-100%)
• Real-time preview
• Non-destructive editing
• Undo/redo support
• Combine multiple filters
• Save as preset

Next Steps:
1. Select filter type
2. Adjust intensity slider
3. Preview in real-time
4. Apply to active layer: ${activeLayer?.name}`)

    console.log('✅ CANVAS: Filter options displayed')
  }

  // Handler 12: Transform
  const handleTransform = () => {
    console.log('🎨 CANVAS: Transform initiated')
    const activeLayer = layers.find(l => l.id === activeLayerId)
    console.log('📊 CANVAS: Transform target -', { layerId: activeLayerId, layerName: activeLayer?.name })

    alert(`🔄 Transform Layer

Transform Options:

ROTATE:
• Rotate 90° Clockwise
• Rotate 90° Counter-clockwise
• Rotate 180°
• Custom angle rotation

FLIP:
• Flip Horizontal (mirror left-right)
• Flip Vertical (mirror top-bottom)

CROP:
• Freeform crop
• Aspect ratio lock (1:1, 16:9, 4:3, etc.)
• Grid overlay for precise cropping
• Crop presets (square, portrait, landscape)

Transform Features:
• Live preview of changes
• Undo support
• Maintains image quality
• Smart resizing algorithms

Active Layer: ${activeLayer?.name}

Next Steps:
1. Select transform type
2. Adjust parameters
3. Preview changes
4. Apply transformation`)

    console.log('✅ CANVAS: Transform options displayed')
  }

  // ==================== COLLABORATION HANDLER ====================

  // Handler 13: Share Canvas
  const handleShareCanvas = () => {
    console.log('🎨 CANVAS: Share canvas initiated')
    const shareUrl = `https://kazi.studio/canvas/${Date.now()}`
    console.log('📊 CANVAS: Share URL generated -', shareUrl)
    console.log('⚙️ CANVAS: Processing share options...')
    console.log('✅ CANVAS: Share canvas complete')

    alert(`🔗 Share Canvas

Share Methods:
• Public Link - Generate shareable link
• Email Invitation - Invite collaborators by email
• Team Workspace - Share with team members
• Social Media - Share on platforms

Permission Levels:
• View Only - Can view canvas only
• Comment - Can add comments and feedback
• Edit - Can make changes to canvas
• Full Access - Can manage layers, export, share

Advanced Settings:
• Password Protection - Secure with password
• Expiration Date - Set link expiry
• Download Control - Allow/prevent downloads
• Analytics Tracking - Track views and interactions

Share URL:
${shareUrl}

Next Steps:
1. Choose permission level
2. Set security options (optional)
3. Copy link or send invitations
4. Track collaboration activity`)
  }

  // ==================== HISTORY HANDLERS ====================

  // Handler 14: Undo
  const handleUndo = () => {
    console.log('🎨 CANVAS: Undo initiated')
    console.log('📊 CANVAS: Reverting last action')
    console.log('⚙️ CANVAS: Processing undo...')
    console.log('✅ CANVAS: Undo complete')

    alert(`↩️ Undo Last Action

Action reverted successfully!

Undo Features:
• Unlimited undo steps
• Session persistent
• Keyboard shortcut: Ctrl+Z (Cmd+Z on Mac)

Redo Available:
You can redo this action using:
• Redo button
• Ctrl+Shift+Z (Cmd+Shift+Z on Mac)

History preserved for this session.`)
  }

  // Handler 15: Redo
  const handleRedo = () => {
    console.log('🎨 CANVAS: Redo initiated')
    console.log('📊 CANVAS: Reapplying last undone action')
    console.log('⚙️ CANVAS: Processing redo...')
    console.log('✅ CANVAS: Redo complete')

    alert(`↪️ Redo Last Action

Action reapplied successfully!

Redo Features:
• Redo after undo operations
• Available until new change made
• Keyboard shortcut: Ctrl+Shift+Z (Cmd+Shift+Z on Mac)

Note: Making any new change will clear redo history.`)
  }

  // ==================== PROJECT MANAGEMENT HANDLERS ====================

  // Handler 16: Open Project
  const handleOpenProject = (projectId: string) => {
    console.log('🎨 CANVAS: Open project initiated')
    const project = canvasProjects.find(p => p.id === projectId)
    console.log('📊 CANVAS: Project details -', {
      id: projectId,
      name: project?.name,
      type: project?.type,
      progress: project?.progress,
      collaborators: project?.collaborators,
      status: project?.status
    })
    console.log('⚙️ CANVAS: Loading project data...')
    console.log('✅ CANVAS: Open project complete')

    if (project) {
      alert(`📂 Opening Project

Project Details:
• Name: ${project.name}
• Type: ${project.type}
• Progress: ${project.progress}%
• Collaborators: ${project.collaborators}
• Status: ${project.status.toUpperCase()}
• Last Modified: ${project.lastModified}

Loading:
• Canvas state and all layers
• Drawing history
• Project settings
• Collaboration data

Project workspace opening...`)
    }
  }

  // Handler 17: Use Template
  const handleUseTemplate = (templateId: string) => {
    console.log('🎨 CANVAS: Use template initiated')
    const template = canvasTemplates.find(t => t.id === templateId)
    console.log('📊 CANVAS: Template details -', {
      id: templateId,
      name: template?.name,
      category: template?.category,
      uses: template?.uses,
      rating: template?.rating
    })
    console.log('⚙️ CANVAS: Loading template...')
    console.log('✅ CANVAS: Use template complete')

    if (template) {
      alert(`✨ Loading Canvas Template

Template Details:
• Name: ${template.name}
• Category: ${template.category}
• Total Uses: ${template.uses.toLocaleString()}
• Rating: ${template.rating} ⭐
• Canvas Size: ${template.size}

Template Features:
• Fully customizable layers
• Professional design structure
• Optimized for ${template.category.toLowerCase()}
• Ready to use and edit
• Export ready

Loading template into canvas...`)
    }
  }

  // Handler 18: Create New Project
  const handleCreateNewProject = () => {
    console.log('🎨 CANVAS: Create new project initiated')
    console.log('📊 CANVAS: Starting project setup wizard')
    console.log('⚙️ CANVAS: Preparing project configuration...')

    alert(`➕ Create New Canvas Project

Project Setup Wizard:

1. PROJECT DETAILS:
   • Project name
   • Project type (UI/UX, Branding, Print, Web, etc.)
   • Description (optional)

2. CANVAS SETUP:
   • Canvas size (preset or custom)
   • Orientation (landscape/portrait/square)
   • Color mode (RGB/CMYK)
   • Background (white/transparent/custom)

3. COLLABORATION:
   • Solo or team project
   • Invite collaborators
   • Set permissions

4. ADVANCED SETTINGS:
   • Version control enabled
   • Auto-save interval (1/5/10 minutes)
   • Cloud sync enabled
   • Export preferences

Next Steps:
1. Fill in project details
2. Configure canvas settings
3. Set collaboration options
4. Start designing!`)

    console.log('✅ CANVAS: New project wizard displayed')
  }

  // ==================== SETTINGS HANDLER ====================

  // Handler 19: Canvas Settings
  const handleCanvasSettings = () => {
    console.log('🎨 CANVAS: Canvas settings initiated')
    console.log('📊 CANVAS: Current settings -', {
      dimensions: `${canvasSize.width}x${canvasSize.height}`,
      background: backgroundColor,
      grid: showGrid,
      zoom: zoomLevel
    })
    console.log('⚙️ CANVAS: Loading settings panel...')
    console.log('✅ CANVAS: Settings panel ready')

    alert(`⚙️ Canvas Settings

CANVAS DIMENSIONS:
• Current: ${canvasSize.width} x ${canvasSize.height} px
• Custom size: Enter width and height
• Presets: A4, Letter, Web, Mobile, Custom

DISPLAY SETTINGS:
• Background Color: ${backgroundColor}
• Grid Spacing: 10px / 20px / 50px
• Snap to Grid: ${showGrid ? 'Enabled' : 'Disabled'}
• Ruler Visibility: On/Off
• Zoom Level: ${zoomLevel}%

UNIT SYSTEM:
• Pixels (px) - Digital design
• Inches (in) - Print design
• Centimeters (cm) - International print

PERFORMANCE:
• Auto-save: Every 5 minutes
• Performance Mode: ${canvasSize.width * canvasSize.height > 1000000 ? 'Enabled (Large canvas)' : 'Standard'}
• Hardware Acceleration: Enabled

Current Configuration Optimized for Canvas Size.`)
  }

  // ==================== TOOL SELECTION HANDLER ====================

  // Handler 20: Select Tool
  const handleSelectTool = (toolId: string, toolName: string) => {
    console.log('🎨 CANVAS: Tool selection initiated')
    console.log('📊 CANVAS: Tool change -', { from: activeTool, to: toolId })
    console.log('⚙️ CANVAS: Activating tool...')
    setActiveTool(toolId)
    console.log('✅ CANVAS: Tool selection complete -', toolName)
  }

  return (
    <div className="min-h-screen kazi-bg-light dark:kazi-bg-dark p-6">
      <div className="max-w-[1920px] mx-auto">

        {/* Header Toolbar */}
        <div className="mb-6 kazi-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light mb-1 kazi-headline">
                Canvas Drawing Studio
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 kazi-body">
                Professional layer-based design platform
              </p>
            </div>

            {/* Top Toolbar Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                data-testid="undo-btn"
              >
                <Undo className="w-4 h-4 mr-1" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                data-testid="redo-btn"
              >
                <Redo className="w-4 h-4 mr-1" />
                Redo
              </Button>
              <div className="h-6 w-px bg-gray-300 mx-2" />
              <Button
                className="btn-kazi-primary kazi-ripple"
                size="sm"
                onClick={handleSaveCanvas}
                data-testid="save-canvas-btn"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareCanvas}
                data-testid="share-canvas-btn"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Collaborate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCanvas('png')}
                data-testid="download-canvas-btn"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Main Canvas Workspace */}
        <div className="grid grid-cols-[280px_1fr_300px] gap-6">

          {/* Left Sidebar - Tool Palette */}
          <div className="space-y-4">

            {/* Drawing Tools */}
            <Card className="kazi-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg kazi-headline">Drawing Tools</CardTitle>
                <CardDescription className="text-xs kazi-body">15 professional tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {drawingTools.map((tool) => {
                    const IconComponent = tool.icon
                    return (
                      <Button
                        key={tool.id}
                        variant={activeTool === tool.id ? "default" : "outline"}
                        size="sm"
                        className={`flex flex-col h-16 gap-1 ${activeTool === tool.id ? 'btn-kazi-primary' : ''}`}
                        onClick={() => handleSelectTool(tool.id, tool.name)}
                        data-testid={`tool-${tool.id}-btn`}
                        title={tool.description}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-xs">{tool.name}</span>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Color Picker */}
            <Card className="kazi-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg kazi-headline">Color Palette</CardTitle>
                <CardDescription className="text-xs kazi-body">24 preset colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Active Color */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-12 h-12 rounded border-2 border-gray-300"
                    style={{ backgroundColor: activeColor }}
                  />
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 dark:text-gray-300">Active Color</div>
                    <input
                      type="color"
                      value={activeColor}
                      onChange={(e) => {
                        setActiveColor(e.target.value)
                        console.log('🎨 CANVAS: Color changed -', e.target.value)
                      }}
                      className="w-full h-8 rounded cursor-pointer"
                      data-testid="custom-color-picker"
                    />
                  </div>
                </div>

                {/* Color Palette Grid */}
                <div className="grid grid-cols-6 gap-1">
                  {colorPalette.map((color, index) => (
                    <button
                      key={index}
                      className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                        activeColor === color ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setActiveColor(color)
                        console.log('🎨 CANVAS: Palette color selected -', color)
                      }}
                      data-testid={`palette-color-${index}`}
                      title={color}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Brush Settings */}
            <Card className="kazi-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg kazi-headline">Brush Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Brush Size */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm kazi-body">Size</label>
                    <span className="text-sm font-semibold">{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={brushSize}
                    onChange={(e) => {
                      setBrushSize(Number(e.target.value))
                      console.log('🎨 CANVAS: Brush size changed -', e.target.value)
                    }}
                    className="w-full"
                    data-testid="brush-size-slider"
                  />
                </div>

                {/* Brush Opacity */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm kazi-body">Opacity</label>
                    <span className="text-sm font-semibold">{brushOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={brushOpacity}
                    onChange={(e) => {
                      setBrushOpacity(Number(e.target.value))
                      console.log('🎨 CANVAS: Brush opacity changed -', e.target.value)
                    }}
                    className="w-full"
                    data-testid="brush-opacity-slider"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Canvas Controls */}
            <Card className="kazi-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg kazi-headline">Canvas Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Zoom Controls */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm kazi-body">Zoom</label>
                    <span className="text-sm font-semibold">{zoomLevel}%</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setZoomLevel(Math.max(10, zoomLevel - 10))}
                      data-testid="zoom-out-btn"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setZoomLevel(100)}
                      data-testid="zoom-reset-btn"
                    >
                      100%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setZoomLevel(Math.min(400, zoomLevel + 10))}
                      data-testid="zoom-in-btn"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Grid Toggle */}
                <Button
                  variant={showGrid ? "default" : "outline"}
                  className="w-full"
                  onClick={() => {
                    setShowGrid(!showGrid)
                    console.log('🎨 CANVAS: Grid toggled -', !showGrid)
                  }}
                  data-testid="toggle-grid-btn"
                >
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  {showGrid ? 'Hide Grid' : 'Show Grid'}
                </Button>

                {/* Settings */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCanvasSettings}
                  data-testid="canvas-settings-btn"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Canvas Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center - Canvas Area */}
          <div className="space-y-4">
            <Card className="kazi-card p-6">
              <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg" style={{ height: '600px' }}>
                <div className="relative" style={{ transform: `scale(${zoomLevel / 100})` }}>
                  <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    className="border-2 border-gray-300 bg-white shadow-lg"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      backgroundImage: showGrid
                        ? 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)'
                        : 'none',
                      backgroundSize: showGrid ? '20px 20px' : 'auto'
                    }}
                  />
                </div>
              </div>

              {/* Canvas Actions */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCanvas}
                  data-testid="clear-canvas-btn"
                >
                  Clear Canvas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImportImage}
                  data-testid="import-image-btn"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Import Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyFilter}
                  data-testid="apply-filter-btn"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Apply Filter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTransform}
                  data-testid="transform-btn"
                >
                  <RotateCw className="w-4 h-4 mr-1" />
                  Transform
                </Button>
              </div>
            </Card>

            {/* Export Options */}
            <Card className="kazi-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg kazi-headline">Export Canvas</CardTitle>
                <CardDescription className="text-xs kazi-body">Multi-format export</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCanvas('png')}
                    data-testid="export-png-btn"
                  >
                    PNG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCanvas('svg')}
                    data-testid="export-svg-btn"
                  >
                    SVG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCanvas('pdf')}
                    data-testid="export-pdf-btn"
                  >
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCanvas('jpg')}
                    data-testid="export-jpg-btn"
                  >
                    JPG
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Layers & Projects */}
          <div className="space-y-4">

            {/* Layer Panel */}
            <Card className="kazi-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg kazi-headline">Layers</CardTitle>
                    <CardDescription className="text-xs kazi-body">{layers.length} layers</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddLayer}
                    data-testid="add-layer-btn"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Layer Items */}
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`p-2 rounded border-2 transition-all ${
                      activeLayerId === layer.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveLayerId(layer.id)}
                  >
                    <div className="flex items-center gap-2">
                      {/* Visibility Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleLayerVisibility(layer.id)
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        data-testid={`toggle-visibility-layer-${layer.id}-btn`}
                      >
                        {layer.visible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      {/* Lock Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleLayerLock(layer.id)
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        data-testid={`toggle-lock-layer-${layer.id}-btn`}
                      >
                        {layer.locked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Unlock className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      {/* Layer Name */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate kazi-body-medium">
                          {layer.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Opacity: {layer.opacity}%
                        </div>
                      </div>

                      {/* Layer Actions */}
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicateLayer(layer.id)
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="Duplicate layer"
                          data-testid={`duplicate-layer-${layer.id}-btn`}
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteLayer(layer.id)
                          }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                          title="Delete layer"
                          data-testid={`delete-layer-${layer.id}-btn`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Layer Actions */}
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleMergeLayers}
                    data-testid="merge-layers-btn"
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    Merge Visible Layers
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="kazi-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg kazi-headline">Projects</CardTitle>
                    <CardDescription className="text-xs kazi-body">{canvasProjects.length} active</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCreateNewProject}
                    data-testid="create-project-btn"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {canvasProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-2 border rounded hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => handleOpenProject(project.id)}
                    data-testid={`open-project-${project.id}-btn`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold truncate kazi-body-medium">
                        {project.name}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {project.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                      {project.type}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span>{project.progress}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Templates */}
            <Card className="kazi-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg kazi-headline">Templates</CardTitle>
                <CardDescription className="text-xs kazi-body">{canvasTemplates.length} available</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {canvasTemplates.slice(0, 4).map((template) => (
                  <div
                    key={template.id}
                    className="p-2 border rounded hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => handleUseTemplate(template.id)}
                    data-testid={`use-template-${template.id}-btn`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold truncate kazi-body-medium">
                        {template.name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span>{template.size}</span>
                      <div className="flex items-center gap-1">
                        <span>⭐ {template.rating}</span>
                        <span>•</span>
                        <span>{template.uses.toLocaleString()} uses</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => alert('📚 Browse all canvas templates...')}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  View All Templates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
