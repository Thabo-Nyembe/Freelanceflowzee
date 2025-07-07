"use client"

import { createClient } from '@/lib/supabase/client'

export interface Post {
  id: string
  userId: string
  title: string
  content: string
  category: string
  mediaUrls: string[]
  likesCount: number
  commentsCount: number
  createdAt: string
  updatedAt: string
  user?: {
    username: string
    avatarUrl: string
  }
}

export interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  user?: {
    username: string
    avatarUrl: string
  }
}

class CommunityService {
  private supabase = createClient()

  // Posts Methods
  async createPost(post: Omit<Post, 'id' | 'likesCount' | 'commentsCount' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await this.supabase
        .from('community_posts')
        .insert({
          user_id: post.userId,
          title: post.title,
          content: post.content,
          category: post.category,
          media_urls: post.mediaUrls
        })
        .select('*, profiles:user_id(*)')
        .single()

      if (error) throw error

      return this.transformPost(data)
    } catch (error) {
      console.error('Error creating post: ', error);
      throw error
    }
  }

  async getPosts(category?: string): Promise<Post[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      let query = this.supabase
        .from('community_posts')
        .select('*, profiles:user_id(*)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error

      return data.map(this.transformPost)
    } catch (error) {
      console.error('Error fetching posts: ', error);
      throw error
    }
  }

  async likePost(postId: string, userId: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { error } = await this.supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId })

      if (error) throw error
    } catch (error) {
      console.error('Error liking post: ', error);
      throw error
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { error } = await this.supabase
        .from('post_likes')
        .delete()
        .match({ post_id: postId, user_id: userId })

      if (error) throw error
    } catch (error) {
      console.error('Error unliking post: ', error);
      throw error
    }
  }

  // Comments Methods
  async createComment(comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await this.supabase
        .from('post_comments')
        .insert({
          post_id: comment.postId,
          user_id: comment.userId,
          content: comment.content
        })
        .select('*, profiles:user_id(*)')
        .single()

      if (error) throw error

      return this.transformComment(data)
    } catch (error) {
      console.error('Error creating comment: ', error);
      throw error
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    try {
      const { data, error } = await this.supabase
        .from('post_comments')
        .select('*, profiles:user_id(*)')
        .eq('post_id', postId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (error) throw error

      return data.map(this.transformComment)
    } catch (error) {
      console.error('Error fetching comments: ', error);
      throw error
    }
  }

  // Helper methods
  private transformPost(post: Record<string, unknown>): Post {
    return {
      id: post.id,
      userId: post.user_id,
      title: post.title,
      content: post.content,
      category: post.category,
      mediaUrls: post.media_urls,
      likesCount: post.likes_count,
      commentsCount: post.comments_count,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      user: post.profiles ? {
        username: post.profiles.username,
        avatarUrl: post.profiles.avatar_url
      } : undefined
    }
  }

  private transformComment(comment: Record<string, unknown>): Comment {
    return {
      id: comment.id,
      postId: comment.post_id,
      userId: comment.user_id,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      user: comment.profiles ? {
        username: comment.profiles.username,
        avatarUrl: comment.profiles.avatar_url
      } : undefined
    }
  }
}

export const communityService = new CommunityService()