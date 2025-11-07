'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, Wand2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const VIDEO_STYLES = [
  { id: 'cinematic', name: 'Cinematic', description: 'Hollywood-style cinematic videos', image: '/Cinematic' },
  { id: 'documentary', name: 'Documentary', description: 'Professional documentary style', image: '/Documentary' },
  { id: 'corporate', name: 'Corporate', description: 'Professional business videos', image: '/Corporate' },
  { id: 'animated', name: 'Animated', description: 'Cartoon and animated style', image: '/Animated' },
  { id: 'minimalist', name: 'Minimalist', description: 'Clean and simple design', image: '/Minimalist' },
  { id: 'retro', name: 'Retro', description: 'Vintage and retro aesthetics', image: '/Retro' }
]

const AI_MODELS = [
  { id: 'kazi-pro', name: 'KAZI Pro', speed: 'Fast', quality: 'Excellent', cost: '$$$$' },
  { id: 'kazi-standard', name: 'KAZI Standard', speed: 'Medium', quality: 'Good', cost: '$$' },
  { id: 'kazi-quick', name: 'KAZI Quick', speed: 'Very Fast', quality: 'Standard', cost: '$' }
]

export default function AIVideoGenerationPage() {
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('cinematic')
  const [selectedModel, setSelectedModel] = useState('kazi-pro')
  const [duration, setDuration] = useState('30')
  const [aspectRatio, setAspectRatio] = useState('16:9')

  const handleGenerate = () => {
    console.log('Generating video with:', { prompt, selectedStyle, selectedModel, duration, aspectRatio })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium">
          <Video className="w-4 h-4" />
          AI Video Generation
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Create Videos with AI
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your ideas into professional videos using advanced AI technology
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-primary" />
              Video Generation
            </h2>

            <div className="space-y-6">
              {/* Prompt Input */}
              <div>
                <Label className="block text-sm font-medium mb-2">Video Description</Label>
                <Textarea
                  placeholder="Describe the video you want to create... e.g., 'A professional product demonstration showing a smartphone with sleek animations and modern background music'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-24"
                />
              </div>

              {/* Video Style */}
              <div>
                <Label className="block text-sm font-medium mb-3">Video Style</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {VIDEO_STYLES.map((style) => (
                    <motion.div
                      key={style.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                        selectedStyle === style.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg mb-2 flex items-center justify-center">
                        <img src={style.image} alt={style.name} className="w-full h-full object-cover rounded-lg" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{style.name}</h3>
                      <p className="text-xs text-muted-foreground">{style.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label className="block text-sm font-medium mb-2">Duration: {duration} seconds</Label>
                <input
                  type="range"
                  min="10"
                  max="180"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Aspect Ratio */}
              <div>
                <Label className="block text-sm font-medium mb-2">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* AI Model */}
              <div>
                <Label className="block text-sm font-medium mb-3">AI Model</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {AI_MODELS.map((model) => (
                    <motion.div
                      key={model.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedModel(model.id)}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                        selectedModel === model.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <h3 className="font-semibold mb-2">{model.name}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Speed:</span>
                          <span className="font-medium">{model.speed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quality:</span>
                          <span className="font-medium">{model.quality}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium">{model.cost}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Video
              </Button>
            </div>
          </Card>
        </div>

        {/* Pro Tips Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              Pro Tips
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Be specific in your descriptions for better results
              </p>
              <p className="text-muted-foreground">
                Include details about mood, style, and visual elements
              </p>
              <p className="text-muted-foreground">
                Longer videos take more time to generate
              </p>
              <p className="text-muted-foreground">
                Higher quality models produce better results
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
