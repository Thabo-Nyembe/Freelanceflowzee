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
      profiles: {
        Row: {
          id: string
          updated_at: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          user_id: string
          status: string
          priority: string
          budget: number
          spent: number
          client_name: string | null
          client_email: string | null
          start_date: string | null
          end_date: string | null
          progress: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          user_id: string
          status?: string
          priority?: string
          budget?: number
          spent?: number
          client_name?: string | null
          client_email?: string | null
          start_date?: string | null
          end_date?: string | null
          progress?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          user_id?: string
          status?: string
          priority?: string
          budget?: number
          spent?: number
          client_name?: string | null
          client_email?: string | null
          start_date?: string | null
          end_date?: string | null
          progress?: number
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: string
          media_urls: string[]
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category: string
          media_urls?: string[]
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: string
          media_urls?: string[]
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      ai_analysis: {
        Row: {
          id: string
          user_id: string
          file_type: string
          status: string
          result: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_type: string
          status: string
          result: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_type?: string
          status?: string
          result?: string
          created_at?: string
          updated_at?: string
        }
      }
      ai_generations: {
        Row: {
          id: string
          user_id: string
          type: string
          prompt: string
          settings: {
            creativity: number
            quality: string
            model: string
          }
          status: string
          result: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          prompt: string
          settings: {
            creativity: number
            quality: string
            model: string
          }
          status: string
          result: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          prompt?: string
          settings?: {
            creativity: number
            quality: string
            model: string
          }
          status?: string
          result?: string
          created_at?: string
          updated_at?: string
        }
      }
      collaboration_sessions: {
        Row: {
          id: string
          project_id: string
          session_type: string
          participants: string[]
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          session_type: string
          participants: string[]
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          session_type?: string
          participants?: string[]
          status?: string
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
      [_ in never]: never
    }
  }
} 