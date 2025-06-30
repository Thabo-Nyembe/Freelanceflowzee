'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Upload, 
  HardDrive, 
  DollarSign, 
  TrendingDown, 
  Server, 
  Cloud, 
  Image, 
  Video, 
  FileText 
} from 'lucide-react';

interface StorageAnalytics {
  totalFiles: number;
  totalSize: number;
  supabaseFiles: number;
  supabaseSize: number;
  wasabiFiles: number;
  wasabiSize: number;
  monthlyCost: number;
  potentialSavings: number;
  costBreakdown: {
    supabaseCost: number;
    wasabiCost: number;
    transferCost: number;
  };
}

interface HealthCheck {
  supabase: boolean;
  wasabi: boolean;
  overall: boolean;
}

interface StorageDashboardProps {
  className?: string;
}

export function StorageDashboard({ className }: StorageDashboardProps) {
  const [analytics, setAnalytics] = useState<StorageAnalytics | null>(null);
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [files, setFiles] = useState<unknown[]>([]);

  // Format bytes to human readable format
  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/storage/analytics');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
        setHealthCheck(data.healthCheck);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load files list
  const loadFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/storage/upload');
      const data = await response.json();
      
      if (data.success) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  }, []);

  // Optimize storage
  const optimizeStorage = useCallback(async () => {
    try {
      setOptimizing(true);
      const response = await fetch('/api/storage/analytics', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        // Show success message
        alert(data.message);
        await loadAnalytics(); // Refresh analytics
      }
    } catch (error) {
      console.error('Optimization failed:', error);
      alert('Storage optimization failed. Please try again.');
    } finally {
      setOptimizing(false);
    }
  }, [loadAnalytics]);

  // File upload handler
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'uploads');
      formData.append('tags', JSON.stringify({ type: 'upload', source: 'dashboard' }));

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`${data.message} - ${data.costOptimized}`);
        await Promise.all([loadAnalytics(), loadFiles()]);
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }

    // Reset file input
    event.target.value = '';
  }, [loadAnalytics, loadFiles]);

  useEffect(() => {
    loadAnalytics();
    loadFiles();
  }, [loadAnalytics, loadFiles]);

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading storage analytics...</span>
        </div>
      </div>
    );
  }

  const supabaseUsage = analytics ? (analytics.supabaseSize / analytics.totalSize) * 100 : 0;
  const wasabiUsage = analytics ? (analytics.wasabiSize / analytics.totalSize) * 100 : 0;
  const monthlySavings = analytics?.potentialSavings || 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Multi-Cloud Storage</h2>
          <p className="text-gray-600">Wasabi + Supabase Integration with 80% Cost Savings</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Health Status */}
          {healthCheck && (
            <Badge variant={healthCheck.overall ? "default" : "destructive"} className="flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>{healthCheck.overall ? "Healthy" : "Degraded"}</span>
            </Badge>
          )}
          
          {/* Upload Button */}
          <div className="relative">
            <input
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*,video/*,audio/*,.pdf,.zip,.txt,.json"
            />
            <Button className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Storage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(analytics?.totalSize || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.totalFiles || 0} files across providers
            </p>
          </CardContent>
        </Card>

        {/* Monthly Cost */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(analytics?.monthlyCost || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Multi-cloud optimization active
            </p>
          </CardContent>
        </Card>

        {/* Potential Savings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${monthlySavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {monthlySavings > 0 ? 'With Wasabi optimization' : 'Enable optimization'}
            </p>
          </CardContent>
        </Card>

        {/* Health Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={healthCheck?.supabase ? "default" : "destructive"}>
                Supabase
              </Badge>
              <Badge variant={healthCheck?.wasabi ? "default" : "destructive"}>
                Wasabi
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Provider connectivity status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Storage Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <Cloud className="w-4 h-4 text-blue-600" />
                      <span>Supabase ({analytics?.supabaseFiles || 0} files)</span>
                    </span>
                    <span>{formatBytes(analytics?.supabaseSize || 0)}</span>
                  </div>
                  <Progress value={supabaseUsage} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <HardDrive className="w-4 h-4 text-green-600" />
                      <span>Wasabi ({analytics?.wasabiFiles || 0} files)</span>
                    </span>
                    <span>{formatBytes(analytics?.wasabiSize || 0)}</span>
                  </div>
                  <Progress value={wasabiUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Supabase Storage</span>
                    <span className="font-medium">${(analytics?.costBreakdown.supabaseCost || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Wasabi Storage</span>
                    <span className="font-medium text-green-600">${(analytics?.costBreakdown.wasabiCost || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Transfer Costs</span>
                    <span className="font-medium">${(analytics?.costBreakdown.transferCost || 0).toFixed(2)}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Monthly</span>
                    <span>${(analytics?.monthlyCost || 0).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Files</CardTitle>
            </CardHeader>
            <CardContent>
              {files.length > 0 ? (
                <div className="space-y-3">
                  {files.slice(0, 10).map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-md bg-gray-100">
                          {file.mimeType?.startsWith('image/') && <Image className="w-4 h-4" />}
                          {file.mimeType?.startsWith('video/') && <Video className="w-4 h-4" />}
                          {!file.mimeType?.startsWith('image/') && !file.mimeType?.startsWith('video/') && <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{file.filename}</p>
                          <p className="text-sm text-gray-500">{formatBytes(file.size)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={file.provider === 'wasabi' ? "default" : "secondary"}>
                          {file.provider}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No files uploaded yet</p>
                  <p className="text-sm">Upload your first file to see it here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Automatic Cost Optimization</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Our intelligent system automatically routes files to the most cost-effective storage provider:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Large files (&gt;10MB) → Wasabi (80% cost savings)</li>
                  <li>• Videos and archives → Wasabi (long-term storage)</li>
                  <li>• Small frequently accessed files → Supabase (fast access)</li>
                  <li>• Backup files → Wasabi (cost-effective archival)</li>
                </ul>
              </div>

              <Button 
                onClick={optimizeStorage}
                disabled={optimizing}
                className="w-full"
              >
                {optimizing ? 'Optimizing...' : 'Run Storage Optimization'}
              </Button>

              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Potential Monthly Savings:</strong> ${monthlySavings.toFixed(2)}</p>
                <p><strong>Next optimization:</strong> Runs automatically daily at 2 AM UTC</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 