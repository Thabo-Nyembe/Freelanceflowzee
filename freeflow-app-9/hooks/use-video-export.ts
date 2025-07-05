import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/lib/supabase/client';
import { 
  VideoExport, 
  ExportPreset, 
  CreateExportRequest, 
  CreatePresetRequest,
  UpdatePresetRequest,
  VideoExportStatus,
  VideoExportFormat,
  VideoExportQuality
} from '@/lib/types/video-export';

interface StartExportRequest {
  videoId: string;
  format: VideoExportFormat;
  quality: VideoExportQuality;
}

export function useVideoExport(videoId?: string) {
  const supabase = useSupabase();
  const [exports, setExports] = useState<VideoExport[]>([]);
  const [presets, setPresets] = useState<ExportPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch exports for a video
  const fetchExports = async () => {
    if (!videoId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('video_exports')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExports(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch exports');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's export presets
  const fetchPresets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('export_presets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch presets');
    } finally {
      setLoading(false);
    }
  };

  // Create new export
  const createExport = async (request: CreateExportRequest) => {
    if (!videoId) return null;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/video/${videoId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('Failed to create export');
      }

      const exportJob = await response.json();
      setExports(prev => [exportJob, ...prev]);
      return exportJob;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create export');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create export preset
  const createPreset = async (request: CreatePresetRequest) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('export_presets')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      setPresets(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create preset');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update export preset
  const updatePreset = async (request: UpdatePresetRequest) => {
    try {
      setLoading(true);
      const { id, ...updates } = request;
      const { data, error } = await supabase
        .from('export_presets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPresets(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preset');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete export preset
  const deletePreset = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('export_presets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPresets(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete preset');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to export status changes
  useEffect(() => {
    if (!videoId) return;

    const subscription = supabase
      .channel(`export-status-${videoId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'video_exports',
        filter: `video_id=eq.${videoId}`
      }, (payload) => {
        setExports(prev => {
          const updated = payload.new as VideoExport;
          return prev.map(exp => 
            exp.id === updated.id ? updated : exp
          );
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [videoId, supabase]);

  // Initial data fetch
  useEffect(() => {
    if (videoId) {
      fetchExports();
    }
    fetchPresets();
  }, [videoId]);

  const startExport = useCallback(async (request: StartExportRequest) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: exportError } = await supabase
        .from('video_exports')
        .insert({
          video_id: request.videoId,
          format: request.format,
          quality: request.quality,
          status: 'pending',
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (exportError) throw exportError;
      setExports(prev => [data as VideoExport, ...prev]);
      return data as VideoExport;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start export';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    exports,
    presets,
    loading,
    error,
    createExport,
    createPreset,
    updatePreset,
    deletePreset,
    refreshExports: fetchExports,
    refreshPresets: fetchPresets,
    startExport
  };
} 