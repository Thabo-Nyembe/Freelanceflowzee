import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { useSupabase } from '@/lib/supabase/client';
import { ExportPreset, VideoExportFormat, VideoExportQuality } from '@/lib/types/video-export';
import { Button } from '@/components/ui/button';
import { Plus, Settings2, Star, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ExportPresetsProps {
  onSelect?: (preset: ExportPreset) => void;
}

export function ExportPresets({ onSelect }: ExportPresetsProps) {
  const [open, setOpen] = useState(false);
  const [presets, setPresets] = useState<ExportPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = useSupabase();

  const [name, setName] = useState('');
  const [format, setFormat] = useState<VideoExportFormat>('mp4');
  const [quality, setQuality] = useState<VideoExportQuality>('high');
  const [isDefault, setIsDefault] = useState(false);

  const handleCreate = async () => {
    try {
      setLoading(true);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('export_presets')
        .insert({
          name,
          format,
          quality,
          is_default: isDefault,
          user_id: user.user.id,
          settings: {}
        })
        .select()
        .single();

      if (error) throw error;

      setPresets([...presets, data]);
      toast.success('Preset created successfully');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to create preset');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (preset: ExportPreset) => {
    try {
      const { error } = await supabase
        .from('export_presets')
        .delete()
        .eq('id', preset.id);

      if (error) throw error;

      setPresets(presets.filter(p => p.id !== preset.id));
      toast.success('Preset deleted successfully');
    } catch (error) {
      toast.error('Failed to delete preset');
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Export Presets</h3>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Preset
        </Button>
      </div>

      <div className="space-y-3">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <div className="flex items-center space-x-3">
              {preset.is_default && (
                <Star className="w-4 h-4 text-yellow-500" />
              )}
              <div>
                <div className="font-medium">{preset.name}</div>
                <div className="text-sm text-gray-500">
                  {preset.format.toUpperCase()} - {preset.quality}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelect?.(preset)}
              >
                <Settings2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(preset)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-[400px]">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-semibold">
                New Export Preset
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
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter preset name"
                />
              </div>

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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="default"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="default" className="text-sm">
                  Set as default preset
                </label>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Dialog.Close asChild>
                  <Button variant="outline">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button onClick={handleCreate} disabled={loading || !name}>
                  {loading ? 'Creating...' : 'Create Preset'}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
} 