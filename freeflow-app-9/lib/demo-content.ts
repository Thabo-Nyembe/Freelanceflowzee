import fs from 'fs';
import path from 'path';

// Demo Content Integration System for FreeflowZee
// Uses the populated realistic content for comprehensive feature demonstrations

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  phone: string;
  profession: string;
  bio: string;
  joinDate: string;
  skills: string[];
  rating: number;
  projectsCompleted: number;
  hourlyRate: number;
  isVerified: boolean;
  isOnline: boolean;
}

export interface DemoProject {
  id: string;
  title: string;
  description: string;
  type: string;
  industry: string;
  client: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  freelancer: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  budget: number;
  timeline: number;
  status: string;
  progress: number;
  priority: string;
  tags: string[];
  createdAt: string;
  dueDate: string;
  images: string[];
  thumbnail: string;
  files: Record<string, unknown>[];
  milestones: Record<string, unknown>[];
  comments: Record<string, unknown>[];
  attachments: Record<string, unknown>[];
}

export interface DemoPost {
  id: string;
  type: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    profession: string;
  };
  content: string;
  image: string | null;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  tags: string[];
  createdAt: string;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface DemoFile {
  id: string;
  name: string;
  type: string;
  category: string;
  size: number;
  sizeFormatted: string;
  uploadedAt: string;
  downloadCount: number;
  isShared: boolean;
  url: string;
  thumbnail: string | null;
}

export interface DemoTransaction {
  id: string;
  projectId: string;
  projectTitle: string;
  client: Record<string, unknown>;
  freelancer: Record<string, unknown>;
  amount: number;
  currency: string;
  status: string;
  type: string;
  createdAt: string;
  releaseDate: string;
  description: string;
  milestoneNumber: number;
  disputeReason: string | null;
}

export interface DemoAnalytics {
  overview: {
    totalViews: number;
    totalDownloads: number;
    totalRevenue: number;
    averageRating: number;
    completionRate: number;
  };
  daily: Array<{
    date: string;
    views: number;
    downloads: number;
    uploads: number;
    revenue: number;
    newUsers: number;
    activeProjects: number;
  }>;
  topCountries: Array<{
    country: string;
    views: number;
    percentage: number;
  }>;
  deviceTypes: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
}

class DemoContentManager {
  private static instance: DemoContentManager;
  private contentCache: Map<string, any> = new Map();
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DemoContentManager {
    if (!DemoContentManager.instance) {
      DemoContentManager.instance = new DemoContentManager();
    }
    return DemoContentManager.instance;
  }

  private async loadContentFile(filename: string): Promise<any> {
    if (this.contentCache.has(filename)) {
      return this.contentCache.get(filename);
    }

    try {
      // Try enhanced content first
      const enhancedPath = path.join(process.cwd(), 'public', 'enhanced-content', 'content', filename);
      if (fs.existsSync(enhancedPath)) {
        const content = JSON.parse(fs.readFileSync(enhancedPath, 'utf-8'));
        this.contentCache.set(filename, content);
        return content;
      }

      // Fallback to mock data
      const mockPath = path.join(process.cwd(), 'public', 'mock-data', filename);
      if (fs.existsSync(mockPath)) {
        const content = JSON.parse(fs.readFileSync(mockPath, 'utf-8'));
        this.contentCache.set(filename, content);
        return content;
      }

      console.warn(`Demo content file not found: ${filename}`);
      return null;
    } catch (error) {
      console.error(`Error loading demo content file ${filename}:`, error);
      return null;
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🎭 Initializing Demo Content Manager...');

    // Pre-load all content files
    const contentFiles = ['enhanced-users.json', 'enhanced-projects.json', 'enhanced-posts.json', 'enhanced-files.json', 'enhanced-transactions.json', 'enhanced-analytics.json', 'enhanced-images.json
    ];

    for (const file of contentFiles) {
      await this.loadContentFile(file);
    }

    this.isInitialized = true;
    console.log('✅ Demo Content Manager initialized with realistic data');
  }

  // Users for Community Hub, Team Management, Client Profiles
  async getDemoUsers(limit?: number): Promise<DemoUser[]> {
    const users = await this.loadContentFile('enhanced-users.json') || 
                 await this.loadContentFile('users.json') || [];
    return limit ? users.slice(0, limit) : users;
  }

  // Projects for Projects Hub, Portfolio, Client Work
  async getDemoProjects(limit?: number, status?: string): Promise<DemoProject[]> {
    let projects = await this.loadContentFile('enhanced-projects.json') || 
                  await this.loadContentFile('projects.json') || [];
    
    if (status) {
      projects = projects.filter((p: DemoProject) => p.status === status);
    }
    
    return limit ? projects.slice(0, limit) : projects;
  }

  // Posts for Community Hub, Social Features
  async getDemoPosts(limit?: number, type?: string): Promise<DemoPost[]> {
    let posts = await this.loadContentFile('enhanced-posts.json') || 
               await this.loadContentFile('posts.json') || [];
    
    if (type) {
      posts = posts.filter((p: DemoPost) => p.type === type);
    }
    
    return limit ? posts.slice(0, limit) : posts;
  }

  // Files for Files Hub, Storage Management
  async getDemoFiles(limit?: number, category?: string): Promise<DemoFile[]> {
    const fileData = await this.loadContentFile('enhanced-files.json') || 
                    await this.loadContentFile('files.json') || { files: [] };
    
    let files = fileData.files || fileData || [];
    
    if (category) {
      files = files.filter((f: DemoFile) => f.category === category);
    }
    
    return limit ? files.slice(0, limit) : files;
  }

  // Transactions for Escrow System, Financial Management
  async getDemoTransactions(limit?: number, status?: string): Promise<DemoTransaction[]> {
    let transactions = await this.loadContentFile('enhanced-transactions.json') || 
                      await this.loadContentFile('escrow-transactions.json') || [];
    
    if (status) {
      transactions = transactions.filter((t: DemoTransaction) => t.status === status);
    }
    
    return limit ? transactions.slice(0, limit) : transactions;
  }

  // Analytics for Dashboard, Reports, Insights
  async getDemoAnalytics(): Promise<DemoAnalytics> {
    return await this.loadContentFile('enhanced-analytics.json') || 
           await this.loadContentFile('advanced-analytics.json') || {
      overview: {
        totalViews: 12500,
        totalDownloads: 3400,
        totalRevenue: 45600,
        averageRating: 4.7,
        completionRate: 94.2
      },
      daily: [],
      topCountries: [],
      deviceTypes: []
    };
  }

  // Images for Media Gallery, Project Showcases
  async getDemoImages(limit?: number): Promise<unknown[]> {
    const images = await this.loadContentFile('enhanced-images.json') || [];
    return limit ? images.slice(0, limit) : images;
  }

  // Specialized content for specific features
  async getProjectsByClient(clientId: string): Promise<DemoProject[]> {
    const projects = await this.getDemoProjects();
    return projects.filter(p => p.client.id === clientId);
  }

  async getProjectsByFreelancer(freelancerId: string): Promise<DemoProject[]> {
    const projects = await this.getDemoProjects();
    return projects.filter(p => p.freelancer.id === freelancerId);
  }

  async getActiveEscrowTransactions(): Promise<DemoTransaction[]> {
    return this.getDemoTransactions(undefined, 'active');
  }

  async getRecentFiles(limit: number = 10): Promise<DemoFile[]> {
    const files = await this.getDemoFiles();
    return files
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, limit);
  }

  async getTrendingPosts(limit: number = 20): Promise<DemoPost[]> {
    const posts = await this.getDemoPosts();
    return posts
      .sort((a, b) => (b.likes + b.views) - (a.likes + a.views))
      .slice(0, limit);
  }

  async getTopCreators(limit: number = 10): Promise<DemoUser[]> {
    const users = await this.getDemoUsers();
    return users
      .filter(u => u.isVerified)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // Feature-specific demo data generators
  async generateDashboardData() {
    const [projects, transactions, files, analytics] = await Promise.all([
      this.getDemoProjects(5),
      this.getDemoTransactions(3, 'active'),
      this.getRecentFiles(5),
      this.getDemoAnalytics()
    ]);

    return {
      recentProjects: projects,
      activeEscrow: transactions,
      recentFiles: files,
      analytics: analytics.overview,
      notifications: [
        { id: 1, type: 'project', message: 'New project milestone completed', time: '2 hours ago' },
        { id: 2, type: 'payment', message: 'Payment released from escrow', time: '5 hours ago' },
        { id: 3, type: 'comment', message: 'New feedback on Brand Identity project', time: '1 day ago' }
      ]
    };
  }

  async generateCommunityData() {
    const [posts, creators, users] = await Promise.all([
      this.getTrendingPosts(20),
      this.getTopCreators(12),
      this.getDemoUsers(50)
    ]);

    return {
      feedPosts: posts,
      featuredCreators: creators,
      activeUsers: users.filter(u => u.isOnline),
      stats: {
        totalCreators: creators.length,
        activePosts: posts.length,
        onlineUsers: users.filter(u => u.isOnline).length
      }
    };
  }

  async generateFilesHubData() {
    const [allFiles, recentFiles] = await Promise.all([
      this.getDemoFiles(),
      this.getRecentFiles(10)
    ]);

    const categories = ['documents', 'images', 'videos', 'audio'];
    const filesByCategory = categories.map(category => ({
      category,
      count: allFiles.filter(f => f.category === category).length,
      files: allFiles.filter(f => f.category === category).slice(0, 5)
    }));

    return {
      allFiles,
      recentFiles,
      filesByCategory,
      totalSize: allFiles.reduce((sum, f) => sum + f.size, 0),
      totalCount: allFiles.length
    };
  }

  async generateEscrowData() {
    const [active, pending, completed] = await Promise.all([
      this.getDemoTransactions(undefined, 'active'),
      this.getDemoTransactions(undefined, 'pending'),
      this.getDemoTransactions(undefined, 'released')
    ]);

    return {
      activeTransactions: active,
      pendingTransactions: pending,
      completedTransactions: completed,
      totalValue: active.reduce((sum, t) => sum + t.amount, 0),
      stats: {
        totalActive: active.length,
        totalPending: pending.length,
        totalCompleted: completed.length
      }
    };
  }

  // Clear cache for testing
  clearCache(): void {
    this.contentCache.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const demoContent = DemoContentManager.getInstance();

// Convenience functions for quick access
export const getDemoUsers = (limit?: number) => demoContent.getDemoUsers(limit);
export const getDemoProjects = (limit?: number, status?: string) => demoContent.getDemoProjects(limit, status);
export const getDemoPosts = (limit?: number, type?: string) => demoContent.getDemoPosts(limit, type);
export const getDemoFiles = (limit?: number, category?: string) => demoContent.getDemoFiles(limit, category);
export const getDemoTransactions = (limit?: number, status?: string) => demoContent.getDemoTransactions(limit, status);
export const getDemoAnalytics = () => demoContent.getDemoAnalytics();

// Initialize on import
if (typeof window === 'undefined') {
  demoContent.initialize().catch(console.error);
} 