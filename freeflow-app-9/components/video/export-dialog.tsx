import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { toast } from 'sonner';
import { Settings2, X } from 'lucide-react';
import { useVideoExport } from '@/hooks/use-video-export';
import { VideoExportFormat, VideoExportQuality } from '@/lib/types/video-export';
import { Button } from '@/components/ui/button';

interface ExportDialogProps {
  videoId: string;
  onExportStart?: () => void;
}

export function ExportDialog({ videoId, onExportStart }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<VideoExportFormat>('mp4');
  const [quality, setQuality] = useState<VideoExportQuality>('high');
  const { startExport, isLoading } = useVideoExport();

  const handleExport = async () => {
    try {
      await startExport({
        videoId,
        format,
        quality,
      });
      
      toast.success('Export started successfully');
      onExportStart?.();
      setOpen(false);
    } catch (error) {
      toast.error('Failed to start export');
      console.error(error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="w-4 h-4 mr-2" />
          Export
        </Button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-[400px]">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Export Video
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Format
              </label>
              <Select.Root value={format} onValueChange={(value: VideoExportFormat) => setFormat(value)}>
                <Select.Trigger className="w-full px-3 py-2 border rounded-md">
                  <Select.Value />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="bg-white dark:bg-gray-900 border rounded-md shadow-lg">
                    <Select.Viewport>
                      <Select.Item value="mp4" className="px-3 py-2 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Select.ItemText>MP4</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="mov" className="px-3 py-2 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Select.ItemText>MOV</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="webm" className="px-3 py-2 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Select.ItemText>WebM</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Quality
              </label>
              <Select.Root value={quality} onValueChange={(value: VideoExportQuality) => setQuality(value)}>
                <Select.Trigger className="w-full px-3 py-2 border rounded-md">
                  <Select.Value />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="bg-white dark:bg-gray-900 border rounded-md shadow-lg">
                    <Select.Viewport>
                      <Select.Item value="low" className="px-3 py-2 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Select.ItemText>Low (720p)</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="medium" className="px-3 py-2 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Select.ItemText>Medium (1080p)</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="high" className="px-3 py-2 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Select.ItemText>High (2160p)</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="source" className="px-3 py-2 outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Select.ItemText>Source Quality</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Dialog.Close asChild>
                <Button variant="outline">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button onClick={handleExport} disabled={isLoading}>
                {isLoading ? 'Starting...' : 'Start Export'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 