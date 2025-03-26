import type { NextApiRequest, NextApiResponse } from 'next';
import { sign } from 'jsonwebtoken';
import { env } from '../../../lib/env';
import type { AdminJwtPayload } from '../../../types/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Validate credentials
  if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
    // Create a JWT token
    const token = sign(
      { 
        username,
        role: 'admin',
        timestamp: Date.now()
      } as AdminJwtPayload,
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie with the token
    res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    
    return res.status(200).json({ 
      success: true,
      message: 'Login successful'
    });
  }

  return res.status(401).json({ 
    error: 'Invalid credentials' 
  });
} 