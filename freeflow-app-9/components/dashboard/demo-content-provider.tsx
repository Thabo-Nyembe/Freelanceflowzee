'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DemoContent {
  users: any[];
  projects: any[];
  posts: any[];
  files: any[];
  transactions: any[];
  analytics: any;
  images: any[];
}

interface DemoContentContextType {
  content: DemoContent | null;
  loading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
  getProjectsByStatus: (status: string) => any[];
  getPostsByType: (type: string) => any[];
  getFilesByCategory: (category: string) => any[];
  getTransactionsByStatus: (status: string) => any[];
  getTopCreators: (limit?: number) => any[];
  getRecentFiles: (limit?: number) => any[];
  getTrendingPosts: (limit?: number) => any[];
}

const DemoContentContext = createContext<DemoContentContextType | undefined>(undefined);

export function DemoContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<DemoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all content types in parallel
      const [users, projects, posts, files, transactions, analytics, images] = await Promise.all([
        fetch('/api/demo/content?type=users').then(r => r.json()),
        fetch('/api/demo/content?type=projects').then(r => r.json()),
        fetch('/api/demo/content?type=posts').then(r => r.json()),
        fetch('/api/demo/content?type=files').then(r => r.json()),
        fetch('/api/demo/content?type=transactions').then(r => r.json()),
        fetch('/api/demo/content?type=analytics').then(r => r.json()),
        fetch('/api/demo/content?type=images').then(r => r.json())
      ]);

      setContent({
        users: users.data || [],
        projects: projects.data || [],
        posts: posts.data || [],
        files: files.data || [],
        transactions: transactions.data || [],
        analytics: analytics.data || {},
        images: images.data || []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load demo content');
      console.error('Demo content loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  // Helper functions for filtered content
  const getProjectsByStatus = (status: string) => {
    return content?.projects?.filter(p => p.status === status) || [];
  };

  const getPostsByType = (type: string) => {
    return content?.posts?.filter(p => p.type === type) || [];
  };

  const getFilesByCategory = (category: string) => {
    return content?.files?.filter(f => f.category === category) || [];
  };

  const getTransactionsByStatus = (status: string) => {
    return content?.transactions?.filter(t => t.status === status) || [];
  };

  const getTopCreators = (limit = 10) => {
    return content?.users
      ?.filter(u => u.isVerified)
      ?.sort((a, b) => b.rating - a.rating)
      ?.slice(0, limit) || [];
  };

  const getRecentFiles = (limit = 10) => {
    return content?.files
      ?.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      ?.slice(0, limit) || [];
  };

  const getTrendingPosts = (limit = 20) => {
    return content?.posts
      ?.sort((a, b) => (b.likes + b.views) - (a.likes + a.views))
      ?.slice(0, limit) || [];
  };

  const refreshContent = async () => {
    await loadContent();
  };

  const value: DemoContentContextType = {
    content,
    loading,
    error,
    refreshContent,
    getProjectsByStatus,
    getPostsByType,
    getFilesByCategory,
    getTransactionsByStatus,
    getTopCreators,
    getRecentFiles,
    getTrendingPosts
  };

  return (
    <DemoContentContext.Provider value={value}>
      {children}
    </DemoContentContext.Provider>
  );
}

export function useDemoContent() {
  const context = useContext(DemoContentContext);
  if (context === undefined) {
    throw new Error('useDemoContent must be used within a DemoContentProvider');
  }
  return context;
}

// Hook for dashboard metrics
export function useDashboardMetrics() {
  const { content } = useDemoContent();
  
  if (!content) return null;

  return {
    totalProjects: content.projects?.length || 0,
    activeProjects: content.projects?.filter(p => p.status === 'active')?.length || 0,
    completedProjects: content.projects?.filter(p => p.status === 'completed')?.length || 0,
    totalFiles: content.files?.length || 0,
    totalRevenue: content.transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
    totalUsers: content.users?.length || 0,
    totalPosts: content.posts?.length || 0,
    averageRating: content.analytics?.overview?.averageRating || 4.7,
    completionRate: content.analytics?.overview?.completionRate || 94.2
  };
}

// Hook for community metrics
export function useCommunityMetrics() {
  const { content, getTopCreators, getTrendingPosts } = useDemoContent();
  
  if (!content) return null;

  const onlineUsers = content.users?.filter(u => u.isOnline)?.length || 0;
  const verifiedCreators = content.users?.filter(u => u.isVerified)?.length || 0;
  const totalEngagement = content.posts?.reduce((sum, p) => sum + (p.likes || 0) + (p.comments || 0), 0) || 0;

  return {
    totalUsers: content.users?.length || 0,
    onlineUsers,
    verifiedCreators,
    totalPosts: content.posts?.length || 0,
    totalEngagement,
    topCreators: getTopCreators(5),
    trendingPosts: getTrendingPosts(10)
  };
}

// Hook for file system metrics
export function useFileSystemMetrics() {
  const { content, getRecentFiles } = useDemoContent();
  
  if (!content) return null;

  const totalSize = content.files?.reduce((sum, f) => sum + (f.size || 0), 0) || 0;
  const categories = [...new Set(content.files?.map(f => f.category) || [])];
  
  const categoryStats = categories.map(category => ({
    category,
    count: content.files?.filter(f => f.category === category)?.length || 0,
    size: content.files?.filter(f => f.category === category)?.reduce((sum, f) => sum + (f.size || 0), 0) || 0
  }));

  return {
    totalFiles: content.files?.length || 0,
    totalSize,
    totalSizeFormatted: `${(totalSize / (1024 * 1024)).toFixed(1)} MB`,
    categories: categoryStats,
    recentFiles: getRecentFiles(10)
  };
}

// Hook for escrow metrics
export function useEscrowMetrics() {
  const { content, getTransactionsByStatus } = useDemoContent();
  
  if (!content) return null;

  const activeTransactions = getTransactionsByStatus('active');
  const pendingTransactions = getTransactionsByStatus('pending');
  const completedTransactions = getTransactionsByStatus('released');
  
  const totalValue = activeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const averageTransaction = activeTransactions.length > 0 ? totalValue / activeTransactions.length : 0;

  return {
    totalTransactions: content.transactions?.length || 0,
    activeTransactions: activeTransactions.length,
    pendingTransactions: pendingTransactions.length,
    completedTransactions: completedTransactions.length,
    totalValue,
    averageTransaction,
    recentTransactions: activeTransactions.slice(0, 5)
  };
} 