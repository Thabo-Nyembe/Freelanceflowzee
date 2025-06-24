"use client"

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Zap, 
  Gauge,
  Sparkles,
  RefreshCw,
  Cpu,
  Sliders
} from 'lucide-react'

interface AdvancedSettingsTabProps {
  onSave?: (settings: any) => void
}

export function AdvancedSettingsTab({ onSave }: AdvancedSettingsTabProps) {
  const [settings, setSettings] = useState({
    quality: {
      resolution: 75,
      compression: 65,
      optimization: true
    },
    performance: {
      caching: true,
      preloading: true,
      batchProcessing: false
    },
    enhancement: {
      autoColor: true,
      noiseCancellation: true,
      stabilization: false
    },
    realtime: {
      livePreview: true,
      autoSync: false,
      instantFeedback: true
    }
  })

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Quality & Performance */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Quality & Performance</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Output Resolution</Label>
            <Slider
              value={[settings.quality.resolution]}
              onValueChange={([value]) => handleSettingChange('quality', 'resolution', value)}
              max={100}
              step={1}
              className="w-full"
              data-testid="resolution-slider"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Standard</span>
              <span>High</span>
              <span>Ultra</span>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Compression Level</Label>
            <Slider
              value={[settings.quality.compression]}
              onValueChange={([value]) => handleSettingChange('quality', 'compression', value)}
              max={100}
              step={1}
              className="w-full"
              data-testid="compression-slider"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Maximum</span>
              <span>Balanced</span>
              <span>Lossless</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Smart Optimization</Label>
              <p className="text-sm text-gray-500">Automatically optimize for best quality-size ratio</p>
            </div>
            <Switch
              checked={settings.quality.optimization}
              onCheckedChange={(checked) => handleSettingChange('quality', 'optimization', checked)}
              data-testid="optimization-switch"
            />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Performance Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Gauge className="h-4 w-4 text-blue-600" />
                <Label>Content Caching</Label>
              </div>
              <p className="text-sm text-gray-500">Cache processed assets for faster loading</p>
            </div>
            <Switch
              checked={settings.performance.caching}
              onCheckedChange={(checked) => handleSettingChange('performance', 'caching', checked)}
              data-testid="caching-switch"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <Label>Smart Preloading</Label>
              </div>
              <p className="text-sm text-gray-500">Preload assets based on user behavior</p>
            </div>
            <Switch
              checked={settings.performance.preloading}
              onCheckedChange={(checked) => handleSettingChange('performance', 'preloading', checked)}
              data-testid="preloading-switch"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-green-600" />
                <Label>Batch Processing</Label>
              </div>
              <p className="text-sm text-gray-500">Process multiple assets simultaneously</p>
            </div>
            <Switch
              checked={settings.performance.batchProcessing}
              onCheckedChange={(checked) => handleSettingChange('performance', 'batchProcessing', checked)}
              data-testid="batch-processing-switch"
            />
          </div>
        </div>
      </Card>

      {/* Enhancement Options */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Enhancement Options</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto Color Correction</Label>
              <p className="text-sm text-gray-500">Automatically enhance colors and contrast</p>
            </div>
            <Switch
              checked={settings.enhancement.autoColor}
              onCheckedChange={(checked) => handleSettingChange('enhancement', 'autoColor', checked)}
              data-testid="auto-color-switch"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Noise Cancellation</Label>
              <p className="text-sm text-gray-500">Remove background noise from audio/video</p>
            </div>
            <Switch
              checked={settings.enhancement.noiseCancellation}
              onCheckedChange={(checked) => handleSettingChange('enhancement', 'noiseCancellation', checked)}
              data-testid="noise-cancellation-switch"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Content Stabilization</Label>
              <p className="text-sm text-gray-500">Stabilize shaky video content</p>
            </div>
            <Switch
              checked={settings.enhancement.stabilization}
              onCheckedChange={(checked) => handleSettingChange('enhancement', 'stabilization', checked)}
              data-testid="stabilization-switch"
            />
          </div>
        </div>
      </Card>

      {/* Real-time Features */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <RefreshCw className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Real-time Features</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Live Preview</Label>
              <p className="text-sm text-gray-500">Show real-time preview of changes</p>
            </div>
            <Switch
              checked={settings.realtime.livePreview}
              onCheckedChange={(checked) => handleSettingChange('realtime', 'livePreview', checked)}
              data-testid="live-preview-switch"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-Sync</Label>
              <p className="text-sm text-gray-500">Automatically sync changes across devices</p>
            </div>
            <Switch
              checked={settings.realtime.autoSync}
              onCheckedChange={(checked) => handleSettingChange('realtime', 'autoSync', checked)}
              data-testid="auto-sync-switch"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Instant Feedback</Label>
              <p className="text-sm text-gray-500">Show immediate processing feedback</p>
            </div>
            <Switch
              checked={settings.realtime.instantFeedback}
              onCheckedChange={(checked) => handleSettingChange('realtime', 'instantFeedback', checked)}
              data-testid="instant-feedback-switch"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setSettings({
            quality: { resolution: 75, compression: 65, optimization: true },
            performance: { caching: true, preloading: true, batchProcessing: false },
            enhancement: { autoColor: true, noiseCancellation: true, stabilization: false },
            realtime: { livePreview: true, autoSync: false, instantFeedback: true }
          })}
          data-testid="reset-settings-btn"
        >
          Reset to Defaults
        </Button>
        <Button
          onClick={() => onSave?.(settings)}
          data-testid="save-settings-btn"
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
} 