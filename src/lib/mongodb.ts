import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import { env } from './env';

// ------------ CONNECTION CONFIG ------------
// Default URI with fallback for development
const MONGODB_URI = env.MONGODB_URI || 'mongodb+srv://aicdadmin:A9t23YN2Ex1wMPKY@cluster0.vdmop.mongodb.net/aicd?retryWrites=true&w=majority';

// Database name to use
const DB_NAME = 'aicd';

// Connection options with shorter timeouts for Vercel serverless functions
const options: MongoClientOptions = {
  connectTimeoutMS: 5000, // 5 seconds max to avoid Vercel timeout
  socketTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10, // Limit connections to avoid MongoDB Atlas free tier limits
};

// ------------ CONNECTION STATE TRACKING ------------
// Track connection state for diagnostics
type ConnectionState = {
  connected: boolean;
  client: MongoClient | null;
  db: Db | null;
  lastConnectAttempt: Date | null;
  connectCount: number;
  errorCount: number;
  lastError: Error | null;
  offlineMode: boolean;
  mockData: boolean;
  lastRefresh: Date | null;
};

// Global connection state
const state: ConnectionState = {
  connected: false,
  client: null,
  db: null,
  lastConnectAttempt: null,
  connectCount: 0,
  errorCount: 0,
  lastError: null,
  offlineMode: false,
  mockData: false,
  lastRefresh: null
};

// Export connection state for diagnostics
export const getConnectionState = () => {
  // Create clean copy without circular references
  return { 
    ...state,
    client: state.client ? 'MongoClient Instance' : null,
    db: state.db ? 'Database Instance' : null
  };
};

// ------------ MOCK DATA FOR OFFLINE MODE ------------
// Mock database for offline mode
class MockDb {
  private collections: { [key: string]: any[] } = {
    'sections': [
      {
        id: 'mock-section-1',
        title: 'AI Tools (Offline Mode)',
        categories: [
          {
            id: 'mock-category-1',
            title: 'Image Generation',
            count: 1,
            icon: '🖼️',
            items: [
              {
                id: 'mock-item-1',
                title: 'MockAI',
                description: 'This is a mock item shown when database is unavailable',
                type: 'tool'
              }
            ]
          }
        ]
      }
    ]
  };

  collection(name: string) {
    return {
      find: () => {
        return {
          toArray: async () => {
            console.log(`[MockDB] Returning mock data for collection: ${name}`);
            return this.collections[name] || [];
          }
        };
      },
      findOne: async () => {
        console.log(`[MockDB] Returning first mock item for collection: ${name}`);
        return (this.collections[name] || [])[0] || null;
      },
      insertMany: async (docs: any[]) => {
        console.log(`[MockDB] Mock insertMany for collection: ${name}`, { count: docs.length });
        return { insertedCount: docs.length };
      },
      deleteMany: async () => {
        console.log(`[MockDB] Mock deleteMany for collection: ${name}`);
        return { deletedCount: this.collections[name]?.length || 0 };
      }
    };
  }

  async listCollections() {
    return {
      toArray: async () => {
        return Object.keys(this.collections).map(name => ({ name }));
      }
    };
  }
}

// ------------ CONNECTION MANAGEMENT ------------
// Maximum age of connection before forcing refresh
const MAX_CONNECTION_AGE_MS = 3600000; // 1 hour

// Maximum retry attempts
const MAX_RETRIES = 5;

// Check connection freshness, disconnect if too old
const refreshConnectionIfNeeded = async () => {
  if (!state.lastRefresh) return false;
  
  const age = Date.now() - state.lastRefresh.getTime();
  if (age > MAX_CONNECTION_AGE_MS && state.client) {
    console.log('[MongoDB] Connection is too old, refreshing...');
    try {
      await state.client.close();
      state.connected = false;
      state.client = null;
      state.db = null;
      return true;
    } catch (err) {
      console.error('[MongoDB] Error closing stale connection:', err);
      return false;
    }
  }
  return false;
};

// Main connection function
const connectDB = async (): Promise<Db> => {
  // Return existing connection if available
  if (state.connected && state.db) {
    await refreshConnectionIfNeeded();
    if (state.connected && state.db) {
      return state.db;
    }
  }
  
  // If in offline mode, return mock database
  if (state.offlineMode) {
    console.log('[MongoDB] Operating in OFFLINE mode, returning mock database');
    state.mockData = true;
    return new MockDb() as unknown as Db;
  }
  
  state.lastConnectAttempt = new Date();
  state.connectCount++;
  
  // Parse and mask URI for logging
  let maskedUri = '';
  try {
    const uri = new URL(MONGODB_URI);
    // Mask password in logs
    const visiblePart = uri.password ? `${uri.password.charAt(0)}***${uri.password.charAt(uri.password.length-1)}` : '***';
    maskedUri = `${uri.protocol}//${uri.username}:${visiblePart}@${uri.host}${uri.pathname}`;
  } catch (e) {
    maskedUri = 'Invalid URI format';
  }
  
  console.log(`[MongoDB] Connection attempt #${state.connectCount} to ${maskedUri}`);
  
  // Track client IP (for debugging Atlas IP whitelist issues)
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .catch(() => ({ ip: 'unknown' }));
    console.log(`[MongoDB] Client IP address: ${ipResponse.ip || 'unknown'}`);
  } catch (e) {
    console.log('[MongoDB] Could not determine client IP');
  }
  
  // Try connecting with retries
  let lastError = null;
  let client = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[MongoDB] Connection attempt ${attempt}/${MAX_RETRIES}...`);
      
      // Create new client
      client = new MongoClient(MONGODB_URI, options);
      
      // Connect with timeout
      await client.connect();
      
      // Log successful connection
      console.log(`[MongoDB] Connected successfully on attempt ${attempt}`);
      
      // Get database
      const db = client.db(DB_NAME);
      
      // Verify connection by listing collections
      console.log('[MongoDB] Verifying connection by listing collections...');
      let collections: { name: string }[] = [];
      
      try {
        collections = await db.listCollections().toArray();
        console.log(`[MongoDB] Available collections in ${DB_NAME}:`, 
          collections.length > 0 
            ? collections.map(c => c.name).join(', ') 
            : 'No collections found');
            
        // Check if 'sections' collection exists
        const hasSections = collections.some(c => c.name === 'sections');
        if (!hasSections) {
          console.warn(`[MongoDB] Warning: 'sections' collection not found in ${DB_NAME} database`);
        }
      } catch (listError) {
        console.error('[MongoDB] Error listing collections:', listError);
      }
      
      // Update connection state
      state.connected = true;
      state.client = client;
      state.db = db;
      state.lastRefresh = new Date();
      state.mockData = false;
      
      return db;
    } catch (error) {
      lastError = error;
      state.errorCount++;
      
      // Log detailed connection error
      let errorType = 'Unknown Error';
      let errorDetail = '';
      
      if (error instanceof Error) {
        // Common MongoDB error types
        if (error.name === 'MongoServerSelectionError') {
          errorType = 'Server Selection Error';
          errorDetail = 'Cannot reach MongoDB Atlas cluster. Possible causes: IP not whitelisted, network issue, or server down.';
        } else if (error.message?.includes('authentication failed')) {
          errorType = 'Authentication Error';
          errorDetail = 'Invalid username or password in connection string.';
        } else if (error.message?.includes('ENOTFOUND')) {
          errorType = 'Host Not Found Error';
          errorDetail = 'Cannot resolve MongoDB Atlas hostname. Possible DNS or network issue.';
        } else if (error.message?.includes('ETIMEDOUT')) {
          errorType = 'Connection Timeout';
          errorDetail = 'Connection attempt timed out. Possible network latency or firewall issue.';
        }
        
        console.error(`[MongoDB] ${errorType} on attempt ${attempt}/${MAX_RETRIES}:`, error.message);
        if (errorDetail) console.error(`[MongoDB] Likely cause: ${errorDetail}`);
      } else {
        console.error(`[MongoDB] Unknown error type on attempt ${attempt}/${MAX_RETRIES}:`, error);
      }
      
      // Close failed client if it was created
      if (client) {
        try {
          await client.close();
        } catch (closeErr) {
          console.error('[MongoDB] Error closing failed client:', closeErr);
        }
      }
      
      // Retry with increasing delay unless it's the last attempt
      if (attempt < MAX_RETRIES) {
        const delay = Math.min(100 * Math.pow(2, attempt), 2000); // Exponential backoff, max 2s
        console.log(`[MongoDB] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed, enter offline mode with mock data
  console.warn('[MongoDB] All connection attempts failed, switching to offline mode with mock data');
  console.error('[MongoDB] Last error:', lastError);
  
  // Update state
  state.connected = false;
  state.client = null;
  state.db = null;
  state.lastError = lastError instanceof Error ? lastError : new Error('Unknown connection error');
  state.offlineMode = true;
  state.mockData = true;
  
  // Return mock database for offline mode
  return new MockDb() as unknown as Db;
};

// Verify database access by testing a query
export async function verifyDatabaseAccess(): Promise<boolean> {
  try {
    console.log('[MongoDB] Verifying database access...');
    const db = await connectDB();
    
    // If we're in mock mode, return false since actual DB is not accessible
    if (state.mockData) {
      console.log('[MongoDB] Using mock database, actual database not accessible');
      return false;
    }
    
    // Try to access the sections collection
    const collections = await db.listCollections().toArray();
    const hasSections = collections.some(c => c.name === 'sections');
    
    if (!hasSections) {
      console.warn('[MongoDB] Warning: sections collection not found');
    }
    
    console.log('[MongoDB] Database access verified successfully');
    return true;
  } catch (error) {
    console.error('[MongoDB] Database access verification failed:', error);
    return false;
  }
}

// Export the connection function
export default connectDB;

// Initialize admin credentials if they don't exist
async function initializeAdmin() {
  try {
    const db = await connectDB();
    const adminCollection = db.collection('admins');
    
    // Check if admin exists
    const admin = await adminCollection.findOne({ username: 'admin' });
    
    if (!admin) {
      // Create default admin if none exists
      await adminCollection.insertOne({
        username: 'admin',
        password: 'admin678', // In production, this should be hashed
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

// Initialize admin on connection
connectDB().then(initializeAdmin);

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export { connectDB }; 