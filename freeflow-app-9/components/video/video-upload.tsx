import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Upload, X, FileVideo, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VideoUploadProps {
  onUpload: (file: File) => Promise<void>;
  maxSize?: number; // in bytes
  accept?: string[];
  className?: string;
}

export function VideoUpload({
  onUpload,
  maxSize = 1024 * 1024 * 100, // 100MB default
  accept = ['video/mp4', 'video/quicktime', 'video/webm'],
  className
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Handle upload
      await onUpload(file);
      toast.success('Video uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': accept
    },
    maxSize,
    multiple: false
  });

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'relative rounded-lg border-2 border-dashed p-4',
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300',
          isMobile ? 'p-4' : 'p-8',
          className
        )}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative aspect-video w-full">
            <video
              src={preview}
              className="h-full w-full rounded-lg object-cover"
              controls
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation();
                clearPreview();
              }}
            >
              <X className="h-4 w-4 text-white" />
            </Button>
          </div>
        ) : (
          <div className={cn(
            'flex flex-col items-center justify-center space-y-4',
            isMobile ? 'min-h-[150px]' : 'min-h-[200px]'
          )}>
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm text-gray-500">Uploading video...</p>
              </>
            ) : (
              <>
                {isDragActive ? (
                  <Upload className="h-8 w-8 text-primary" />
                ) : (
                  <FileVideo className="h-8 w-8 text-gray-400" />
                )}
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {isDragActive
                      ? 'Drop your video here'
                      : isMobile
                      ? 'Tap to upload video'
                      : 'Drag & drop or click to upload video'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {`Maximum file size: ${Math.round(maxSize / 1024 / 1024)}MB`}
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported formats: {accept.join(', ')}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 