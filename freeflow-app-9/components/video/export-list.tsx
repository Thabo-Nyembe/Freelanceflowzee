import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/supabase/client';
import { VideoExport } from '@/lib/types/video-export';
import { formatDistanceToNow } from 'date-fns';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportListProps {
  videoId: string;
}

export function ExportList({ videoId }: ExportListProps) {
  const [exports, setExports] = useState<VideoExport[]>([]);
  const [loading, setLoading] = useState<any>(true);
  const supabase = useSupabase();

  useEffect(() => {
    const fetchExports = async () => {
      const { data, error } = await supabase
        .from('video_exports')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setExports(data);
      }
      setLoading(false);
    };

    fetchExports();

    // Subscribe to changes
    const channel = supabase
      .channel(`video_exports:${videoId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'video_exports',
        filter: `video_id=eq.${videoId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setExports(prev => [payload.new as VideoExport, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setExports(prev => prev.map(exp => 
            exp.id === payload.new.id ? payload.new as VideoExport : exp
          ));
        } else if (payload.eventType === 'DELETE') {
          setExports(prev => prev.filter(exp => exp.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [videoId, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (exports.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No exports yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exports.map((export_) => (
        <div
          key={export_.id}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                {export_.format.toUpperCase()} - {export_.quality}
              </span>
              <span className={`px-2 py-1 text-xs rounded ${
                export_.status === 'completed' ? 'bg-green-100 text-green-800' :
                export_.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {export_.status}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(export_.created_at), { addSuffix: true })}
            </div>
            {export_.error_message && (
              <div className="text-sm text-red-500 mt-1">
                {export_.error_message}
              </div>
            )}
          </div>

          {export_.status === 'completed' && export_.output_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(export_.output_url, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      ))}
    </div>
  );
} 