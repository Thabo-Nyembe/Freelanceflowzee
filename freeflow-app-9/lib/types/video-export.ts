import { Database } from '../database.types';

export type VideoExportStatus = Database['public']['Enums']['video_export_status'];
export type VideoExportQuality = Database['public']['Enums']['video_export_quality'];
export type VideoExportFormat = Database['public']['Enums']['video_export_format'];

export interface VideoExport {
  id: string;
  video_id: string;
  user_id: string;
  status: VideoExportStatus;
  format: VideoExportFormat;
  quality: VideoExportQuality;
  output_url: string | null;
  error_message: string | null;
  export_settings: Record<string, unknown>;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExportPreset {
  id: string;
  user_id: string;
  name: string;
  format: VideoExportFormat;
  quality: VideoExportQuality;
  settings: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateExportRequest {
  videoId: string;
  format: VideoExportFormat;
  quality: VideoExportQuality;
  settings?: Record<string, unknown>;
}

export interface CreatePresetRequest {
  name: string;
  format: VideoExportFormat;
  quality: VideoExportQuality;
  settings?: Record<string, unknown>;
  isDefault?: boolean;
}

export interface UpdatePresetRequest extends Partial<CreatePresetRequest> {
  id: string;
}

export interface ExportProgress {
  status: VideoExportStatus;
  progress: number;
  timeRemaining?: number;
} 