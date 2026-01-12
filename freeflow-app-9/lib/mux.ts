import Mux from '@mux/mux-node';

const { Video } = new Mux.default({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

interface ExportOptions {
  assetId: string;
  format: string;
  quality: string;
  [key: string]: unknown;
}

export class MuxClient {
  async requestExport(options: ExportOptions) {
    try {
      const { assetId, format, quality, ...settings } = options;

      // Map quality levels to Mux quality settings
      const qualitySettings = {
        low: { max_resolution: '720p', max_bitrate: 2000000 },
        medium: { max_resolution: '1080p', max_bitrate: 4000000 },
        high: { max_resolution: '2160p', max_bitrate: 8000000 },
        source: {}
      }[quality] || {};

      // Create MP4 export
      const exportData = await Video.Assets.createMP4Playback(assetId, {
        ...qualitySettings,
        ...settings
      });

      return {
        id: exportData.id,
        status: exportData.status,
        format,
        quality
      };
    } catch (error) {
      console.error('Mux export request error:', error);
      throw error;
    }
  }

  async getExportStatus(exportId: string) {
    try {
      const exportData = await Video.Assets.retrieveMP4Playback(exportId);
      
      return {
        status: exportData.status,
        url: exportData.url,
        ready: exportData.ready,
        error: exportData.error
      };
    } catch (error) {
      console.error('Mux export status error:', error);
      throw error;
    }
  }

  async deleteExport(exportId: string) {
    try {
      await Video.Assets.deleteMP4Playback(exportId);
      return true;
    } catch (error) {
      console.error('Mux export deletion error:', error);
      throw error;
    }
  }
} 