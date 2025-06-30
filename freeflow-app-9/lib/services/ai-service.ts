"use client"

import { createClient } from '@/lib/supabase/client'
import { FileType } from '@/types/files'
import type { Database } from '@/types/supabase'
import { SupabaseClient } from '@supabase/supabase-js'

export interface AIAnalysisResult {
  id: string
  timestamp: string
  type: FileType
  status: 'analyzing' | 'complete' | 'error
  result: string
}

export interface AIGenerationSettings {
  creativity: number
  quality: string
  model: string
}

export interface AIGenerationResult {
  id: string
  timestamp: string
  type: string
  status: 'generating' | 'complete' | 'error
  result: string
}

export class AIService {
  private supabase: SupabaseClient<Database>

  constructor() {
    const client = createClient()
    if (!client) {
      throw new Error('Failed to initialize Supabase client')
    }
    this.supabase = client
  }

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
          file_type: type,
          status: 'analyzing',
          result: 
        })
        .select()
        .single()

      if (error) throw error

      if (!data) {
        throw new Error('No data returned from insert operation')
      }

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
        type: data.file_type as FileType,
        status: data.status as 'analyzing' | 'complete' | 'error',
        result: data.result
      }
    } catch (error) {
      console.error('Error analyzing file: ', error)'
      throw error
    }
  }

  async getAnalysisHistory(): Promise<AIAnalysisResult[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await this.supabase
        .from('ai_analysis')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(item => ({
        id: item.id,
        timestamp: item.created_at,
        type: item.file_type as FileType,
        status: item.status as 'analyzing' | 'complete' | 'error',
        result: item.result || 
      }))
    } catch (error) {
      console.error('Error fetching analysis history: ', error)'
      throw error
    }
  }

  // AI Create Methods
  async generateAsset(
    type: 'image' | 'code' | 'text' | 'audio' | 'video',
    prompt: string,
    settings: AIGenerationSettings
  ): Promise<AIGenerationResult> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('User not authenticated')

      // Create initial record
      const { data, error: insertError } = await this.supabase
        .from('ai_generations')
        .insert({
          user_id: user.id,
          type,
          prompt,
          settings,
          status: 'generating',
          result: 
        })
        .select()
        .single()

      if (insertError) throw insertError
      if (!data) throw new Error('No data returned from insert operation')

      // Simulate generation process
      setTimeout(async () => {
        await this.supabase
          .from('ai_generations')
          .update({
            status: 'complete',
            result: 'Generation completed successfully'
          })
          .eq('id', data.id)
      }, 5000)

      return {
        id: data.id,
        timestamp: data.created_at,
        type: data.type,
        status: data.status as 'generating' | 'complete' | 'error',
        result: data.result
      }
    } catch (error) {
      console.error('Error generating asset: ', error)'
      throw error
    }
  }

  async getGenerationLibrary(): Promise<AIGenerationResult[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await this.supabase
        .from('ai_generations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(item => ({
        id: item.id,
        timestamp: item.created_at,
        type: item.type,
        status: item.status as 'generating' | 'complete' | 'error',
        result: item.result || 
      }))
    } catch (error) {
      console.error('Error fetching generation library: ', error)'
      throw error
    }
  }
}

export const aiService = new AIService() 