import { NextApiRequest, NextApiResponse } from 'next';
import connectDB, { getConnectionState } from '../../../lib/mongodb';
import Section from '../../../models/Section';

// Sample fallback data to use when offline
const FALLBACK_DATA = [
  {
    id: 'fallback-section',
    title: 'Fallback Data (Offline Mode)',
    categories: [
      {
        id: 'fallback-category',
        title: 'Database Connection Unavailable',
        count: 1,
        icon: '⚠️',
        items: [
          {
            id: 'fallback-item',
            title: 'MongoDB Connection Error',
            description: 'The application is currently running in offline mode due to a database connection issue. Please try again later.',
            type: 'info'
          }
        ]
      }
    ]
  }
];

// API request tracking for diagnostics
const API_REQUESTS = {
  total: 0,
  successful: 0,
  failed: 0,
  lastRequest: null as Date | null,
  lastError: null as Error | null
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Start tracking request
  API_REQUESTS.total++;
  API_REQUESTS.lastRequest = new Date();
  
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);
  
  console.log(`[API:${requestId}] ${req.method} request to /api/sections`, {
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    headers: {
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer,
      host: req.headers.host
    },
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    offlineMode: false // Will update if offline mode is detected
  });
  
  // Set CORS headers first to ensure they're included in all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Set headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Add diagnostic headers to help with troubleshooting
  res.setHeader('X-API-Request-ID', requestId);
  res.setHeader('X-API-Time', new Date().toISOString());
  
  // Handle OPTIONS request (pre-flight for CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Connect to MongoDB - this is the critical operation that might fail
    console.log(`[API:${requestId}] Connecting to MongoDB...`);
    
    // Add timeout for connection to prevent hanging in production
    const connectionPromise = connectDB().catch(error => {
      console.error(`[API:${requestId}] Connection failed:`, error);
      throw error; // Rethrow to be caught by the main try/catch
    });
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('MongoDB connection timeout after 14 seconds')), 14000)
    );
    
    // Wait for connection with timeout
    let connection;
    try {
      connection = await Promise.race([connectionPromise, timeoutPromise]);
    } catch (connectionError) {
      console.error(`[API:${requestId}] Connection error:`, connectionError);
      
      // Check if we're in offline mode - if so, return fallback data
      const connectionState = getConnectionState();
      if (connectionState.offlineMode) {
        console.log(`[API:${requestId}] Operating in OFFLINE mode - returning fallback data`);
        
        // Return fallback data with offline indicator
        return res.status(200).json({
          success: true,
          sections: FALLBACK_DATA,
          isOffline: true,
          timestamp: new Date().toISOString(),
          message: 'Database unavailable - showing fallback data'
        });
      }
      
      // If not in offline mode, continue to throw the error to be caught by main try/catch
      throw connectionError;
    }
    
    console.log(`[API:${requestId}] MongoDB connection successful`);
    
    // Check if connection returned a mock (offline mode)
    const connectionState = getConnectionState();
    const isOfflineMode = connectionState.offlineMode;
    
    if (isOfflineMode) {
      console.log(`[API:${requestId}] Detected offline mode, will return fallback data`);
    }
    
    // Route based on HTTP method
    if (req.method === 'GET') {
      return await getSections(req, res, requestId, isOfflineMode);
    } else if (req.method === 'PUT') {
      return await updateSections(req, res, requestId, isOfflineMode);
    } else {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed',
        timestamp: new Date().toISOString(),
        requestId
      });
    }
  } catch (error) {
    // Track failed request
    API_REQUESTS.failed++;
    API_REQUESTS.lastError = error instanceof Error ? error : new Error('Unknown error');
    
    // Detailed error logging
    console.error(`[API:${requestId}] Server error:`, error);
    
    // Get details for better diagnostics
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'UnknownError',
      // Include stack in development but not production
      stack: process.env.NODE_ENV !== 'production' && error instanceof Error ? error.stack : undefined,
      time: new Date().toISOString(),
      duration: `${Date.now() - startTime}ms`,
      requestId
    };
    
    console.error(`[API:${requestId}] Error details:`, errorDetails);
    
    return res.status(500).json({ 
      success: false, 
      error: 'Server error', 
      message: errorDetails.message,
      timestamp: new Date().toISOString(),
      requestId,
      // Always return something in the sections field to avoid frontend errors
      sections: FALLBACK_DATA
    });
  }
}

// GET - Retrieve all sections
async function getSections(
  req: NextApiRequest, 
  res: NextApiResponse,
  requestId: string,
  isOfflineMode = false
) {
  const queryStartTime = Date.now();
  
  try {
    console.log(`[API:${requestId}] Fetching sections from database...`);
    
    // If in offline mode, return fallback data
    if (isOfflineMode) {
      console.log(`[API:${requestId}] Using fallback data for offline mode`);
      
      API_REQUESTS.successful++;
      return res.status(200).json({
        success: true,
        sections: FALLBACK_DATA,
        isOffline: true,
        timestamp: new Date().toISOString(),
        requestId,
        duration: `${Date.now() - queryStartTime}ms`,
        message: 'Database unavailable - showing fallback data'
      });
    }
    
    // Set timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout after 10 seconds')), 10000)
    );
    
    // Use try/catch for the specific MongoDB query
    let sections;
    try {
      // Fetch sections without the exec() which is causing the error,
      // Use a simpler approach with try/catch to avoid TypeScript issues
      const sectionsPromise = new Promise(async (resolve, reject) => {
        try {
          // Use find() directly and handle potential errors
          const docs = await Section.find({}).lean();
          resolve(docs);
        } catch (err) {
          reject(err);
        }
      });
      
      sections = await Promise.race([sectionsPromise, timeoutPromise]);
    } catch (queryError) {
      console.error(`[API:${requestId}] Query error:`, queryError);
      
      // For query errors, return fallback data with an error indicator
      API_REQUESTS.successful++;
      return res.status(200).json({
        success: true,
        sections: FALLBACK_DATA,
        isOffline: true,
        error: queryError instanceof Error ? queryError.message : 'Unknown query error',
        timestamp: new Date().toISOString(),
        requestId,
        duration: `${Date.now() - queryStartTime}ms`,
        message: 'Query error - showing fallback data'
      });
    }
    
    // Check if sections is undefined, null, or not an array
    if (!sections || !Array.isArray(sections)) {
      console.warn(`[API:${requestId}] Query returned invalid data:`, sections);
      sections = []; // Default to empty array
    }
    
    // Log detailed info about the results
    console.log(`[API:${requestId}] Found ${sections.length} sections`, {
      duration: `${Date.now() - queryStartTime}ms`,
      hasData: sections.length > 0
    });
    
    // Track successful request
    API_REQUESTS.successful++;
    
    // IMPORTANT: Always return data using sections key for consistency
    // This ensures frontend can rely on a consistent format
    return res.status(200).json({
      success: true,
      sections: sections,
      timestamp: new Date().toISOString(),
      requestId,
      duration: `${Date.now() - queryStartTime}ms`
    });
  } catch (error) {
    console.error(`[API:${requestId}] Error fetching sections:`, error);
    
    // Track failed request
    API_REQUESTS.failed++;
    API_REQUESTS.lastError = error instanceof Error ? error : new Error('Unknown error');
    
    return res.status(200).json({ 
      success: false, 
      error: 'Failed to fetch sections', 
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      requestId,
      duration: `${Date.now() - queryStartTime}ms`,
      // Always return something in the sections field to avoid frontend errors
      sections: FALLBACK_DATA,
      isOffline: true
    });
  }
}

// PUT - Update all sections
async function updateSections(
  req: NextApiRequest, 
  res: NextApiResponse,
  requestId: string,
  isOfflineMode = false
) {
  const updateStartTime = Date.now();
  
  try {
    console.log(`[API:${requestId}] Processing update request...`);
    
    // If in offline mode, pretend update was successful
    if (isOfflineMode) {
      console.log(`[API:${requestId}] Simulating successful update in offline mode`);
      
      // Return success but with offline indicator
      API_REQUESTS.successful++;
      return res.status(200).json({
        success: true,
        message: 'Update simulated - running in offline mode',
        isOffline: true,
        timestamp: new Date().toISOString(),
        requestId,
        duration: `${Date.now() - updateStartTime}ms`,
        sections: req.body // Echo back what was sent
      });
    }
    
    // Get the data from the request body
    let updatedSections;
    try {
      updatedSections = req.body;
    } catch (parseError) {
      console.error(`[API:${requestId}] Error parsing request body:`, parseError);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request data', 
        message: 'Could not parse request body',
        timestamp: new Date().toISOString(),
        requestId
      });
    }
    
    // Validate input
    if (!updatedSections || !Array.isArray(updatedSections)) {
      console.error(`[API:${requestId}] Invalid input: sections must be an array`);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid input', 
        message: 'Sections must be an array',
        timestamp: new Date().toISOString(),
        requestId
      });
    }
    
    console.log(`[API:${requestId}] Updating ${updatedSections.length} sections`);
    
    // Use try/catch for database operations
    try {
      // Clear existing sections
      await Section.deleteMany({});
      
      // Insert new sections - use setTimeout to avoid potential timeout issues
      const insertPromise = Section.insertMany(updatedSections);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Insert operation timeout after 15 seconds')), 15000)
      );
      
      await Promise.race([insertPromise, timeoutPromise]);
      
      console.log(`[API:${requestId}] Sections updated successfully`, {
        count: updatedSections.length,
        duration: `${Date.now() - updateStartTime}ms`
      });
    } catch (dbError) {
      console.error(`[API:${requestId}] Database operation failed:`, dbError);
      throw dbError; // Let main catch handler deal with it
    }
    
    // Track successful request
    API_REQUESTS.successful++;
    
    // Return updated sections - use consistent format with "sections" key
    return res.status(200).json({
      success: true,
      sections: updatedSections,
      message: 'Sections updated successfully',
      timestamp: new Date().toISOString(),
      requestId,
      duration: `${Date.now() - updateStartTime}ms`
    });
  } catch (error) {
    console.error(`[API:${requestId}] Error updating sections:`, error);
    
    // Track failed request
    API_REQUESTS.failed++;
    API_REQUESTS.lastError = error instanceof Error ? error : new Error('Unknown error');
    
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update sections', 
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      requestId,
      duration: `${Date.now() - updateStartTime}ms`
    });
  }
} 

// Diagnostic endpoint - used in development for debugging
export const getAPIStats = () => {
  return {
    ...API_REQUESTS,
    connectionState: getConnectionState()
  };
}; 