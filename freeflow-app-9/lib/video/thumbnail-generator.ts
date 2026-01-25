/**
 * Video Thumbnail Generator
 * Handles automatic thumbnail generation from Mux and fallback systems
 */

import { createClient } from '@/lib/supabase/client';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('ThumbnailGenerator');

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  time?: number; // Timestamp in seconds
  fitMode?: 'pad' | 'crop' | 'fill';
  format?: 'jpg' | 'png' | 'gif';
  quality?: number; // 1-100
}

export interface ThumbnailResult {
  url: string;
  width: number;
  height: number;
  format: string;
  source: 'mux' | 'generated' | 'fallback';
}

export interface AnimatedThumbnailOptions extends ThumbnailOptions {
  startTime?: number;
  endTime?: number;
  fps?: number;
  duration?: number;
}

export class VideoThumbnailGenerator {
  private supabase = createClient();

  /**
   * Generate thumbnail URL from Mux playback ID
   */
  public generateMuxThumbnail(
    playbackId: string, 
    options: ThumbnailOptions = {}
  ): ThumbnailResult {
    const {
      width = 640,
      height = 360,
      time = 1,
      fitMode = 'pad',
      format = 'jpg',
      quality = 85
    } = options;

    const params = new URLSearchParams({
      width: width.toString(),
      height: height.toString(),
      time: time.toString(),
      fit_mode: fitMode,
      quality: quality.toString()
    });

    const url = `https://image.mux.com/${playbackId}/thumbnail.${format}?${params}`;

    return {
      url,
      width,
      height,
      format,
      source: 'mux'
    };
  }

  /**
   * Generate animated GIF thumbnail from Mux
   */
  public generateMuxAnimatedThumbnail(
    playbackId: string,
    options: AnimatedThumbnailOptions = {}
  ): ThumbnailResult {
    const {
      width = 640,
      height = 360,
      startTime = 1,
      endTime = 4,
      fps = 15,
      fitMode = 'pad'
    } = options;

    const params = new URLSearchParams({
      width: width.toString(),
      height: height.toString(),
      start: startTime.toString(),
      end: endTime.toString(),
      fps: fps.toString(),
      fit_mode: fitMode
    });

    const url = `https://image.mux.com/${playbackId}/animated.gif?${params}`;

    return {
      url,
      width,
      height,
      format: 'gif',
      source: 'mux'
    };
  }

  /**
   * Generate multiple thumbnail sizes for responsive display
   */
  public generateResponsiveThumbnails(
    playbackId: string,
    baseOptions: ThumbnailOptions = {}
  ): Record<string, ThumbnailResult> {
    const sizes = {
      small: { width: 320, height: 180 },
      medium: { width: 640, height: 360 },
      large: { width: 1280, height: 720 },
      xl: { width: 1920, height: 1080 }
    };

    const thumbnails: Record<string, ThumbnailResult> = {};

    Object.entries(sizes).forEach(([size, dimensions]) => {
      thumbnails[size] = this.generateMuxThumbnail(playbackId, {
        ...baseOptions,
        ...dimensions
      });
    });

    return thumbnails;
  }

  /**
   * Generate thumbnail at multiple time points
   */
  public generateTimelineThumbnails(
    playbackId: string,
    videoDuration: number,
    count: number = 10,
    options: ThumbnailOptions = {}
  ): ThumbnailResult[] {
    const thumbnails: ThumbnailResult[] = [];
    const interval = Math.max(videoDuration / (count + 1), 1);

    for (let i = 1; i <= count; i++) {
      const time = Math.floor(interval * i);
      thumbnails.push(
        this.generateMuxThumbnail(playbackId, {
          ...options,
          time
        })
      );
    }

    return thumbnails;
  }

  /**
   * Save thumbnail metadata to database
   */
  public async saveThumbnailMetadata(
    videoId: string,
    thumbnails: {
      small?: ThumbnailResult;
      medium?: ThumbnailResult;
      large?: ThumbnailResult;
      xl?: ThumbnailResult;
      animated?: ThumbnailResult;
      timeline?: ThumbnailResult[];
    }
  ) {
    try {
      const thumbnailData = {
        video_id: videoId,
        thumbnail_small: thumbnails.small?.url,
        thumbnail_medium: thumbnails.medium?.url,
        thumbnail_large: thumbnails.large?.url,
        thumbnail_xl: thumbnails.xl?.url,
        thumbnail_animated: thumbnails.animated?.url,
        thumbnail_timeline: thumbnails.timeline?.map(t => t.url),
        generated_at: new Date().toISOString(),
        source: 'mux'
      };

      const { error } = await this.supabase
        .from('video_thumbnails')
        .upsert(thumbnailData, { onConflict: 'video_id' });

      if (error) throw error;

      return thumbnailData;
    } catch (error) {
      logger.error('Failed to save thumbnail metadata', { error });
      throw error;
    }
  }

  /**
   * Get cached thumbnails from database
   */
  public async getCachedThumbnails(videoId: string) {
    try {
      const { data, error } = await this.supabase
        .from('video_thumbnails')
        .select('*')
        .eq('video_id', videoId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data;
    } catch (error) {
      logger.error('Failed to get cached thumbnails', { error });
      return null;
    }
  }

  /**
   * Generate and cache thumbnails for a video
   */
  public async generateAndCacheThumbnails(
    videoId: string,
    playbackId: string,
    videoDuration?: number
  ) {
    try {
      // Check if thumbnails already exist
      const existingThumbnails = await this.getCachedThumbnails(videoId);
      if (existingThumbnails) {
        return existingThumbnails;
      }

      // Generate responsive thumbnails
      const responsiveThumbnails = this.generateResponsiveThumbnails(playbackId, {
        time: 1,
        fitMode: 'pad',
        quality: 85
      });

      // Generate animated thumbnail
      const animatedThumbnail = this.generateMuxAnimatedThumbnail(playbackId, {
        width: 640,
        height: 360,
        startTime: 1,
        endTime: 4,
        fps: 15
      });

      // Generate timeline thumbnails if duration is available
      let timelineThumbnails: ThumbnailResult[] = [];
      if (videoDuration && videoDuration > 10) {
        timelineThumbnails = this.generateTimelineThumbnails(
          playbackId,
          videoDuration,
          Math.min(Math.floor(videoDuration / 10), 20)
        );
      }

      // Save to database
      const thumbnailData = await this.saveThumbnailMetadata(videoId, {
        ...responsiveThumbnails,
        animated: animatedThumbnail,
        timeline: timelineThumbnails
      });

      return thumbnailData;
    } catch (error) {
      logger.error('Failed to generate and cache thumbnails', { error });
      throw error;
    }
  }

  /**
   * Get optimized thumbnail URL for display
   */
  public getOptimizedThumbnailUrl(
    playbackId: string,
    displayWidth: number,
    displayHeight?: number,
    options: Partial<ThumbnailOptions> = {}
  ): string {
    // Calculate optimal dimensions (2x for retina)
    const optimalWidth = Math.min(displayWidth * 2, 1920);
    const optimalHeight = displayHeight ? Math.min(displayHeight * 2, 1080) : Math.round(optimalWidth * (9/16));

    const thumbnail = this.generateMuxThumbnail(playbackId, {
      width: optimalWidth,
      height: optimalHeight,
      time: 1,
      fitMode: 'pad',
      format: 'jpg',
      quality: 85,
      ...options
    });

    return thumbnail.url;
  }

  /**
   * Generate fallback gradient based on video ID
   */
  public generateFallbackGradient(videoId: string): string {
    const gradients = [
      'from-blue-400 to-purple-600',
      'from-green-400 to-blue-500',
      'from-pink-400 to-red-600',
      'from-yellow-400 to-orange-500',
      'from-indigo-400 to-purple-600',
      'from-teal-400 to-blue-600',
      'from-rose-400 to-pink-600',
      'from-cyan-400 to-teal-600',
      'from-amber-400 to-orange-600',
      'from-emerald-400 to-green-600'
    ];

    // Generate consistent hash from video ID
    const hash = videoId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  }

  /**
   * Clean up old thumbnails from database
   */
  public async cleanupOldThumbnails(daysOld: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await this.supabase
        .from('video_thumbnails')
        .delete()
        .lt('generated_at', cutoffDate.toISOString());

      if (error) throw error;

      logger.info('Cleaned up thumbnails', { daysOld });
    } catch (error) {
      logger.error('Failed to cleanup old thumbnails', { error });
      throw error;
    }
  }

  /**
   * Validate thumbnail URL accessibility
   */
  public async validateThumbnailUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      logger.error('Failed to validate thumbnail URL', { error });
      return false;
    }
  }

  /**
   * Get thumbnail with fallback chain
   */
  public async getThumbnailWithFallback(
    videoId: string,
    playbackId?: string,
    options: ThumbnailOptions = {}
  ): Promise<{ url: string; source: string }> {
    try {
      // Try cached thumbnails first
      const cached = await this.getCachedThumbnails(videoId);
      if (cached?.thumbnail_medium) {
        const isValid = await this.validateThumbnailUrl(cached.thumbnail_medium);
        if (isValid) {
          return {
            url: cached.thumbnail_medium,
            source: 'cached'
          };
        }
      }

      // Try Mux thumbnail if playback ID available
      if (playbackId) {
        const muxThumbnail = this.generateMuxThumbnail(playbackId, options);
        const isValid = await this.validateThumbnailUrl(muxThumbnail.url);
        if (isValid) {
          return {
            url: muxThumbnail.url,
            source: 'mux'
          };
        }
      }

      // Fallback to gradient
      return {
        url: '', // Will use CSS gradient
        source: 'gradient'
      };
    } catch (error) {
      logger.error('Failed to get thumbnail with fallback', { error });
      return {
        url: '',
        source: 'gradient'
      };
    }
  }
}

// Export singleton instance
export const thumbnailGenerator = new VideoThumbnailGenerator();

// Utility functions for common use cases
export const generateVideoThumbnail = (playbackId: string, options?: ThumbnailOptions) => thumbnailGenerator.generateMuxThumbnail(playbackId, options);

export const generateResponsiveThumbnails = (playbackId: string, options?: ThumbnailOptions) => thumbnailGenerator.generateResponsiveThumbnails(playbackId, options);

export const getOptimizedThumbnailUrl = (playbackId: string, displayWidth: number, displayHeight?: number, options?: Partial<ThumbnailOptions>) => thumbnailGenerator.getOptimizedThumbnailUrl(playbackId, displayWidth, displayHeight, options);

export const getFallbackGradient = (videoId: string) => 
  thumbnailGenerator.generateFallbackGradient(videoId); 