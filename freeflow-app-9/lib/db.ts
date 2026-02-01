import { PrismaClient } from '@prisma/client';
import { Logger } from '@/lib/logger';

// Types for enhanced Prisma client with logging and metrics
interface ExtendedPrismaClient extends PrismaClient {
  $metrics?: {
    queries: number;
    slowQueries: number;
    errors: number;
    lastError?: Error;
  };
}

// Configuration for Prisma client
const prismaClientConfig = {
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
};

// Connection pool configuration for production
const connectionPoolConfig = {
  pool: {
    min: 2,
    max: 10,
  },
};

// Global variable to store the Prisma client instance
let prisma: ExtendedPrismaClient;

// Initialize metrics
const initMetrics = (client: ExtendedPrismaClient) => {
  client.$metrics = {
    queries: 0,
    slowQueries: 0,
    errors: 0,
  };
};

// Set up event listeners for the Prisma client
const setupEventListeners = (client: ExtendedPrismaClient) => {
  client.$on('query', (e: any) => {
    if (client.$metrics) {
      client.$metrics.queries++;
    }

    // Log slow queries (over 500ms)
    if (e.duration > 500) {
      if (client.$metrics) {
        client.$metrics.slowQueries++;
      }
      Logger.warn(`Slow query detected (${e.duration}ms): ${e.query}`);
    }

    // Detailed logging in development
    if (process.env.NODE_ENV === 'development') {
      Logger.debug(`Query (${e.duration}ms): ${e.query}`);
    }
  });

  client.$on('error', (e: any) => {
    if (client.$metrics) {
      client.$metrics.errors++;
      client.$metrics.lastError = e;
    }
    Logger.error('Prisma client error:', e);
  });

  client.$on('info', (e: any) => {
    Logger.info('Prisma info:', e);
  });

  client.$on('warn', (e: any) => {
    Logger.warn('Prisma warning:', e);
  });
};

// Function to create a new Prisma client
function createPrismaClient(): ExtendedPrismaClient {
  // Determine if we're in production to apply connection pooling
  const config = process.env.NODE_ENV === 'production'
    ? { ...prismaClientConfig, ...connectionPoolConfig }
    : prismaClientConfig;

  const client = new PrismaClient(config) as ExtendedPrismaClient;
  
  // Initialize metrics tracking
  initMetrics(client);
  
  // Set up event listeners
  setupEventListeners(client);
  
  return client;
}

// Initialize the Prisma client as a singleton
if (process.env.NODE_ENV === 'production') {
  // In production, create a new instance
  prisma = createPrismaClient();
} else {
  // In development, reuse the existing instance to avoid multiple connections
  if (!(global as Record<string, unknown>).prisma) {
    (global as Record<string, unknown>).prisma = createPrismaClient();
  }
  prisma = (global as Record<string, unknown>).prisma;
}

// Helper function to execute a database operation with retries
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.code === 'P2002' || error.code === 'P2003') {
        // Unique constraint or foreign key constraint failure
        throw error;
      }
      
      Logger.warn(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
}

// Helper function to safely execute a transaction
export async function safeTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx) => {
      return await callback(tx);
    });
  } catch (error) {
    Logger.error('Transaction failed:', error);
    throw error;
  }
}

// Helper function to get database metrics
export function getDatabaseMetrics() {
  return prisma.$metrics || {
    queries: 0,
    slowQueries: 0,
    errors: 0,
  };
}

// Helper function to reset database metrics
export function resetDatabaseMetrics() {
  if (prisma.$metrics) {
    prisma.$metrics.queries = 0;
    prisma.$metrics.slowQueries = 0;
    prisma.$metrics.errors = 0;
    prisma.$metrics.lastError = undefined;
  }
}

// Helper function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Execute a simple query to check connection
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    Logger.error('Database connection check failed:', error);
    return false;
  }
}

// Helper function to gracefully disconnect
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    Logger.info('Database disconnected successfully');
  } catch (error) {
    Logger.error('Error disconnecting from database:', error);
  }
}

// Export the Prisma client instance and helper functions
export { prisma };

// Default export for convenience
export default prisma;
