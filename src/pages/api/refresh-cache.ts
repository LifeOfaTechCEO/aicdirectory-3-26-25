import { NextApiRequest, NextApiResponse } from 'next';
import { sendEventToClients } from './events';

// Simple endpoint to force cache refresh
// This signals that data has changed and clients should refresh
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const token = req.headers.authorization?.split(' ')[1];
  if (token !== 'authenticated') {
    console.error('Authentication failed - Invalid token:', token);
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Log the cache invalidation request
  console.log('Cache invalidation requested at:', new Date().toISOString());
  
  // Set cache prevention headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Notify all connected clients about the update
  const updateId = Math.random().toString(36).substring(2, 15);
  const timestamp = new Date().getTime();
  
  try {
    // Send event to all connected clients
    sendEventToClients({
      type: 'cache-invalidated',
      timestamp,
      updateId
    });
    
    console.log('Sent cache invalidation to all connected clients');
  } catch (error) {
    console.error('Error sending update to clients:', error);
  }
  
  // Return success with timestamp
  res.status(200).json({ 
    success: true, 
    message: 'Cache invalidated',
    timestamp,
    cacheId: updateId
  });
} 