export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          mux_asset_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          mux_asset_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          mux_asset_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      video_exports: {
        Row: {
          id: string
          video_id: string
          user_id: string
          status: Database['public']['Enums']['video_export_status']
          format: Database['public']['Enums']['video_export_format']
          quality: Database['public']['Enums']['video_export_quality']
          output_url: string | null
          error_message: string | null
          export_settings: Json
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          video_id: string
          user_id: string
          status?: Database['public']['Enums']['video_export_status']
          format: Database['public']['Enums']['video_export_format']
          quality: Database['public']['Enums']['video_export_quality']
          output_url?: string | null
          error_message?: string | null
          export_settings?: Json
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          user_id?: string
          status?: Database['public']['Enums']['video_export_status']
          format?: Database['public']['Enums']['video_export_format']
          quality?: Database['public']['Enums']['video_export_quality']
          output_url?: string | null
          error_message?: string | null
          export_settings?: Json
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      export_presets: {
        Row: {
          id: string
          user_id: string
          name: string
          format: Database['public']['Enums']['video_export_format']
          quality: Database['public']['Enums']['video_export_quality']
          settings: Json
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          format: Database['public']['Enums']['video_export_format']
          quality: Database['public']['Enums']['video_export_quality']
          settings?: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          format?: Database['public']['Enums']['video_export_format']
          quality?: Database['public']['Enums']['video_export_quality']
          settings?: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      video_export_status: 'pending' | 'processing' | 'completed' | 'failed'
      video_export_quality: 'low' | 'medium' | 'high' | 'source'
      video_export_format: 'mp4' | 'mov' | 'webm'
    }
  }
} 