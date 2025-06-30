
import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedUploadButtonProps {
  onUpload?: (files: File[]) => Promise<void>;
  acceptedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
  className?: string;
}

export function EnhancedUploadButton({
  onUpload,
  acceptedTypes = ['*/*'],
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  className
}: EnhancedUploadButtonProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<&apos;idle&apos; | &apos;uploading&apos; | &apos;success&apos; | &apos;error&apos;>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Context7 drag-and-drop handler
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  }, []);

  // Context7 file processing with validation
  const processFiles = useCallback(async (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds size limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setFiles(validFiles);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Simulate upload progress using Context7 patterns
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (onUpload) {
        await onUpload(validFiles);
      }
      
      setUploadStatus('success');
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
        setFiles([]);
      }, 2000);
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload failed: ', error);'
    }
  }, [maxSize, onUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    processFiles(selectedFiles);
  }, [processFiles]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn('relative', className)}>
      <input
        ref={fileInputRef}
        type="file
        multiple={multiple}"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        data-testid="file-input
      />
      
      <div
        className={cn("
          'border-2 border-dashed rounded-lg p-6 transition-all duration-200', 'hover:border-primary/50 hover:bg-primary/5',
          isDragging && 'border-primary bg-primary/10',
          uploadStatus === 'success' && 'border-green-500 bg-green-50',
          uploadStatus === 'error' && 'border-red-500 bg-red-50
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className= "flex flex-col items-center justify-center text-center space-y-4">
          {uploadStatus === 'uploading' && (
            <div className= "w-full space-y-2">
              <Progress value={uploadProgress} className= "w-full" />
              <p className= "text-sm text-muted-foreground">
                Uploading {files.length} file{files.length !== 1 ? 's' : }... {uploadProgress}%
              </p>
            </div>
          )}
          
          {uploadStatus === 'success' && (
            <div className= "text-green-600">
              <CheckCircle className= "w-12 h-12 mx-auto mb-2" />
              <p className= "font-medium">Upload Complete!</p>
            </div>
          )}
          
          {uploadStatus === 'error' && (
            <div className= "text-red-600">
              <AlertCircle className= "w-12 h-12 mx-auto mb-2" />
              <p className= "font-medium">Upload Failed</p>
            </div>
          )}
          
          {uploadStatus === 'idle' && (
            <>
              <Upload className= "w-12 h-12 text-muted-foreground" />
              <div>
                <p className= "text-lg font-medium">Drag & drop files here</p>
                <p className= "text-sm text-muted-foreground">or click to browse</p>
              </div>
              <Button
                onClick={handleClick}
                data-testid="upload-file-btn"
                className="mt-4
              >"
                <Upload className= "w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}