import { NextApiRequest, NextApiResponse } from 'next';

// Store connected clients
const clients: Set<NextApiResponse> = new Set();

// Function to send event to all connected clients
export const sendEventToClients = (data: any) => {
  const eventData = JSON.stringify(data);
  clients.forEach(client => {
    client.write(`data: ${eventData}\n\n`);
  });
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // For Nginx
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
  
  // Add this client to the set
  clients.add(res);
  
  // If the client closes the connection, remove them from the set
  req.on('close', () => {
    clients.delete(res);
  });
} 