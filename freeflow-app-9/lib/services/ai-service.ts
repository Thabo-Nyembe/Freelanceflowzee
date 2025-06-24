"use client"

import { createClient } from '@/lib/supabase/client'
import { FileType } from '@/types/files'

export interface AIAnalysisResult {
  id: string
  timestamp: string
  type: FileType
  status: 'analyzing' | 'complete' | 'error'
  result: string
}

export interface AIGenerationResult {
  id: string
  type: 'image' | 'code' | 'text' | 'audio' | 'video'
  status: 'generating' | 'complete' | 'error'
  result: string
  settings: {
    creativity: number
    quality: 'draft' | 'standard' | 'premium'
    model: string
  }
}

class AIService {
  private supabase = createClient()

  // AI Assistant Methods
  async analyzeFile(file: File, type: FileType): Promise<AIAnalysisResult> {
    try {
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('ai-analysis')
        .upload(`${Date.now()}-${file.name}`, file)

      if (uploadError) throw uploadError

      // Create analysis record
      const { data, error } = await this.supabase
        .from('ai_analysis')
        .insert({
          file_url: uploadData.path,
          type,
          status: 'analyzing'
        })
        .select()
        .single()

      if (error) throw error

      // Start analysis process (simulated for now)
      setTimeout(async () => {
        await this.supabase
          .from('ai_analysis')
          .update({
            status: 'complete',
            result: 'Analysis completed successfully'
          })
          .eq('id', data.id)
      }, 3000)

      return {
        id: data.id,
        timestamp: data.created_at,
        type: data.type,
        status: data.status,
        result: data.result || ''
      }
    } catch (error) {
      console.error('Error analyzing file:', error)
      throw error
    }
  }

  async getAnalysisHistory(): Promise<AIAnalysisResult[]> {
    try {
      const { data, error } = await this.supabase
        .from('ai_analysis')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(item => ({
        id: item.id,
        timestamp: item.created_at,
        type: item.type,
        status: item.status,
        result: item.result || ''
      }))
    } catch (error) {
      console.error('Error fetching analysis history:', error)
      throw error
    }
  }

  // AI Create Methods
  async generateAsset(
    type: 'image' | 'code' | 'text' | 'audio' | 'video',
    prompt: string,
    settings: {
      creativity: number
      quality: 'draft' | 'standard' | 'premium'
      model: string
    }
  ): Promise<AIGenerationResult> {
    try {
      // Create generation record
      const { data, error } = await this.supabase
        .from('ai_generations')
        .insert({
          type,
          prompt,
          settings,
          status: 'generating'
        })
        .select()
        .single()

      if (error) throw error

      // Start generation process (simulated for now)
      setTimeout(async () => {
        await this.supabase
          .from('ai_generations')
          .update({
            status: 'complete',
            result: 'Generated content will be here'
          })
          .eq('id', data.id)
      }, 5000)

      return {
        id: data.id,
        type: data.type,
        status: data.status,
        result: data.result || '',
        settings: data.settings
      }
    } catch (error) {
      console.error('Error generating asset:', error)
      throw error
    }
  }

  async getGenerationLibrary(): Promise<AIGenerationResult[]> {
    try {
      const { data, error } = await this.supabase
        .from('ai_generations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(item => ({
        id: item.id,
        type: item.type,
        status: item.status,
        result: item.result || '',
        settings: item.settings
      }))
    } catch (error) {
      console.error('Error fetching generation library:', error)
      throw error
    }
  }
}

export const aiService = new AIService() 