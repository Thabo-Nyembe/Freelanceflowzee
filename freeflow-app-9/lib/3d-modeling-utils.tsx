/**
 * 3D Modeling Utilities
 *
 * Comprehensive 3D modeling studio management with scene objects, materials,
 * lighting, camera controls, and rendering capabilities.
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('3DModelingUtils')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ObjectType = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'plane' | 'torus' | 'pyramid' | 'prism'
export type MaterialType = 'standard' | 'metallic' | 'glass' | 'plastic' | 'fabric' | 'wood' | 'stone' | 'emission'
export type LightType = 'directional' | 'point' | 'spot' | 'ambient' | 'area'
export type ToolType = 'select' | 'move' | 'rotate' | 'scale' | 'extrude' | 'subdivide'
export type ViewMode = 'solid' | 'wireframe' | 'textured' | 'rendered'
export type RenderQuality = 'low' | 'medium' | 'high' | 'ultra'
export type ProjectionType = 'perspective' | 'orthographic'

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface SceneObject {
  id: string
  name: string
  type: ObjectType
  position: Vector3
  rotation: Vector3
  scale: Vector3
  material: string
  visible: boolean
  locked: boolean
  parent?: string
  children?: string[]
  createdAt: string
  updatedAt: string
}

export interface Material {
  id: string
  name: string
  type: MaterialType
  color: string
  roughness: number
  metallic: number
  emission: number
  opacity: number
  texture?: string
  normalMap?: string
  bumpMap?: string
}

export interface Light {
  id: string
  name: string
  type: LightType
  intensity: number
  color: string
  position: Vector3
  rotation?: Vector3
  castShadow: boolean
  enabled: boolean
}

export interface Camera {
  id: string
  name: string
  type: ProjectionType
  position: Vector3
  target: Vector3
  fov: number
  near: number
  far: number
}

export interface Scene {
  id: string
  userId: string
  name: string
  description?: string
  objects: SceneObject[]
  materials: Material[]
  lights: Light[]
  camera: Camera
  backgroundColor: string
  gridSize: number
  gridDivisions: number
  createdAt: string
  updatedAt: string
}

export interface RenderSettings {
  quality: RenderQuality
  resolution: {
    width: number
    height: number
  }
  samples: number
  maxBounces: number
  enableShadows: boolean
  enableReflections: boolean
  enableAmbientOcclusion: boolean
  backgroundColor: string
  outputFormat: 'png' | 'jpg' | 'webp' | 'exr'
}

export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  scenes: Scene[]
  activeSceneId: string
  thumbnailUrl?: string
  tags: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface ExportOptions {
  format: 'obj' | 'fbx' | 'gltf' | 'stl' | 'dae' | 'blend'
  includeTextures: boolean
  includeMaterials: boolean
  includeLights: boolean
  includeCamera: boolean
  scale: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_MATERIALS: Material[] = [
  {
    id: 'metal-steel',
    name: 'Steel',
    type: 'metallic',
    color: '#C0C0C0',
    roughness: 0.2,
    metallic: 1.0,
    emission: 0,
    opacity: 1.0
  },
  {
    id: 'metal-gold',
    name: 'Gold',
    type: 'metallic',
    color: '#FFD700',
    roughness: 0.3,
    metallic: 1.0,
    emission: 0,
    opacity: 1.0
  },
  {
    id: 'metal-copper',
    name: 'Copper',
    type: 'metallic',
    color: '#B87333',
    roughness: 0.4,
    metallic: 1.0,
    emission: 0,
    opacity: 1.0
  },
  {
    id: 'plastic-red',
    name: 'Red Plastic',
    type: 'plastic',
    color: '#FF4444',
    roughness: 0.8,
    metallic: 0.0,
    emission: 0,
    opacity: 1.0
  },
  {
    id: 'plastic-blue',
    name: 'Blue Plastic',
    type: 'plastic',
    color: '#4444FF',
    roughness: 0.8,
    metallic: 0.0,
    emission: 0,
    opacity: 1.0
  },
  {
    id: 'glass-clear',
    name: 'Clear Glass',
    type: 'glass',
    color: '#E6F3FF',
    roughness: 0.0,
    metallic: 0.0,
    emission: 0,
    opacity: 0.3
  },
  {
    id: 'glass-frosted',
    name: 'Frosted Glass',
    type: 'glass',
    color: '#F0F8FF',
    roughness: 0.5,
    metallic: 0.0,
    emission: 0,
    opacity: 0.5
  },
  {
    id: 'wood-oak',
    name: 'Oak Wood',
    type: 'wood',
    color: '#DEB887',
    roughness: 0.9,
    metallic: 0.0,
    emission: 0,
    opacity: 1.0
  },
  {
    id: 'fabric-cotton',
    name: 'Cotton Fabric',
    type: 'fabric',
    color: '#8B4513',
    roughness: 0.9,
    metallic: 0.0,
    emission: 0,
    opacity: 1.0
  },
  {
    id: 'emission-glow',
    name: 'Glow',
    type: 'emission',
    color: '#00FF88',
    roughness: 0.5,
    metallic: 0.0,
    emission: 1.0,
    opacity: 1.0
  }
]

export const DEFAULT_LIGHTS: Light[] = [
  {
    id: 'sun',
    name: 'Sun Light',
    type: 'directional',
    intensity: 80,
    color: '#FFF8DC',
    position: { x: 5, y: 10, z: 5 },
    rotation: { x: -45, y: 45, z: 0 },
    castShadow: true,
    enabled: true
  },
  {
    id: 'fill',
    name: 'Fill Light',
    type: 'point',
    intensity: 40,
    color: '#87CEEB',
    position: { x: -3, y: 5, z: 3 },
    castShadow: false,
    enabled: true
  },
  {
    id: 'ambient',
    name: 'Ambient',
    type: 'ambient',
    intensity: 20,
    color: '#B0C4DE',
    position: { x: 0, y: 0, z: 0 },
    castShadow: false,
    enabled: true
  }
]

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

export function generateMockSceneObjects(count: number = 20): SceneObject[] {
  const objects: SceneObject[] = []
  const types: ObjectType[] = ['cube', 'sphere', 'cylinder', 'cone', 'plane', 'torus', 'pyramid']
  const materials = DEFAULT_MATERIALS.map(m => m.id)

  for (let i = 0; i < count; i++) {
    objects.push({
      id: `object-${i + 1}`,
      name: `${types[i % types.length]} ${i + 1}`,
      type: types[i % types.length],
      position: {
        x: (Math.random() - 0.5) * 10,
        y: Math.random() * 5,
        z: (Math.random() - 0.5) * 10
      },
      rotation: {
        x: Math.random() * 360,
        y: Math.random() * 360,
        z: Math.random() * 360
      },
      scale: {
        x: 0.5 + Math.random() * 2,
        y: 0.5 + Math.random() * 2,
        z: 0.5 + Math.random() * 2
      },
      material: materials[i % materials.length],
      visible: Math.random() > 0.1,
      locked: Math.random() > 0.8,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.debug('Generated mock scene objects', { count: objects.length })
  return objects
}

export function generateMockScenes(count: number = 10, userId: string = 'user-1'): Scene[] {
  const scenes: Scene[] = []

  for (let i = 0; i < count; i++) {
    scenes.push({
      id: `scene-${i + 1}`,
      userId,
      name: `Scene ${i + 1}`,
      description: `3D scene with ${5 + i} objects`,
      objects: generateMockSceneObjects(5 + i),
      materials: DEFAULT_MATERIALS,
      lights: DEFAULT_LIGHTS,
      camera: {
        id: 'main-camera',
        name: 'Main Camera',
        type: 'perspective',
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 },
        fov: 75,
        near: 0.1,
        far: 1000
      },
      backgroundColor: ['#1a1a1a', '#2a2a2a', '#0a0a0a'][i % 3],
      gridSize: 10,
      gridDivisions: 10,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.debug('Generated mock scenes', { count: scenes.length })
  return scenes
}

export function generateMockProjects(count: number = 15, userId: string = 'user-1'): Project[] {
  const projects: Project[] = []

  for (let i = 0; i < count; i++) {
    const sceneCount = 1 + Math.floor(Math.random() * 5)
    const scenes = generateMockScenes(sceneCount, userId)

    projects.push({
      id: `project-${i + 1}`,
      userId,
      name: `Project ${i + 1}`,
      description: `3D modeling project with ${sceneCount} scenes`,
      scenes,
      activeSceneId: scenes[0].id,
      thumbnailUrl: `/thumbnails/project-${i + 1}.jpg`,
      tags: ['3d', 'modeling', ['architecture', 'product', 'character'][i % 3]],
      isPublic: Math.random() > 0.5,
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.debug('Generated mock projects', { count: projects.length })
  return projects
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createDefaultCamera(): Camera {
  return {
    id: 'camera-1',
    name: 'Main Camera',
    type: 'perspective',
    position: { x: 5, y: 5, z: 5 },
    target: { x: 0, y: 0, z: 0 },
    fov: 75,
    near: 0.1,
    far: 1000
  }
}

export function createPrimitiveObject(type: ObjectType, name?: string): SceneObject {
  return {
    id: `object-${Date.now()}`,
    name: name || type.charAt(0).toUpperCase() + type.slice(1),
    type,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    material: 'metal-steel',
    visible: true,
    locked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export function duplicateObject(object: SceneObject): SceneObject {
  return {
    ...object,
    id: `object-${Date.now()}`,
    name: `${object.name} Copy`,
    position: {
      x: object.position.x + 1,
      y: object.position.y,
      z: object.position.z + 1
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export function updateObjectTransform(
  object: SceneObject,
  transform: {
    position?: Partial<Vector3>
    rotation?: Partial<Vector3>
    scale?: Partial<Vector3>
  }
): SceneObject {
  return {
    ...object,
    position: { ...object.position, ...transform.position },
    rotation: { ...object.rotation, ...transform.rotation },
    scale: { ...object.scale, ...transform.scale },
    updatedAt: new Date().toISOString()
  }
}

export function getVisibleObjects(objects: SceneObject[]): SceneObject[] {
  return objects.filter(obj => obj.visible)
}

export function getLockedObjects(objects: SceneObject[]): SceneObject[] {
  return objects.filter(obj => obj.locked)
}

export function getObjectsByType(objects: SceneObject[], type: ObjectType): SceneObject[] {
  return objects.filter(obj => obj.type === type)
}

export function searchObjects(objects: SceneObject[], query: string): SceneObject[] {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return objects

  return objects.filter(obj =>
    obj.name.toLowerCase().includes(lowerQuery) ||
    obj.type.toLowerCase().includes(lowerQuery) ||
    obj.material.toLowerCase().includes(lowerQuery)
  )
}

export function calculateSceneBounds(objects: SceneObject[]): {
  min: Vector3
  max: Vector3
  center: Vector3
  size: Vector3
} {
  if (objects.length === 0) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
      center: { x: 0, y: 0, z: 0 },
      size: { x: 0, y: 0, z: 0 }
    }
  }

  const min = { x: Infinity, y: Infinity, z: Infinity }
  const max = { x: -Infinity, y: -Infinity, z: -Infinity }

  for (const obj of objects) {
    min.x = Math.min(min.x, obj.position.x - obj.scale.x)
    min.y = Math.min(min.y, obj.position.y - obj.scale.y)
    min.z = Math.min(min.z, obj.position.z - obj.scale.z)

    max.x = Math.max(max.x, obj.position.x + obj.scale.x)
    max.y = Math.max(max.y, obj.position.y + obj.scale.y)
    max.z = Math.max(max.z, obj.position.z + obj.scale.z)
  }

  const center = {
    x: (min.x + max.x) / 2,
    y: (min.y + max.y) / 2,
    z: (min.z + max.z) / 2
  }

  const size = {
    x: max.x - min.x,
    y: max.y - min.y,
    z: max.z - min.z
  }

  return { min, max, center, size }
}

export function getMaterialById(materials: Material[], id: string): Material | undefined {
  return materials.find(m => m.id === id)
}

export function getLightById(lights: Light[], id: string): Light | undefined {
  return lights.find(l => l.id === id)
}

export function getEnabledLights(lights: Light[]): Light[] {
  return lights.filter(l => l.enabled)
}

export function calculateTotalLightIntensity(lights: Light[]): number {
  return getEnabledLights(lights).reduce((sum, light) => sum + light.intensity, 0)
}

export function exportScene(scene: Scene, options: ExportOptions): {
  data: string
  filename: string
  mimeType: string
} {
  const exportData = {
    scene: {
      name: scene.name,
      objects: options.includeMaterials ? scene.objects : scene.objects.map(o => ({ ...o, material: undefined })),
      materials: options.includeMaterials ? scene.materials : [],
      lights: options.includeLights ? scene.lights : [],
      camera: options.includeCamera ? scene.camera : undefined
    },
    metadata: {
      exportedAt: new Date().toISOString(),
      format: options.format,
      scale: options.scale
    }
  }

  const data = JSON.stringify(exportData, null, 2)
  const filename = `${scene.name.replace(/\s+/g, '-')}.${options.format}`
  const mimeType = 'application/json'

  return { data, filename, mimeType }
}

export function getRenderSettings(quality: RenderQuality): RenderSettings {
  const presets: Record<RenderQuality, RenderSettings> = {
    low: {
      quality: 'low',
      resolution: { width: 640, height: 480 },
      samples: 32,
      maxBounces: 4,
      enableShadows: true,
      enableReflections: false,
      enableAmbientOcclusion: false,
      backgroundColor: '#1a1a1a',
      outputFormat: 'jpg'
    },
    medium: {
      quality: 'medium',
      resolution: { width: 1280, height: 720 },
      samples: 64,
      maxBounces: 8,
      enableShadows: true,
      enableReflections: true,
      enableAmbientOcclusion: false,
      backgroundColor: '#1a1a1a',
      outputFormat: 'png'
    },
    high: {
      quality: 'high',
      resolution: { width: 1920, height: 1080 },
      samples: 128,
      maxBounces: 12,
      enableShadows: true,
      enableReflections: true,
      enableAmbientOcclusion: true,
      backgroundColor: '#1a1a1a',
      outputFormat: 'png'
    },
    ultra: {
      quality: 'ultra',
      resolution: { width: 3840, height: 2160 },
      samples: 256,
      maxBounces: 16,
      enableShadows: true,
      enableReflections: true,
      enableAmbientOcclusion: true,
      backgroundColor: '#1a1a1a',
      outputFormat: 'exr'
    }
  }

  return presets[quality]
}

export function estimateRenderTime(settings: RenderSettings, objectCount: number): number {
  // Estimate in seconds based on complexity
  const baseTime = 1
  const resolutionFactor = (settings.resolution.width * settings.resolution.height) / (1280 * 720)
  const samplesFactor = settings.samples / 64
  const objectFactor = objectCount / 10

  let time = baseTime * resolutionFactor * samplesFactor * objectFactor

  if (settings.enableShadows) time *= 1.3
  if (settings.enableReflections) time *= 1.5
  if (settings.enableAmbientOcclusion) time *= 1.4

  return Math.ceil(time)
}

export function getProjectStats(project: Project) {
  const totalScenes = project.scenes.length
  const totalObjects = project.scenes.reduce((sum, scene) => sum + scene.objects.length, 0)
  const totalMaterials = project.scenes.reduce((sum, scene) => sum + scene.materials.length, 0)
  const totalLights = project.scenes.reduce((sum, scene) => sum + scene.lights.length, 0)

  return {
    totalScenes,
    totalObjects,
    totalMaterials,
    totalLights,
    averageObjectsPerScene: Math.floor(totalObjects / totalScenes),
    createdAt: project.createdAt,
    lastModified: project.updatedAt
  }
}
