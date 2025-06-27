import { NextRequest, NextResponse } from 'next/server';
import { demoContent } from '@/lib/demo-content';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Initialize demo content manager
    await demoContent.initialize();

    let data;

    switch (type) {
      case 'users':
        data = await demoContent.getDemoUsers(limit);
        break;
      
      case 'projects':
        data = await demoContent.getDemoProjects(limit, status || undefined);
        break;
      
      case 'posts':
        data = await demoContent.getDemoPosts(limit, category || undefined);
        break;
      
      case 'files':
        data = await demoContent.getDemoFiles(limit, category || undefined);
        break;
      
      case 'transactions':
        data = await demoContent.getDemoTransactions(limit, status || undefined);
        break;
      
      case 'analytics':
        data = await demoContent.getDemoAnalytics();
        break;
      
      case 'images':
        data = await demoContent.getDemoImages(limit);
        break;
      
      case 'dashboard':
        data = await demoContent.generateDashboardData();
        break;
      
      case 'community':
        data = await demoContent.generateCommunityData();
        break;
      
      case 'files-hub':
        data = await demoContent.generateFilesHubData();
        break;
      
      case 'escrow':
        data = await demoContent.generateEscrowData();
        break;
      
      case 'trending-posts':
        data = await demoContent.getTrendingPosts(limit || 20);
        break;
      
      case 'top-creators':
        data = await demoContent.getTopCreators(limit || 10);
        break;
      
      case 'recent-files':
        data = await demoContent.getRecentFiles(limit || 10);
        break;
      
      default:
        // Return overview of all available content
        const [users, projects, posts, files, transactions] = await Promise.all([
          demoContent.getDemoUsers(5),
          demoContent.getDemoProjects(5),
          demoContent.getDemoPosts(5),
          demoContent.getDemoFiles(5),
          demoContent.getDemoTransactions(5)
        ]);

        data = {
          overview: {
            users: users.length,
            projects: projects.length,
            posts: posts.length,
            files: files.length,
            transactions: transactions.length
          },
          samples: {
            users: users.slice(0, 3),
            projects: projects.slice(0, 3),
            posts: posts.slice(0, 3),
            files: files.slice(0, 3),
            transactions: transactions.slice(0, 3)
          },
          availableTypes: ['users', 'projects', 'posts', 'files', 'transactions', 'analytics', 'images', 'dashboard', 'community', 'files-hub', 'escrow', 'trending-posts', 'top-creators', 'recent-files'
          ]
        };
    }

    return NextResponse.json({
      success: true,
      type,
      count: Array.isArray(data) ? data.length : 1,
      data
    });

  } catch (error) {
    console.error('Demo content API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load demo content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    await demoContent.initialize();

    switch (action) {
      case 'refresh':
        demoContent.clearCache();
        await demoContent.initialize();
        return NextResponse.json({
          success: true,
          message: 'Demo content cache refreshed'
        });
      
      case 'stats':
        const [users, projects, posts, files, transactions, analytics] = await Promise.all([
          demoContent.getDemoUsers(),
          demoContent.getDemoProjects(),
          demoContent.getDemoPosts(),
          demoContent.getDemoFiles(),
          demoContent.getDemoTransactions(),
          demoContent.getDemoAnalytics()
        ]);

        return NextResponse.json({
          success: true,
          stats: {
            totalUsers: users.length,
            totalProjects: projects.length,
            totalPosts: posts.length,
            totalFiles: files.length,
            totalTransactions: transactions.length,
            analyticsAvailable: !!analytics.overview
          }
        });
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Demo content POST error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process demo content request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 